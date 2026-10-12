import type { Category, Paginated, Product, ProductQuery } from "../types";
import { api } from "./api";

function clean(query: ProductQuery): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && value !== null) params[key] = value as string | number | boolean;
  }
  return params;
}

export const productService = {
  async list(query: ProductQuery = {}, signal?: AbortSignal) {
    const { data } = await api.get<Paginated<Product>>("products/", { params: clean(query), signal });
    return data;
  },
  async get(id: number | string, signal?: AbortSignal) {
    const { data } = await api.get<Product>(`products/${id}/`, { signal });
    return data;
  },
};

export const categoryService = {
  async list(signal?: AbortSignal) {
    const { data } = await api.get<Category[]>("categories/", { signal });
    return data;
  },
};
