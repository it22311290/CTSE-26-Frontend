import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5173,
    proxy: {
      "/api/auth":     { target: "http://localhost:3001", changeOrigin: true },
      "/api/users":    { target: "http://localhost:3001", changeOrigin: true },
      "/api/products": { target: "http://localhost:3002", changeOrigin: true },
      "/api/orders":   { target: "http://localhost:3003", changeOrigin: true },
      "/api/payments": { target: "http://localhost:3004", changeOrigin: true },
      "/health/user":    { target: "http://localhost:3001", changeOrigin: true, rewrite: () => "/health" },
      "/health/product": { target: "http://localhost:3002", changeOrigin: true, rewrite: () => "/health" },
      "/health/order":   { target: "http://localhost:3003", changeOrigin: true, rewrite: () => "/health" },
      "/health/payment": { target: "http://localhost:3004", changeOrigin: true, rewrite: () => "/health" },
    },
  },
});
