import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "../hooks/useAuth";
import { cartService } from "../services/cart";
import type { Cart } from "../types";
import { CartContext } from "./contexts";

/** Savatcha backendda saqlanadi (GET/POST/PATCH/DELETE /api/cart/...). Faqat login qilganlar uchun. */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyItem, setBusyItem] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setCart(await cartService.get());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refresh().catch(() => setCart(null));
    else setCart(null);
  }, [user, refresh]);

  const add = useCallback(async (productId: number, quantity = 1) => {
    setCart(await cartService.add(productId, quantity));
  }, []);

  const update = useCallback(async (itemId: number, quantity: number) => {
    setBusyItem(itemId);
    try {
      setCart(await cartService.update(itemId, quantity));
    } finally {
      setBusyItem(null);
    }
  }, []);

  const remove = useCallback(async (itemId: number) => {
    setBusyItem(itemId);
    try {
      setCart(await cartService.remove(itemId));
    } finally {
      setBusyItem(null);
    }
  }, []);

  const clear = useCallback(async () => {
    setCart(await cartService.clear());
  }, []);

  const reset = useCallback(() => setCart((c) => (c ? { ...c, items: [], total_items: 0, total_price: "0.00" } : c)), []);

  const value = useMemo(
    () => ({ cart, loading, busyItem, count: cart?.total_items ?? 0, refresh, add, update, remove, clear, reset }),
    [cart, loading, busyItem, refresh, add, update, remove, clear, reset],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
