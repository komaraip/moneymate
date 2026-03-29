import Link from "next/link";
import { ConfidenceBadge } from "@/components/documents/confidence-badge";
import { DocumentStatusBadge } from "@/components/documents/status-badge";
import { UploadPanel } from "@/components/documents/upload-panel";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { listDocuments } from "@/lib/services/documents";
import { formatDate } from "@/lib/utils/format";

export default async function DocumentsPage() {
  const user = await requireUser();
  const documents = await listDocuments(user.id, {});

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ingestion"
        title="Documents"
        description="Register uploads, track parser status, and jump into review or approval."
      />

      <UploadPanel />

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Document Archive</h2>
          <p className="text-sm text-muted-foreground">Every upload keeps its own parser history and source traceability.</p>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <EmptyState
              title="No documents uploaded yet"
              description="Use the upload panel above to start the parser workflow."
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
                    <th className="pb-3">Period</th>
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
                      <td className="py-4">
                        {document.statementPeriod.start
                          ? `${formatDate(document.statementPeriod.start)} - ${formatDate(document.statementPeriod.end)}`
                          : "-"}
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

