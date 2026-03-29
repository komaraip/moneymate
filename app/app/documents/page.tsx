import Link from "next/link";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import { UploadPanel } from "@/components/documents/upload-panel";
import { Badge } from "@/components/shared/badge";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { FiltersBar } from "@/components/shared/filters-bar";
import { Input } from "@/components/shared/input";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { listDocuments } from "@/lib/services/documents";
import { formatDate } from "@/lib/utils/format";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

function pickQueryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const query = {
    search: pickQueryValue(params.search),
    status: pickQueryValue(params.status),
    type: pickQueryValue(params.type),
    duplicatesOnly: pickQueryValue(params.duplicatesOnly),
    confidenceBelow: pickQueryValue(params.confidenceBelow),
    page: "1",
    pageSize: "100"
  };
  const documents = await listDocuments(user.id, query);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ingestion"
        title="Documents"
        description="Register uploads, track parser status, filter low-confidence rows, and spot duplicates faster."
      />

      <UploadPanel />

      <FiltersBar>
        <label className="grid gap-2 text-sm font-medium text-foreground xl:col-span-2">
          Search filename
          <Input name="search" defaultValue={query.search} placeholder="Stock statement March" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Status
          <select name="status" defaultValue={query.status ?? ""} className={selectClassName}>
            <option value="">All statuses</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="PROCESSING">Processing</option>
            <option value="PARSED">Parsed</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="APPROVED">Approved</option>
            <option value="DUPLICATE">Duplicate</option>
            <option value="FAILED">Failed</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Type
          <select name="type" defaultValue={query.type ?? ""} className={selectClassName}>
            <option value="">All types</option>
            <option value="STOCK_ACTIVITY_STATEMENT">Stock Activity Statement</option>
            <option value="PORTFOLIO_SUMMARY">Portfolio Summary</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Confidence below
          <Input name="confidenceBelow" defaultValue={query.confidenceBelow} placeholder="0.75" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Duplicates only
          <select name="duplicatesOnly" defaultValue={query.duplicatesOnly ?? ""} className={selectClassName}>
            <option value="">All documents</option>
            <option value="true">Only duplicates</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="inline-flex items-center justify-center rounded-2xl border border-border/80 bg-white/90 px-4 py-2.5 text-sm font-semibold text-foreground shadow-panel transition hover:bg-white">
            Apply Filters
          </button>
        </div>
      </FiltersBar>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Document Archive</h2>
          <p className="text-sm text-muted-foreground">Every upload keeps its own parser history, confidence trail, and duplicate signals.</p>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <EmptyState
              title="No documents match these filters"
              description="Try a broader search or upload a new statement to start the parser workflow."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Filename</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Confidence</th>
                    <th className="pb-3 pr-4">Uploaded</th>
                    <th className="pb-3 pr-4">Period</th>
                    <th className="pb-3">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td className="py-4 pr-4">
                        <Link href={`/app/documents/${document.id}`} className="font-semibold hover:text-[hsl(var(--accent))]">
                          {document.filename}
                        </Link>
                      </td>
                      <td className="py-4 pr-4">
                        <DocumentStatusBadge status={document.parseStatus} />
                      </td>
                      <td className="py-4 pr-4">
                        <ConfidenceBadge confidence={document.overallConfidence} />
                      </td>
                      <td className="py-4 pr-4">{formatDate(document.uploadedAt)}</td>
                      <td className="py-4 pr-4">
                        {document.statementPeriod.start
                          ? `${formatDate(document.statementPeriod.start)} - ${formatDate(document.statementPeriod.end)}`
                          : "-"}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {document.duplicateOfDocumentId ? <Badge tone="warning">Duplicate</Badge> : null}
                          {document.needsReview ? <Badge tone="accent">Review Needed</Badge> : null}
                        </div>
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
