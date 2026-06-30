import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency, formatPercent } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

export function OverviewPage() {
  const overview = useQuery({ queryKey: queryKeys.dashboard.overview, queryFn: mvpApi.overview });
  const allocation = useQuery({ queryKey: queryKeys.dashboard.allocation, queryFn: mvpApi.allocation });
  const alerts = useQuery({ queryKey: queryKeys.dashboard.alerts, queryFn: mvpApi.alerts });

  if (overview.isLoading) return <LoadingState />;
  if (overview.isError) return <ErrorState message="Overview belum bisa dimuat." />;

  const data = overview.data;
  if (!data) {
    return <EmptyState title="Overview kosong" description="Jalankan seed dan recalculate holdings terlebih dahulu." />;
  }

  return (
    <div>
      <PageHeader description="Ringkasan aset dan risiko berbasis data manual" title="Overview" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Kekayaan Bersih" value={formatCurrency(data.total_net_worth)} />
        <Kpi label="Nilai Portfolio" value={formatCurrency(data.total_portfolio_value)} />
        <Kpi label="Total Cash" value={formatCurrency(data.total_cash)} />
        <Kpi
          label="Laba/Rugi"
          tone={data.profit_loss_value < 0 ? "negative" : "positive"}
          value={`${formatCurrency(data.profit_loss_value)} (${formatPercent(data.profit_loss_percent)})`}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Alokasi Aset</h3>
          <div className="mt-4 space-y-3">
            {allocation.data?.map((item) => (
              <div key={item.asset}>
                <div className="flex justify-between text-sm">
                  <span>{item.asset}</span>
                  <span>{formatCurrency(item.value)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
                    style={{ width: `${Math.min(item.percent * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-white">Alert Data</h3>
          <div className="mt-4 space-y-3">
            {alerts.data?.length ? (
              alerts.data.map((alert) => (
                <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3" key={`${alert.code}-${alert.message}`}>
                  <p className="text-sm font-medium text-amber-100">{alert.title}</p>
                  <p className="mt-1 text-sm text-amber-100/75">{alert.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Tidak ada alert utama.</p>
            )}
          </div>
        </Card>
      </div>

      <p className="mt-6 text-sm text-zinc-500">{data.price_disclaimer}</p>
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "positive" | "negative" }) {
  const toneClass = tone === "negative" ? "text-red-300" : tone === "positive" ? "text-emerald-300" : "text-white";
  return (
    <Card>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </Card>
  );
}
