type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Failed to load data", message }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-fin-loss/20 bg-fin-loss/5 p-5 card-shadow">
      <p className="text-sm font-bold text-main font-display">{title}</p>
      <p className="mt-2 text-xs text-muted font-sans">{message}</p>
    </div>
  );
}
