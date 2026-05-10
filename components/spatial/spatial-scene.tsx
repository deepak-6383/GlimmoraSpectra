"use client";

/**
 * SpatialScene — the R3F overlay that sits on top of the camera feed.
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  <video> webcam feed (background, native HTML)           │
 *  │  ┌────────────────────────────────────────────────────┐  │
 *  │  │  <Canvas> transparent — Three.js / R3F overlay     │  │
 *  │  │   - SpatialAnchor3D for each detected anchor       │  │
 *  │  │   - SpatialParticles ambient drift                 │  │
 *  │  │   - GazeCursor3D (cursor → ray)                    │  │
 *  │  └────────────────────────────────────────────────────┘  │
 *  └──────────────────────────────────────────────────────────┘
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useSpatialStore, type SpatialAnchor } from "@/lib/spatial";

import { SpatialAnchor3D } from "./spatial-anchor";

const FOV_DEG = 60;
const FOV_RAD = (FOV_DEG * Math.PI) / 180;

export function SpatialScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 0.001], fov: FOV_DEG }}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <SceneLights />
          <AnchorsLayer />
          <SpatialParticles />
          <GazeCursor3D />
          <CursorBridge />
        </Suspense>
      </Canvas>
    </div>
  );
}

// =============================================================
//  Anchors layer
// =============================================================

function AnchorsLayer() {
  const anchors = useSpatialStore((s) => s.anchors);
  const { size } = useThree();
  const aspect = size.width / Math.max(1, size.height);

  return (
    <>
      {anchors.map((a) => (
        <SpatialAnchor3D
          key={a.id}
          anchor={a}
          fovRad={FOV_RAD}
          aspect={aspect}
        />
      ))}
    </>
  );
}

// =============================================================
//  Cinematic lights
// =============================================================

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 2, 2]} intensity={1.0} color="#79c8ff" distance={15} decay={1.5} />
      <pointLight position={[-3, -1, -2]} intensity={0.7} color="#8c5cff" distance={15} decay={1.5} />
      <pointLight position={[0, 2, -3]} intensity={0.4} color="#c965ff" distance={12} decay={1.5} />
    </>
  );
}

// =============================================================
//  Ambient drifting particles — sells the "spatial" feel
// =============================================================

function SpatialParticles({ count = 140 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#58e3ff"),
      new THREE.Color("#8c5cff"),
      new THREE.Color("#6affc1"),
      new THREE.Color("#c965ff"),
    ];
    for (let i = 0; i < count; i++) {
      // distribute particles in a wide volume in front of the camera
      const x = (Math.random() - 0.5) * 7;
      const y = (Math.random() - 0.5) * 4.5;
      const z = -0.5 - Math.random() * 5.5;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    // drift particles upward and wrap
    const positions = ref.current.geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      let y = positions.getY(i) + delta * 0.05;
      if (y > 2.5) y = -2.5;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

// =============================================================
//  Gaze cursor — 3D ring projected from cursor NDC
// =============================================================

function GazeCursor3D() {
  const ref = useRef<THREE.Group>(null);
  const cursor = useSpatialStore((s) => s.cursorNDC);
  const focused = useSpatialStore((s) => s.focusedId);

  useFrame((state) => {
    if (!ref.current) return;
    // place the cursor 1.5 units in front of the camera at the cursor's NDC
    const z = -1.6;
    const halfFovTan = Math.tan(FOV_RAD / 2);
    const aspect = state.size.width / Math.max(1, state.size.height);
    const viewHeight = 2 * halfFovTan * Math.abs(z);
    const viewWidth = viewHeight * aspect;

    const tx = (cursor.x * 0.5) * viewWidth;
    const ty = (cursor.y * 0.5) * viewHeight;
    // smooth follow
    ref.current.position.x +=
      (tx - ref.current.position.x) * 0.18;
    ref.current.position.y +=
      (ty - ref.current.position.y) * 0.18;
    ref.current.position.z = z;

    // pulse on focus
    const target = focused ? 1.45 : 1.0;
    const cur = ref.current.scale.x;
    const next = cur + (target - cur) * 0.18;
    ref.current.scale.set(next, next, 1);
  });

  return (
    <group ref={ref}>
      <mesh>
        <ringGeometry args={[0.045, 0.06, 32]} />
        <meshBasicMaterial
          color={focused ? "#6affc1" : "#79c8ff"}
          transparent
          opacity={0.85}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[0.075, 0.082, 32]} />
        <meshBasicMaterial
          color={focused ? "#6affc1" : "#79c8ff"}
          transparent
          opacity={0.35}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// =============================================================
//  CursorBridge — feeds R3F's pointer state into our zustand store
//  so non-3D HUD elements can react.
// =============================================================

function CursorBridge() {
  const setCursorNDC = useSpatialStore((s) => s.setCursorNDC);
  useFrame((state) => {
    setCursorNDC(state.pointer.x, state.pointer.y);
  });
  return null;
}
