import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-xl border border-subtle bg-surface/70 p-5 ${className}`}>
      {children}
    </section>
  );
}
