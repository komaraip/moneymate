type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center">
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}
