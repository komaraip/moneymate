type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading data" }: LoadingStateProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          className="h-28 animate-pulse rounded-2xl surface-card card-shadow"
          key={item}
        />
      ))}
      <p className="sr-only">{label}</p>
    </div>
  );
}
