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
        <p className="text-sm text-muted">{description}</p>
        <h2 className="mt-1 text-2xl font-semibold text-main">{title}</h2>
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}
