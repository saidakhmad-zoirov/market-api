import { useEffect, useRef, type RefObject } from "react";

import { prefersReducedMotion, useInView } from "../../hooks/useInView";

export interface FrameInfo {
  ctx: CanvasRenderingContext2D;
  width: number; // CSS piksel
  height: number;
  time: number; // ms
  dt: number;
}

/**
 * Canvas uchun umumiy sikl: devicePixelRatio bo'yicha aniq (crisp) chizish,
 * o'lcham o'zgarishini kuzatish, ekrandan tashqarida va yashirin tabda pauza.
 */
export function useCanvasLoop(
  draw: (frame: FrameInfo) => void,
  options: { always?: boolean } = {},
): RefObject<HTMLCanvasElement | null> {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const inView = useInView(ref, "50px");
  const active = options.always || inView;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!document.hidden) drawRef.current({ ctx, width, height, time: now, dt });
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  return ref;
}

export interface Palette {
  dark: boolean;
  accent: string; // "r,g,b"
  accent2: string;
  ink: string;
}

let cached: { key: string; value: Palette } | null = null;

function rgb(hex: string, fallback: string): string {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(n)) return fallback;
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/** Canvas ranglari CSS o'zgaruvchilaridan olinadi — palitra bitta joyda (index.css). */
export function readPalette(): Palette {
  const root = document.documentElement;
  const key = "navy";
  if (cached?.key === key) return cached.value;
  const style = getComputedStyle(root);
  const value: Palette = {
    dark: true,
    accent: rgb(style.getPropertyValue("--accent"), "165,148,255"),
    accent2: rgb(style.getPropertyValue("--accent-2"), "125,211,252"),
    ink: rgb(style.getPropertyValue("--ink"), "245,245,247"),
  };
  cached = { key, value };
  return value;
}
