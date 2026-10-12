import axios from "axios";

type FieldErrors = Record<string, string>;

function flatten(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flatten).filter(Boolean).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(flatten).join(" ");
  return "";
}

/** DRF xatolarini foydalanuvchiga tushunarli matnga aylantiradi. */
export function getErrorMessage(error: unknown, fallback = "Nimadir xato ketdi. Qayta urinib ko'ring."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "Server javob bermadi (timeout)."
        : "Serverga ulanib bo'lmadi. Backend ishlayaptimi va CORS sozlanganmi — tekshiring.";
    }
    const data = error.response.data as Record<string, unknown> | undefined;
    if (data && typeof data === "object") {
      if ("detail" in data) return flatten(data.detail);
      if ("non_field_errors" in data) return flatten(data.non_field_errors);
      const first = Object.values(data)[0];
      if (first) return flatten(first);
    }
    if (error.response.status === 404) return "Topilmadi.";
    if (error.response.status >= 500) return "Serverda xatolik yuz berdi.";
  }
  return fallback;
}

/** Forma maydonlari bo'yicha xatolar: { email: "Bu email band" } */
export function getFieldErrors(error: unknown): FieldErrors {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== "object") return {};
  const out: FieldErrors = {};
  for (const [key, value] of Object.entries(error.response.data as Record<string, unknown>)) {
    if (key !== "detail" && key !== "non_field_errors") out[key] = flatten(value);
  }
  return out;
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
