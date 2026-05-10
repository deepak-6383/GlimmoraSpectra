"use client";

/**
 * SpatialAnchor3D — a single anchored AR overlay in the 3D scene.
 *
 * Composition:
 *   * a thin glowing ring at the bbox center (always visible)
 *   * a holographic panel above it that expands when the anchor is focused
 *   * an HTML label rendered via drei <Html> for crisp text
 *   * a subtle leader line connecting the panel to the ring
 *
 * Gaze focus is read from the spatial store; activation triggers a
 * second outer ring and bumps the panel's brightness.
 */

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { bboxToWorld, type SpatialAnchor, useSpatialStore } from "@/lib/spatial";

import { HolographicPanel } from "./holographic-panel";

const TONE_FOR_KIND = {
  object: "cyan",
  person: "violet",
  place: "aurora",
  memory: "amber",
  note: "coral",
} as const;

const KIND_LABEL = {
  object: "Object",
  person: "Person",
  place: "Place",
  memory: "Memory",
  note: "Text",
};

export function SpatialAnchor3D({
  anchor,
  fovRad,
  aspect,
}: {
  anchor: SpatialAnchor;
  fovRad: number;
  aspect: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const focusedId = useSpatialStore((s) => s.focusedId);
  const activatedId = useSpatialStore((s) => s.activatedId);
  const setFocused = useSpatialStore((s) => s.setFocused);

  const isFocused = focusedId === anchor.id;
  const isActive = activatedId === anchor.id;
  const tone = TONE_FOR_KIND[anchor.kind];

  // resolve world position from bbox
  const position = useMemo<[number, number, number]>(() => {
    if (!anchor.bbox) return [0, 0, -anchor.depth];
    return bboxToWorld(anchor.bbox, anchor.depth, fovRad, aspect);
  }, [anchor.bbox, anchor.depth, fovRad, aspect]);

  const panelOffset: [number, number, number] = [
    position[0],
    position[1] + 0.55,
    position[2] + 0.05,
  ];

  // update ring scale + emissive on focus / active
  useFrame((state) => {
    if (!ringRef.current) return;
    const target = isActive ? 1.55 : isFocused ? 1.25 : 1.0;
    const current = ringRef.current.scale.x;
    const next = current + (target - current) * 0.12;
    ringRef.current.scale.set(next, next, next);

    const m = ringRef.current.material as THREE.MeshBasicMaterial;
    const targetOpacity = isActive ? 1.0 : isFocused ? 0.85 : 0.55;
    m.opacity = m.opacity + (targetOpacity - m.opacity) * 0.12;

    // gentle rotation
    ringRef.current.rotation.z =
      state.clock.elapsedTime * (isFocused ? 0.4 : 0.12);
  });

  return (
    <group>
      {/* anchor ring at bbox center */}
      <mesh
        ref={ringRef}
        position={position}
        onPointerEnter={() => setFocused(anchor.id)}
        onPointerLeave={() =>
          setFocused((focusedId === anchor.id ? null : focusedId) ?? null)
        }
      >
        <ringGeometry args={[0.12, 0.16, 32]} />
        <meshBasicMaterial
          color={tone === "violet" ? "#8c5cff" : tone === "aurora" ? "#6affc1" : tone === "amber" ? "#ffba6a" : tone === "coral" ? "#ff7a8d" : "#58e3ff"}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* outer pulse ring (only when active) */}
      {(isFocused || isActive) && (
        <PulseRing
          color={tone}
          position={position}
          intense={isActive}
        />
      )}

      {/* leader line — anchor ring to panel */}
      <line>
        <bufferGeometry
          attach="geometry"
          ref={(g) => {
            if (g) {
              g.setFromPoints([
                new THREE.Vector3(...position),
                new THREE.Vector3(...panelOffset),
              ]);
            }
          }}
        />
        <lineBasicMaterial
          color={tone === "violet" ? "#8c5cff" : tone === "aurora" ? "#6affc1" : "#58e3ff"}
          transparent
          opacity={isFocused ? 0.65 : 0.25}
          toneMapped={false}
        />
      </line>

      {/* holographic panel */}
      <HolographicPanel
        position={panelOffset}
        width={isFocused ? 1.5 : 1.05}
        height={isFocused ? 0.78 : 0.5}
        tone={tone}
        active={isActive}
        opacity={isFocused ? 1.0 : 0.85}
      />

      {/* HTML label inside the panel */}
      <Html
        position={[panelOffset[0], panelOffset[1], panelOffset[2] + 0.01]}
        center
        distanceFactor={5}
        zIndexRange={[12, 8]}
        style={{ pointerEvents: "none" }}
      >
        <div
          className="select-none rounded-md border border-white/10 px-3 py-1.5 backdrop-blur-md"
          style={{
            background: "rgba(8,12,24,0.45)",
            minWidth: isFocused ? 240 : 160,
            maxWidth: 320,
          }}
        >
          <div
            className="text-[9px] uppercase tracking-[0.25em]"
            style={{
              color:
                tone === "violet"
                  ? "#c8b3ff"
                  : tone === "aurora"
                    ? "#9cf2d3"
                    : tone === "amber"
                      ? "#ffd29a"
                      : tone === "coral"
                        ? "#ff9eaf"
                        : "#9bd9ff",
            }}
          >
            {KIND_LABEL[anchor.kind]} · {(anchor.confidence * 100).toFixed(0)}%
          </div>
          <div className="mt-0.5 text-[12px] font-medium text-white">
            {anchor.label}
          </div>
          {(isFocused || isActive) && anchor.description && (
            <div className="mt-1 text-[10px] leading-snug text-white/70">
              {anchor.description}
            </div>
          )}
          {isActive && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/80">
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: "#6affc1", boxShadow: "0 0 6px #6affc1" }}
              />
              activated · pin to memory
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function PulseRing({
  color,
  position,
  intense,
}: {
  color: keyof typeof TONE_FOR_KIND extends never ? never : "cyan" | "violet" | "aurora" | "amber" | "coral";
  position: [number, number, number];
  intense: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const cycle = (t * (intense ? 1.6 : 0.9)) % 1.0;
    const scale = 1 + cycle * (intense ? 1.3 : 0.7);
    ref.current.scale.set(scale, scale, scale);
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = (1.0 - cycle) * (intense ? 0.85 : 0.55);
  });
  const hex =
    color === "violet"
      ? "#8c5cff"
      : color === "aurora"
        ? "#6affc1"
        : color === "amber"
          ? "#ffba6a"
          : color === "coral"
            ? "#ff7a8d"
            : "#58e3ff";
  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.13, 0.155, 48]} />
      <meshBasicMaterial
        color={hex}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
