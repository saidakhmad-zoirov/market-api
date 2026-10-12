import { Link } from "react-router-dom";

import { AmbientCanvas } from "../components/canvas/AmbientCanvas";
import { PriceTowers } from "../components/canvas/PriceTowers";
import { ProductGrid } from "../components/product/ProductGrid";
import { SearchBar } from "../components/product/SearchBar";
import { LinkButton } from "../components/ui/Button";
import { CountUp } from "../components/ui/CountUp";
import { DecodeText } from "../components/ui/DecodeText";
import { ArrowIcon } from "../components/ui/Icons";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, ProductGridSkeleton } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useReveal } from "../hooks/useReveal";
import { categoryService, productService } from "../services/products";

function SectionHead({ label, title, link }: { label: string; title: string; link?: { to: string; text: string } }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-3">
        <DecodeText text={label} className="label text-accent-2" />
        <h2 className="text-3xl font-medium sm:text-5xl">{title}</h2>
      </div>
      {link && (
        <Link to={link.to} className="roll-host group inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink">
          <span className="roll">
            <span>{link.text}</span>
            <span aria-hidden="true">{link.text}</span>
          </span>
          <ArrowIcon width={16} height={16} className="transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  // Hammasi haqiqiy API'dan: yangi mahsulotlar, kategoriyalar, ombordagi mahsulotlar soni, eng ko'p sotilganlar
  const latest = useAsync((signal) => productService.list({ ordering: "-created_at", page_size: 12 }, signal), []);
  const categories = useAsync((signal) => categoryService.list(signal), []);
  const inStock = useAsync((signal) => productService.list({ in_stock: true, page_size: 1 }, signal), []);
  const popular = useAsync((signal) => productService.list({ ordering: "-sold_count", page_size: 4 }, signal), []);

  const products = latest.data?.results ?? [];
  const bestSellers = (popular.data?.results ?? []).filter((p) => p.sold_count > 0);
  const priciest = products.length ? products.reduce((a, b) => (Number(b.price) > Number(a.price) ? b : a)).id : undefined;
  const catRef = useReveal<HTMLDivElement>([categories.data?.length ?? 0]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="shell relative grid min-h-[78vh] items-center gap-10 pb-16 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 px-4 py-2 backdrop-blur">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            <DecodeText text="LIVE API · DJANGO REST" className="font-mono text-[11px] tracking-[0.18em] text-muted" />
          </div>
          <h1 className="text-[clamp(2.8rem,8vw,6.6rem)] font-medium leading-[0.95]">
            <SplitText text="Kerakli narsa." className="block" />
            <SplitText text="Aniq narx." className="block text-accent-ink" delay={380} />
          </h1>
          <p className="max-w-lg text-lg text-muted">
            Har bir mahsulot, narx va ombor qoldig'i to'g'ridan-to'g'ri backend'dan keladi. Qidiring, solishtiring, savatchaga soling va bir necha
            soniyada buyurtma bering.
          </p>
          <div className="max-w-xl">
            <SearchBar size="lg" />
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton to="/products" size="lg" icon={<ArrowIcon width={18} height={18} />}>
              Katalogni ochish
            </LinkButton>
            <LinkButton to="/register" size="lg" variant="outline">
              Hisob yaratish
            </LinkButton>
          </div>
        </div>

        <div className="relative h-[340px] sm:h-[460px] lg:h-[560px]">
          <div className="pointer-events-none absolute inset-8 rounded-full bg-accent/12 blur-[90px]" />
          {latest.loading ? (
            <div className="grid h-full place-items-center">
              <div className="shimmer size-48 rounded-[40px] opacity-60" />
            </div>
          ) : products.length ? (
            <>
              <PriceTowers products={products} />
              <p className="label pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Minora balandligi = narx · bosing
              </p>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center text-sm text-muted">
              {latest.error ? "API'ga ulanib bo'lmadi" : "Mahsulot qo'shilgach, bu yerda narx minoralari paydo bo'ladi"}
            </div>
          )}
        </div>
      </section>

      {/* ---------- RAQAMLAR (real) ---------- */}
      {latest.data && (
        <section className="shell">
          <div className="panel grid grid-cols-1 divide-y divide-line shadow-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { label: "Mahsulotlar", value: latest.data.count, accent: true },
              { label: "Kategoriyalar", value: categories.data?.length ?? 0 },
              { label: "Hozir omborda", value: inStock.data?.count ?? 0 },
            ].map((s) => (
              <div key={s.label} className="p-8">
                <p className="label">{s.label}</p>
                <CountUp value={s.value} className={`mt-3 block font-display text-5xl font-medium ${s.accent ? "text-accent-ink" : ""}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- KATEGORIYALAR ---------- */}
      <section className="relative mt-28 overflow-hidden py-6">
        <AmbientCanvas variant="rings" points={categories.data?.length ?? 6} />
        <div className="shell relative">
          <SectionHead label="KATEGORIYALAR" title="Yo'nalishni tanlang" link={{ to: "/products", text: "Barcha mahsulotlar" }} />
          {categories.loading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="shimmer h-24 w-56 rounded-3xl" />
              ))}
            </div>
          ) : categories.error ? (
            <ErrorState message={categories.error} onRetry={categories.reload} />
          ) : categories.data?.length ? (
            <div ref={catRef} className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {(() => {
                const max = Math.max(1, ...categories.data.map((c) => c.product_count));
                return categories.data.map((c, i) => (
                  <Link
                    key={c.id}
                    to={`/products?category=${c.slug}`}
                    className="reveal group relative overflow-hidden rounded-3xl border border-transparent bg-bg-2 p-6 transition duration-500 hover:-translate-y-1 hover:border-accent/25 hover:bg-mint"
                    style={{ ["--i" as string]: i }}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-semibold">{c.name}</h3>
                      <ArrowIcon className="-rotate-45 text-muted transition duration-500 group-hover:rotate-0 group-hover:text-accent-ink" />
                    </div>
                    <p className="mt-6 font-mono text-sm text-muted">{c.product_count} ta mahsulot</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full ${c.product_count === max ? "bg-accent" : "bg-accent-2"}`}
                        style={{ width: `${(c.product_count / max) * 100}%` }}
                      />
                    </div>
                  </Link>
                ));
              })()}
            </div>
          ) : (
            <EmptyState title="Kategoriyalar hali yo'q" text="Admin panel orqali birinchi kategoriyani qo'shing." />
          )}
        </div>
      </section>

      {/* ---------- ENG KO'P SOTILGANLAR — faqat haqiqiy savdo bo'lsa ---------- */}
      {bestSellers.length > 0 && (
        <section className="shell mt-28">
          <SectionHead label="OMMABOP" title="Eng ko'p sotilganlar" />
          <ProductGrid products={bestSellers} highlightId={bestSellers[0]?.id} />
        </section>
      )}

      {/* ---------- YANGI MAHSULOTLAR ---------- */}
      <section className="shell mt-28">
        <SectionHead label="YANGI" title="So'nggi qo'shilganlar" link={{ to: "/products", text: "Katalog" }} />
        {latest.loading ? (
          <ProductGridSkeleton count={8} />
        ) : latest.error ? (
          <ErrorState message={latest.error} onRetry={latest.reload} />
        ) : products.length ? (
          <ProductGrid products={products.slice(0, 8)} highlightId={priciest} />
        ) : (
          <EmptyState title="Mahsulotlar hali qo'shilmagan" text="Admin panelda mahsulot qo'shing yoki `python manage.py seed_demo` buyrug'ini ishga tushiring." />
        )}
      </section>
    </>
  );
}
