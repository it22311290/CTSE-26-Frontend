import { clsx } from "clsx";
import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          {...props}
          className={clsx(
            "w-full px-3 py-2 text-sm border rounded-lg bg-white text-zinc-900 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent",
            error ? "border-red-400" : "border-zinc-300 hover:border-zinc-400",
            className
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
