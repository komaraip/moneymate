import Link from "next/link";
import { ReviewItemCard } from "@/components/review/review-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getReviewQueue } from "@/lib/services/review";

export default async function ReviewPage() {
  const user = await requireUser();
  const items = await getReviewQueue(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Trust Layer"
        title="Review Queue"
        description="Resolve low-confidence parser output before a document is approved into holdings and dashboard metrics."
      />

      {items.length === 0 ? (
        <EmptyState
          title="No items require review"
          description="Once the parser flags uncertain rows or metadata, they will appear here with side-by-side editing."
          action={
            <Link href="/app/documents" className="text-sm font-semibold text-[hsl(var(--accent))]">
              Go to documents
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <ReviewItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

