"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { InvestmentCategoryItem } from "@/lib/contracts";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

type InvestmentCategoriesSettingsProps = {
  categories: InvestmentCategoryItem[];
};

export function InvestmentCategoriesSettings({ categories }: InvestmentCategoriesSettingsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = `${formData.get("name") ?? ""}`.trim();
    const slug = `${formData.get("slug") ?? ""}`.trim();

    try {
      const response = await fetch("/api/settings/investment-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          slug,
          includeInNetWorth: true,
          includeInDashboard: true,
          includeInReports: true
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to create category.");
        return;
      }

      form.reset();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/settings/investment-categories/${id}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to delete category.");
        return;
      }

      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete category.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleCreate}>
        <Input name="name" placeholder="Stocks" required />
        <Input name="slug" placeholder="stocks" required />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Add category"}
        </Button>
      </form>

      {error ? (
        <p className="rounded-2xl bg-[hsl(var(--danger)/0.08)] px-4 py-3 text-sm text-[hsl(var(--danger))]">{error}</p>
      ) : null}

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No custom investment categories yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Slug</th>
                <th className="pb-3 pr-4">Net Worth</th>
                <th className="pb-3 pr-4">Reports</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="py-3 pr-4">{category.name}</td>
                  <td className="py-3 pr-4">{category.slug}</td>
                  <td className="py-3 pr-4">{category.includeInNetWorth ? "Included" : "Excluded"}</td>
                  <td className="py-3 pr-4">{category.includeInReports ? "Included" : "Excluded"}</td>
                  <td className="py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void handleDelete(category.id)}
                      disabled={isSaving || category.isSystemDefault}
                    >
                      {category.isSystemDefault ? "System default" : "Delete"}
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
