type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Memuat data" }: LoadingStateProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          className="h-28 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/70"
          key={item}
        />
      ))}
      <p className="sr-only">{label}</p>
    </div>
  );
}
