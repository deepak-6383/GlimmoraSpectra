"use client";

/**
 * AgiEye — a cinematic, interactive 3D AGI consciousness for the hero section.
 *
 * Architecture
 * ────────────
 * - Glossy near-black PhysicalMaterial **eyeball**.
 * - Custom GLSL **iris** shader (radial neural lines + pulsing rings + FBM).
 * - Emissive **pupil core** with a soft inner glow.
 * - Slightly larger transparent **cornea** dome (clearcoat glass).
 * - Three orbiting **neural rings** (torus geometries).
 * - A sparse halo of **floating particles** drifting around the eye.
 * - Cursor-tracked **rig** with critically-damped inertia.
 * - **Reduced-motion + mobile** detection downgrades particle count and
 *   disables clearcoat-heavy materials when needed.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// =============================================================
//  GLSL — iris shader
// =============================================================

const IRIS_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const IRIS_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uHover;
  varying vec2  vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i),                hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2  uv  = vUv - 0.5;
    float r   = length(uv);
    float ang = atan(uv.y, uv.x);

    // discard outside iris ring
    if (r > 0.50) discard;

    // pupil hole — fade so it blends with the pupil core
    float pupilMask = smoothstep(0.085, 0.135, r);

    // 28 radial neural fibers, slowly rotating
    float fibers = sin(ang * 28.0 + uTime * 0.35) * 0.5 + 0.5;
    fibers = pow(fibers, 8.0);

    // outward-pulsing rings
    float rings = sin((r - uTime * 0.16) * 36.0) * 0.5 + 0.5;
    rings = pow(rings, 6.0);

    // ambient FBM "consciousness texture"
    float n = fbm(uv * 7.0 + uTime * 0.06);

    // signature palette: cyan core → violet midfield → fuchsia rim
    vec3 cCore = vec3(0.345, 0.890, 1.000); // #58e3ff
    vec3 cMid  = vec3(0.549, 0.361, 1.000); // #8c5cff
    vec3 cRim  = vec3(0.788, 0.396, 1.000); // #c965ff
    vec3 col   = mix(cCore, cMid, smoothstep(0.10, 0.32, r));
    col        = mix(col,   cRim, smoothstep(0.32, 0.50, r));

    // intensity build-up
    float intensity = fibers * 0.85 + rings * 0.55 + n * 0.30;
    intensity *= pupilMask;

    // breathing pulse + subtle hover boost
    float pulse  = sin(uTime * 1.6) * 0.12 + 1.0;
    float boost  = 1.0 + 0.20 * uHover;

    // mouse-reactive shimmer (a soft hot-spot)
    vec2  mp     = uMouse * 0.25;
    float shimmer = 1.0 + 0.30 * exp(-distance(uv, mp) * 9.0);

    // outer fade so the iris dissolves into the eyeball
    float edge   = smoothstep(0.50, 0.42, r);

    vec3 final   = col * intensity * pulse * boost * shimmer
                 + col * 0.18 * pupilMask;
    float alpha  = edge * pupilMask;

    gl_FragColor = vec4(final, alpha);
  }
`;

// =============================================================
//  GLSL — pupil core (deep dark + tiny inner energy)
// =============================================================

const PUPIL_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2  uv = vUv - 0.5;
    float r  = length(uv);
    if (r > 0.5) discard;

    // deep void, a flicker of cyan core
    float core   = exp(-r * 14.0);
    float jitter = 0.5 + 0.5 * sin(uTime * 4.0 + r * 16.0);
    vec3  col    = mix(vec3(0.01, 0.02, 0.05),
                       vec3(0.20, 0.74, 1.00),
                       core * (0.6 + 0.4 * jitter));

    float edge   = smoothstep(0.50, 0.40, r);
    gl_FragColor = vec4(col, edge);
  }
`;

// =============================================================
//  Eye rig — root group, mouse-tracked
// =============================================================

function EyeRig({ low }: { low: boolean }) {
  const group = useRef<THREE.Group>(null);
  const innerCore = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);

    // critically-damped lerp toward mouse pose
    const targetY = state.pointer.x * 0.55; // yaw
    const targetX = -state.pointer.y * 0.45; // pitch
    const k = 1 - Math.exp(-6.0 * dt);

    group.current.rotation.y += (targetY - group.current.rotation.y) * k;
    group.current.rotation.x += (targetX - group.current.rotation.x) * k;

    // breathing scale (very subtle)
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.015;
    group.current.scale.setScalar(breath);

    // inner energy core flickers
    if (innerCore.current) {
      const m = innerCore.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity =
        2.4 + Math.sin(state.clock.elapsedTime * 1.4) * 0.6;
    }
  });

  return (
    <group ref={group}>
      {/* glossy near-black eyeball */}
      <mesh>
        <sphereGeometry args={[1.0, 96, 96]} />
        <meshPhysicalMaterial
          color="#04050d"
          metalness={0.65}
          roughness={0.18}
          clearcoat={low ? 0.4 : 1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={1.4}
          reflectivity={0.6}
        />
      </mesh>

      {/* iris disc */}
      <Iris />

      {/* pupil core (shader disc) */}
      <PupilDisc />

      {/* tiny emissive bead deep inside the pupil — the "soul" */}
      <mesh ref={innerCore} position={[0, 0, 1.02]}>
        <sphereGeometry args={[0.04, 24, 24]} />
        <meshStandardMaterial
          color="#79c8ff"
          emissive={new THREE.Color("#9bd9ff")}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>

      {/* transparent cornea dome — slightly larger glass shell */}
      {!low && (
        <mesh>
          <sphereGeometry args={[1.04, 96, 96]} />
          <meshPhysicalMaterial
            color="#0a0c1a"
            metalness={0.0}
            roughness={0.05}
            transmission={0.55}
            thickness={0.6}
            ior={1.45}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* neural rings orbiting the eye */}
      <NeuralRing radius={1.45} tube={0.014} color="#58e3ff" tilt={0.4}  speed={0.18} />
      <NeuralRing radius={1.7}  tube={0.010} color="#8c5cff" tilt={1.1}  speed={-0.12} dashes />
      {!low && (
        <NeuralRing
          radius={1.95}
          tube={0.008}
          color="#c965ff"
          tilt={1.7}
          tiltY={0.35}
          speed={0.08}
          dashes
        />
      )}
    </group>
  );
}

// =============================================================
//  Iris — flat disc just in front of the eyeball
// =============================================================

function Iris() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime:  { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uHover: { value: 0 },
        },
        vertexShader: IRIS_VERT,
        fragmentShader: IRIS_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y);
  });

  return (
    <mesh position={[0, 0, 0.998]}>
      <circleGeometry args={[0.62, 96]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}

// =============================================================
//  Pupil — slightly forward of the iris
// =============================================================

function PupilDisc() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: IRIS_VERT,
        fragmentShader: PUPIL_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, 1.0]}>
      <circleGeometry args={[0.18, 64]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}

// =============================================================
//  Neural ring — orbiting torus
// =============================================================

function NeuralRing({
  radius,
  tube,
  color,
  tilt,
  tiltY = 0,
  speed,
  dashes,
}: {
  radius: number;
  tube: number;
  color: string;
  tilt: number;
  tiltY?: number;
  speed: number;
  dashes?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, tiltY, 0]}>
      <torusGeometry args={[radius, tube, 14, 220]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={dashes ? 0.45 : 0.65}
        toneMapped={false}
      />
    </mesh>
  );
}

// =============================================================
//  Particle halo — floating orbital intelligence
// =============================================================

function ParticleHalo({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const palette = [
      new THREE.Color("#58e3ff"),
      new THREE.Color("#8c5cff"),
      new THREE.Color("#c965ff"),
      new THREE.Color("#6affc1"),
    ];
    for (let i = 0; i < count; i++) {
      // dense halo within radius 2.5..3.4
      const r = 2.4 + Math.random() * 1.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.45;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const c = palette[i % palette.length];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      siz[i] = 0.018 + Math.random() * 0.025;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, colors, sizes]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

// =============================================================
//  Lighting setup
// =============================================================

function CinematicLights() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <pointLight position={[3.5, 2, 4]}  intensity={2.2} color="#79c8ff" distance={20} decay={1.6} />
      <pointLight position={[-4, -1.5, 3]} intensity={1.6} color="#8c5cff" distance={20} decay={1.6} />
      <pointLight position={[0, 3.5, -2]} intensity={0.9} color="#c965ff" distance={20} decay={1.6} />
      <pointLight position={[0, 0, 4]}    intensity={0.6} color="#ffffff" distance={10} decay={2} />
    </>
  );
}

// =============================================================
//  Public component
// =============================================================

export function AgiEye({ className }: { className?: string }) {
  const [low, setLow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLow(isMobile || reduced);
  }, []);

  const particleCount = low ? 32 : 110;
  const dpr: [number, number] = low ? [1, 1.4] : [1, 1.8];

  return (
    <div className={className}>
      {/* atmospheric CSS bloom — adds the cinematic halo without postprocessing */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(closest-side, rgba(140,92,255,0.45), rgba(88,227,255,0.20) 45%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0.85,
        }}
      />

      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 3.2], fov: 38 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={["#04050d", 6, 14]} />

          <CinematicLights />

          {!low && (
            <Stars
              radius={40}
              depth={20}
              count={900}
              factor={2.2}
              saturation={0}
              fade
              speed={0.4}
            />
          )}

          <ParticleHalo count={particleCount} />

          <EyeRig low={low} />
        </Suspense>
      </Canvas>
    </div>
  );
}
