type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-subtle/50 surface-card p-8 text-center card-shadow">
      <p className="text-sm font-bold text-main font-display">{title}</p>
      <p className="mt-2 text-xs text-muted font-sans">{description}</p>
    </div>
  );
}
