import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { ProductImage } from "../components/product/ProductImage";
import { LinkButton } from "../components/ui/Button";
import { ConfirmButton } from "../components/ui/ConfirmButton";
import { CheckIcon } from "../components/ui/Icons";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/errors";
import { orderService } from "../services/orders";
import type { OrderStatus } from "../types";
import { STATUS_LABELS, formatDate, formatPrice } from "../utils/format";
import { StatusBadge } from "./Orders";

const STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id = "" } = useParams();
  const location = useLocation();
  const justCreated = Boolean((location.state as { created?: boolean } | null)?.created);
  const { notify } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const order = useAsync((signal) => orderService.get(id, signal), [id]);
  const o = order.data;

  if (order.loading && !o) return <LoadingState />;
  if (order.notFound)
    return (
      <div className="shell">
        <EmptyState title="Buyurtma topilmadi" action={<LinkButton to="/orders">Buyurtmalarga qaytish</LinkButton>} />
      </div>
    );
  if (order.error || !o)
    return (
      <div className="shell">
        <ErrorState message={order.error ?? "Xatolik"} onRetry={order.reload} />
      </div>
    );

  const cancel = async () => {
    setCancelling(true);
    try {
      order.setData(await orderService.cancel(o.id));
      notify("Buyurtma bekor qilindi", "info");
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setCancelling(false);
    }
  };

  const stepIndex = STEPS.indexOf(o.status);

  return (
    <div className="shell max-w-5xl">
      {justCreated && (
        <div className="panel glow-accent mb-8 flex items-center gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
            <CheckIcon />
          </span>
          <div>
            <p className="font-semibold">Buyurtma qabul qilindi!</p>
            <p className="text-sm text-muted">Holatini shu sahifada kuzatishingiz mumkin.</p>
          </div>
        </div>
      )}

      <Link to="/orders" className="text-sm text-muted transition hover:text-ink">
        ← Barcha buyurtmalar
      </Link>
      <header className="mb-10 mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl font-medium">Buyurtma #{o.id}</h1>
          <p className="text-muted">{formatDate(o.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={o.status} />
          {o.status === "pending" && (
            <ConfirmButton label="Bekor qilish" question="Buyurtma bekor qilinsinmi?" onConfirm={cancel} loading={cancelling} />
          )}
        </div>
      </header>

      {o.status !== "cancelled" && (
        <ol className="panel mb-8 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s} className="space-y-2">
              <div className={`h-1 rounded-full ${i <= stepIndex ? (i === stepIndex ? "bg-accent" : "bg-accent-2") : "bg-panel-2"}`} />
              <p className={`text-sm ${i <= stepIndex ? "text-ink" : "text-faint"}`}>{STATUS_LABELS[s]}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <ul className="panel divide-y divide-line">
          {o.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                <ProductImage src={item.image} name={item.product_name} />
              </div>
              <div className="min-w-0 flex-1">
                {item.product_id ? (
                  <Link to={`/products/${item.product_id}`} className="block truncate font-semibold hover:text-accent-2">
                    {item.product_name}
                  </Link>
                ) : (
                  <p className="truncate font-semibold">{item.product_name}</p>
                )}
                <p className="font-mono text-sm text-muted">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="font-display font-semibold">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <aside className="panel h-fit space-y-4 p-6">
          <div>
            <p className="label">Qabul qiluvchi</p>
            <p className="mt-1">{o.full_name}</p>
            <p className="text-sm text-muted">{o.phone}</p>
          </div>
          <div>
            <p className="label">Manzil</p>
            <p className="mt-1">{o.address}</p>
          </div>
          {o.comment && (
            <div>
              <p className="label">Izoh</p>
              <p className="mt-1 text-muted">{o.comment}</p>
            </div>
          )}
          <div className="flex items-end justify-between border-t border-line pt-4">
            <span className="label">Jami</span>
            <span className="font-display text-3xl font-medium text-accent-ink">{formatPrice(o.total_price)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
