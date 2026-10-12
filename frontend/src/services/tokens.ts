import type { Tokens } from "../types";

const ACCESS = "market-access";
const REFRESH = "market-refresh";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const tokenStore = {
  get access() {
    return read(ACCESS);
  },
  get refresh() {
    return read(REFRESH);
  },
  set(tokens: Partial<Tokens>) {
    try {
      if (tokens.access) localStorage.setItem(ACCESS, tokens.access);
      if (tokens.refresh) localStorage.setItem(REFRESH, tokens.refresh);
    } catch {
      /* private rejimda localStorage yopiq bo'lishi mumkin */
    }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS);
      localStorage.removeItem(REFRESH);
    } catch {
      /* e'tiborsiz */
    }
  },
};

export const AUTH_EXPIRED_EVENT = "market:auth-expired";
