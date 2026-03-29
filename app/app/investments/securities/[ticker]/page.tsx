import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getSecurityDetail } from "@/lib/services/investments";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function SecurityDetailPage({
  params
}: {
  params: Promise<{ ticker: string }>;
}) {
  const user = await requireUser();
  const { ticker } = await params;
  const detail = await getSecurityDetail(user.id, ticker);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Security Detail"
        title={`${detail.ticker} · ${detail.securityName}`}
        description="Per-security approved timeline with the latest approved holding snapshot."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quantity</p>
            <p className="text-3xl font-semibold">{detail.latestHolding?.quantity ?? "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Average Cost</p>
            <p className="text-3xl font-semibold">{detail.latestHolding?.averageCost ?? "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Market Value</p>
            <p className="text-3xl font-semibold">
              {detail.latestHolding?.marketValue ? formatCurrency(detail.latestHolding.marketValue) : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Activity Timeline</h2>
          <p className="text-sm text-muted-foreground">Approved activity only.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {detail.activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="py-4 pr-4">{activity.activityType.replaceAll("_", " ")}</td>
                    <td className="py-4 pr-4">{formatDate(activity.activityDate)}</td>
                    <td className="py-4 pr-4">{activity.description}</td>
                    <td className="py-4 pr-4">{activity.quantity ?? "-"}</td>
                    <td className="py-4">{activity.balanceAfter ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

