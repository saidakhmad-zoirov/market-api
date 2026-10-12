import type { Cart } from "../types";
import { api } from "./api";

export const cartService = {
  async get() {
    const { data } = await api.get<Cart>("cart/");
    return data;
  },
  async add(productId: number, quantity = 1) {
    const { data } = await api.post<Cart>("cart/items/", { product_id: productId, quantity });
    return data;
  },
  async update(itemId: number, quantity: number) {
    const { data } = await api.patch<Cart>(`cart/items/${itemId}/`, { quantity });
    return data;
  },
  async remove(itemId: number) {
    const { data } = await api.delete<Cart>(`cart/items/${itemId}/`);
    return data;
  },
  async clear() {
    const { data } = await api.delete<Cart>("cart/");
    return data;
  },
};
