"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrokerItem, InvestmentCategoryItem } from "@/lib/contracts";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

type BrokersSettingsProps = {
  brokers: BrokerItem[];
  categories: InvestmentCategoryItem[];
};

export function BrokersSettings({ brokers, categories }: BrokersSettingsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/settings/brokers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          brokerName: formData.get("brokerName"),
          brokerCode: formData.get("brokerCode") || null,
          investmentCategoryId: formData.get("investmentCategoryId") || null,
          branchName: formData.get("branchName") || null
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to create broker.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create broker.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/brokers/${id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to delete broker.");
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete broker.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Broker name
          <Input name="brokerName" placeholder="Mirae Asset" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Broker code
          <Input name="brokerCode" placeholder="YP" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Investment category
          <select name="investmentCategoryId" className={selectClassName} defaultValue="">
            <option value="">No linked category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Branch
          <Input name="branchName" placeholder="Jakarta" />
        </label>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add broker"}
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      {brokers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No broker profiles yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4">Broker</th>
                <th className="pb-3 pr-4">Code</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Branch</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {brokers.map((broker) => (
                <tr key={broker.id}>
                  <td className="py-3 pr-4">{broker.brokerName}</td>
                  <td className="py-3 pr-4">{broker.brokerCode ?? "-"}</td>
                  <td className="py-3 pr-4">
                    {categories.find((category) => category.id === broker.investmentCategoryId)?.name ?? "-"}
                  </td>
                  <td className="py-3 pr-4">{broker.branchName ?? "-"}</td>
                  <td className="py-3">
                    <Button type="button" variant="ghost" onClick={() => void handleDelete(broker.id)} disabled={isSaving}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

