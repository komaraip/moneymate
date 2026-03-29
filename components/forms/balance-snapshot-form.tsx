"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getTodayInputValue } from "@/lib/utils/date-input";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

type BalanceSnapshotFormProps = {
  accountId: string;
};

export function BalanceSnapshotForm({ accountId }: BalanceSnapshotFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/accounts/${accountId}/snapshots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          snapshotDate: formData.get("snapshotDate"),
          balance: formData.get("balance"),
          availableBalance: formData.get("availableBalance") || null
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to save the balance snapshot.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the balance snapshot.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Snapshot date
        <Input name="snapshotDate" type="date" required defaultValue={getTodayInputValue()} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Balance
        <Input name="balance" required inputMode="decimal" placeholder="5000000" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
        Available balance
        <Input name="availableBalance" inputMode="decimal" placeholder="Optional" autoComplete="off" />
      </label>
      {error ? (
        <div className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))] md:col-span-2">
          {error}
        </div>
      ) : null}
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Add snapshot"}
        </Button>
      </div>
    </form>
  );
}
