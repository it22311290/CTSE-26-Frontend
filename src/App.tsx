import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

import { LoginPage } from "@/pages/LoginPage";
import { ShopPage } from "@/pages/customer/ShopPage";
import { CartPage } from "@/pages/customer/CartPage";
import { OrdersPage } from "@/pages/customer/OrdersPage";
import { PaymentsPage } from "@/pages/customer/PaymentsPage";
import { AccountPage } from "@/pages/customer/AccountPage";

import { DashboardPage } from "@/pages/admin/DashboardPage";
import { AdminProductsPage } from "@/pages/admin/ProductsPage";
import { AdminOrdersPage } from "@/pages/admin/OrdersPage";
import { AdminPaymentsPage } from "@/pages/admin/PaymentsPage";
import { AdminUsersPage } from "@/pages/admin/UsersPage";
import { AdminAnalyticsPage } from "@/pages/admin/AnalyticsPage";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RequireAuth({ children, role }: { children: React.ReactNode; role?: "admin" | "customer" }) {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/shop"} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "'DM Sans', sans-serif", fontSize: "14px" },
            success: { iconTheme: { primary: "#18181b", secondary: "#fff" } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Customer */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Navigate to="/shop" replace />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
            <Route path="/payments" element={<RequireAuth><PaymentsPage /></RequireAuth>} />
            <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
