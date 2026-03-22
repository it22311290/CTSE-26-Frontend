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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export type PaymentMethod = "card" | "paypal" | "bank_transfer";

export interface Payment {
  id: string;
  paymentNumber: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceHealth {
  user: "up" | "down" | "checking";
  product: "up" | "down" | "checking";
  order: "up" | "down" | "checking";
  payment: "up" | "down" | "checking";
}

export interface ApiError {
  error: string;
  status?: number;
}
