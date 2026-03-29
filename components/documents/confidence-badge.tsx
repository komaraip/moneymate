import { Badge } from "@/components/shared/badge";

export function ConfidenceBadge({ confidence }: { confidence: number | null }) {
  if (confidence === null || Number.isNaN(confidence)) {
    return <Badge tone="neutral">No confidence</Badge>;
  }

  const tone = confidence >= 0.9 ? "success" : confidence >= 0.75 ? "accent" : "warning";
  return <Badge tone={tone}>{Math.round(confidence * 100)}% confidence</Badge>;
}

