import { useMemo } from "react";

import { readPalette, useCanvasLoop } from "./useCanvas";

type Variant = "rings" | "flow";

/**
 * Bo'lim fonlari:
 *  - rings: kategoriyalar markazdan tarqaladigan "signal" halqalari (har kategoriya — bitta orbita nuqtasi)
 *  - flow:  zarrachalar oqimi — savatchadan buyurtmaga harakat g'oyasi
 */
export function AmbientCanvas({ variant, points = 6, className = "" }: { variant: Variant; points?: number; className?: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        x: Math.random(),
        y: Math.random(),
        v: 0.00004 + Math.random() * 0.00012,
        a: Math.random() * Math.PI * 2,
      })),
    [],
  );

  const ref = useCanvasLoop(({ ctx, width, height, time }) => {
    ctx.clearRect(0, 0, width, height);
    const pal = readPalette();
    const dark = pal.dark;
    const ring = pal.accent;
    const spark = pal.accent2;

    if (variant === "rings") {
      const cx = width * 0.82;
      const cy = height * 0.5;
      const maxR = Math.max(width, height) * 0.7;
      for (let i = 0; i < 5; i++) {
        const p = ((time * 0.00012 + i / 5) % 1 + 1) % 1;
        ctx.strokeStyle = `rgba(${ring},${(1 - p) * (dark ? 0.22 : 0.18)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, p * maxR, 0, Math.PI * 2);
        ctx.stroke();
      }
      const n = Math.max(1, points);
      for (let i = 0; i < n; i++) {
        const r = maxR * (0.18 + (0.55 * i) / n);
        const ang = time * 0.00018 * (1 + i * 0.12) + i * 1.7;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r * 0.55;
        ctx.fillStyle = i === 0 ? `rgba(${spark},0.9)` : `rgba(${ring},0.7)`;
        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 3.2 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      for (const p of particles) {
        p.x += p.v * 16 * 6;
        if (p.x > 1.05) p.x = -0.05;
        const y = p.y + Math.sin(time * 0.0008 + p.a) * 0.02;
        const px = p.x * width;
        const py = y * height;
        ctx.strokeStyle = `rgba(${ring},${dark ? 0.35 : 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - 18, py);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = p.a > 5.6 ? `rgba(${spark},0.9)` : `rgba(${ring},0.8)`;
        ctx.fillRect(px, py - 1, 2, 2);
      }
    }
  });

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
