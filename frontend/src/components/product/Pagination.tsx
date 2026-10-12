import { ArrowIcon } from "../ui/Icons";

interface Props {
  page: number;
  pageSize: number;
  count: number;
  onChange: (page: number) => void;
}

function pagesToShow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1]);
  const list = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  list.forEach((p, i) => {
    if (i && p - list[i - 1]! > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageSize, count, onChange }: Props) {
  const total = Math.max(1, Math.ceil(count / pageSize));
  if (total <= 1) return null;
  const btn = "grid h-10 min-w-10 place-items-center rounded-full px-3 font-mono text-sm transition";
  return (
    <nav aria-label="Sahifalar" className="flex flex-wrap items-center justify-center gap-2">
      <button className={`${btn} border border-line hover:border-line-strong disabled:opacity-30`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Oldingi sahifa">
        <ArrowIcon width={16} height={16} className="rotate-180" />
      </button>
      {pagesToShow(page, total).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted">…</span>
        ) : (
          <button
            key={p}
            className={`${btn} ${p === page ? "bg-ink text-bg" : "text-muted hover:bg-panel-2 hover:text-ink"}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button className={`${btn} border border-line hover:border-line-strong disabled:opacity-30`} disabled={page >= total} onClick={() => onChange(page + 1)} aria-label="Keyingi sahifa">
        <ArrowIcon width={16} height={16} />
      </button>
    </nav>
  );
}
