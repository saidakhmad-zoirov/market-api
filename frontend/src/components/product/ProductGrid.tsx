import { useReveal } from "../../hooks/useReveal";
import type { Product } from "../../types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, highlightId }: { products: Product[]; highlightId?: number }) {
  const ref = useReveal<HTMLDivElement>([products.map((p) => p.id).join(",")]);
  return (
    <div ref={ref} className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} highlight={p.id === highlightId} />
      ))}
    </div>
  );
}
