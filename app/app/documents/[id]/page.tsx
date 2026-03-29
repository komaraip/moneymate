import { notFound } from "next/navigation";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { DocumentActions } from "@/components/documents/document-actions";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import { Badge } from "@/components/shared/badge";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getDocumentDetail } from "@/lib/services/documents";
import { formatDate } from "@/lib/utils/format";

export default async function DocumentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const detail = await getDocumentDetail(user.id, id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Document Detail"
        title={detail.document.filename}
        description="Inspect parser runs, validation issues, and normalized rows before approving this statement."
        action={<DocumentActions documentId={detail.document.id} parseStatus={detail.document.parseStatus} />}
      />

      <div className="flex flex-wrap gap-3">
        <DocumentStatusBadge status={detail.document.parseStatus} />
        <ConfidenceBadge confidence={detail.document.overallConfidence} />
        <Badge tone="neutral">{detail.document.documentType}</Badge>
        <Badge tone="accent">{detail.document.parserVersion ?? "No parser version"}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Metadata</h2>
            <p className="text-sm text-muted-foreground">Document-level fields persisted from the parser run.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[24px] bg-white/60 p-4 text-sm">
              <p>
                <span className="font-semibold">Uploaded:</span> {formatDate(detail.document.uploadedAt)}
              </p>
              <p>
                <span className="font-semibold">Processed:</span> {formatDate(detail.document.processedAt)}
              </p>
              <p>
                <span className="font-semibold">Storage key:</span> {detail.document.storageKey}
              </p>
            </div>
            {detail.metadata.map((entry) => (
              <div key={entry.key} className="rounded-[24px] border border-border/70 bg-white/60 p-4 text-sm">
                <p className="font-semibold">{entry.key}</p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                  {entry.valueText ?? JSON.stringify(entry.valueJson, null, 2)}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Validation + Jobs</h2>
            <p className="text-sm text-muted-foreground">Parser issues and extraction job history stay attached to the document.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {detail.validationIssues.length === 0 ? (
                <p className="rounded-2xl bg-[hsl(var(--success)/0.08)] px-4 py-3 text-sm text-[hsl(var(--success))]">
                  No validation issues were recorded.
                </p>
              ) : (
                detail.validationIssues.map((issue) => (
                  <div
                    key={issue}
                    className="rounded-2xl bg-[hsl(var(--warning)/0.08)] px-4 py-3 text-sm text-[hsl(var(--warning))]"
                  >
                    {issue}
                  </div>
                ))
              )}
            </div>
            <div className="grid gap-3">
              {detail.extractionJobs.map((job) => (
                <div key={job.id} className="rounded-[24px] border border-border/70 bg-white/60 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{job.status}</p>
                      <p className="text-muted-foreground">{job.stage}</p>
                    </div>
                    <p className="text-muted-foreground">{formatDate(job.createdAt)}</p>
                  </div>
                  {job.errorMessage ? <p className="mt-3 text-[hsl(var(--danger))]">{job.errorMessage}</p> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Parsed Activity Rows</h2>
          <p className="text-sm text-muted-foreground">These rows remain outside portfolio analytics until the document is approved.</p>
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
                  <th className="pb-3 pr-4">Balance After</th>
                  <th className="pb-3">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {detail.activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="py-3 pr-4">{activity.activityType.replaceAll("_", " ")}</td>
                    <td className="py-3 pr-4">{formatDate(activity.activityDate)}</td>
                    <td className="py-3 pr-4">{activity.description}</td>
                    <td className="py-3 pr-4">{activity.quantity ?? "-"}</td>
                    <td className="py-3 pr-4">{activity.balanceAfter ?? "-"}</td>
                    <td className="py-3">{activity.requiresReview ? "Needs review" : "Ready"}</td>
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

