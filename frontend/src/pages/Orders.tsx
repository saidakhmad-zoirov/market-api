import { Link, useSearchParams } from "react-router-dom";

import { Pagination } from "../components/product/Pagination";
import { LinkButton } from "../components/ui/Button";
import { ArrowIcon } from "../components/ui/Icons";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useReveal } from "../hooks/useReveal";
import { orderService } from "../services/orders";
import type { OrderStatus } from "../types";
import { STATUS_LABELS, formatDate, formatPrice } from "../utils/format";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-accent-2/15 text-accent-2",
  processing: "bg-accent-2/25 text-accent-2",
  shipped: "bg-accent/20 text-accent-ink",
  delivered: "bg-ok/15 text-ok",
  cancelled: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}>{STATUS_LABELS[status] ?? status}</span>;
}

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const orders = useAsync((signal) => orderService.list(page, signal), [page]);
  const ref = useReveal<HTMLUListElement>([orders.data?.results.map((o) => o.id).join(",") ?? ""]);

  return (
    <div className="shell">
      <header className="mb-10 space-y-3">
        <p className="label text-accent-2">Buyurtmalar tarixi</p>
        <h1 className="text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-none">
          <SplitText text="Mening buyurtmalarim" />
        </h1>
      </header>

      {orders.loading && !orders.data ? (
        <LoadingState />
      ) : orders.error ? (
        <ErrorState message={orders.error} onRetry={orders.reload} />
      ) : orders.data?.results.length ? (
        <div className="space-y-10">
          <ul ref={ref} className="space-y-3">
            {orders.data.results.map((o, i) => (
              <li key={o.id} className="reveal" style={{ ["--i" as string]: i }}>
                <Link
                  to={`/orders/${o.id}`}
                  className="panel group grid grid-cols-2 items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-line-strong sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-8"
                >
                  <span className="font-display text-2xl font-medium">#{o.id}</span>
                  <span className="text-right text-sm text-muted sm:text-left">{formatDate(o.created_at)}</span>
                  <StatusBadge status={o.status} />
                  <span className="text-right font-mono text-sm text-muted sm:text-left">{o.items_count} dona</span>
                  <span className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1">
                    <span className="font-display text-xl font-semibold">{formatPrice(o.total_price)}</span>
                    <ArrowIcon className="text-muted transition group-hover:translate-x-1 group-hover:text-ink" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={page} pageSize={12} count={orders.data.count} onChange={(p) => setParams(p > 1 ? { page: String(p) } : {})} />
        </div>
      ) : (
        <EmptyState title="Hali buyurtma yo'q" text="Birinchi buyurtmangiz shu yerda ko'rinadi." action={<LinkButton to="/products">Xarid qilish</LinkButton>} />
      )}
    </div>
  );
}
