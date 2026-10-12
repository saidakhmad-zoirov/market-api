import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import { readPalette, useCanvasLoop } from "./useCanvas";

type Pt = [number, number];

interface Tower {
  product: Product;
  gx: number; // panjara koordinatasi
  gy: number;
  h: number; // 0..1 — narxga proporsional
  lift: number; // hover animatsiyasi
}

interface Hit {
  index: number;
  polys: Pt[][];
}

/** "r,g,b" rangini k koeffitsiyent bilan qoraytirish/yoritish */
function shadeRgb(rgbStr: string, k: number): string {
  const [r, g, b] = rgbStr.split(",").map((v) => Math.min(255, Math.round(Number(v) * k)));
  return `rgb(${r},${g},${b})`;
}

function inPoly([x, y]: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Hero vizuali: har bir minora — API'dan kelgan haqiqiy mahsulot.
 * Minora balandligi = narx. Eng qimmat mahsulot asosiy aksent (yashil) rangda, hover — amber.
 * Sichqoncha tomon og'adi, hover'da ko'tariladi, bosilganda mahsulot sahifasiga o'tadi.
 */
export function PriceTowers({ products }: { products: Product[] }) {
  const navigate = useNavigate();
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0, px: -1, py: -1 });
  const hovered = useRef<number>(-1);
  const hits = useRef<Hit[]>([]);
  const towersRef = useRef<Tower[]>([]);
  const keyRef = useRef("");

  // Mahsulotlar o'zgarsa panjarani qayta quramiz
  const key = products.map((p) => `${p.id}:${p.price}`).join("|");
  if (key !== keyRef.current) {
    keyRef.current = key;
    const list = products.slice(0, 12);
    const max = Math.max(1, ...list.map((p) => Number.parseFloat(p.price) || 0));
    const cols = Math.ceil(Math.sqrt(list.length));
    towersRef.current = list.map((product, i) => ({
      product,
      gx: (i % cols) - (cols - 1) / 2,
      gy: Math.floor(i / cols) - (Math.ceil(list.length / cols) - 1) / 2,
      h: 0.18 + 0.82 * ((Number.parseFloat(product.price) || 0) / max),
      lift: 0,
    }));
  }

  const ref = useCanvasLoop(({ ctx, width, height }) => {
    ctx.clearRect(0, 0, width, height);
    const towers = towersRef.current;
    if (!towers.length) return;
    const pal = readPalette();
    const dark = pal.dark;

    // sichqoncha bo'yicha og'ish (yumshoq)
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;
    const angle = Math.PI / 4 + m.x * 0.35;
    const elev = 0.52 + m.y * 0.12;

    const span = Math.max(...towers.map((t) => Math.max(Math.abs(t.gx), Math.abs(t.gy)))) + 1;
    const unit = Math.min(width, height * 1.3) / (span * 3.2);
    const cx = width / 2;
    const cy = height * 0.62;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const proj = (x: number, y: number, z: number): Pt => {
      const xr = x * cos - y * sin;
      const yr = x * sin + y * cos;
      return [cx + xr * unit, cy + yr * unit * elev - z * unit];
    };
    const depth = (t: Tower) => t.gx * sin + t.gy * cos;

    // pol to'ri
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${pal.accent},${dark ? 0.12 : 0.14})`;
    for (let i = -span; i <= span; i++) {
      const a = proj(i, -span, 0);
      const b = proj(i, span, 0);
      const c = proj(-span, i, 0);
      const d = proj(span, i, 0);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.moveTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.stroke();
    }

    const maxIdx = towers.reduce((best, t, i) => (t.h > towers[best]!.h ? i : best), 0);
    const order = towers.map((_, i) => i).sort((a, b) => depth(towers[a]!) - depth(towers[b]!));
    const newHits: Hit[] = [];
    const s = 0.32; // minora yarim kengligi
    const heightScale = span * 1.25;

    for (const i of order) {
      const t = towers[i]!;
      const target = hovered.current === i ? 1 : 0;
      t.lift += (target - t.lift) * 0.15;
      const z0 = t.lift * 0.25;
      const z1 = z0 + t.h * heightScale;
      const isMax = i === maxIdx;
      const isHover = hovered.current === i;
      const corners: [number, number][] = [
        [t.gx - s, t.gy - s],
        [t.gx + s, t.gy - s],
        [t.gx + s, t.gy + s],
        [t.gx - s, t.gy + s],
      ];
      const top = corners.map(([x, y]) => proj(x, y, z1));
      const bottom = corners.map(([x, y]) => proj(x, y, z0));
      const polys: Pt[][] = [];

      // ko'rinadigan yon yuzlar (normal tomoshabinga qaragan)
      const normals: [number, number][] = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ];
      normals.forEach(([nx, ny], k) => {
        const nyr = nx * sin + ny * cos;
        if (nyr <= 0) return;
        const nxr = nx * cos - ny * sin;
        const a = k;
        const b = (k + 1) % 4;
        const face: Pt[] = [bottom[a]!, bottom[b]!, top[b]!, top[a]!];
        const shade = 0.5 + nxr * 0.25;
        // yon yuz: eng qimmat — aksent rang, qolganlari — grafit/oq neytral
        const light = 0.45 + shade * 0.45;
        if (isMax) ctx.fillStyle = shadeRgb(pal.accent, light);
        else ctx.fillStyle = dark ? shadeRgb("44,66,100", 0.6 + shade * 0.5) : shadeRgb("208,216,210", 0.8 + shade * 0.2);
        ctx.beginPath();
        face.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fill();
        polys.push(face);
      });

      ctx.beginPath();
      top.forEach(([x, y], n) => (n ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = isMax ? `rgb(${pal.accent})` : isHover ? `rgb(${pal.accent2})` : dark ? "#3A5683" : "#EEF2EF";
      ctx.fill();
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.18)" : "rgba(11,11,16,0.08)";
      ctx.stroke();
      polys.push(top);
      newHits.push({ index: i, polys });
    }
    hits.current = newHits;

    // hover yorlig'i — canvas'da aniq matn
    const hi = hovered.current;
    if (hi >= 0 && towers[hi]) {
      const t = towers[hi]!;
      const [x, y] = proj(t.gx, t.gy, t.lift * 0.25 + t.h * heightScale);
      const name = t.product.name.length > 26 ? `${t.product.name.slice(0, 25)}…` : t.product.name;
      const price = formatPrice(t.product.price);
      ctx.font = '600 13px "Instrument Sans", system-ui, sans-serif';
      const w = Math.max(ctx.measureText(name).width, 80) + 28;
      const bx = Math.min(Math.max(8, x - w / 2), width - w - 8);
      const by = Math.max(8, y - 70);
      ctx.fillStyle = dark ? "rgba(23,42,69,0.96)" : "rgba(255,255,255,0.96)";
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 52, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = dark ? "#F3F6FB" : "#111116";
      ctx.fillText(name, bx + 14, by + 22);
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgb(${pal.accent})`;
      ctx.fillText(price, bx + 14, by + 40);
    }
  });

  const pick = (clientX: number, clientY: number) => {
    const canvas = ref.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const p: Pt = [clientX - rect.left, clientY - rect.top];
    for (let k = hits.current.length - 1; k >= 0; k--) {
      const hit = hits.current[k]!;
      if (hit.polys.some((poly) => inPoly(p, poly))) return hit.index;
    }
    return -1;
  };

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Mahsulotlar narx minoralari: minora qancha baland bo'lsa, narx shuncha yuqori"
      className="h-full w-full cursor-crosshair touch-pan-y"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouse.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouse.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        const idx = pick(e.clientX, e.clientY);
        hovered.current = idx;
        e.currentTarget.style.cursor = idx >= 0 ? "pointer" : "crosshair";
      }}
      onPointerLeave={() => {
        hovered.current = -1;
        mouse.current.tx = 0;
        mouse.current.ty = 0;
      }}
      onClick={(e) => {
        const idx = pick(e.clientX, e.clientY);
        const tower = towersRef.current[idx];
        if (tower) navigate(`/products/${tower.product.id}`);
      }}
    />
  );
}
