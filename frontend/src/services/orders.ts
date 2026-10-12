import type { CheckoutPayload, Order, Paginated } from "../types";
import { api } from "./api";

export const orderService = {
  async list(page = 1, signal?: AbortSignal) {
    const { data } = await api.get<Paginated<Order>>("orders/", { params: { page }, signal });
    return data;
  },
  async get(id: number | string, signal?: AbortSignal) {
    const { data } = await api.get<Order>(`orders/${id}/`, { signal });
    return data;
  },
  async create(payload: CheckoutPayload) {
    const { data } = await api.post<Order>("orders/", payload);
    return data;
  },
  async cancel(id: number) {
    const { data } = await api.post<Order>(`orders/${id}/cancel/`);
    return data;
  },
};
