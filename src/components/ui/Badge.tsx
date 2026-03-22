import { clsx } from "clsx";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "outline";

const variants: Record<Variant, string> = {
  default:  "bg-zinc-100 text-zinc-700",
  success:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning:  "bg-amber-50 text-amber-700 border border-amber-200",
  danger:   "bg-red-50 text-red-700 border border-red-200",
  info:     "bg-blue-50 text-blue-700 border border-blue-200",
  outline:  "border border-zinc-300 text-zinc-600",
};

export function Badge({ children, variant = "default", className }: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    pending: "warning", confirmed: "info", processing: "info",
    shipped: "outline", delivered: "success", cancelled: "danger",
    completed: "success", failed: "danger", refunded: "outline",
    customer: "default", admin: "info",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}
