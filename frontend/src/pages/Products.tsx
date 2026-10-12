import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

import { Pagination } from "../components/product/Pagination";
import { ProductGrid } from "../components/product/ProductGrid";
import { Button } from "../components/ui/Button";
import { CloseIcon, SearchIcon } from "../components/ui/Icons";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, ProductGridSkeleton } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useDebounce } from "../hooks/useDebounce";
import { categoryService, productService } from "../services/products";
import type { ProductOrdering } from "../types";

const PAGE_SIZE = 12;
const SORTS: { value: ProductOrdering; label: string }[] = [
  { value: "-created_at", label: "Eng yangi" },
  { value: "price", label: "Narx: arzonidan" },
  { value: "-price", label: "Narx: qimmatidan" },
  { value: "-sold_count", label: "Ommabop" },
  { value: "name", label: "Nomi: A–Z" },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const ordering = (SORTS.find((s) => s.value === params.get("ordering"))?.value ?? "-created_at") as ProductOrdering;
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const minPrice = params.get("min_price") ?? "";
  const maxPrice = params.get("max_price") ?? "";
  const inStock = params.get("in_stock") === "true";

  // URL — yagona haqiqat manbai: filtrlar ulashiladigan havola bo'lib qoladi
  const update = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (resetPage) next.delete("page");
    setParams(next);
  };

  // qidiruv maydoni: yozish paytida debounce
  const [term, setTerm] = useState(search);
  const debounced = useDebounce(term, 400);
  useEffect(() => setTerm(search), [search]);
  useEffect(() => {
    if (debounced.trim() !== search) update({ search: debounced.trim() || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const [priceDraft, setPriceDraft] = useState({ min: minPrice, max: maxPrice });
  useEffect(() => setPriceDraft({ min: minPrice, max: maxPrice }), [minPrice, maxPrice]);
  const applyPrice = (e: FormEvent) => {
    e.preventDefault();
    update({ min_price: priceDraft.min || null, max_price: priceDraft.max || null });
  };

  const categories = useAsync((signal) => categoryService.list(signal), []);
  const products = useAsync(
    (signal) =>
      productService.list(
        {
          search: search || undefined,
          category: category || undefined,
          ordering,
          page,
          page_size: PAGE_SIZE,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          in_stock: inStock || undefined,
        },
        signal,
      ),
    [search, category, ordering, page, minPrice, maxPrice, inStock],
  );

  // Sahifa raqami mavjud sahifalardan katta bo'lsa (DRF 404 qaytaradi) — 1-sahifaga qaytamiz
  useEffect(() => {
    if (products.notFound && page > 1) update({ page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.notFound]);

  const activeCategory = categories.data?.find((c) => c.slug === category);
  const hasFilters = Boolean(search || category || minPrice || maxPrice || inStock);
  const count = products.data?.count ?? 0;

  return (
    <div className="shell">
      <header className="mb-10 space-y-4">
        <p className="label text-accent-2">Katalog</p>
        <h1 className="text-[clamp(2.4rem,6vw,4.8rem)] font-medium leading-none">
          <SplitText key={activeCategory?.name ?? "all"} text={activeCategory?.name ?? "Barcha mahsulotlar"} />
        </h1>
        <p className="text-muted">
          {products.loading && !products.data ? "Yuklanmoqda…" : `${count} ta mahsulot topildi`}
          {search && (
            <>
              {" "}
              · «<span className="text-ink">{search}</span>» bo'yicha
            </>
          )}
        </p>
      </header>

      {/* ---------- Filtrlar ---------- */}
      <div className="panel sticky top-24 z-30 mb-8 space-y-4 bg-panel/85 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute z-10 left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Nomi, tavsifi yoki kategoriyasi…"
              aria-label="Mahsulot qidirish"
              className="field h-12 rounded-full pl-12"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={ordering}
              onChange={(e) => update({ ordering: e.target.value === "-created_at" ? null : e.target.value })}
              className="field h-12 w-auto cursor-pointer rounded-full pr-10"
              aria-label="Saralash"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <form onSubmit={applyPrice} className="flex items-center gap-2">
              <input
                inputMode="decimal"
                value={priceDraft.min}
                onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="Min $"
                aria-label="Minimal narx"
                className="field h-12 w-24 rounded-full text-center"
              />
              <span className="text-faint">—</span>
              <input
                inputMode="decimal"
                value={priceDraft.max}
                onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value.replace(/[^0-9.]/g, "") }))}
                placeholder="Max $"
                aria-label="Maksimal narx"
                className="field h-12 w-24 rounded-full text-center"
              />
              <Button type="submit" variant="outline" size="md" className="h-12">
                OK
              </Button>
            </form>
            <button
              type="button"
              onClick={() => update({ in_stock: inStock ? null : "true" })}
              className="chip h-12"
              data-active={inStock}
              aria-pressed={inStock}
            >
              Faqat omborda borlari
            </button>
          </div>
        </div>

        {categories.data && categories.data.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            <button type="button" className="chip shrink-0" data-active={!category} onClick={() => update({ category: null })}>
              Hammasi
            </button>
            {categories.data.map((c) => (
              <button key={c.id} type="button" className="chip shrink-0" data-active={c.slug === category} onClick={() => update({ category: c.slug })}>
                {c.name}
                <span className="font-mono text-xs opacity-60">{c.product_count}</span>
              </button>
            ))}
          </div>
        )}

        {hasFilters && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
            onClick={() => {
              setTerm("");
              setParams(ordering === "-created_at" ? {} : { ordering });
            }}
          >
            <CloseIcon width={14} height={14} /> Filtrlarni tozalash
          </button>
        )}
      </div>

      {/* ---------- Natijalar ---------- */}
      <div className={`transition-opacity duration-300 ${products.loading && products.data ? "opacity-50" : ""}`}>
        {products.loading && !products.data ? (
          <ProductGridSkeleton count={8} />
        ) : products.error && !products.notFound ? (
          <ErrorState message={products.error} onRetry={products.reload} />
        ) : products.data && products.data.results.length ? (
          <div className="space-y-12">
            <ProductGrid products={products.data.results} />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              count={count}
              onChange={(p) => {
                update({ page: p > 1 ? String(p) : null }, false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        ) : (
          <EmptyState
            title="Hech narsa topilmadi"
            text={hasFilters ? "Filtrlarni o'zgartirib yoki tozalab ko'ring." : "Do'konda hali mahsulot yo'q."}
          />
        )}
      </div>
    </div>
  );
}
