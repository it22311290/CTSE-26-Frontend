import { useQuery } from "@tanstack/react-query";
import { CreditCard, Receipt } from "lucide-react";
import { paymentsApi } from "@/api/payments";
import { StatusBadge } from "@/components/ui/Badge";
import { PageSpinner, EmptyState } from "@/components/ui/Spinner";

export function PaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-payments"],
    queryFn: paymentsApi.getMyPayments,
  });

  if (isLoading) return <PageSpinner />;
  const payments = data?.payments ?? [];
  const total = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">My Payments</h1>
        <p className="text-zinc-500 text-sm mt-0.5">{payments.length} transaction{payments.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Spent", value: `$${total.toFixed(2)}`, sub: "completed payments" },
            { label: "Completed", value: payments.filter((p) => p.status === "completed").length },
            { label: "Processing", value: payments.filter((p) => p.status === "processing").length },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-zinc-200 p-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-bold text-zinc-900 mt-1 font-mono">{m.value}</p>
              {m.sub && <p className="text-xs text-zinc-400 mt-0.5">{m.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {payments.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-14 h-14" />} title="No payment history" description="Your payments will appear here after you place orders" />
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          {payments.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-4 p-4 ${i < payments.length - 1 ? "border-b border-zinc-100" : ""}`}>
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-zinc-900 font-mono">{p.paymentNumber}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono truncate">{p.transactionRef}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {p.method.replace("_", " ")} · {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-900 font-mono">${p.amount.toFixed(2)}</p>
                <p className="text-xs text-zinc-400 uppercase">{p.currency}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
