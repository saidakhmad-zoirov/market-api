import { Link } from "react-router-dom";

import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import { ArrowIcon } from "../ui/Icons";
import { ProductImage } from "./ProductImage";

/**
 * Mahsulot kartasi — qorong'i fonda yorug' "plitka".
 * highlight=true bo'lsa (masalan, eng qimmat / eng ko'p sotilgan) — to'liq accent rangda.
 */
export function ProductCard({ product, index = 0, highlight = false }: { product: Product; index?: number; highlight?: boolean }) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const tone = highlight
    ? "bg-accent text-on-accent shadow-[0_24px_60px_-28px_var(--glow)]"
    : "bg-tile text-tile-ink shadow-[0_0_0_1px_var(--tile-line)] hover:shadow-[0_0_0_1px_var(--accent),0_18px_40px_-24px_var(--glow)]";
  const sub = highlight ? "text-on-accent/70" : "text-tile-muted";

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group reveal relative flex flex-col overflow-hidden rounded-[22px] p-2.5 transition duration-500 hover:-translate-y-1.5 ${tone}`}
      style={{ ["--i" as string]: index % 8 }}
    >
      <div className="relative aspect-[4/3.3] overflow-hidden rounded-[16px] bg-panel">
        <ProductImage src={product.image} name={product.name} category={product.category.name} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {!product.in_stock && <span className="rounded-full bg-bg/80 px-3 py-1 text-xs font-medium text-danger backdrop-blur">Tugagan</span>}
          {lowStock && <span className="rounded-full bg-bg/80 px-3 py-1 text-xs font-medium text-ink backdrop-blur">Oxirgi {product.stock} dona</span>}
        </div>
        <span className="absolute bottom-3 right-3 grid size-10 translate-y-3 place-items-center rounded-full bg-accent text-on-accent opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowIcon width={18} height={18} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2.5 pb-2.5 pt-4">
        <div className={`flex items-center justify-between gap-3 font-mono text-[11.5px] ${sub}`}>
          <span className="truncate">{product.category.name}</span>
          <span className="shrink-0">{product.in_stock ? `${product.stock} omborda` : "—"}</span>
        </div>
        <h3 className="line-clamp-2 text-lg leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-display text-[34px] leading-none tracking-[-0.02em] tabular-nums">{formatPrice(product.price)}</span>
          {highlight && <span className="font-mono text-xs text-on-accent/70">TOP</span>}
        </div>
      </div>
    </Link>
  );
}
