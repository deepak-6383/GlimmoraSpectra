"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial, Sphere, Torus } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function CorePulse() {
  const mat = useRef<THREE.MeshStandardMaterial | null>(null);
  useFrame(({ clock }) => {
    if (mat.current) {
      mat.current.emissiveIntensity = 1.4 + Math.sin(clock.elapsedTime * 1.5) * 0.45;
    }
  });
  return (
    <mesh>
      <sphereGeometry args={[0.55, 64, 64]} />
      <meshStandardMaterial
        ref={mat}
        color={"#ffffff"}
        emissive={new THREE.Color("#79c8ff")}
        emissiveIntensity={1.6}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  );
}

function NeuralRing({ radius = 1.7, tubular = 0.012, color = "#58e3ff", speedX = 0.2, speedY = 0.05, tiltX = 0.4, tiltY = 0.0, opacity = 0.55 }) {
  const ref = useRef<THREE.Mesh | null>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speedX;
    ref.current.rotation.y += delta * speedY;
  });
  return (
    <Torus
      ref={ref as never}
      args={[radius, tubular, 16, 200]}
      rotation={[tiltX, tiltY, 0]}
    >
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </Torus>
  );
}

function OrbitalNodes({ count = 18 }) {
  const group = useRef<THREE.Group | null>(null);
  const positions = useMemo(() => {
    const arr: { p: THREE.Vector3; r: number; phase: number; color: string }[] = [];
    for (let i = 0; i < count; i++) {
      const radius = 1.4 + Math.random() * 1.3;
      const angle = Math.random() * Math.PI * 2;
      const tilt = (Math.random() - 0.5) * 0.6;
      arr.push({
        p: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(tilt) * radius * 0.5, Math.sin(angle) * radius),
        r: 0.025 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
        color: ["#58e3ff", "#8c5cff", "#c965ff", "#6affc1"][i % 4],
      });
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={group}>
      {positions.map((n, i) => (
        <Float
          key={i}
          speed={1.2 + (i % 3) * 0.4}
          rotationIntensity={0.15}
          floatIntensity={0.6}
        >
          <mesh position={n.p}>
            <sphereGeometry args={[n.r, 16, 16]} />
            <meshBasicMaterial color={n.color} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function NeuralLines({ count = 26 }) {
  const ref = useRef<THREE.LineSegments | null>(null);
  const geom = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      const r = 1.6 + Math.random() * 1.2;
      const a1 = Math.random() * Math.PI * 2;
      const a2 = a1 + (Math.random() - 0.5) * 1.6;
      const y1 = (Math.random() - 0.5) * 1.4;
      const y2 = (Math.random() - 0.5) * 1.4;
      positions.push(
        Math.cos(a1) * r,
        y1,
        Math.sin(a1) * r,
        Math.cos(a2) * r,
        y2,
        Math.sin(a2) * r,
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });

  return (
    <lineSegments ref={ref} geometry={geom}>
      <lineBasicMaterial color={"#79c8ff"} transparent opacity={0.2} />
    </lineSegments>
  );
}

function DistortShell() {
  return (
    <Sphere args={[1.0, 64, 64]}>
      <MeshDistortMaterial
        color={"#4f7dff"}
        emissive={"#8c5cff"}
        emissiveIntensity={0.5}
        speed={1.6}
        distort={0.32}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.55}
      />
    </Sphere>
  );
}

export function AgiCore({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.4, 5.4], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#03040a"]} />
        <fog attach="fog" args={["#03040a", 7, 14]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={1.4} color={"#58e3ff"} />
        <pointLight position={[-4, -2, -2]} intensity={1.2} color={"#8c5cff"} />
        <pointLight position={[0, -3, 3]} intensity={0.8} color={"#c965ff"} />

        <Suspense fallback={null}>
          <Stars
            radius={60}
            depth={40}
            count={1800}
            factor={3.2}
            saturation={0}
            fade
            speed={0.6}
          />

          <Float speed={0.8} floatIntensity={0.4} rotationIntensity={0.15}>
            <group>
              <DistortShell />
              <CorePulse />
              <NeuralRing radius={1.5} color={"#58e3ff"} speedX={0.25} tiltX={0.3} opacity={0.6} />
              <NeuralRing radius={1.85} tubular={0.008} color={"#8c5cff"} speedX={-0.18} speedY={0.08} tiltX={1.1} opacity={0.45} />
              <NeuralRing radius={2.2} tubular={0.006} color={"#c965ff"} speedX={0.1} speedY={-0.06} tiltX={1.7} tiltY={0.4} opacity={0.35} />
              <OrbitalNodes count={22} />
              <NeuralLines count={32} />
            </group>
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}
