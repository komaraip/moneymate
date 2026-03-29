"use client";

import { FormEvent, Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { ClassificationRuleItem } from "@/lib/contracts";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

type ClassificationRulesSettingsProps = {
  rules: ClassificationRuleItem[];
};

function getActionLabel(actionType: string) {
  if (actionType === "INCLUDE_IN_GENERAL_CASHFLOW") return "Include in General Cashflow";
  if (actionType === "EXCLUDE_FROM_GENERAL_CASHFLOW") return "Exclude from General Cashflow";
  if (actionType === "FORCE_TRANSACTION_TYPE") return "Force Transaction Type";
  return "Force Category Name";
}

export function ClassificationRulesSettings({ rules }: ClassificationRulesSettingsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/settings/classification-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scope: formData.get("scope"),
          pattern: formData.get("pattern"),
          matchMode: formData.get("matchMode"),
          actionType: formData.get("actionType"),
          actionValue: formData.get("actionValue") || null,
          priority: Number(formData.get("priority") || 100),
          isActive: formData.get("isActive") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to create rule.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create rule.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(rule: ClassificationRuleItem) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/classification-rules/${rule.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isActive: !rule.isActive
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to update rule.");
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update rule.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/classification-rules/${id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to delete rule.");
        return;
      }

      setEditingId((current) => (current === id ? null : current));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete rule.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/settings/classification-rules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scope: formData.get("scope"),
          pattern: formData.get("pattern"),
          matchMode: formData.get("matchMode"),
          actionType: formData.get("actionType"),
          actionValue: formData.get("actionValue") || null,
          priority: Number(formData.get("priority") || 100),
          isActive: formData.get("isActive") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to update rule.");
        return;
      }

      setEditingId(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update rule.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Scope
          <select name="scope" defaultValue="CASHFLOW" className={selectClassName}>
            <option value="CASHFLOW">Cashflow</option>
            <option value="INGESTION">Ingestion</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Match mode
          <select name="matchMode" defaultValue="CONTAINS" className={selectClassName}>
            <option value="CONTAINS">Contains</option>
            <option value="EXACT">Exact</option>
            <option value="REGEX">Regex</option>
          </select>
        </label>
        <label className="md:col-span-2 grid gap-2 text-sm font-medium text-foreground">
          Pattern
          <Input name="pattern" placeholder="dividend" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Action
          <select name="actionType" defaultValue="INCLUDE_IN_GENERAL_CASHFLOW" className={selectClassName}>
            <option value="INCLUDE_IN_GENERAL_CASHFLOW">Include in general cashflow</option>
            <option value="EXCLUDE_FROM_GENERAL_CASHFLOW">Exclude from general cashflow</option>
            <option value="FORCE_TRANSACTION_TYPE">Force transaction type</option>
            <option value="FORCE_CATEGORY_NAME">Force category name</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Action value
          <Input name="actionValue" placeholder="income or Dividend Income" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Priority
          <Input name="priority" type="number" defaultValue="100" min={0} />
        </label>
        <label className="flex items-center gap-3 text-sm text-foreground md:self-end">
          <input type="checkbox" name="isActive" defaultChecked />
          Active
        </label>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add rule"}
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No classification rules yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4">Pattern</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Priority</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rules.map((rule) => (
                <Fragment key={rule.id}>
                  <tr>
                    <td className="py-3 pr-4">{rule.pattern}</td>
                    <td className="py-3 pr-4">
                      {getActionLabel(rule.actionType)}
                      {rule.actionValue ? `: ${rule.actionValue}` : ""}
                    </td>
                    <td className="py-3 pr-4">{rule.priority}</td>
                    <td className="py-3 pr-4">{rule.isActive ? "Active" : "Disabled"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="ghost" onClick={() => setEditingId(rule.id)} disabled={isSaving}>
                          Edit
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => void handleToggle(rule)} disabled={isSaving}>
                          {rule.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => void handleDelete(rule.id)} disabled={isSaving}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editingId === rule.id ? (
                    <tr>
                      <td colSpan={5} className="py-3">
                        <form className="grid gap-3 md:grid-cols-2 rounded-2xl border border-border/60 p-4" onSubmit={(event) => void handleEditSubmit(event, rule.id)}>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Scope
                            <select name="scope" defaultValue={rule.scope} className={selectClassName}>
                              <option value="CASHFLOW">Cashflow</option>
                              <option value="INGESTION">Ingestion</option>
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Match mode
                            <select name="matchMode" defaultValue={rule.matchMode} className={selectClassName}>
                              <option value="CONTAINS">Contains</option>
                              <option value="EXACT">Exact</option>
                              <option value="REGEX">Regex</option>
                            </select>
                          </label>
                          <label className="md:col-span-2 grid gap-2 text-sm font-medium text-foreground">
                            Pattern
                            <Input name="pattern" defaultValue={rule.pattern} required />
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Action
                            <select name="actionType" defaultValue={rule.actionType} className={selectClassName}>
                              <option value="INCLUDE_IN_GENERAL_CASHFLOW">Include in general cashflow</option>
                              <option value="EXCLUDE_FROM_GENERAL_CASHFLOW">Exclude from general cashflow</option>
                              <option value="FORCE_TRANSACTION_TYPE">Force transaction type</option>
                              <option value="FORCE_CATEGORY_NAME">Force category name</option>
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Action value
                            <Input name="actionValue" defaultValue={rule.actionValue ?? ""} />
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Priority
                            <Input name="priority" type="number" defaultValue={`${rule.priority}`} min={0} />
                          </label>
                          <label className="flex items-center gap-3 text-sm text-foreground md:self-end">
                            <input type="checkbox" name="isActive" defaultChecked={rule.isActive} />
                            Active
                          </label>
                          <div className="md:col-span-2 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setEditingId(null)} disabled={isSaving}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                              {isSaving ? "Saving..." : "Save changes"}
                            </Button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
