import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const summary = await getDashboardSummary(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Dashboard"
        description="A Phase 2 view of document processing health, review workload, and approved portfolio activity."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Processed Documents" value={`${summary.metrics.processedDocuments}`} />
        <MetricCard
          label="Pending Review"
          value={`${summary.metrics.pendingReviewItems}`}
          tone={summary.metrics.pendingReviewItems > 0 ? "warning" : "success"}
          trend={summary.metrics.pendingReviewItems > 0 ? "Needs attention" : "Clear"}
        />
        <MetricCard
          label="Approved Holdings"
          value={formatCurrency(summary.metrics.totalHoldingsValue)}
          tone="accent"
          trend="Approved only"
        />
        <MetricCard label="Tracked Securities" value={`${summary.metrics.uniqueSecurities}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <p className="text-sm text-muted-foreground">Latest uploads and their parser readiness.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.recentDocuments.length === 0 ? (
              <EmptyState
                title="No documents uploaded yet"
                description="Use the Documents page to upload a broker statement and start the review flow."
              />
            ) : (
              summary.recentDocuments.map((document) => (
                <Link
                  key={document.id}
                  href={`/app/documents/${document.id}`}
                  className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-white/60 p-4 transition hover:border-[hsl(var(--accent)/0.3)] hover:bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{document.filename}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(document.uploadedAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <DocumentStatusBadge status={document.parseStatus} />
                      <ConfidenceBadge confidence={document.overallConfidence} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Review Alerts</h2>
            <p className="text-sm text-muted-foreground">Signals that still block trusted analytics.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.alerts.length === 0 ? (
              <p className="rounded-2xl bg-[hsl(var(--success)/0.08)] px-4 py-3 text-sm text-[hsl(var(--success))]">
                No active review alerts right now.
              </p>
            ) : (
              summary.alerts.map((alert) => (
                <div
                  key={alert}
                  className="rounded-2xl bg-[hsl(var(--warning)/0.08)] px-4 py-3 text-sm text-[hsl(var(--warning))]"
                >
                  {alert}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Recent Approved Activity</h2>
          <p className="text-sm text-muted-foreground">Only approved activity rows appear here.</p>
        </CardHeader>
        <CardContent>
          {summary.recentActivities.length === 0 ? (
            <EmptyState
              title="No approved activity yet"
              description="Approve a parsed stock statement and the investment timeline will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Security</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Quantity</th>
                    <th className="pb-3">Market Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {summary.recentActivities.map((activity) => (
                    <tr key={`${activity.ticker}-${activity.id}`} className="align-top">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium">{activity.ticker}</p>
                          <p className="text-muted-foreground">{activity.securityName}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{activity.activityType.replaceAll("_", " ")}</td>
                      <td className="py-3 pr-4">{formatDate(activity.activityDate)}</td>
                      <td className="py-3 pr-4">{activity.quantity ?? "-"}</td>
                      <td className="py-3">{activity.marketValueAfter ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

