import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/shared/card";

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex-col items-start gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
