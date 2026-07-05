type SummaryMetricProps = {
  label: string;
  value: string;
  tone?: "neutral" | "negative";
};

export function SummaryMetric({ label, tone = "neutral", value }: SummaryMetricProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone === "negative" ? "text-red-300" : "text-white"}`}>{value}</p>
    </div>
  );
}
