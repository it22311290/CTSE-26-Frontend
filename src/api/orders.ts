import client from "./client";
import type { Order, OrderStatus, ShippingAddress } from "@/types";

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
}

export const ordersApi = {
  create: async (payload: CreateOrderPayload): Promise<{ order: Order }> => {
    const { data } = await client.post("/api/orders", payload);
    return data;
  },
  getMyOrders: async (): Promise<{ orders: Order[]; count: number }> => {
    const { data } = await client.get("/api/orders/my");
    return data;
  },
  getById: async (id: string): Promise<{ order: Order }> => {
    const { data } = await client.get(`/api/orders/${id}`);
    return data;
  },
  cancel: async (id: string): Promise<{ order: Order }> => {
    const { data } = await client.put(`/api/orders/${id}/cancel`);
    return data;
  },
  getAllOrders: async (): Promise<{ orders: Order[]; count: number }> => {
    const { data } = await client.get("/api/orders");
    return data;
  },
  updateStatus: async (id: string, status: OrderStatus): Promise<{ order: Order }> => {
    const { data } = await client.put(`/api/orders/${id}/status`, { status });
    return data;
  },
};
