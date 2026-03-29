import { Badge } from "@/components/shared/badge";

const toneByStatus: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  DRAFT: "neutral",
  UPLOADED: "accent",
  PROCESSING: "accent",
  PARSED: "accent",
  NEEDS_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  DUPLICATE: "warning",
  FAILED: "danger"
};

export function DocumentStatusBadge({ status }: { status: string }) {
  return <Badge tone={toneByStatus[status] ?? "neutral"}>{status.replaceAll("_", " ")}</Badge>;
}

