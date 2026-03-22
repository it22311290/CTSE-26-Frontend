import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// These will be injected by GitHub Actions during build
const SERVICE_URLS = {
  USER: import.meta.env.VITE_USER_SERVICE_URL,
  PRODUCT: import.meta.env.VITE_PRODUCT_SERVICE_URL,
  ORDER: import.meta.env.VITE_ORDER_SERVICE_URL,
  PAYMENT: import.meta.env.VITE_PAYMENT_SERVICE_URL,
};

const client = axios.create();

client.interceptors.request.use((config) => {
  // 1. Determine which service to hit based on the URL path
  const url = config.url || "";

  if (url.startsWith("/api/auth") || url.startsWith("/api/users")) {
    config.baseURL = SERVICE_URLS.USER;
  } else if (url.startsWith("/api/products")) {
    config.baseURL = SERVICE_URLS.PRODUCT;
  } else if (url.startsWith("/api/orders")) {
    config.baseURL = SERVICE_URLS.ORDER;
  } else if (url.startsWith("/api/payments")) {
    config.baseURL = SERVICE_URLS.PAYMENT;
  } else {
    config.baseURL = "/"; // Fallback for local/relative paths
  }

  if (url.startsWith("/health/user")) {
    config.baseURL = SERVICE_URLS.USER;
    config.url = "/health";
  } else if (url.startsWith("/health/product")) {
    config.baseURL = SERVICE_URLS.PRODUCT;
    config.url = "/health";
  } else if (url.startsWith("/health/order")) {
    config.baseURL = SERVICE_URLS.ORDER;
    config.url = "/health";
  } else if (url.startsWith("/health/payment")) {
    config.baseURL = SERVICE_URLS.PAYMENT;
    config.url = "/health";
  }

  // 2. Attach Authorization Token
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  },
);

export default client;
