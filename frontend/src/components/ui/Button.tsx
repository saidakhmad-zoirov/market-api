import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

import { Spinner } from "./Spinner";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97]";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:glow-accent hover:-translate-y-0.5",
  ghost: "text-ink hover:bg-panel-2",
  outline: "border border-line-strong text-ink hover:border-ink hover:-translate-y-0.5",
  danger: "border border-danger/40 text-danger hover:bg-danger hover:text-white",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

function Roll({ children }: { children: ReactNode }) {
  // Matn hover'da yuqoriga "aylanadi"
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, icon, className = "", children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner size={16} /> : icon}
      {typeof children === "string" ? <Roll>{children}</Roll> : children}
    </button>
  );
}

interface LinkButtonProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function LinkButton({ variant = "primary", size = "md", icon, className = "", children, ...rest }: LinkButtonProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {typeof children === "string" ? <Roll>{children}</Roll> : children}
      {icon}
    </Link>
  );
}
