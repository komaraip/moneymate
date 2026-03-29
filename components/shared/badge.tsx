import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-black/5 text-foreground/80",
  success: "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
  warning: "bg-[hsl(var(--warning)/0.16)] text-[hsl(var(--warning))]",
  danger: "bg-[hsl(var(--danger)/0.14)] text-[hsl(var(--danger))]",
  accent: "bg-[hsl(var(--accent)/0.14)] text-[hsl(var(--accent))]"
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

