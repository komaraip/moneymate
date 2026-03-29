import { Badge } from "@/components/shared/badge";
import { Card, CardContent, CardHeader } from "@/components/shared/card";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  trend?: string;
  tone?: "neutral" | "accent" | "success" | "warning";
};

export function MetricCard({ label, value, detail, trend, tone = "neutral" }: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        </div>
        {trend ? <Badge tone={tone}>{trend}</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}

