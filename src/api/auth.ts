import client from "./client";
import type { User } from "@/types";

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await client.post("/api/auth/login", { email, password });
    return data;
  },
  register: async (
    name: string,
    email: string,
    password: string,
    role: "customer" | "admin" = "customer"
  ): Promise<AuthResponse> => {
    const { data } = await client.post("/api/auth/register", { name, email, password, role });
    return data;
  },
  getProfile: async (): Promise<{ user: User }> => {
    const { data } = await client.get("/api/users/me");
    return data;
  },
  updateProfile: async (name: string): Promise<{ user: User }> => {
    const { data } = await client.put("/api/users/me", { name });
    return data;
  },
  getAllUsers: async (): Promise<{ users: User[]; count: number }> => {
    const { data } = await client.get("/api/users");
    return data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await client.delete(`/api/users/${id}`);
  },
};
