import client from "./client";
import type { Product } from "@/types";

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}

export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<{ products: Product[]; count: number }> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.minPrice != null) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
    const { data } = await client.get(`/api/products?${params}`);
    return data;
  },
  getById: async (id: string): Promise<{ product: Product }> => {
    const { data } = await client.get(`/api/products/${id}`);
    return data;
  },
  create: async (payload: ProductPayload): Promise<{ product: Product }> => {
    const { data } = await client.post("/api/products", payload);
    return data;
  },
  update: async (id: string, payload: Partial<ProductPayload>): Promise<{ product: Product }> => {
    const { data } = await client.put(`/api/products/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/products/${id}`);
  },
};
