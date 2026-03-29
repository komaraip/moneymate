"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/shared/button";
import { Card, CardContent, CardHeader } from "@/components/shared/card";

async function hashFile(file: File) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function UploadPanel() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(file: File | null) {
    if (!file) return;

    setIsPending(true);
    setError(null);

    try {
      const initResponse = await fetch("/api/documents/upload/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSizeBytes: file.size
        })
      });

      const initPayload = await initResponse.json();
      if (!initResponse.ok) {
        throw new Error(initPayload.error ?? "Upload init failed.");
      }

      const uploadResponse = await fetch(initPayload.uploadUrl, {
        method: initPayload.method,
        headers: {
          "Content-Type": file.type || "application/octet-stream"
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error("Uploading to storage failed.");
      }

      const sha256Hash = await hashFile(file);
      const finalizeResponse = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          documentId: initPayload.documentId,
          sha256Hash
        })
      });

      const finalizePayload = await finalizeResponse.json();
      if (!finalizeResponse.ok) {
        throw new Error(finalizePayload.error ?? "Upload finalization failed.");
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-2">
        <h2 className="text-xl font-semibold text-foreground">Upload a statement</h2>
        <p className="text-sm text-muted-foreground">
          MoneyMate signs the upload, stores the file, then queues it for parser processing.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[hsl(var(--accent)/0.34)] bg-[hsl(var(--accent)/0.04)] px-6 py-8 text-center transition hover:bg-[hsl(var(--accent)/0.06)]">
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={isPending}
            onChange={(event) => void handleSelect(event.target.files?.[0] ?? null)}
          />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
            {isPending ? "Uploading..." : "Choose document"}
          </span>
          <span className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Best results come from text-based stock activity PDFs. Scanned/image-only documents are stored, but OCR is not part of this Phase 2 MVP yet.
          </span>
        </label>
        {error ? (
          <div className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">
            {error}
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button variant="secondary" disabled>
            Signed S3 Upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

