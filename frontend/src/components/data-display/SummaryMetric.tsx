type SummaryMetricProps = {
  label: string;
  value: string;
  tone?: "neutral" | "negative";
};

export function SummaryMetric({ label, tone = "neutral", value }: SummaryMetricProps) {
  return (
    <div className="rounded-lg border border-subtle bg-surface px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone === "negative" ? "text-danger" : "text-main"}`}>{value}</p>
    </div>
  );
}
