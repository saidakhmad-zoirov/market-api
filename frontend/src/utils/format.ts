const currency = import.meta.env.VITE_CURRENCY || "USD";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 });

export function formatPrice(value: string | number): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? money.format(n) : String(value);
}

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];

/** "11 okt 2026, 16:32" — brauzerlarda uz-UZ formati bir xil emas, shuning uchun qo'lda. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w)) // faqat harf bilan boshlanadigan so'zlar
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Kutilmoqda",
  processing: "Tayyorlanmoqda",
  shipped: "Yo'lda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilingan",
};
