import client from "./client";
import type { Payment } from "@/types";

export const paymentsApi = {
  getMyPayments: async (): Promise<{ payments: Payment[]; count: number }> => {
    const { data } = await client.get("/api/payments/my");
    return data;
  },
  getById: async (id: string): Promise<{ payment: Payment }> => {
    const { data } = await client.get(`/api/payments/${id}`);
    return data;
  },
  getByOrder: async (orderId: string): Promise<{ payments: Payment[] }> => {
    const { data } = await client.get(`/api/payments/order/${orderId}`);
    return data;
  },
  getAllPayments: async (): Promise<{ payments: Payment[]; count: number }> => {
    const { data } = await client.get("/api/payments");
    return data;
  },
  refund: async (id: string): Promise<{ payment: Payment }> => {
    const { data } = await client.post(`/api/payments/${id}/refund`);
    return data;
  },
};
