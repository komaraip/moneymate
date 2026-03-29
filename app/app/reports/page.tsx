import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import { BarBreakdownChart } from "@/components/reports/bar-breakdown-chart";
import { ChartCard } from "@/components/reports/chart-card";
import { LineTrendChart } from "@/components/reports/line-trend-chart";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { FiltersBar } from "@/components/shared/filters-bar";
import { Input } from "@/components/shared/input";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { resolveDateRangePresetWindow, toDateInputValue } from "@/lib/services/date-range";
import {
  getBalanceReport,
  getCashflowReport,
  getDocumentHealthReport,
  getInvestmentReport
} from "@/lib/services/reporting";
import { getDashboardPreference } from "@/lib/services/settings";
import { formatCurrency, formatDate } from "@/lib/utils/format";

function pickQueryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function buildExportHref(kind: string, from?: string, to?: string, mode?: string) {
  const params = new URLSearchParams();
  params.set("kind", kind);

  if (from) {
    params.set("from", from);
  }

  if (to) {
    params.set("to", to);
  }

  if (mode) {
    params.set("mode", mode);
  }

  return `/api/reports/export?${params.toString()}`;
}

const exportLinkClassName =
  "inline-flex items-center justify-center rounded-2xl border border-border/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-foreground shadow-panel transition hover:bg-white";
const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const dashboardPreference = await getDashboardPreference(user.id);
  const fallbackDateRange = resolveDateRangePresetWindow(dashboardPreference.defaultDateRange);
  const from = pickQueryValue(params.from) ?? toDateInputValue(fallbackDateRange.from);
  const to = pickQueryValue(params.to) ?? toDateInputValue(fallbackDateRange.to);
  const mode = pickQueryValue(params.mode);

  const [cashflow, balance, investments, documentHealth] = await Promise.all([
    getCashflowReport(user.id, { from, to, mode }),
    getBalanceReport(user.id, { from, to }),
    getInvestmentReport(user.id, { from, to }),
    getDocumentHealthReport(user.id)
  ]);

  const balanceTrendData = balance.monthly.map((entry) => ({
    label: entry.month,
    cash: Number(entry.cashBalance),
    investments: Number(entry.investmentValue),
    netWorth: Number(entry.netWorth)
  }));
  const cashflowTrendData = cashflow.monthly.map((entry) => ({
    label: entry.month,
    income: Number(entry.income),
    expense: Number(entry.expense),
    net: Number(entry.net)
  }));
  const investmentTrendData = investments.monthlyActivity.map((entry) => ({
    label: entry.month,
    activityCount: entry.activityCount
  }));
  const expenseCategoryData = cashflow.categories.map((entry) => ({
    label: entry.categoryName,
    total: Number(entry.total)
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Phase 4 brings together trend analysis, duplicate detection, parser quality signals, and exports."
        action={
          <div className="flex flex-wrap gap-2">
            <a href={buildExportHref("cashflow", from, to, mode)} className={exportLinkClassName}>
              Export Cashflow CSV
            </a>
            <a href={buildExportHref("transactions", from, to, mode)} className={exportLinkClassName}>
              Export Transactions CSV
            </a>
            <a href={buildExportHref("documents", from, to, mode)} className={exportLinkClassName}>
              Export Documents CSV
            </a>
            <a href={buildExportHref("holdings", from, to, mode)} className={exportLinkClassName}>
              Export Holdings CSV
            </a>
          </div>
        }
      />

      <FiltersBar>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          From
          <Input name="from" type="date" defaultValue={from} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          To
          <Input name="to" type="date" defaultValue={to} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Cashflow mode
          <select name="mode" defaultValue={mode ?? cashflow.mode} className={selectClassName}>
            <option value="COMBINED">Combined</option>
            <option value="SEPARATE">Separate</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className={exportLinkClassName}>
            Apply Report Window
          </button>
        </div>
      </FiltersBar>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Net Worth" value={formatCurrency(balance.summary.totalNetWorth)} tone="accent" />
        <MetricCard label="Cash Balance" value={formatCurrency(balance.summary.totalCash)} tone="accent" />
        <MetricCard label="Investment Value" value={formatCurrency(balance.summary.totalInvestments)} tone="accent" />
        <MetricCard label="Duplicate Documents" value={`${documentHealth.summary.duplicateDocuments}`} tone="warning" />
        <MetricCard
          label="Low Confidence Docs"
          value={`${documentHealth.summary.lowConfidenceDocuments}`}
          tone={documentHealth.summary.lowConfidenceDocuments > 0 ? "warning" : "success"}
        />
        <MetricCard
          label="Average Parse Confidence"
          value={
            documentHealth.summary.averageConfidence !== null
              ? `${Math.round(documentHealth.summary.averageConfidence * 100)}%`
              : "-"
          }
          tone="accent"
        />
        <MetricCard label="Regular Cashflow Net" value={formatCurrency(cashflow.streams.regular.net)} tone="accent" />
        <MetricCard
          label="Investment Cashflow Net"
          value={formatCurrency(cashflow.streams.investment.net)}
          tone="accent"
        />
        <MetricCard
          label="Internal Transfers Excluded"
          value={`${cashflow.ruleSummary.transfer.excludedCount}`}
          tone={cashflow.ruleSummary.transfer.excludedCount > 0 ? "warning" : "success"}
        />
        <MetricCard
          label="Rule Matches"
          value={`${cashflow.ruleSummary.classification.matchedCount + cashflow.ruleSummary.transfer.matchedCount}`}
          tone="accent"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Net Worth Trend"
          description="Cash and approved investments rolled into a month-by-month balance view."
        >
          <LineTrendChart
            data={balanceTrendData}
            series={[
              { dataKey: "netWorth", label: "Net Worth", color: "#0f766e" },
              { dataKey: "cash", label: "Cash", color: "#1d4ed8" },
              { dataKey: "investments", label: "Investments", color: "#ca8a04" }
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Cashflow Trend"
          description="Income, expenses, and net cashflow over the current reporting window."
        >
          <LineTrendChart
            data={cashflowTrendData}
            series={[
              { dataKey: "income", label: "Income", color: "#15803d" },
              { dataKey: "expense", label: "Expense", color: "#dc2626" },
              { dataKey: "net", label: "Net", color: "#2563eb" }
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Investment Activity"
          description="Approved investment activity counts by month."
        >
          <BarBreakdownChart
            data={investmentTrendData}
            dataKey="activityCount"
            label="Activity Count"
            color="#0f766e"
            valueFormat="number"
          />
        </ChartCard>

        <ChartCard
          title="Top Cashflow Categories"
          description="The biggest income and expense categories in the current report window."
        >
          <BarBreakdownChart data={expenseCategoryData} dataKey="total" label="Category Total" color="#7c3aed" />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Potential Duplicate Documents</h2>
            <p className="text-sm text-muted-foreground">
              Exact duplicates and suspicious near-matches surfaced from filename, statement period, and file similarity.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentHealth.duplicateCandidates.length === 0 ? (
              <p className="rounded-2xl bg-[hsl(var(--success)/0.08)] px-4 py-3 text-sm text-[hsl(var(--success))]">
                No duplicate candidates are standing out right now.
              </p>
            ) : (
              documentHealth.duplicateCandidates.map((candidate) => (
                <div key={`${candidate.documentId}-${candidate.duplicateOfDocumentId}`} className="rounded-[24px] border border-border/70 bg-white/65 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link href={`/app/documents/${candidate.documentId}`} className="font-semibold text-foreground hover:text-[hsl(var(--accent))]">
                        {candidate.filename}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {formatDate(candidate.uploadedAt)} and matched against {candidate.duplicateFilename}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Similarity</p>
                      <p className="font-semibold text-[hsl(var(--warning))]">{Math.round(candidate.similarityScore * 100)}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Parser Confidence Watchlist</h2>
            <p className="text-sm text-muted-foreground">Documents under the trust threshold stay visible here for quick follow-up.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentHealth.lowConfidenceDocuments.length === 0 ? (
              <p className="rounded-2xl bg-[hsl(var(--success)/0.08)] px-4 py-3 text-sm text-[hsl(var(--success))]">
                No low-confidence documents in the current archive.
              </p>
            ) : (
              documentHealth.lowConfidenceDocuments.map((document) => (
                <div key={document.id} className="rounded-[24px] border border-border/70 bg-white/65 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <Link href={`/app/documents/${document.id}`} className="font-semibold text-foreground hover:text-[hsl(var(--accent))]">
                        {document.filename}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatDate(document.uploadedAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <DocumentStatusBadge status={document.parseStatus} />
                      <ConfidenceBadge confidence={document.overallConfidence} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Top Realized P/L Securities</h2>
            <p className="text-sm text-muted-foreground">Approved activity only, ranked by realized profit/loss in the selected period.</p>
          </CardHeader>
          <CardContent>
            {investments.realizedBySecurity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No realized P/L entries were found in this reporting window.</p>
            ) : (
              <div className="space-y-3">
                {investments.realizedBySecurity.map((security) => (
                  <div key={security.ticker} className="flex items-center justify-between rounded-2xl border border-border/70 bg-white/65 px-4 py-3">
                    <div>
                      <p className="font-semibold text-foreground">{security.ticker}</p>
                      <p className="text-sm text-muted-foreground">{security.securityName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(security.realizedProfitLoss)}</p>
                      <p className="text-sm text-muted-foreground">{security.activityCount} activities</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Account Snapshot Coverage</h2>
            <p className="text-sm text-muted-foreground">Balance analytics are only as strong as the latest account snapshots feeding them.</p>
          </CardHeader>
          <CardContent>
            {balance.accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cash accounts yet.</p>
            ) : (
              <div className="space-y-3">
                {balance.accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-white/65 px-4 py-3">
                    <div>
                      <p className="font-semibold text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.latestSnapshotDate ? formatDate(account.latestSnapshotDate) : "No snapshot yet"}</p>
                    </div>
                    <p className="font-semibold text-foreground">
                      {account.currentBalance ? formatCurrency(account.currentBalance, account.currency) : "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
