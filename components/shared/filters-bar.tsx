import { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FiltersBarProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

export function FiltersBar({ children, className, method = "get", ...props }: FiltersBarProps) {
  return (
    <form
      method={method}
      className={cn(
        "grid gap-3 rounded-[28px] border border-border/70 bg-white/70 p-4 md:grid-cols-2 xl:grid-cols-6",
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}
