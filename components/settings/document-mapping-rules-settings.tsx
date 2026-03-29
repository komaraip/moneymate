"use client";

import { FormEvent, Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { BrokerItem, DocumentMappingRuleItem, InvestmentCategoryItem } from "@/lib/contracts";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

const selectClassName =
  "w-full rounded-2xl border border-border/80 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10";

type InvestmentAccountOption = {
  id: string;
  label: string;
};

type DocumentMappingRulesSettingsProps = {
  rules: DocumentMappingRuleItem[];
  brokers: BrokerItem[];
  categories: InvestmentCategoryItem[];
  investmentAccounts: InvestmentAccountOption[];
};

export function DocumentMappingRulesSettings({
  rules,
  brokers,
  categories,
  investmentAccounts
}: DocumentMappingRulesSettingsProps) {
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
      const response = await fetch("/api/settings/document-mapping-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pattern: formData.get("pattern"),
          matchMode: formData.get("matchMode"),
          brokerId: formData.get("brokerId") || null,
          investmentAccountId: formData.get("investmentAccountId") || null,
          categoryId: formData.get("categoryId") || null,
          priority: Number(formData.get("priority") || 100),
          isActive: formData.get("isActive") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to create mapping rule.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create mapping rule.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(rule: DocumentMappingRuleItem) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/document-mapping-rules/${rule.id}`, {
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
        setError(payload?.error ?? "Unable to update mapping rule.");
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update mapping rule.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/document-mapping-rules/${id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to delete mapping rule.");
        return;
      }

      setEditingId((current) => (current === id ? null : current));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete mapping rule.");
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
      const response = await fetch(`/api/settings/document-mapping-rules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pattern: formData.get("pattern"),
          matchMode: formData.get("matchMode"),
          brokerId: formData.get("brokerId") || null,
          investmentAccountId: formData.get("investmentAccountId") || null,
          categoryId: formData.get("categoryId") || null,
          priority: Number(formData.get("priority") || 100),
          isActive: formData.get("isActive") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to update mapping rule.");
        return;
      }

      setEditingId(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update mapping rule.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
        <label className="md:col-span-2 grid gap-2 text-sm font-medium text-foreground">
          Pattern
          <Input name="pattern" placeholder="mirae asset" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Match mode
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
          Broker
          <select name="brokerId" defaultValue="" className={selectClassName}>
            <option value="">No broker override</option>
            {brokers.map((broker) => (
              <option key={broker.id} value={broker.id}>
                {broker.brokerName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Investment account
          <select name="investmentAccountId" defaultValue="" className={selectClassName}>
            <option value="">No account override</option>
            {investmentAccounts.map((investmentAccount) => (
              <option key={investmentAccount.id} value={investmentAccount.id}>
                {investmentAccount.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Category
          <select name="categoryId" defaultValue="" className={selectClassName}>
            <option value="">No category override</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input type="checkbox" name="isActive" defaultChecked />
          Active
        </label>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add mapping rule"}
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      {rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No document mapping rules yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4">Pattern</th>
                <th className="pb-3 pr-4">Mappings</th>
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
                      Broker: {rule.brokerName ?? "-"}, Account: {rule.investmentAccountName ?? "-"}, Category:{" "}
                      {rule.categoryName ?? "-"}
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
                          <label className="md:col-span-2 grid gap-2 text-sm font-medium text-foreground">
                            Pattern
                            <Input name="pattern" defaultValue={rule.pattern} required />
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Match mode
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
                            Broker
                            <select name="brokerId" defaultValue={rule.brokerId ?? ""} className={selectClassName}>
                              <option value="">No broker override</option>
                              {brokers.map((broker) => (
                                <option key={broker.id} value={broker.id}>
                                  {broker.brokerName}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Investment account
                            <select
                              name="investmentAccountId"
                              defaultValue={rule.investmentAccountId ?? ""}
                              className={selectClassName}
                            >
                              <option value="">No account override</option>
                              {investmentAccounts.map((investmentAccount) => (
                                <option key={investmentAccount.id} value={investmentAccount.id}>
                                  {investmentAccount.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-2 text-sm font-medium text-foreground">
                            Category
                            <select name="categoryId" defaultValue={rule.categoryId ?? ""} className={selectClassName}>
                              <option value="">No category override</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
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
