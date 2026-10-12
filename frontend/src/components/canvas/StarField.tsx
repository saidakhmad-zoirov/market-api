import { useMemo, useRef } from "react";

import { readPalette, useCanvasLoop } from "./useCanvas";

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/** Butun sahifa orqasidagi yulduzli osmon. Har 3 soniyada bitta uchar yulduz. */
export function StarField() {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 140 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.2 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
      })),
    [],
  );
  const meteor = useRef<Meteor | null>(null);
  const lastMeteor = useRef(0);

  const ref = useCanvasLoop(
    ({ ctx, width, height, time }) => {
      ctx.clearRect(0, 0, width, height);
      const pal = readPalette();
      const dark = pal.dark;
      const base = dark ? "226,234,246" : "15,21,18";

      for (const s of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.001 * s.speed + s.phase));
        ctx.fillStyle = `rgba(${base},${(dark ? 0.75 : 0.16) * tw})`;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (time - lastMeteor.current > 3000) {
        lastMeteor.current = time;
        const angle = Math.PI * (0.16 + Math.random() * 0.1);
        const speed = 0.9 + Math.random() * 0.5;
        meteor.current = {
          x: width * (0.15 + Math.random() * 0.7),
          y: -20,
          vx: -Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
        };
      }

      const m = meteor.current;
      if (m) {
        m.x += m.vx * 16;
        m.y += m.vy * 16;
        m.life -= 0.012;
        const tail = 140;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
        grad.addColorStop(0, `rgba(${pal.accent2},${m.life * (dark ? 1 : 0.7)})`);
        grad.addColorStop(1, `rgba(${pal.accent},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
        ctx.stroke();
        if (m.life <= 0 || m.y > height + 50) meteor.current = null;
      }
    },
    { always: true },
  );

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
