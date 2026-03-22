import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const client = axios.create({ baseURL: "/" });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export default client;
