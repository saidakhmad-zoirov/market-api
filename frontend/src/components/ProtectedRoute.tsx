import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { LoadingState } from "./ui/States";

/** Login qilmagan foydalanuvchini /login sahifasiga yuboradi va qaytish manzilini eslab qoladi. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <LoadingState label="Tekshirilmoqda…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <LoadingState />;
  // Login bo'lgan foydalanuvchi kelgan joyiga (yoki bosh sahifaga) qaytariladi
  if (user) return <Navigate to={(location.state as { from?: string } | null)?.from ?? "/"} replace />;
  return <>{children}</>;
}
