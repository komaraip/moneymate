import { Card, CardContent } from "@/components/shared/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div className="rounded-2xl bg-[hsl(var(--accent)/0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          Nothing here yet
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

