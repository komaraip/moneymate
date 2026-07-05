type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-subtle bg-surface/40 p-8 text-center">
      <p className="text-base font-medium text-main">{title}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
