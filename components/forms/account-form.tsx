"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { cashAccountTypes, getAccountTypeLabel } from "@/lib/finance";
import { getTodayInputValue } from "@/lib/utils/date-input";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

export function AccountForm() {
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
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.get("name"),
          institutionName: formData.get("institutionName") || null,
          accountType: formData.get("accountType"),
          currency: formData.get("currency"),
          accountNumber: formData.get("accountNumber"),
          openingBalance: formData.get("openingBalance") || null,
          openingBalanceDate: formData.get("openingBalanceDate") || null
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to save the account right now.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the account right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Account name
        <Input name="name" required placeholder="BCA Everyday Cash" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Institution
        <Input name="institutionName" placeholder="Bank Central Asia" autoComplete="organization" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Account type
        <select name="accountType" defaultValue="BANK_ACCOUNT" className={selectClassName}>
          {cashAccountTypes.map((type) => (
            <option key={type} value={type}>
              {getAccountTypeLabel(type)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Currency
        <Input name="currency" defaultValue="IDR" maxLength={3} required autoCapitalize="characters" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Account number / reference
        <Input name="accountNumber" required placeholder="1234567890" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Opening balance
        <Input name="openingBalance" inputMode="decimal" placeholder="Optional" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
        Opening balance date
        <Input name="openingBalanceDate" type="date" defaultValue={getTodayInputValue()} />
      </label>
      {error ? (
        <div className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))] md:col-span-2">
          {error}
        </div>
      ) : null}
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Add account"}
        </Button>
      </div>
    </form>
  );
}
