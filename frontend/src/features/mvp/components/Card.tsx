import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 ${className}`}>
      {children}
    </section>
  );
}
