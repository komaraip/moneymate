import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-panel hover:bg-[hsl(var(--accent)/0.92)] focus-visible:ring-accent/40",
  secondary:
    "bg-white/90 text-foreground hover:bg-white focus-visible:ring-border shadow-panel border border-border/80",
  ghost: "bg-transparent text-foreground hover:bg-black/5 focus-visible:ring-border/60",
  danger: "bg-danger text-white hover:bg-[hsl(var(--danger)/0.92)] focus-visible:ring-danger/30"
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

