"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  alpha: number;
  size: number;
  vx: number;
  vy: number;
}

interface MouseTrailProps {
  /** Trail color in hex */
  color?: string;
  /** Max number of particles alive at once */
  maxParticles?: number;
  /** How fast particles fade (0-1, higher = faster fade) */
  fadeSpeed?: number;
}

export default function MouseTrail({
  color = "#38bdf8",
  maxParticles = 25,
  fadeSpeed = 0.025,
}: MouseTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Parse hex color to rgb
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 56, g: 189, b: 248 };
    };

    const rgb = hexToRgb(color);

    let spawnAccumulator = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!activeRef.current) {
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
        activeRef.current = true;
      }
    };

    const handleMouseLeave = () => {
      activeRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeRef.current) {
        const dx = mouseRef.current.x - prevMouseRef.current.x;
        const dy = mouseRef.current.y - prevMouseRef.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        // Only spawn particles when mouse is moving
        if (speed > 2) {
          spawnAccumulator += Math.min(speed * 0.15, 3);
          while (
            spawnAccumulator >= 1 &&
            particlesRef.current.length < maxParticles
          ) {
            spawnAccumulator -= 1;
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
            const spawnSpeed = Math.random() * 0.8 + 0.2;
            particlesRef.current.push({
              x: mouseRef.current.x + (Math.random() - 0.5) * 6,
              y: mouseRef.current.y + (Math.random() - 0.5) * 6,
              alpha: 0.6 + Math.random() * 0.4,
              size: 1.5 + Math.random() * 2.5,
              vx: -Math.cos(angle) * spawnSpeed,
              vy: -Math.sin(angle) * spawnSpeed,
            });
          }
        } else {
          spawnAccumulator = 0;
        }

        prevMouseRef.current = { ...mouseRef.current };
      }

      // Update & draw particles
      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        p.alpha -= fadeSpeed;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.size *= 0.985;

        if (p.alpha > 0.01 && p.size > 0.3) {
          alive.push(p);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha * 0.7})`;
          ctx.fill();

          // Add subtle glow
          if (p.alpha > 0.3) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha * 0.08})`;
            ctx.fill();
          }
        }
      }
      particlesRef.current = alive;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [color, maxParticles, fadeSpeed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999998,
      }}
    />
  );
}
