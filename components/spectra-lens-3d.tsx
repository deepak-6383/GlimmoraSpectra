"use client";

/**
 * SpectraLens3D — fully procedural smart-eyewear preview.
 *
 * No external GLTF assets. Geometry is built from THREE.Shape +
 * ExtrudeGeometry for the front frame (with two lens cutouts), plus boxed
 * temples, nose pads, a camera lozenge and a pulsing status LED. Drag to
 * rotate; idle = slow auto-rotate.
 *
 * Color is configurable via the `frame` and `lens` props so the parent
 * page can offer a colour picker without re-mounting the canvas.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

// =============================================================
//  Front frame — single shape, two rounded-square lens holes
// =============================================================

function FrameFront({ color }: { color: string }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();

    // outer rounded rectangle
    const fw = 1.30;
    const fh = 0.46;
    const fr = 0.05;
    s.moveTo(-fw / 2 + fr, -fh / 2);
    s.lineTo(fw / 2 - fr, -fh / 2);
    s.quadraticCurveTo(fw / 2, -fh / 2, fw / 2, -fh / 2 + fr);
    s.lineTo(fw / 2, fh / 2 - fr);
    s.quadraticCurveTo(fw / 2, fh / 2, fw / 2 - fr, fh / 2);
    s.lineTo(-fw / 2 + fr, fh / 2);
    s.quadraticCurveTo(-fw / 2, fh / 2, -fw / 2, fh / 2 - fr);
    s.lineTo(-fw / 2, -fh / 2 + fr);
    s.quadraticCurveTo(-fw / 2, -fh / 2, -fw / 2 + fr, -fh / 2);

    // two lens holes (rounded squares)
    const lensWidth = 0.50;
    const lensHeight = 0.34;
    const lensR = 0.06;
    [-0.32, 0.32].forEach((cx) => {
      const hole = new THREE.Path();
      const x0 = cx - lensWidth / 2;
      const x1 = cx + lensWidth / 2;
      const y0 = -lensHeight / 2 - 0.02; // slight downward
      const y1 = lensHeight / 2 - 0.02;
      hole.moveTo(x0 + lensR, y0);
      hole.lineTo(x1 - lensR, y0);
      hole.quadraticCurveTo(x1, y0, x1, y0 + lensR);
      hole.lineTo(x1, y1 - lensR);
      hole.quadraticCurveTo(x1, y1, x1 - lensR, y1);
      hole.lineTo(x0 + lensR, y1);
      hole.quadraticCurveTo(x0, y1, x0, y1 - lensR);
      hole.lineTo(x0, y0 + lensR);
      hole.quadraticCurveTo(x0, y0, x0 + lensR, y0);
      s.holes.push(hole);
    });

    return s;
  }, []);

  const extrudeOpts = useMemo(
    () => ({
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.010,
      bevelSegments: 4,
      curveSegments: 28,
    }),
    [],
  );

  return (
    <mesh position={[0, 0, -0.035]}>
      <extrudeGeometry args={[shape, extrudeOpts]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.35}
        roughness={0.22}
        clearcoat={1.0}
        clearcoatRoughness={0.06}
        envMapIntensity={1.2}
        sheen={0.2}
        sheenColor={new THREE.Color("#1a1a1a")}
      />
    </mesh>
  );
}

// =============================================================
//  Lens — flat tinted plane inside each cutout
// =============================================================

function Lens({ x, color }: { x: number; color: string }) {
  return (
    <mesh position={[x, -0.02, 0.006]}>
      <planeGeometry args={[0.485, 0.325, 1, 1]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.0}
        roughness={0.04}
        clearcoat={1.0}
        clearcoatRoughness={0.03}
        transmission={0.55}
        thickness={0.4}
        ior={1.49}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        envMapIntensity={1.6}
      />
    </mesh>
  );
}

// =============================================================
//  Temple (arm) — extending back, slight outward angle, small ear hook
// =============================================================

function Temple({ side, color }: { side: -1 | 1; color: string }) {
  return (
    <group position={[side * 0.625, 0.10, -0.03]} rotation={[0, side * -0.04, 0]}>
      {/* hinge bump */}
      <mesh position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.035, 18, 18]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.45}
          roughness={0.18}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* main arm */}
      <mesh position={[side * 0.06, -0.01, -0.42]} rotation={[-0.04, 0, 0]}>
        <boxGeometry args={[0.04, 0.05, 0.86]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.35}
          roughness={0.22}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* end hook (down-bend) */}
      <mesh position={[side * 0.075, -0.07, -0.85]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[0.04, 0.13, 0.05]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.35}
          roughness={0.25}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* subtle Glimmora "S" notch on the temple */}
      <mesh position={[side * 0.077, 0.005, -0.15]}>
        <boxGeometry args={[0.001, 0.01, 0.025]} />
        <meshStandardMaterial color="#79c8ff" emissive="#79c8ff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// =============================================================
//  Nose pads — tiny translucent pads on the inner edges
// =============================================================

function NosePads() {
  return (
    <>
      <mesh position={[-0.05, -0.04, 0.04]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshPhysicalMaterial
          color="#cfd6e0"
          metalness={0.0}
          roughness={0.15}
          transmission={0.4}
          ior={1.4}
          thickness={0.3}
          transparent
          opacity={0.65}
        />
      </mesh>
      <mesh position={[0.05, -0.04, 0.04]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshPhysicalMaterial
          color="#cfd6e0"
          metalness={0.0}
          roughness={0.15}
          transmission={0.4}
          ior={1.4}
          thickness={0.3}
          transparent
          opacity={0.65}
        />
      </mesh>
    </>
  );
}

// =============================================================
//  Smart-glasses HUD details — camera + LED indicator
// =============================================================

function CameraDot() {
  return (
    <group position={[-0.585, 0.165, 0.038]}>
      {/* outer ring */}
      <mesh>
        <cylinderGeometry args={[0.022, 0.022, 0.012, 24]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.05}
          clearcoat={1.0}
        />
      </mesh>
      {/* inner glass (camera) */}
      <mesh position={[0, 0.007, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.014, 24]} />
        <meshPhysicalMaterial
          color="#000"
          metalness={1.0}
          roughness={0.05}
          envMapIntensity={2.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function StatusLED() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 1.6 + Math.sin(state.clock.elapsedTime * 1.8) * 0.8;
  });
  return (
    <mesh ref={ref} position={[-0.555, 0.165, 0.046]}>
      <sphereGeometry args={[0.006, 12, 12]} />
      <meshStandardMaterial
        color="#79c8ff"
        emissive="#79c8ff"
        emissiveIntensity={1.8}
        toneMapped={false}
      />
    </mesh>
  );
}

// =============================================================
//  The whole assembly — auto-rotates, pauses on hover
// =============================================================

function GlassesRig({
  frame,
  lens,
}: {
  frame: string;
  lens: string;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    // micro float for "alive" feel
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.8) * 0.012;
  });

  return (
    <group ref={group}>
      <FrameFront color={frame} />
      <Lens x={-0.32} color={lens} />
      <Lens x={0.32} color={lens} />
      <Temple side={-1} color={frame} />
      <Temple side={1} color={frame} />
      <NosePads />
      <CameraDot />
      <StatusLED />
    </group>
  );
}

// =============================================================
//  Cinematic studio lighting
// =============================================================

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={1.5}
        color="#fff4e8"
      />
      <pointLight
        position={[-4, 1, 3]}
        intensity={0.9}
        color="#a3c4ff"
        distance={14}
        decay={1.6}
      />
      <pointLight
        position={[0, -2, -3]}
        intensity={0.5}
        color="#b187ff"
        distance={12}
        decay={1.6}
      />
      <pointLight
        position={[2, 2, 4]}
        intensity={0.8}
        color="#ffffff"
        distance={8}
        decay={2}
      />
    </>
  );
}

// =============================================================
//  Public component
// =============================================================

type Props = {
  className?: string;
  frame?: string;
  lens?: string;
  autoRotate?: boolean;
};

export function SpectraLens3D({
  className,
  frame = "#0d0d10",
  lens = "#1a1f2a",
  autoRotate = true,
}: Props) {
  const [low, setLow] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLow(isMobile || reduced);
  }, []);

  const dpr: [number, number] = low ? [1, 1.4] : [1, 1.8];

  return (
    <div
      className={className}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      {/* atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(closest-side, rgba(140,92,255,0.16), rgba(88,227,255,0.10) 50%, transparent 75%)",
          filter: "blur(60px)",
          opacity: 0.85,
        }}
      />

      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0.05, 2.4], fov: 32 }}
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

          <GlassesRig frame={frame} lens={lens} />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.85}
            autoRotate={autoRotate && !hovering}
            autoRotateSpeed={1.0}
            minPolarAngle={Math.PI / 2 - 0.7}
            maxPolarAngle={Math.PI / 2 + 0.4}
          />
        </Suspense>
      </Canvas>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-ink-mute backdrop-blur-md sm:bottom-5"
      >
        drag to rotate
      </div>
    </div>
  );
}
