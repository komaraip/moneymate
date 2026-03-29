"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPreference, DashboardWidgetPreference } from "@/lib/contracts";
import { Button } from "@/components/shared/button";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

const widgetLabels: Record<string, string> = {
  metrics: "Metrics cards",
  recent_documents: "Recent documents",
  review_alerts: "Review alerts",
  recent_activities: "Recent approved activity",
  recent_cash_transactions: "Recent cash transactions"
};

type DashboardWidgetsSettingsProps = {
  preference: DashboardPreference;
  widgets: DashboardWidgetPreference[];
};

export function DashboardWidgetsSettings({ preference, widgets }: DashboardWidgetsSettingsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    const payloadWidgets = widgets.map((widget) => ({
      widgetKey: widget.widgetKey,
      isVisible: formData.get(`widget:${widget.widgetKey}`) === "on"
    }));

    try {
      const [preferenceResponse, widgetsResponse] = await Promise.all([
        fetch("/api/settings/dashboard-preferences", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            defaultDateRange: formData.get("defaultDateRange")
          })
        }),
        fetch("/api/settings/dashboard-widgets", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            widgets: payloadWidgets
          })
        })
      ]);

      if (!preferenceResponse.ok || !widgetsResponse.ok) {
        let payload: { error?: string } | null = null;
        if (!preferenceResponse.ok) {
          payload = (await preferenceResponse.json().catch(() => null)) as { error?: string } | null;
        }
        if (!widgetsResponse.ok) {
          payload = (await widgetsResponse.json().catch(() => payload)) as { error?: string } | null;
        }
        setError(payload?.error ?? "Unable to save dashboard preferences.");
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save dashboard preferences.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSave}>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        Default dashboard/report date range
        <select name="defaultDateRange" defaultValue={preference.defaultDateRange} className={selectClassName}>
          <option value="DAYS_30">Last 30 days</option>
          <option value="DAYS_90">Last 90 days</option>
          <option value="MONTHS_6">Last 6 months</option>
          <option value="MONTHS_12">Last 12 months</option>
        </select>
      </label>

      <div className="space-y-2">
        {widgets.map((widget) => (
          <label key={widget.widgetKey} className="flex items-center gap-3 text-sm text-foreground">
            <input type="checkbox" name={`widget:${widget.widgetKey}`} defaultChecked={widget.isVisible} />
            {widgetLabels[widget.widgetKey] ?? widget.widgetKey}
          </label>
        ))}
      </div>

      {error ? (
        <p className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save dashboard preferences"}
        </Button>
      </div>
    </form>
  );
}
