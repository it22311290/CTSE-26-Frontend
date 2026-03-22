import { clsx } from "clsx";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={clsx(
            "w-full px-3 py-2 text-sm border rounded-lg bg-white text-zinc-900 placeholder-zinc-400 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-0 focus:border-transparent",
            error ? "border-red-400 focus:ring-red-500" : "border-zinc-300 hover:border-zinc-400",
            props.disabled && "bg-zinc-50 cursor-not-allowed",
            className
          )}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
