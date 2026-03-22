import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx("animate-spin text-zinc-400", className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon && <div className="text-zinc-300 mb-1">{icon}</div>}
      <p className="font-semibold text-zinc-600">{title}</p>
      {description && <p className="text-sm text-zinc-400 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
