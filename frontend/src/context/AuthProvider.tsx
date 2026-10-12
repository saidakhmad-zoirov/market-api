import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { authService } from "../services/auth";
import { AUTH_EXPIRED_EVENT, tokenStore } from "../services/tokens";
import type { RegisterPayload, User } from "../types";
import { AuthContext } from "./contexts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Sahifa yangilanganda saqlangan token bilan profilni tiklash
  useEffect(() => {
    if (!tokenStore.access && !tokenStore.refresh) {
      setReady(true);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  // Refresh token ham yaroqsiz bo'lsa — chiqib ketamiz
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await authService.login(username, password);
    const me = await authService.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const me = await authService.register(payload);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, ready, login, register, logout, setUser }), [user, ready, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
