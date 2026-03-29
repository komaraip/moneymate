"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/shared/button";

type DocumentActionsProps = {
  documentId: string;
  parseStatus: string;
};

export function DocumentActions({ documentId, parseStatus }: DocumentActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null);

  async function runAction(action: "approve" | "reject" | "reprocess") {
    setIsPending(action);
    try {
      const response = await fetch(`/api/documents/${documentId}/${action}`, {
        method: "POST"
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Action failed.");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setIsPending(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => void runAction("reprocess")}
        variant="secondary"
        disabled={isPending !== null}
      >
        {isPending === "reprocess" ? "Reprocessing..." : "Reprocess"}
      </Button>
      <Button
        onClick={() => void runAction("reject")}
        variant="danger"
        disabled={isPending !== null || parseStatus === "REJECTED"}
      >
        {isPending === "reject" ? "Rejecting..." : "Reject"}
      </Button>
      <Button
        onClick={() => void runAction("approve")}
        disabled={isPending !== null || parseStatus === "APPROVED"}
      >
        {isPending === "approve" ? "Approving..." : "Approve"}
      </Button>
    </div>
  );
}

