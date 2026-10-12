import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { ProductGrid } from "../components/product/ProductGrid";
import { ProductImage } from "../components/product/ProductImage";
import { Button, LinkButton } from "../components/ui/Button";
import { ArrowIcon, BagIcon, CheckIcon } from "../components/ui/Icons";
import { QuantityStepper } from "../components/ui/QuantityStepper";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/errors";
import { productService } from "../services/products";
import { formatPrice } from "../utils/format";

export default function ProductDetail() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const cart = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const product = useAsync((signal) => productService.get(id, signal), [id]);
  const p = product.data;
  const related = useAsync(
    (signal) =>
      p ? productService.list({ category: p.category.slug, page_size: 5 }, signal) : Promise.resolve(null),
    [p?.category.slug],
  );

  if (product.loading && !p) return <LoadingState />;
  if (product.notFound)
    return (
      <div className="shell">
        <EmptyState title="Mahsulot topilmadi" text="U o'chirilgan yoki sotuvdan olingan bo'lishi mumkin." action={<LinkButton to="/products">Katalogga qaytish</LinkButton>} />
      </div>
    );
  if (product.error || !p)
    return (
      <div className="shell">
        <ErrorState message={product.error ?? "Xatolik"} onRetry={product.reload} />
      </div>
    );

  const inCart = cart.cart?.items.find((i) => i.product.id === p.id)?.quantity ?? 0;
  const available = Math.max(0, p.stock - inCart);
  const stockPct = Math.min(100, (p.stock / 50) * 100);

  const addToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setAdding(true);
    try {
      await cart.add(p.id, qty);
      notify(`${p.name} savatchaga qo'shildi`);
      setQty(1);
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setAdding(false);
    }
  };

  const others = (related.data?.results ?? []).filter((r) => r.id !== p.id).slice(0, 4);

  return (
    <div className="shell">
      <nav aria-label="Yo'l" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/products" className="transition hover:text-ink">
          Katalog
        </Link>
        <span>/</span>
        <Link to={`/products?category=${p.category.slug}`} className="transition hover:text-ink">
          {p.category.name}
        </Link>
        <span>/</span>
        <span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="group panel relative aspect-square overflow-hidden lg:sticky lg:top-28 lg:self-start">
          <ProductImage src={p.image} name={p.name} category={p.category.name} />
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <span className="label text-accent-2">{p.category.name}</span>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.02]">
              <SplitText text={p.name} />
            </h1>
            <p className="font-display text-4xl font-medium text-accent-ink">{formatPrice(p.price)}</p>
          </div>

          <div className="panel space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="label">Ombordagi miqdor</span>
              <span className={`font-mono ${p.in_stock ? "text-ok" : "text-danger"}`}>{p.in_stock ? `${p.stock} dona` : "Tugagan"}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-panel-2">
              <div className={`h-full rounded-full transition-all duration-700 ${p.stock <= 5 ? "bg-accent-2" : "bg-accent"}`} style={{ width: `${stockPct}%` }} />
            </div>
            {inCart > 0 && (
              <p className="flex items-center gap-2 text-sm text-muted">
                <CheckIcon width={16} height={16} className="text-ok" /> Savatchangizda {inCart} dona bor
              </p>
            )}
          </div>

          {p.in_stock ? (
            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper value={Math.min(qty, Math.max(1, available))} max={Math.max(1, available)} disabled={!available} onChange={setQty} />
              <Button size="lg" onClick={addToCart} loading={adding} disabled={user ? available === 0 : false} icon={<BagIcon width={18} height={18} />}>
                {user ? (available ? "Savatchaga qo'shish" : "Hammasi savatchada") : "Kirib, savatchaga qo'shish"}
              </Button>
              {inCart > 0 && (
                <LinkButton to="/cart" variant="outline" size="lg" icon={<ArrowIcon width={18} height={18} />}>
                  Savatcha
                </LinkButton>
              )}
            </div>
          ) : (
            <p className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-4 text-sm text-danger">Bu mahsulot hozircha omborda yo'q.</p>
          )}

          <div className="space-y-3 border-t border-line pt-8">
            <h2 className="label">Tavsif</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted">{p.description || "Tavsif qo'shilmagan."}</p>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-28">
          <h2 className="mb-8 text-3xl font-medium sm:text-4xl">Shu kategoriyadan</h2>
          <ProductGrid products={others} />
        </section>
      )}
    </div>
  );
}
