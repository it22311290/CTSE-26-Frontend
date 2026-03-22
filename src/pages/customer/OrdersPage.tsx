import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, ChevronRight, X, MapPin, CreditCard, Clock } from "lucide-react";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { PageSpinner, EmptyState } from "@/components/ui/Spinner";
import type { Order, Payment } from "@/types";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function OrderTimeline({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status);
  const isCancelled = status === "cancelled";
  return (
    <div className="flex items-center gap-0 mt-4 mb-2">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            isCancelled ? "bg-red-100 text-red-400 border-2 border-red-200"
              : i <= idx ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400 border-2 border-zinc-200"
          )}>
            {i < idx ? "✓" : i + 1}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={clsx("flex-1 h-0.5", i < idx ? "bg-zinc-900" : "bg-zinc-200")} />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: paymentsData } = useQuery({
    queryKey: ["order-payments", order.id],
    queryFn: () => paymentsApi.getByOrder(order.id),
  });
  const cancelMut = useMutation({
    mutationFn: () => ordersApi.cancel(order.id),
    onSuccess: () => {
      toast.success("Order cancelled");
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="p-6 space-y-5">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-mono">Order Number</p>
          <p className="text-lg font-bold text-zinc-900">{order.orderNumber}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      {order.status !== "cancelled" && (
        <div>
          <OrderTimeline status={order.status} />
          <div className="flex justify-between text-xs text-zinc-400 mt-1">
            {STATUS_STEPS.map((s) => <span key={s} className="capitalize">{s}</span>)}
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Items</p>
        <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.quantity} × ${item.price.toFixed(2)}</p>
              </div>
              <p className="text-sm font-bold font-mono">${item.lineTotal.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-zinc-50 rounded-xl p-4 space-y-1 text-sm">
        <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span className="font-mono">${order.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-zinc-600"><span>Tax (10%)</span><span className="font-mono">${(order.total - order.subtotal).toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-zinc-900 text-base pt-1 border-t border-zinc-200"><span>Total</span><span className="font-mono">${order.total.toFixed(2)}</span></div>
      </div>

      {/* Shipping */}
      <div className="flex items-start gap-3">
        <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-zinc-700">
          <p className="font-medium">Shipping Address</p>
          <p className="text-zinc-500">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
        </div>
      </div>

      {/* Payment */}
      {paymentsData?.payments.length ? (
        <div className="flex items-start gap-3">
          <CreditCard className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-zinc-700">Payment</p>
            {paymentsData.payments.map((p: Payment) => (
              <div key={p.id} className="flex items-center gap-2 mt-1">
                <StatusBadge status={p.status} />
                <span className="text-xs text-zinc-500 font-mono">{p.transactionRef?.slice(-12)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Dates */}
      <div className="flex items-start gap-3">
        <Clock className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-zinc-500">
          Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {canCancel && (
        <Button variant="danger" fullWidth onClick={() => cancelMut.mutate()} loading={cancelMut.isPending}>
          Cancel Order
        </Button>
      )}
    </div>
  );
}

export function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: ordersApi.getMyOrders,
  });
  const [selected, setSelected] = useState<Order | null>(null);
  const navigate = useNavigate();

  if (isLoading) return <PageSpinner />;

  const orders = data?.orders ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Orders</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/shop")}>
          Continue Shopping
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-14 h-14" />}
          title="No orders yet"
          description="When you place an order, it will appear here"
          action={<Button onClick={() => navigate("/shop")}>Shop Now</Button>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id}
              onClick={() => setSelected(order)}
              className="bg-white rounded-2xl border border-zinc-200 p-4 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-zinc-900 font-mono">{order.orderNumber}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {order.items.slice(0, 2).map(i => i.name).join(", ")}{order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-zinc-900 font-mono">${order.total.toFixed(2)}</p>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Order Details" size="lg">
        {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </div>
  );
}
