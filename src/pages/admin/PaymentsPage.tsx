import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, RotateCcw } from "lucide-react";
import { paymentsApi } from "@/api/payments";
import { Button } from "@/components/ui/Button";
import { Table, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/Card";
import { PageSpinner, EmptyState } from "@/components/ui/Spinner";
import toast from "react-hot-toast";

export function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["admin-payments"], queryFn: paymentsApi.getAllPayments });

  const refundMut = useMutation({
    mutationFn: paymentsApi.refund,
    onSuccess: () => { toast.success("Payment refunded"); qc.invalidateQueries({ queryKey: ["admin-payments"] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const handleRefund = (id: string, amount: number) => {
    if (!confirm(`Refund $${amount.toFixed(2)}?`)) return;
    refundMut.mutate(id);
  };

  if (isLoading) return <PageSpinner />;
  const payments = data?.payments ?? [];
  const completed = payments.filter((p) => p.status === "completed");
  const revenue = completed.reduce((s, p) => s + p.amount, 0);
  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Payments</h1>
        <p className="text-zinc-500 text-sm">{payments.length} total transactions</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={`$${revenue.toFixed(2)}`} sub="completed payments" />
        <MetricCard label="Completed" value={completed.length} />
        <MetricCard label="Processing" value={payments.filter((p) => p.status === "processing").length} />
        <MetricCard label="Refunded" value={payments.filter((p) => p.status === "refunded").length} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all","pending","processing","completed","failed","refunded"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === s ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400"}`}>
            {s === "all" ? `All (${payments.length})` : `${s} (${payments.filter((p) => p.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-12 h-12" />} title="No payments found" />
      ) : (
        <Table>
          <thead>
            <tr><Th>Payment</Th><Th>Order</Th><Th>Amount</Th><Th>Method</Th><Th>Ref</Th><Th>Date</Th><Th>Status</Th><Th><></></Th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <Tr key={p.id}>
                <Td><span className="font-mono font-semibold text-zinc-900">{p.paymentNumber}</span></Td>
                <Td><span className="font-mono text-xs text-zinc-500">...{p.orderId.slice(-8)}</span></Td>
                <Td><span className="font-mono font-semibold">${p.amount.toFixed(2)}</span></Td>
                <Td><span className="text-xs capitalize text-zinc-600">{p.method.replace("_"," ")}</span></Td>
                <Td><span className="font-mono text-xs text-zinc-400">{p.transactionRef?.slice(-12)}</span></Td>
                <Td><span className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</span></Td>
                <Td><StatusBadge status={p.status} /></Td>
                <Td>
                  {p.status === "completed" && (
                    <Button size="xs" variant="outline" onClick={() => handleRefund(p.id, p.amount)} loading={refundMut.isPending}>
                      <RotateCcw className="w-3 h-3" /> Refund
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
