import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { productsApi } from "@/api/products";
import { authApi } from "@/api/auth";
import { PageSpinner } from "@/components/ui/Spinner";
import { clsx } from "clsx";

function Bar({ value, max, label, sublabel }: { value: number; max: number; label: string; sublabel: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-zinc-600 truncate">{label}</div>
      <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
        <div className="bg-zinc-900 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs font-mono text-zinc-700 w-16 text-right">{sublabel}</div>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const { data: ordersData, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: ordersApi.getAllOrders });
  const { data: paymentsData } = useQuery({ queryKey: ["admin-payments"], queryFn: paymentsApi.getAllPayments });
  const { data: productsData } = useQuery({ queryKey: ["admin-products"], queryFn: () => productsApi.getAll() });
  const { data: usersData } = useQuery({ queryKey: ["admin-users"], queryFn: authApi.getAllUsers });

  if (isLoading) return <PageSpinner />;

  const orders = ordersData?.orders ?? [];
  const payments = paymentsData?.payments ?? [];
  const products = productsData?.products ?? [];

  // Revenue by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const revenueByDay = last7.map((day) => ({
    day,
    amount: payments.filter((p) => p.status === "completed" && p.createdAt.slice(0, 10) === day).reduce((s, p) => s + p.amount, 0),
  }));
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.amount), 1);

  // Orders by status
  const statusCounts = ["pending","confirmed","processing","shipped","delivered","cancelled"].map((s) => ({
    status: s, count: orders.filter((o) => o.status === s).length,
  }));
  const maxStatus = Math.max(...statusCounts.map((s) => s.count), 1);

  // Top products by category
  const catRevenue: Record<string, number> = {};
  products.forEach((p) => { catRevenue[p.category] = (catRevenue[p.category] || 0) + p.price * (100 - p.stock); });
  const topCats = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat = Math.max(...topCats.map((c) => c[1]), 1);

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const avgOrder = orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0;
  const conversionRate = orders.length ? (orders.filter((o) => o.status !== "cancelled").length / orders.length * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Analytics</h1>
        <p className="text-zinc-500 text-sm">Store performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
          { label: "Avg Order Value", value: `$${avgOrder.toFixed(2)}` },
          { label: "Conversion Rate", value: `${conversionRate}%` },
          { label: "Total Customers", value: usersData?.users.filter((u) => u.role === "customer").length ?? 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1 font-mono">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue last 7 days */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Revenue — Last 7 Days</h2>
          {/* Mini bar chart */}
          <div className="flex items-end gap-2 h-32 mb-2">
            {revenueByDay.map((d) => {
              const pct = maxRevenue > 0 ? (d.amount / maxRevenue) * 100 : 0;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-zinc-500 font-mono">{d.amount > 0 ? `$${d.amount.toFixed(0)}` : ""}</span>
                  <div className="w-full bg-zinc-100 rounded-t-md" style={{ height: "80px" }}>
                    <div className="w-full bg-zinc-900 rounded-t-md transition-all" style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            {revenueByDay.map((d) => (
              <div key={d.day} className="flex-1 text-center text-xs text-zinc-400">
                {new Date(d.day).toLocaleDateString("en-US", { weekday: "short" })}
              </div>
            ))}
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {statusCounts.map((s) => (
              <Bar key={s.status} value={s.count} max={maxStatus} label={s.status} sublabel={`${s.count} orders`} />
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Top Categories</h2>
          <div className="space-y-3">
            {topCats.map(([cat, val]) => (
              <Bar key={cat} value={val} max={maxCat} label={cat} sublabel={`${products.filter((p) => p.category === cat).length} products`} />
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {(["card","paypal","bank_transfer"] as const).map((method) => {
              const count = payments.filter((p) => p.method === method).length;
              return <Bar key={method} value={count} max={payments.length || 1} label={method.replace("_", " ")} sublabel={`${count} payments`} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
