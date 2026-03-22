import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, Users, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { ordersApi } from "@/api/orders";
import { productsApi } from "@/api/products";
import { authApi } from "@/api/auth";
import { paymentsApi } from "@/api/payments";
import { healthApi } from "@/api/health";
import { MetricCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { clsx } from "clsx";

export function DashboardPage() {
  const { data: orders } = useQuery({ queryKey: ["admin-orders"], queryFn: ordersApi.getAllOrders });
  const { data: products } = useQuery({ queryKey: ["admin-products"], queryFn: () => productsApi.getAll() });
  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: authApi.getAllUsers });
  const { data: payments } = useQuery({ queryKey: ["admin-payments"], queryFn: paymentsApi.getAllPayments });
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: healthApi.checkAll, refetchInterval: 30000 });

  const revenue = payments?.payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0) ?? 0;
  const recentOrders = orders?.orders.slice(0, 5) ?? [];
  const lowStock = products?.products.filter((p) => p.stock < 10) ?? [];

  const serviceColor = (s: string) =>
    s === "up" ? "bg-emerald-400" : s === "checking" ? "bg-amber-400 animate-pulse" : "bg-red-400";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Overview of your store</p>
      </div>

      {/* Service health */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-zinc-200 px-4 py-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Services</span>
        {(["user", "product", "order", "payment"] as const).map((svc) => (
          <div key={svc} className="flex items-center gap-1.5">
            <div className={clsx("w-2 h-2 rounded-full", serviceColor(health?.[svc] ?? "checking"))} />
            <span className="text-xs text-zinc-600 capitalize">{svc}</span>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={`$${revenue.toFixed(2)}`} sub="from completed payments" icon={<TrendingUp className="w-8 h-8" />} />
        <MetricCard label="Total Orders" value={orders?.count ?? "—"} sub={`${orders?.orders.filter((o) => o.status === "pending").length ?? 0} pending`} icon={<ShoppingCart className="w-8 h-8" />} />
        <MetricCard label="Products" value={products?.count ?? "—"} sub={`${lowStock.length} low stock`} icon={<Package className="w-8 h-8" />} />
        <MetricCard label="Customers" value={users?.users.filter((u) => u.role === "customer").length ?? "—"} sub={`${users?.count ?? 0} total users`} icon={<Users className="w-8 h-8" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No orders yet</p>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 font-mono">{order.orderNumber}</p>
                  <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={order.status} />
                <p className="text-sm font-bold font-mono text-zinc-900">${order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-zinc-900">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {lowStock.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">All products are well stocked</p>
            ) : lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-400 font-mono">{p.category}</p>
                </div>
                <span className={clsx("text-xs font-bold px-2 py-1 rounded-lg", p.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600")}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order status breakdown */}
      {orders && orders.orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="font-semibold text-zinc-900 mb-4">Orders by Status</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {(["pending","confirmed","processing","shipped","delivered","cancelled"] as const).map((s) => {
              const count = orders.orders.filter((o) => o.status === s).length;
              const pct = orders.orders.length ? Math.round(count / orders.orders.length * 100) : 0;
              return (
                <div key={s} className="text-center p-3 bg-zinc-50 rounded-xl">
                  <p className="text-xl font-bold text-zinc-900">{count}</p>
                  <StatusBadge status={s} />
                  <p className="text-xs text-zinc-400 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
