"use client";

import { FormEvent, Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { TransferRuleItem } from "@/lib/contracts";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

type TransferRulesSettingsProps = {
  rules: TransferRuleItem[];
};

export function TransferRulesSettings({ rules }: TransferRulesSettingsProps) {
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
      const response = await fetch("/api/settings/transfer-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pattern: formData.get("pattern"),
          matchMode: formData.get("matchMode"),
          accountPattern: formData.get("accountPattern") || null,
          accountMatchMode: formData.get("accountMatchMode"),
          counterpartyPattern: formData.get("counterpartyPattern") || null,
          counterpartyMatchMode: formData.get("counterpartyMatchMode"),
          excludeAsInternalTransfer: formData.get("excludeAsInternalTransfer") === "on",
          priority: Number(formData.get("priority") || 100),
          isActive: formData.get("isActive") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to create transfer rule.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create transfer rule.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(rule: TransferRuleItem) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/transfer-rules/${rule.id}`, {
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
        setError(payload?.error ?? "Unable to update transfer rule.");
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update transfer rule.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/transfer-rules/${id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to delete transfer rule.");
        return;
      }

      setEditingId((current) => (current === id ? null : current));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete transfer rule.");
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
      const response = await fetch(`/api/settings/transfer-rules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pattern: formData.get("pattern"),
          matchMode: formData.get("matchMode"),
          accountPattern: formData.get("accountPattern") || null,
          accountMatchMode: formData.get("accountMatchMode"),
          counterpartyPattern: formData.get("counterpartyPattern") || null,
          counterpartyMatchMode: formData.get("counterpartyMatchMode"),
          excludeAsInternalTransfer: formData.get("excludeAsInternalTransfer") === "on",
          priority: Number(formData.get("priority") || 100),
          isActive: formData.get("isActive") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to update transfer rule.");
        return;
      }

      setEditingId(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update transfer rule.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
        <label className="md:col-span-2 grid gap-2 text-sm font-medium text-foreground">
          Pattern
          <Input name="pattern" placeholder="transfer to rdn" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Pattern mode
          <select name="matchMode" defaultValue="CONTAINS" className={selectClassName}>
            <option value="CONTAINS">Contains</option>
            <option value="EXACT">Exact</option>
            <option value="REGEX">Regex</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Priority
          <Input name="priority" type="number" defaultValue="100" min={0} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Account pattern
          <Input name="accountPattern" placeholder="BCA RDN" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Account pattern mode
          <select name="accountMatchMode" defaultValue="CONTAINS" className={selectClassName}>
            <option value="CONTAINS">Contains</option>
            <option value="EXACT">Exact</option>
            <option value="REGEX">Regex</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Counterparty pattern
          <Input name="counterpartyPattern" placeholder="Mirae Asset" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Counterparty mode
          <select name="counterpartyMatchMode" defaultValue="CONTAINS" className={selectClassName}>
            <option value="CONTAINS">Contains</option>
            <option value="EXACT">Exact</option>
            <option value="REGEX">Regex</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input type="checkbox" name="excludeAsInternalTransfer" defaultChecked />
          Exclude as internal transfer
        </label>
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input type="checkbox" name="isActive" defaultChecked />
          Active
        </label>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add transfer rule"}
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transfer rules yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4">Pattern</th>
                <th className="pb-3 pr-4">Context</th>
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
                      {rule.accountPattern ? `Account: ${rule.accountPattern}. ` : ""}
                      {rule.counterpartyPattern ? `Counterparty: ${rule.counterpartyPattern}.` : "Any account context."}
                    </td>
                    <td className="py-3 pr-4">{rule.priority}</td>
                    <td className="py-3 pr-4">
                      {rule.isActive ? "Active" : "Disabled"}
                      {rule.excludeAsInternalTransfer ? " / Exclude transfer" : ""}
                    </td>
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
                          <label className="md:col-span-2 grid gap-2 text-sm font-medium text-foreground">
                            Pattern
                            <Input name="pattern" defaultValue={rule.pattern} required />
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Pattern mode
                            <select name="matchMode" defaultValue={rule.matchMode} className={selectClassName}>
                              <option value="CONTAINS">Contains</option>
                              <option value="EXACT">Exact</option>
                              <option value="REGEX">Regex</option>
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Priority
                            <Input name="priority" type="number" defaultValue={`${rule.priority}`} min={0} />
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Account pattern
                            <Input name="accountPattern" defaultValue={rule.accountPattern ?? ""} />
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Account mode
                            <select name="accountMatchMode" defaultValue={rule.accountMatchMode} className={selectClassName}>
                              <option value="CONTAINS">Contains</option>
                              <option value="EXACT">Exact</option>
                              <option value="REGEX">Regex</option>
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Counterparty pattern
                            <Input name="counterpartyPattern" defaultValue={rule.counterpartyPattern ?? ""} />
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Counterparty mode
                            <select
                              name="counterpartyMatchMode"
                              defaultValue={rule.counterpartyMatchMode}
                              className={selectClassName}
                            >
                              <option value="CONTAINS">Contains</option>
                              <option value="EXACT">Exact</option>
                              <option value="REGEX">Regex</option>
                            </select>
                          </label>
                          <label className="flex items-center gap-3 text-sm text-foreground">
                            <input
                              type="checkbox"
                              name="excludeAsInternalTransfer"
                              defaultChecked={rule.excludeAsInternalTransfer}
                            />
                            Exclude as internal transfer
                          </label>
                          <label className="flex items-center gap-3 text-sm text-foreground">
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
