"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountSummary } from "@/lib/contracts";
import { getManualTransactionTypeLabel, manualTransactionTypes } from "@/lib/finance";
import { getTodayInputValue } from "@/lib/utils/date-input";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";
const textareaClassName =
  "min-h-24 w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

type ManualTransactionFormProps = {
  accounts: Pick<AccountSummary, "id" | "name" | "currency" | "accountType">[];
  defaultAccountId?: string;
};

export function ManualTransactionForm({ accounts, defaultAccountId }: ManualTransactionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const fallbackAccountId = useMemo(
    () => defaultAccountId ?? accounts[0]?.id ?? "",
    [accounts, defaultAccountId]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (accounts.length === 0) {
      setError("Create an account first before adding a transaction.");
      return;
    }

    setIsPending(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const accountId = `${formData.get("accountId") ?? fallbackAccountId}`;
    const selectedAccount = accounts.find((account) => account.id === accountId);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accountId,
          transactionType: formData.get("transactionType"),
          transactionDate: formData.get("transactionDate"),
          postingDate: formData.get("postingDate") || null,
          amount: formData.get("amount"),
          currency: selectedAccount?.currency ?? "IDR",
          description: formData.get("description"),
          categoryName: formData.get("categoryName") || null,
          merchantName: formData.get("merchantName") || null,
          counterpartyName: formData.get("counterpartyName") || null,
          notes: formData.get("notes") || null
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to save the transaction.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save the transaction.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Account
        <select
          name="accountId"
          defaultValue={fallbackAccountId}
          className={selectClassName}
          disabled={accounts.length === 0}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Transaction type
        <select name="transactionType" defaultValue="expense" className={selectClassName}>
          {manualTransactionTypes.map((type) => (
            <option key={type} value={type}>
              {getManualTransactionTypeLabel(type)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Transaction date
        <Input name="transactionDate" type="date" required defaultValue={getTodayInputValue()} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Posting date
        <Input name="postingDate" type="date" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Amount
        <Input name="amount" required inputMode="decimal" placeholder="150000" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Category
        <Input name="categoryName" placeholder="Groceries" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
        Description
        <Input name="description" required placeholder="Weekly grocery restock" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Merchant
        <Input name="merchantName" placeholder="Papaya Fresh Gallery" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Counterparty
        <Input name="counterpartyName" placeholder="Optional" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
        Notes
        <textarea name="notes" className={textareaClassName} placeholder="Optional context for future you." />
      </label>
      {error ? (
        <div className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))] md:col-span-2">
          {error}
        </div>
      ) : null}
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending || accounts.length === 0}>
          {isPending ? "Saving..." : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
