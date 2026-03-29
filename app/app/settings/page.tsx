import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Phase 2 keeps settings intentionally light while the ingestion and approval loop hardens."
      />

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">Current authenticated user and currency defaults.</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="font-semibold">Display name:</span> {user.displayName ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Preferred currency:</span> {user.preferredCurrency}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Phase 2 Defaults</h2>
          <p className="text-sm text-muted-foreground">Explicit product boundaries for this MVP slice.</p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Credentials-only authentication</p>
          <p>Signed S3 uploads for documents</p>
          <p>Text-based PDF support first, OCR deferred</p>
          <p>Approved documents are the portfolio and dashboard boundary</p>
        </CardContent>
      </Card>
    </div>
  );
}
