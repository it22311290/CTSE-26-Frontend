import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "xs" | "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:   "bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300",
  ghost:     "bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200",
  danger:    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  outline:   "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100",
};

const sizes: Record<Size, string> = {
  xs: "px-2.5 py-1 text-xs rounded-md",
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-xl",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children, variant = "primary", size = "md", loading = false,
  fullWidth = false, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant], sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}
