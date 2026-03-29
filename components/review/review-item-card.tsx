"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ReviewQueueItem } from "@/lib/contracts";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card, CardContent, CardHeader } from "@/components/shared/card";

type ReviewItemCardProps = {
  item: ReviewQueueItem;
};

export function ReviewItemCard({ item }: ReviewItemCardProps) {
  const router = useRouter();
  const initialValue = useMemo(
    () => JSON.stringify(item.normalizedValue ?? null, null, 2),
    [item.normalizedValue]
  );
  const [draft, setDraft] = useState(initialValue);
  const [isPending, setIsPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "approve" | "reject" | "ignore") {
    setError(null);
    setIsPending(decision);

    try {
      const normalizedValue = draft ? JSON.parse(draft) : null;
      const response = await fetch(`/api/review/field/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          normalizedValue,
          decision
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update review item.");
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update review item.");
    } finally {
      setIsPending(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning">{item.fieldPath}</Badge>
          <Badge tone="accent">{item.documentFilename}</Badge>
          <Badge tone="neutral">{item.reviewStatus}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Compare the raw source with the normalized value and decide whether this field should flow into approval.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border/70 bg-white/60 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Raw</p>
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-foreground">{item.rawValue}</pre>
        </div>
        <div className="grid gap-3">
          <div className="rounded-[24px] border border-border/70 bg-white/60 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Normalized JSON
            </p>
            <textarea
              className="min-h-56 w-full resize-y rounded-2xl border border-border/80 bg-white px-4 py-3 font-[family-name:var(--font-mono)] text-sm outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          {error ? (
            <div className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
              {error}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void submit("ignore")} variant="ghost" disabled={isPending !== null}>
              {isPending === "ignore" ? "Ignoring..." : "Ignore"}
            </Button>
            <Button onClick={() => void submit("reject")} variant="danger" disabled={isPending !== null}>
              {isPending === "reject" ? "Rejecting..." : "Reject"}
            </Button>
            <Button onClick={() => void submit("approve")} disabled={isPending !== null}>
              {isPending === "approve" ? "Saving..." : "Approve Edit"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

