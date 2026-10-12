import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProductImage } from "../components/product/ProductImage";
import { Button, LinkButton } from "../components/ui/Button";
import { ConfirmButton } from "../components/ui/ConfirmButton";
import { Field, TextArea } from "../components/ui/Field";
import { TrashIcon } from "../components/ui/Icons";
import { QuantityStepper } from "../components/ui/QuantityStepper";
import { SplitText } from "../components/ui/SplitText";
import { EmptyState, ErrorState, LoadingState } from "../components/ui/States";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { getErrorMessage, getFieldErrors } from "../services/errors";
import { orderService } from "../services/orders";
import type { CheckoutPayload } from "../types";
import { formatPrice } from "../utils/format";

export default function CartPage() {
  const { user } = useAuth();
  const cart = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutPayload>({ full_name: "", phone: "", address: "", comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Har safar sahifa ochilganda savatchani serverdan yangilaymiz (narx/ombor o'zgargan bo'lishi mumkin)
  useEffect(() => {
    cart
      .refresh()
      .then(() => setLoadError(null))
      .catch((err: unknown) => setLoadError(getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Profil ma'lumotlari bilan formani oldindan to'ldirish
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      full_name: f.full_name || [user.first_name, user.last_name].filter(Boolean).join(" "),
      phone: f.phone || user.phone,
      address: f.address || user.address,
    }));
  }, [user]);

  const change = async (itemId: number, quantity: number) => {
    try {
      await cart.update(itemId, quantity);
    } catch (err) {
      notify(getErrorMessage(err), "error");
    }
  };

  const remove = async (itemId: number, name: string) => {
    try {
      await cart.remove(itemId);
      notify(`${name} olib tashlandi`, "info");
    } catch (err) {
      notify(getErrorMessage(err), "error");
    }
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await cart.clear();
      notify("Savatcha tozalandi", "info");
    } catch (err) {
      notify(getErrorMessage(err), "error");
    } finally {
      setClearing(false);
    }
  };

  const checkout = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const order = await orderService.create(form);
      cart.reset(); // server savatchani tozaladi
      notify(`Buyurtma #${order.id} qabul qilindi`);
      navigate(`/orders/${order.id}`, { state: { created: true } });
    } catch (err) {
      setErrors(getFieldErrors(err));
      notify(getErrorMessage(err), "error");
      cart.refresh().catch(() => undefined); // ombor o'zgargan bo'lishi mumkin
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.cart && cart.loading) return <LoadingState />;
  if (loadError && !cart.cart)
    return (
      <div className="shell">
        <ErrorState message={loadError} onRetry={() => cart.refresh().then(() => setLoadError(null)).catch((e: unknown) => setLoadError(getErrorMessage(e)))} />
      </div>
    );

  const items = cart.cart?.items ?? [];
  const overStock = items.filter((i) => i.quantity > i.product.stock);

  if (!items.length)
    return (
      <div className="shell">
        <EmptyState
          title="Savatcha bo'sh"
          text="Katalogdan yoqqan mahsulotni tanlang — u shu yerda paydo bo'ladi."
          action={<LinkButton to="/products">Katalogga o'tish</LinkButton>}
        />
      </div>
    );

  return (
    <div className="shell">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="label text-accent-2">Savatcha</p>
          <h1 className="text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-none">
            <SplitText text="Buyurtmani rasmiylashtiring" />
          </h1>
        </div>
        <ConfirmButton label="Tozalash" question="Hammasi o'chirilsinmi?" onConfirm={clearAll} loading={clearing} icon={<TrashIcon width={16} height={16} />} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className={`panel group flex gap-4 p-4 transition sm:gap-6 ${cart.busyItem === item.id ? "opacity-60" : ""}`}>
              <Link to={`/products/${item.product.id}`} className="block size-24 shrink-0 overflow-hidden rounded-2xl sm:size-32">
                <ProductImage src={item.product.image} name={item.product.name} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label">{item.product.category.name}</p>
                    <Link to={`/products/${item.product.id}`} className="mt-1 block truncate text-lg font-semibold hover:text-accent-2">
                      {item.product.name}
                    </Link>
                    <p className="font-mono text-sm text-muted">{formatPrice(item.product.price)} / dona</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`${item.product.name} — olib tashlash`}
                    onClick={() => remove(item.id, item.product.name)}
                    disabled={cart.busyItem === item.id}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger"
                  >
                    <TrashIcon width={18} height={18} />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    value={item.quantity}
                    max={Math.max(item.quantity, item.product.stock)}
                    disabled={cart.busyItem === item.id}
                    onChange={(q) => change(item.id, q)}
                  />
                  <span className="font-display text-xl font-semibold">{formatPrice(item.subtotal)}</span>
                </div>
                {item.quantity > item.product.stock && (
                  <p className="text-sm text-danger">Omborda faqat {item.product.stock} dona qoldi — miqdorni kamaytiring.</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <form onSubmit={checkout} className="panel space-y-5 p-6" noValidate>
            <div className="space-y-2 border-b border-line pb-5">
              <div className="flex justify-between text-sm text-muted">
                <span>Mahsulotlar</span>
                <span className="font-mono">{cart.cart?.total_items} dona</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="label">Jami</span>
                <span className="font-display text-3xl font-medium text-accent-ink">{formatPrice(cart.cart?.total_price ?? "0")}</span>
              </div>
              <p className="text-xs text-faint">Summa serverda, bazadagi joriy narxlar bo'yicha hisoblanadi.</p>
            </div>

            <Field label="F.I.Sh." name="full_name" required value={form.full_name} error={errors.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} autoComplete="name" />
            <Field label="Telefon" name="phone" type="tel" required placeholder="+998 90 123 45 67" value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
            <Field label="Manzil" name="address" required value={form.address} error={errors.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" />
            <TextArea label="Izoh (ixtiyoriy)" name="comment" value={form.comment} error={errors.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />

            <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={overStock.length > 0}>
              Buyurtma berish
            </Button>
            {overStock.length > 0 && <p className="text-center text-sm text-danger">Ba'zi mahsulotlar omborda yetarli emas.</p>}
          </form>
        </aside>
      </div>
    </div>
  );
}
