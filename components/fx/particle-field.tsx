"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  density?: number;
  hue?: [number, number];
  speed?: number;
};

/**
 * Canvas particle field — connected nodes that drift like a neural mesh.
 * Adapts density/DPR for performance. Honors prefers-reduced-motion.
 */
export function ParticleField({
  className,
  density = 0.00012,
  hue = [195, 280],
  speed = 0.18,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type P = { x: number; y: number; vx: number; vy: number; h: number };
    let particles: P[] = [];
    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.6);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.max(40, Math.floor(w * h * density));
      const isMobile = window.innerWidth < 768;
      const finalCount = isMobile ? Math.min(target, 70) : Math.min(target, 200);

      particles = [];
      for (let i = 0; i < finalCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          h: hue[0] + Math.random() * (hue[1] - hue[0]),
        });
      }
    };

    const draw = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      const maxDist = 130;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.22;
            ctx.strokeStyle = `hsla(${(a.h + b.h) / 2}, 90%, 70%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = `hsla(${p.h}, 90%, 75%, 0.7)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    if (!reduced) raf = requestAnimationFrame(draw);
    else draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, hue, speed]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
