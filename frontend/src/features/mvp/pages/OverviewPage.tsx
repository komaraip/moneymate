import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency, formatPercent } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import type { Budget } from "../types";

export function OverviewPage() {
  const month = defaultMonth();
  const overview = useQuery({ queryKey: queryKeys.dashboard.overview, queryFn: mvpApi.overview });
  const allocation = useQuery({ queryKey: queryKeys.dashboard.allocation, queryFn: mvpApi.allocation });
  const alerts = useQuery({ queryKey: queryKeys.dashboard.alerts, queryFn: mvpApi.alerts });
  const budgets = useQuery({ queryKey: queryKeys.budgets.month(month), queryFn: () => mvpApi.budgets(month) });

  if (overview.isLoading) return <LoadingState />;
  if (overview.isError) return <ErrorState message="Ringkasan belum bisa dimuat." />;

  const data = overview.data;
  if (!data) {
    return <EmptyState title="Ringkasan kosong" description="Jalankan seed dan hitung ulang portofolio terlebih dahulu." />;
  }

  return (
    <div>
      <PageHeader description="Ringkasan aset dan risiko berbasis data manual" title="Ringkasan" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Kekayaan Bersih" value={formatCurrency(data.total_net_worth)} />
        <Kpi label="Nilai Portofolio" value={formatCurrency(data.total_portfolio_value)} />
        <Kpi label="Total Kas" value={formatCurrency(data.total_cash)} />
        <Kpi
          label="Laba/Rugi"
          tone={data.profit_loss_value < 0 ? "negative" : "positive"}
          value={`${formatCurrency(data.profit_loss_value)} (${formatPercent(data.profit_loss_percent)})`}
        />
        <Kpi label="Pemasukan Bulan Ini" value={formatCurrency(data.monthly_income ?? 0)} />
        <Kpi label="Pengeluaran Bulan Ini" tone="negative" value={formatCurrency(data.monthly_expense ?? 0)} />
        <Kpi label="Cashflow Bersih" tone={(data.monthly_net_cashflow ?? 0) < 0 ? "negative" : "positive"} value={formatCurrency(data.monthly_net_cashflow ?? 0)} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
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
        <BudgetWidget budgets={budgets.data ?? []} isError={budgets.isError} isLoading={budgets.isLoading} />
        <Card>
          <h3 className="font-semibold text-white">Peringatan Data</h3>
          <div className="mt-4 space-y-3">
            {alerts.data?.length ? (
              alerts.data.map((alert) => (
                <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3" key={`${alert.code}-${alert.message}`}>
                  <p className="text-sm font-medium text-amber-100">{alert.title}</p>
                  <p className="mt-1 text-sm text-amber-100/75">{alert.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Tidak ada peringatan utama.</p>
            )}
          </div>
        </Card>
      </div>

      <p className="mt-6 text-sm text-zinc-500">{data.price_disclaimer}</p>
    </div>
  );
}

function BudgetWidget({ budgets, isError, isLoading }: { budgets: Budget[]; isError: boolean; isLoading: boolean }) {
  const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const overBudget = budgets.filter((item) => item.over_budget);
  const percent = totalBudget > 0 ? totalSpent / totalBudget : 0;

  return (
    <Card>
      <h3 className="font-semibold text-white">Anggaran Bulan Ini</h3>
      {isLoading ? <p className="mt-4 text-sm text-zinc-500">Memuat anggaran...</p> : null}
      {isError ? <p className="mt-4 text-sm text-red-200">Anggaran belum bisa dimuat.</p> : null}
      {!isLoading && !isError && budgets.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Belum ada anggaran bulan ini.</p> : null}
      {!isLoading && !isError && budgets.length > 0 ? (
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(totalSpent)}</span>
            <span>{formatCurrency(totalBudget)}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-zinc-800">
            <div className={`h-2 rounded-full ${percent > 1 ? "bg-red-400" : percent >= 0.8 ? "bg-amber-300" : "bg-emerald-400"}`} style={{ width: `${Math.min(percent, 1) * 100}%` }} />
          </div>
          <p className="mt-2 text-sm text-zinc-400">{formatPercent(percent)} terpakai dari total anggaran.</p>
          <div className="mt-4 space-y-2">
            {budgets.slice(0, 3).map((item) => (
              <div className="flex justify-between gap-3 text-sm" key={item.id}>
                <span className="truncate text-zinc-300">{item.category_name}</span>
                <span className={item.over_budget ? "text-red-300" : "text-zinc-200"}>{formatCurrency(item.remaining)}</span>
              </div>
            ))}
          </div>
          {overBudget.length > 0 ? <p className="mt-3 text-sm text-red-200">{overBudget.length} kategori melewati anggaran.</p> : null}
        </div>
      ) : null}
    </Card>
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

function defaultMonth() {
  return new Date().toISOString().slice(0, 7);
}
