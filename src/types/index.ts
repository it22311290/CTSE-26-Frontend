export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface ServiceHealth {
  user: "up" | "down" | "checking";
}

export interface ApiError {
  error: string;
  status?: number;
}
