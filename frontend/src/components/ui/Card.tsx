import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-2xl surface-card card-shadow p-5 ${className}`}>
      {children}
    </section>
  );
}
