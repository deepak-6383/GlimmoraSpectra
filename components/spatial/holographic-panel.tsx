"use client";

/**
 * HolographicPanel — translucent floating UI plate rendered in 3D space.
 *
 * Key design moves:
 *   * Custom GLSL shader that draws scan lines, fresnel-like edge glow
 *     and corner brackets in one pass.
 *   * Always billboards toward the camera so HUD-text never warps.
 *   * Subtle breathing motion driven by `useFrame`.
 *   * Optional "active" state pulses brighter + adds a second outer ring.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Tone = "cyan" | "violet" | "aurora" | "amber" | "coral";

const TONE_COLORS: Record<Tone, [string, string]> = {
  cyan: ["#58e3ff", "#79c8ff"],
  violet: ["#8c5cff", "#c965ff"],
  aurora: ["#6affc1", "#79e0ff"],
  amber: ["#ffba6a", "#ff9a4a"],
  coral: ["#ff7a8d", "#c965ff"],
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uActive;
  uniform float uOpacity;
  uniform float uAspect;
  varying vec2  vUv;

  // hash + fbm
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  // distance-to-rounded-rect SDF in UV space
  float sdRoundRect(vec2 uv, float rx, float ry, float r) {
    vec2 q = abs(uv) - vec2(rx, ry) + vec2(r);
    return length(max(q, 0.0)) - r;
  }

  void main() {
    // center the UV around (0,0)
    vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0);

    // rounded panel mask
    float d = sdRoundRect(uv, 0.5 * uAspect - 0.05, 0.45, 0.10);
    if (d > 0.0) discard;

    // edge glow (fresnel-like)
    float edge = 1.0 - smoothstep(-0.10, 0.00, d);

    // scan lines moving slowly upward
    float scan = sin((vUv.y - uTime * 0.12) * 70.0) * 0.5 + 0.5;
    scan = pow(scan, 6.0);

    // gentle FBM noise
    float n = 0.0;
    n += noise(uv * 4.0 + uTime * 0.05) * 0.5;
    n += noise(uv * 9.0 - uTime * 0.03) * 0.3;

    // base gradient (top→bottom)
    vec3 base = mix(uColorA, uColorB, vUv.y);

    // composite: panel body very translucent, edges glow strongly
    float bodyAlpha = 0.10 + 0.10 * n;
    float edgeAlpha = edge * (0.55 + 0.20 * uActive);
    float scanAlpha = 0.06 * scan * (0.6 + uActive * 0.4);

    vec3 color = base * (0.6 + edgeAlpha + scanAlpha + uActive * 0.25);

    // inner corner bracket accents — distance to corner
    vec2 corner = vec2(0.5 * uAspect - 0.04, 0.45 - 0.04);
    float cornerD = min(
      length(uv - vec2( corner.x,  corner.y)),
      min(
        length(uv - vec2(-corner.x,  corner.y)),
        min(
          length(uv - vec2( corner.x, -corner.y)),
          length(uv - vec2(-corner.x, -corner.y))
        )
      )
    );
    float cornerGlow = exp(-cornerD * 30.0);
    color += uColorA * cornerGlow * (0.5 + uActive);

    float alpha = (bodyAlpha + edgeAlpha + scanAlpha) * uOpacity;
    alpha = clamp(alpha, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function HolographicPanel({
  width = 0.9,
  height = 0.55,
  tone = "cyan",
  active = false,
  opacity = 1.0,
  position = [0, 0, 0] as [number, number, number],
}: {
  width?: number;
  height?: number;
  tone?: Tone;
  active?: boolean;
  opacity?: number;
  position?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(() => {
    const [a, b] = TONE_COLORS[tone];
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(a) },
        uColorB: { value: new THREE.Color(b) },
        uActive: { value: active ? 1 : 0 },
        uOpacity: { value: opacity },
        uAspect: { value: width / height },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }, [tone, width, height]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uActive.value = THREE.MathUtils.lerp(
      material.uniforms.uActive.value,
      active ? 1 : 0,
      0.12,
    );
    material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.uniforms.uOpacity.value,
      opacity,
      0.18,
    );
    if (meshRef.current) {
      // billboard toward camera
      meshRef.current.quaternion.copy(state.camera.quaternion);
      // micro float
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.012;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <primitive attach="material" object={material} ref={matRef} />
    </mesh>
  );
}
