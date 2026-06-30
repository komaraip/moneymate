type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = "Gagal memuat data", message }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-5 text-sm text-red-100">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-red-200/80">{message}</p>
    </div>
  );
}
