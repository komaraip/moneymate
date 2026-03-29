"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportPreference } from "@/lib/contracts";
import { Button } from "@/components/shared/button";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

type CashflowPreferencesSettingsProps = {
  preference: ReportPreference;
};

export function CashflowPreferencesSettings({ preference }: CashflowPreferencesSettingsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/settings/report-preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          defaultCashflowMode: formData.get("defaultCashflowMode"),
          includeDividendsInIncome: formData.get("includeDividendsInIncome") === "on",
          includeStockSaleProceedsInIncome: formData.get("includeStockSaleProceedsInIncome") === "on",
          includeBrokerFeesInExpenses: formData.get("includeBrokerFeesInExpenses") === "on",
          includeInvestmentCashInTotalCash: formData.get("includeInvestmentCashInTotalCash") === "on",
          includeRealizedPlInIncome: formData.get("includeRealizedPlInIncome") === "on",
          includeUnrealizedPlInDashboard: formData.get("includeUnrealizedPlInDashboard") === "on"
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to update preferences.");
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update preferences.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSave}>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Default cashflow mode
        <select name="defaultCashflowMode" defaultValue={preference.defaultCashflowMode} className={selectClassName}>
          <option value="SEPARATE">Separate cashflow</option>
          <option value="COMBINED">Combined cashflow</option>
        </select>
      </label>

      <label className="flex items-center gap-3 text-sm text-foreground">
        <input type="checkbox" name="includeDividendsInIncome" defaultChecked={preference.includeDividendsInIncome} />
        Include dividends in general income
      </label>
      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          name="includeStockSaleProceedsInIncome"
          defaultChecked={preference.includeStockSaleProceedsInIncome}
        />
        Include stock sale proceeds in general income
      </label>
      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          name="includeBrokerFeesInExpenses"
          defaultChecked={preference.includeBrokerFeesInExpenses}
        />
        Include broker fees in general expenses
      </label>
      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          name="includeInvestmentCashInTotalCash"
          defaultChecked={preference.includeInvestmentCashInTotalCash}
        />
        Include investment cash in combined cash totals
      </label>
      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          name="includeRealizedPlInIncome"
          defaultChecked={preference.includeRealizedPlInIncome}
        />
        Include realized P/L in general income
      </label>
      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          name="includeUnrealizedPlInDashboard"
          defaultChecked={preference.includeUnrealizedPlInDashboard}
        />
        Include unrealized P/L in dashboard metrics
      </label>

      {error ? (
        <p className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}
