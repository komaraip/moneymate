import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getApprovedHoldings } from "@/lib/services/investments";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function InvestmentsPage() {
  const user = await requireUser();
  const holdings = await getApprovedHoldings(user.id);
  const totalValue = holdings.reduce((sum, holding) => sum + Number(holding.marketValue ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portfolio"
        title="Investments"
        description="Approved holding snapshots give you the trustworthy portfolio view for this MVP."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Approved Holdings" value={`${holdings.length}`} />
        <MetricCard label="Portfolio Value" value={formatCurrency(totalValue)} tone="accent" trend="Approved only" />
        <MetricCard label="Unique Tickers" value={`${new Set(holdings.map((holding) => holding.ticker)).size}`} />
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Latest Snapshots</h2>
          <p className="text-sm text-muted-foreground">One latest approved snapshot per security and account pair.</p>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <EmptyState
              title="No approved holdings yet"
              description="Approve a parsed stock activity statement to populate the portfolio."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Security</th>
                    <th className="pb-3 pr-4">Quantity</th>
                    <th className="pb-3 pr-4">Average Cost</th>
                    <th className="pb-3 pr-4">Market Value</th>
                    <th className="pb-3 pr-4">Snapshot Date</th>
                    <th className="pb-3">Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {holdings.map((holding) => (
                    <tr key={`${holding.securityId}-${holding.investmentAccountName ?? "default"}`}>
                      <td className="py-4 pr-4">
                        <Link
                          href={`/app/investments/securities/${holding.ticker}`}
                          className="font-semibold hover:text-[hsl(var(--accent))]"
                        >
                          {holding.ticker}
                        </Link>
                        <p className="text-muted-foreground">{holding.securityName}</p>
                      </td>
                      <td className="py-4 pr-4">{holding.quantity}</td>
                      <td className="py-4 pr-4">{holding.averageCost ?? "-"}</td>
                      <td className="py-4 pr-4">{holding.marketValue ? formatCurrency(holding.marketValue) : "-"}</td>
                      <td className="py-4 pr-4">{formatDate(holding.latestSnapshotDate)}</td>
                      <td className="py-4">{holding.investmentAccountName ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/app/investments/activity" className="text-sm font-semibold text-[hsl(var(--accent))]">
          View full activity timeline
        </Link>
      </div>
    </div>
  );
}

