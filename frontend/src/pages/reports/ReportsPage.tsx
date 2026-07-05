import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { formatCurrency, formatDate, formatPercent } from "../../utils/format";
import { Select } from "../../components/ui/Select";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import type { MonthlySummaryReport, PersonalInsightsReport, PortfolioPerformanceReport, ReportWarning } from "../../types/moneymate";
import { motion } from "framer-motion";

export function ReportsPage() {
  const [month, setMonth] = useState(defaultMonth());
  const [fromDate, setFromDate] = useState(defaultRange().from);
  const [toDate, setToDate] = useState(defaultRange().to);
  const [trendMonths, setTrendMonths] = useState(6);
  const [exportMessage, setExportMessage] = useState("");

  const monthly = useQuery({
    queryKey: queryKeys.reports.monthly(month),
    queryFn: () => moneymateApi.monthlySummary(month),
  });
  const performance = useQuery({
    queryKey: queryKeys.reports.performance(fromDate, toDate),
    queryFn: () => moneymateApi.portfolioPerformance(fromDate, toDate),
  });
  const insights = useQuery({
    queryKey: queryKeys.reports.personalInsights(month, trendMonths),
    queryFn: () => moneymateApi.personalInsights(month, trendMonths),
  });
  const exportCsv = useMutation({
    mutationFn: moneymateApi.exportReportsCsv,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `moneymate-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setExportMessage("Ekspor CSV berhasil diproses.");
    },
    onError: () => {
      setExportMessage("");
    },
  });

  const isLoading = monthly.isLoading || performance.isLoading || insights.isLoading;
  const isError = monthly.isError || performance.isError || insights.isError;

  return (
    <div>
      <PageHeader description="Ringkasan portfolio berbasis data manual/mock" title="Laporan" />

      <Card className="mb-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_10rem_auto] lg:items-end">
          <label className="text-sm text-muted">
            <span className="mb-2 block font-medium">Bulan laporan</span>
            <input
              className="w-full rounded-lg border border-subtle bg-app px-3 py-2 text-sm text-main"
              onChange={(event) => setMonth(event.target.value)}
              type="month"
              value={month}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-muted">
              <span className="mb-2 block font-medium">Dari tanggal</span>
              <input
                className="w-full rounded-lg border border-subtle bg-app px-3 py-2 text-sm text-main"
                onChange={(event) => setFromDate(event.target.value)}
                type="date"
                value={fromDate}
              />
            </label>
            <label className="text-sm text-muted">
              <span className="mb-2 block font-medium">Sampai tanggal</span>
              <input
                className="w-full rounded-lg border border-subtle bg-app px-3 py-2 text-sm text-main"
                onChange={(event) => setToDate(event.target.value)}
                type="date"
                value={toDate}
              />
            </label>
          </div>
          <label className="text-sm text-muted">
            <span className="mb-2 block font-medium">Tren</span>
            <Select
              options={[
                { label: "3 bulan", value: "3" },
                { label: "6 bulan", value: "6" },
                { label: "12 bulan", value: "12" },
              ]}
              value={String(trendMonths)}
              onChange={(val) => setTrendMonths(Number(val))}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={exportCsv.isPending}
            onClick={() => exportCsv.mutate()}
            type="button"
          >
            <Download className="h-4 w-4" />
            {exportCsv.isPending ? "Menyiapkan..." : "Ekspor CSV"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">Data manual/mock, bukan real-time.</p>
        {exportMessage ? <p className="mt-3 text-sm text-emerald-200">{exportMessage}</p> : null}
        {exportCsv.isError ? <p className="mt-3 text-sm text-red-200">Ekspor CSV gagal diproses.</p> : null}
      </Card>

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Laporan belum bisa dimuat." /> : null}
      {!isLoading && !isError && !monthly.data && !performance.data ? (
        <EmptyState title="Laporan kosong" description="Belum ada snapshot portfolio untuk dibuat laporan." />
      ) : null}

      {!isLoading && !isError && monthly.data ? <MonthlySummary data={monthly.data} /> : null}
      {!isLoading && !isError && insights.data ? <PersonalInsights data={insights.data} /> : null}
      {!isLoading && !isError && performance.data ? <PerformanceSummary data={performance.data} /> : null}
    </div>
  );
}

function PersonalInsights({ data }: { data: PersonalInsightsReport }) {
  return (
    <section className="mb-5">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" />
        <h3 className="text-lg font-semibold text-main">Insight Personal {data.month}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Income" value={formatCurrency(data.income_total)} />
        <Metric label="Expense" value={formatCurrency(data.expense_total)} />
        <Metric label="Cashflow Bersih" value={formatCurrency(data.net_cashflow)} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h4 className="font-semibold text-main">Breakdown Kategori</h4>
          <SimpleTable
            emptyLabel="Belum ada pemasukan atau pengeluaran pada bulan ini."
            rows={data.category_breakdown.map((row, index) => ({
              key: `${row.type}-${row.category_id ?? row.category_name}`,
              left: `${row.category_name} / ${row.type === "income" ? "Income" : "Expense"}`,
              right: formatCurrency(row.total_idr),
              detail: `${row.transaction_count} transaksi / ${formatPercent(row.percent)}`,
            }))}
          />
        </Card>
        <Card>
          <h4 className="font-semibold text-main">Tren Cashflow</h4>
          <SimpleTable
            emptyLabel="Tren cashflow belum tersedia."
            rows={data.cashflow_trend.map((row, index) => ({
              key: row.month,
              left: row.month,
              right: formatCurrency(row.net_cashflow),
              detail: `Masuk ${formatCurrency(row.income)} / Keluar ${formatCurrency(row.expense)}`,
            }))}
          />
        </Card>
      </div>
    </section>
  );
}

function MonthlySummary({ data }: { data: MonthlySummaryReport }) {
  return (
    <section className="mb-5">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" />
        <h3 className="text-lg font-semibold text-main">Ringkasan Bulanan {data.month}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Kekayaan Bersih Akhir" value={formatMaybeCurrency(data.ending_net_worth)} />
        <Metric label="Portofolio" value={formatMaybeCurrency(data.portfolio_value)} />
        <Metric label="Kas" value={formatMaybeCurrency(data.cash_balance)} />
        <Metric label="Pergerakan Kas" value={formatMaybeCurrency(data.cash_net_movement)} />
        <Metric label="Income" value={formatMaybeCurrency(data.income_total)} />
        <Metric label="Expense" value={formatMaybeCurrency(data.expense_total)} />
        <Metric label="Cashflow Bersih" value={formatMaybeCurrency(data.net_cashflow)} />
        <Metric label="Laba/Rugi Belum Terealisasi" value={formatMaybeCurrency(data.unrealized_profit_loss)} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h4 className="font-semibold text-main">Progress Anggaran</h4>
          <SimpleTable
            emptyLabel="Belum ada anggaran pada bulan ini."
            rows={(data.budgets ?? []).map((row, index) => ({
              key: row.id,
              left: row.category_name,
              right: formatCurrency(row.spent),
              detail: `${formatCurrency(row.amount)} / ${formatPercent(row.percent_used)}${row.over_budget ? " / melewati anggaran" : ""}`,
            }))}
          />
        </Card>
        <Card>
          <h4 className="font-semibold text-main">Total Transaksi per Aset</h4>
          <SimpleTable
            emptyLabel="Belum ada transaksi pada bulan ini."
            rows={data.transaction_totals_by_asset_type.map((row, index) => ({
              key: `${row.asset_type}-${row.transaction_type}`,
              left: `${row.asset_type} / ${row.transaction_type}`,
              right: formatCurrency(row.total_idr),
              detail: `${row.transaction_count} transaksi`,
            }))}
          />
        </Card>
        <Card>
          <h4 className="font-semibold text-main">Total Transaksi per Instrumen</h4>
          <SimpleTable
            emptyLabel="Belum ada transaksi instrumen."
            rows={data.transaction_totals_by_instrument.map((row, index) => ({
              key: `${row.instrument_id ?? row.name}-${row.transaction_type}`,
              left: `${row.ticker ?? row.name} / ${row.transaction_type}`,
              right: formatCurrency(row.total_idr),
              detail: `${row.instrument_type}, ${row.original_currency}`,
            }))}
          />
        </Card>
      </div>
      <Warnings warnings={data.warnings} />
    </section>
  );
}

function PerformanceSummary({ data }: { data: PortfolioPerformanceReport }) {
  const change = data.absolute_change == null ? "Tidak tersedia" : formatCurrency(data.absolute_change);
  const percent = data.percentage_change == null ? "Tidak tersedia" : formatPercent(data.percentage_change);
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-accent" />
        <h3 className="text-lg font-semibold text-main">
          Performa Portofolio {formatDate(data.from_date)} - {formatDate(data.to_date)}
        </h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Nilai Awal" value={formatMaybeCurrency(data.starting_value)} />
        <Metric label="Nilai Akhir" value={formatMaybeCurrency(data.ending_value)} />
        <Metric label="Perubahan" value={change} />
        <Metric label="Persentase" value={percent} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h4 className="font-semibold text-main">Alokasi</h4>
          <SimpleTable
            emptyLabel="Alokasi belum tersedia."
            rows={data.allocation_breakdown.map((row, index) => ({
              key: row.asset,
              left: row.asset,
              right: formatCurrency(row.value),
              detail: formatPercent(row.percent),
            }))}
          />
        </Card>
        <Card>
          <h4 className="font-semibold text-main">Posisi</h4>
          <SimpleTable
            emptyLabel="Holding belum tersedia."
            rows={data.holdings_performance.map((row, index) => ({
              key: row.instrument_id,
              left: row.ticker ?? row.name,
              right: formatCurrency(row.current_value_idr),
              detail: `${formatCurrency(row.profit_loss_value_idr)} / ${row.instrument_currency}`,
            }))}
          />
        </Card>
      </div>
      <Card className="mt-4">
        <h4 className="font-semibold text-main">Kas</h4>
        <p className="mt-2 text-sm text-muted">
          {formatCurrency(data.cash_summary.total_cash)} dari {data.cash_summary.active_accounts} akun aktif.
        </p>
        <p className="mt-1 text-sm text-muted">Pergerakan periode: {formatCurrency(data.cash_summary.period_movement)}</p>
        <p className="mt-1 text-sm text-muted">{data.cash_summary.note}</p>
      </Card>
      <Warnings warnings={data.warnings} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-main">{value}</p>
    </Card>
  );
}

function SimpleTable({ emptyLabel, rows }: { emptyLabel: string; rows: Array<{ key: string; left: string; right: string; detail: string }> }) {
  if (rows.length === 0) {
    return <p className="mt-4 text-sm text-muted">{emptyLabel}</p>;
  }
  return (
    <div className="mt-4 divide-y divide-subtle">
      {rows.map((row, index) => (
        <div className="flex items-start justify-between gap-4 py-3" key={row.key}>
          <div>
            <p className="text-sm font-medium text-main">{row.left}</p>
            <p className="mt-1 text-xs text-muted">{row.detail}</p>
          </div>
          <p className="shrink-0 text-sm text-zinc-200">{row.right}</p>
        </div>
      ))}
    </div>
  );
}

function Warnings({ warnings }: { warnings: ReportWarning[] }) {
  if (warnings.length === 0) {
    return null;
  }
  return (
    <Card className="mt-4">
      <h4 className="font-semibold text-main">Catatan Kualitas Data</h4>
      <div className="mt-3 space-y-2">
        {warnings.map((warning, index) => (
          <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 px-3 py-2" key={`${warning.code}-${warning.message}`}>
            <p className="text-sm font-medium text-amber-100">{warning.code}</p>
            <p className="mt-1 text-sm text-amber-100/80">{warning.message}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function formatMaybeCurrency(value: number | null | undefined) {
  if (value == null) {
    return "Tidak tersedia";
  }
  return formatCurrency(value);
}

function defaultMonth() {
  return new Date().toISOString().slice(0, 7);
}

function defaultRange() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  return { from, to };
}
