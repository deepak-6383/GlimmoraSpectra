"use client";

/**
 * RealisticEye — a photo-real, draggable 3D human eye for the hero.
 *
 * The texture is procedurally painted onto a 2048×1024 equirectangular canvas
 * (sclera gradient + radial veins + iris fibers + pupil) and applied to a
 * sphere. A slightly larger transparent cornea sphere provides the wet
 * specular highlight. OrbitControls let the user drag to rotate; auto-rotate
 * keeps the eye alive when the cursor isn't on it.
 *
 * No external assets — everything is generated client-side, so the component
 * works offline, on Vercel, and behind any tunnel.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// =============================================================
//  Procedural eye texture (sclera + veins + iris + pupil)
// =============================================================

type EyeTextureOpts = {
  size?: number;
  irisColor?: { core: string; mid: string; outer: string; rim: string };
  scleraTint?: string;
  veinDensity?: number;
};

function makeEyeTexture({
  size = 2048,
  irisColor = {
    core: "#5a7250",
    mid: "#7d925d",
    outer: "#3d4a26",
    rim: "#1f1c10",
  },
  scleraTint = "#fef5f0",
  veinDensity = 220,
}: EyeTextureOpts = {}): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size / 2;
  const ctx = c.getContext("2d")!;
  const W = c.width;
  const H = c.height;

  // 1) sclera base: vertical pink → cream → pink (poles are warmer)
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#dba391");
  base.addColorStop(0.35, "#f7d8cc");
  base.addColorStop(0.5, scleraTint);
  base.addColorStop(0.65, "#f7d8cc");
  base.addColorStop(1, "#dba391");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // 2) overall warm noise to break up the gradient
  const speckles = ctx.createImageData(W, H);
  const sd = speckles.data;
  for (let i = 0; i < sd.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    sd[i] = 255 + n; // r
    sd[i + 1] = 235 + n;
    sd[i + 2] = 225 + n;
    sd[i + 3] = 14;
  }
  ctx.putImageData(speckles, 0, 0);

  // 3) where the iris will sit on the sphere — center of texture
  // (after we rotate the sphere by π around Y, this maps to +Z on the eye)
  const irisX = W * 0.5;
  const irisY = H * 0.5;
  const irisR = H * 0.20;

  // 4) red bloom around the iris (the watery / inflamed look)
  const bloom = ctx.createRadialGradient(
    irisX,
    irisY,
    irisR * 0.95,
    irisX,
    irisY,
    irisR * 4.0,
  );
  bloom.addColorStop(0, "rgba(180, 70, 60, 0.42)");
  bloom.addColorStop(0.45, "rgba(180, 70, 60, 0.12)");
  bloom.addColorStop(1, "rgba(180, 70, 60, 0)");
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  // 5) veins — branching random walks from the periphery toward the iris
  for (let i = 0; i < veinDensity; i++) {
    drawVein(ctx, W, H, irisX, irisY, irisR);
  }

  // 6) heavier veins close to the iris boundary
  for (let i = 0; i < Math.floor(veinDensity * 0.4); i++) {
    drawVein(ctx, W, H, irisX, irisY, irisR, true);
  }

  // 7) iris on top
  drawIris(ctx, irisX, irisY, irisR, irisColor);

  // 8) pupil
  ctx.fillStyle = "#080306";
  ctx.beginPath();
  ctx.arc(irisX, irisY, irisR * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // 9) tiny catchlight specular hint inside the pupil (the AI feels alive)
  const pupilGrad = ctx.createRadialGradient(
    irisX - irisR * 0.05,
    irisY - irisR * 0.05,
    0,
    irisX - irisR * 0.05,
    irisY - irisR * 0.05,
    irisR * 0.18,
  );
  pupilGrad.addColorStop(0, "rgba(120, 140, 170, 0.35)");
  pupilGrad.addColorStop(1, "rgba(120, 140, 170, 0)");
  ctx.fillStyle = pupilGrad;
  ctx.beginPath();
  ctx.arc(irisX, irisY, irisR * 0.32, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function drawVein(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  irisX: number,
  irisY: number,
  irisR: number,
  short = false,
) {
  // start somewhere near the iris periphery and walk OUTWARD
  const startAngle = Math.random() * Math.PI * 2;
  const startDist = irisR * (1.05 + Math.random() * 0.15);
  let x = irisX + Math.cos(startAngle) * startDist;
  let y = irisY + Math.sin(startAngle) * startDist;
  let angle = startAngle + (Math.random() - 0.5) * 0.4;

  const length = short ? 12 + Math.random() * 22 : 35 + Math.random() * 90;
  let alpha = short ? 0.55 : 0.65;
  let lineWidth = short ? 0.5 + Math.random() * 0.7 : 1.0 + Math.random() * 1.2;

  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < length; i++) {
    angle += (Math.random() - 0.5) * 0.55;
    const step = 1.2 + Math.random() * 2.6;
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;

    if (x < 0 || x > W || y < 0 || y > H) break;
    ctx.lineTo(x, y);
    alpha *= 0.985;
    lineWidth = Math.max(0.25, lineWidth * 0.99);

    // occasional thin branch
    if (!short && Math.random() < 0.05 && i > 6) {
      drawBranch(ctx, x, y, angle + (Math.random() - 0.5) * 1.6);
    }
  }

  const r = 130 + Math.floor(Math.random() * 35);
  const g = 22 + Math.floor(Math.random() * 18);
  const b = 18 + Math.floor(Math.random() * 12);
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawBranch(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  angle: number,
) {
  let x = startX;
  let y = startY;
  let a = angle;
  const len = 6 + Math.random() * 18;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < len; i++) {
    a += (Math.random() - 0.5) * 0.6;
    x += Math.cos(a) * (1 + Math.random() * 1.5);
    y += Math.sin(a) * (1 + Math.random() * 1.5);
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = `rgba(${130 + Math.random() * 30}, 25, 20, ${0.25 + Math.random() * 0.2})`;
  ctx.lineWidth = 0.4 + Math.random() * 0.6;
  ctx.stroke();
}

function drawIris(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  c: { core: string; mid: string; outer: string; rim: string },
) {
  // base radial color
  const grad = ctx.createRadialGradient(cx, cy, r * 0.32, cx, cy, r);
  grad.addColorStop(0, c.core);
  grad.addColorStop(0.45, c.mid);
  grad.addColorStop(0.85, c.outer);
  grad.addColorStop(1, c.rim);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // dense radial fibers
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2 + (Math.random() - 0.5) * 0.04;
    const innerR = r * (0.32 + Math.random() * 0.08);
    const outerR = r * (0.62 + Math.random() * 0.34);
    const tone = 0.18 + Math.random() * 0.42;
    const lighter = Math.random() > 0.5;
    ctx.strokeStyle = lighter
      ? `rgba(220, 215, 170, ${tone.toFixed(2)})`
      : `rgba(20, 25, 12, ${tone.toFixed(2)})`;
    ctx.lineWidth = 0.4 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
    ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
    ctx.stroke();
  }

  // crinkles — small tangential lines for realism
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = r * (0.45 + Math.random() * 0.4);
    const len = 4 + Math.random() * 12;
    ctx.strokeStyle = `rgba(${30 + Math.random() * 40}, ${40 + Math.random() * 40}, ${20 + Math.random() * 20}, 0.45)`;
    ctx.lineWidth = 0.4 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    ctx.lineTo(
      cx + Math.cos(a + 0.3) * rr + (Math.random() - 0.5) * len,
      cy + Math.sin(a + 0.3) * rr + (Math.random() - 0.5) * len,
    );
    ctx.stroke();
  }

  // limbal ring (dark outer rim)
  ctx.strokeStyle = "rgba(15, 14, 9, 0.85)";
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.97, 0, Math.PI * 2);
  ctx.stroke();

  // collarette — bright ring around pupil
  ctx.strokeStyle = "rgba(245, 230, 180, 0.35)";
  ctx.lineWidth = r * 0.02;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.36, 0, Math.PI * 2);
  ctx.stroke();
}

// =============================================================
//  Optional bump texture from a darkened version of the color tex
// =============================================================

function makeBumpTexture(size = 1024): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size / 2;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, c.width, c.height);
  // small wrinkles
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const len = 4 + Math.random() * 18;
    const a = Math.random() * Math.PI * 2;
    ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? 96 : 144}, 0, 0, 0.18)`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// =============================================================
//  Eyeball — sphere wearing the painted texture
// =============================================================

function Eyeball({ texture, bump }: { texture: THREE.Texture; bump: THREE.Texture }) {
  return (
    <mesh rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[1.0, 128, 128]} />
      <meshPhysicalMaterial
        map={texture}
        bumpMap={bump}
        bumpScale={0.0035}
        roughness={0.32}
        metalness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.18}
        sheen={0.4}
        sheenRoughness={0.6}
        sheenColor={new THREE.Color("#f5d8c8")}
        envMapIntensity={1.1}
      />
    </mesh>
  );
}

// =============================================================
//  Cornea — a slightly larger transparent dome over the iris
// =============================================================

function Cornea() {
  return (
    <mesh rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[1.012, 96, 96]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.18}
        metalness={0.0}
        roughness={0.04}
        clearcoat={1.0}
        clearcoatRoughness={0.02}
        ior={1.376}
        envMapIntensity={1.6}
        depthWrite={false}
      />
    </mesh>
  );
}

// =============================================================
//  Eye rig — auto-rotates, pauses on hover, gentle breathing
// =============================================================

function EyeRig({ texture, bump }: { texture: THREE.Texture; bump: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.55) * 0.012;
    group.current.scale.setScalar(breath);
  });

  return (
    <group ref={group}>
      <Eyeball texture={texture} bump={bump} />
      <Cornea />
    </group>
  );
}

// =============================================================
//  Cinematic studio lighting
// =============================================================

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.22} color="#a8b3c4" />
      {/* key light — top right, warm white */}
      <directionalLight
        position={[3.2, 3.4, 3.0]}
        intensity={1.4}
        color="#fff4e8"
        castShadow={false}
      />
      {/* fill — left side, cool */}
      <pointLight
        position={[-3.5, 0.5, 1.5]}
        intensity={0.9}
        color="#a3c4ff"
        distance={14}
        decay={1.6}
      />
      {/* rim — back, violet for atmosphere */}
      <pointLight
        position={[0, -1.5, -3]}
        intensity={0.5}
        color="#b187ff"
        distance={12}
        decay={1.6}
      />
      {/* tight specular for cornea catchlight */}
      <pointLight
        position={[1.6, 1.8, 2.4]}
        intensity={1.3}
        color="#ffffff"
        distance={6}
        decay={2}
      />
    </>
  );
}

// =============================================================
//  Public component
// =============================================================

export function RealisticEye({ className }: { className?: string }) {
  const [low, setLow] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [textures, setTextures] = useState<{
    color: THREE.CanvasTexture;
    bump: THREE.CanvasTexture;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLow(isMobile || reduced);
  }, []);

  // generate textures once on mount (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const color = makeEyeTexture({
      size: low ? 1024 : 2048,
      veinDensity: low ? 110 : 220,
    });
    const bump = makeBumpTexture(low ? 512 : 1024);
    setTextures({ color, bump });
    return () => {
      color.dispose();
      bump.dispose();
    };
  }, [low]);

  const dpr: [number, number] = low ? [1, 1.4] : [1, 1.8];

  return (
    <div
      className={className}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      {/* atmospheric bloom behind the eye */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,180,160,0.18), rgba(140,92,255,0.18) 40%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0.85,
        }}
      />

      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 6.0], fov: 28 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <StudioLights />

          {textures && <EyeRig texture={textures.color} bump={textures.bump} />}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.7}
            autoRotate={!hovering}
            autoRotateSpeed={0.6}
            minPolarAngle={Math.PI / 2 - 0.55}
            maxPolarAngle={Math.PI / 2 + 0.55}
          />
        </Suspense>
      </Canvas>

      {/* tiny "drag to rotate" affordance */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-ink-mute backdrop-blur-md sm:bottom-5"
      >
        drag to rotate
      </div>
    </div>
  );
}
