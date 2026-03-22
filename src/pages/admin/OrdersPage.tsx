import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Eye } from "lucide-react";
import { ordersApi } from "@/api/orders";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Table, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/Card";
import { PageSpinner, EmptyState } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import type { Order, OrderStatus } from "@/types";
import toast from "react-hot-toast";

const ORDER_STATUSES: OrderStatus[] = ["pending","confirmed","processing","shipped","delivered","cancelled"];

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<OrderStatus>(order.status);

  const updateMut = useMutation({
    mutationFn: (s: OrderStatus) => ordersApi.updateStatus(order.id, s),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); onClose(); },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-zinc-500 font-mono">Order</p>
          <p className="text-xl font-bold">{order.orderNumber}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Customer ID: <span className="font-mono">{order.userId.slice(-8)}</span></p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center px-4 py-3">
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-zinc-500">{item.quantity} × ${item.price.toFixed(2)}</p>
            </div>
            <p className="text-sm font-bold font-mono">${item.lineTotal.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-50 rounded-xl p-4 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-zinc-500">Subtotal</span><span className="font-mono">${order.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold"><span>Total</span><span className="font-mono">${order.total.toFixed(2)}</span></div>
      </div>

      <div className="text-sm text-zinc-600 bg-zinc-50 rounded-xl p-4">
        <p className="font-medium mb-1">Shipping Address</p>
        <p className="text-zinc-500">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Update Status</label>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white">
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button onClick={() => updateMut.mutate(status)} loading={updateMut.isPending} disabled={status === order.status}>
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  const [selected, setSelected] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: ordersApi.getAllOrders });

  if (isLoading) return <PageSpinner />;
  const orders = data?.orders ?? [];
  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
  const revenue = orders.reduce((s, o) => s + (["confirmed","processing","shipped","delivered"].includes(o.status) ? o.total : 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Orders</h1>
        <p className="text-zinc-500 text-sm">{orders.length} total orders</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Orders" value={orders.length} />
        <MetricCard label="Pending" value={orders.filter((o) => o.status === "pending").length} />
        <MetricCard label="Delivered" value={orders.filter((o) => o.status === "delivered").length} />
        <MetricCard label="Revenue" value={`$${revenue.toFixed(2)}`} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400"}`}>
            {s === "all" ? "All" : s} {s !== "all" ? `(${orders.filter((o) => o.status === s).length})` : `(${orders.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="w-12 h-12" />} title="No orders" />
      ) : (
        <Table>
          <thead>
            <tr><Th>Order</Th><Th>Customer</Th><Th>Items</Th><Th>Total</Th><Th>Date</Th><Th>Status</Th><Th><></></Th></tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <Tr key={order.id}>
                <Td><span className="font-mono font-semibold text-zinc-900">{order.orderNumber}</span></Td>
                <Td><span className="font-mono text-xs text-zinc-500">...{order.userId.slice(-8)}</span></Td>
                <Td><span className="text-zinc-600">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span></Td>
                <Td><span className="font-mono font-semibold">${order.total.toFixed(2)}</span></Td>
                <Td><span className="text-zinc-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</span></Td>
                <Td><StatusBadge status={order.status} /></Td>
                <Td>
                  <Button size="xs" variant="outline" onClick={() => setSelected(order)}>
                    <Eye className="w-3 h-3" /> View
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Order Details" size="lg">
        {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </div>
  );
}
