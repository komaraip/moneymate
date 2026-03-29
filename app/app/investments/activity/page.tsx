import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getApprovedActivities } from "@/lib/services/investments";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function InvestmentActivityPage() {
  const user = await requireUser();
  const activities = await getApprovedActivities(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Timeline"
        title="Investment Activity"
        description="Every row here has crossed the approval boundary and can be traced back to its source statement."
      />

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Approved Activity</h2>
          <p className="text-sm text-muted-foreground">Grouped chronologically across approved documents.</p>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <EmptyState
              title="No approved activity"
              description="Approve a stock activity statement to populate the timeline."
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
                    <th className="pb-3 pr-4">Value</th>
                    <th className="pb-3">Realized P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="py-4 pr-4">
                        <p className="font-semibold">{activity.ticker}</p>
                        <p className="text-muted-foreground">{activity.securityName}</p>
                      </td>
                      <td className="py-4 pr-4">{activity.activityType.replaceAll("_", " ")}</td>
                      <td className="py-4 pr-4">{formatDate(activity.activityDate)}</td>
                      <td className="py-4 pr-4">{activity.quantity ?? "-"}</td>
                      <td className="py-4 pr-4">
                        {activity.marketValueAfter ? formatCurrency(activity.marketValueAfter) : "-"}
                      </td>
                      <td className="py-4">
                        {activity.realizedProfitLoss ? formatCurrency(activity.realizedProfitLoss) : "-"}
                      </td>
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

