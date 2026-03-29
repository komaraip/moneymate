import Link from "next/link";
import { Card, CardContent } from "@/components/shared/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-xl">
        <CardContent className="flex flex-col items-start gap-4 p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
            Not Found
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">This page does not exist.</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The route may have moved, or the referenced document or security does not exist for the current account.
          </p>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-panel transition hover:bg-[hsl(var(--accent)/0.92)]"
          >
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
