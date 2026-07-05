import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted font-sans">{description}</p>
        <h2 className="mt-1.5 text-xl font-bold text-main tracking-tight font-display lg:text-2xl">{title}</h2>
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}
