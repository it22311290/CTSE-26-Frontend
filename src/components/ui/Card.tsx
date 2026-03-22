import { clsx } from "clsx";

export function Card({ children, className, onClick }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white border border-zinc-200 rounded-2xl",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MetricCard({ label, value, sub, icon }: {
  label: string; value: string | number; sub?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-bold text-zinc-900">{value}</p>
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
        </div>
        {icon && <div className="text-zinc-300">{icon}</div>}
      </div>
    </div>
  );
}
