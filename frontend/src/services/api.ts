import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { AUTH_EXPIRED_EVENT, tokenStore } from "./tokens";

const rawUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
export const API_URL = rawUrl.endsWith("/") ? rawUrl : `${rawUrl}/`;
/** Django admin manzili: http://127.0.0.1:8000/api/ → http://127.0.0.1:8000/admin/ */
export const ADMIN_URL = new URL("../admin/", API_URL).toString();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// --- Access token muddati tugasa, refresh token bilan bir marta yangilanadi ---
let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  try {
    // alohida axios — interceptorlarga tushib qolmaslik uchun
    const { data } = await axios.post<{ access: string; refresh?: string }>(`${API_URL}auth/refresh/`, { refresh });
    tokenStore.set(data); // ROTATE_REFRESH_TOKENS=True — yangi refresh ham keladi
    return data.access;
  } catch {
    return null;
  }
}

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const isAuthCall = original?.url?.startsWith("auth/login") || original?.url?.startsWith("auth/refresh");
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall && tokenStore.refresh) {
      original._retried = true;
      refreshing ??= refreshAccess().finally(() => {
        refreshing = null;
      });
      const access = await refreshing;
      if (access) {
        original.headers.set("Authorization", `Bearer ${access}`);
        return api(original);
      }
      tokenStore.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);
