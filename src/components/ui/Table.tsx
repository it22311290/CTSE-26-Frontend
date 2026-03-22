import { clsx } from "clsx";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto rounded-xl border border-zinc-200", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={clsx("px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-50 border-b border-zinc-200", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={clsx("px-4 py-3 text-zinc-700 border-b border-zinc-100 last:border-0", className)}>
      {children}
    </td>
  );
}

export function Tr({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <tr onClick={onClick} className={clsx("hover:bg-zinc-50 transition-colors", onClick && "cursor-pointer", className)}>
      {children}
    </tr>
  );
}
