import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { InlineAlert } from "../../components/feedback/InlineAlert";
import { LoadingState } from "../../components/feedback/LoadingState";
import { FormField as Field } from "../../components/forms/FormField";
import { SummaryMetric as Summary } from "../../components/data-display/SummaryMetric";
import { formatCurrency, formatPercent } from "../../utils/format";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import type { Budget } from "../../types/moneymate";

type BudgetForm = {
  category_id: string;
  month: string;
  amount: string;
  notes: string;
  is_active: boolean;
};

const emptyForm = (): BudgetForm => ({
  category_id: "",
  month: defaultMonth(),
  amount: "",
  notes: "",
  is_active: true,
});

export function BudgetsPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(defaultMonth());
  const [form, setForm] = useState<BudgetForm>(emptyForm);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const budgets = useQuery({ queryKey: queryKeys.budgets.month(month), queryFn: () => moneymateApi.budgets(month) });
  const categories = useQuery({ queryKey: queryKeys.transactionCategories.all, queryFn: () => moneymateApi.transactionCategories("expense") });

  const create = useMutation({
    mutationFn: () => moneymateApi.createBudget(toPayload(form)),
    onSuccess: () => {
      closeForm();
      setSuccessMessage("Anggaran berhasil ditambahkan.");
      invalidateBudgetWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Anggaran belum dipilih.");
      return moneymateApi.updateBudget(editing.id, toPayload(form));
    },
    onSuccess: () => {
      closeForm();
      setSuccessMessage("Anggaran berhasil diperbarui.");
      invalidateBudgetWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => moneymateApi.deleteBudget(id),
    onSuccess: () => {
      setDeleteTarget(null);
      setSuccessMessage("Anggaran berhasil dinonaktifkan.");
      invalidateBudgetWrites(queryClient);
    },
  });

  if (budgets.isLoading || categories.isLoading) return <LoadingState />;
  if (budgets.isError) return <ErrorState message="Anggaran belum bisa dimuat." />;

  const items = budgets.data ?? [];
  const totalBudget = items.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
  const overBudgetCount = items.filter((item) => item.over_budget).length;

  const submit = () => {
    const errors = validateBudget(form);
    setFormErrors(errors);
    if (errors.length > 0) return;
    if (editing) {
      update.mutate();
      return;
    }
    create.mutate();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <PageHeader description="Pantau batas pengeluaran bulanan per kategori" title="Anggaran" />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          onClick={() => openCreate(month, setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah Anggaran
        </button>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-success/10 px-3 py-2 text-sm text-emerald-100">{successMessage}</div>
      ) : null}

      <Card className="mb-5">
        <div className="grid gap-4 lg:grid-cols-[16rem_1fr] lg:items-end">
          <label className="text-sm text-muted">
            <span className="mb-2 block font-medium">Bulan anggaran</span>
            <input
              className={inputClass}
              onChange={(event) => setMonth(event.target.value)}
              type="month"
              value={month}
            />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            <Summary label="Total Anggaran" value={formatCurrency(totalBudget)} />
            <Summary label="Terpakai" value={formatCurrency(totalSpent)} tone={totalSpent > totalBudget && totalBudget > 0 ? "negative" : "neutral"} />
            <Summary label="Kategori Melebihi" value={`${overBudgetCount} kategori`} tone={overBudgetCount > 0 ? "negative" : "neutral"} />
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <EmptyState title="Belum ada anggaran" description="Tambahkan anggaran pengeluaran untuk bulan ini agar progress bisa dipantau." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <BudgetCard
              item={item}
              key={item.id}
              onDelete={() => setDeleteTarget(item)}
              onEdit={() => openEdit(item, setForm, setEditing, setFormOpen, setFormErrors)}
            />
          ))}
        </div>
      )}

      {formOpen ? (
        <Modal title={editing ? "Edit Anggaran" : "Tambah Anggaran"} onClose={closeForm}>
          <div className="space-y-4">
            <Field label="Kategori Pengeluaran">
              <select className={inputClass} value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}>
                <option value="">Pilih kategori</option>
                {(categories.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bulan">
              <input className={inputClass} type="month" value={form.month} onChange={(event) => setForm((current) => ({ ...current, month: event.target.value }))} />
            </Field>
            <Field label="Nominal Anggaran">
              <input className={inputClass} inputMode="decimal" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
            </Field>
            <Field label="Catatan">
              <textarea className={`${inputClass} min-h-24`} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" />
              Anggaran aktif
            </label>
          </div>
          <Feedback error={errorMessage(create.error ?? update.error)} errors={formErrors} />
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-subtle px-4 py-2 text-sm text-muted" onClick={closeForm} type="button">
              Batal
            </button>
            <button
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
              disabled={create.isPending || update.isPending}
              onClick={submit}
              type="button"
            >
              Simpan
            </button>
          </div>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal title="Hapus Anggaran" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-muted">
            Anggaran {deleteTarget.category_name} bulan {deleteTarget.month} akan dinonaktifkan. Transaksi pengeluaran tidak dihapus.
          </p>
          <Feedback error={errorMessage(remove.error)} errors={[]} />
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-subtle px-4 py-2 text-sm text-muted" onClick={() => setDeleteTarget(null)} type="button">
              Batal
            </button>
            <button
              className="rounded-lg bg-red-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60"
              disabled={remove.isPending}
              onClick={() => remove.mutate(deleteTarget.id)}
              type="button"
            >
              Hapus
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm());
    setFormErrors([]);
  }
}

function BudgetCard({ item, onDelete, onEdit }: { item: Budget; onDelete: () => void; onEdit: () => void }) {
  const width = `${Math.min(Math.max(item.percent_used, 0), 1) * 100}%`;
  const progressTone = item.over_budget ? "bg-red-400" : item.percent_used >= 0.8 ? "bg-amber-300" : "bg-emerald-400";
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{item.month}</p>
          <h3 className="mt-1 text-lg font-semibold text-main">{item.category_name}</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs ${item.over_budget ? "bg-red-500/10 text-red-200" : "bg-success/10 text-emerald-200"}`}>
          {item.over_budget ? "Melebihi" : "Terkendali"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SmallMetric label="Anggaran" value={formatCurrency(item.amount)} />
        <SmallMetric label="Terpakai" value={formatCurrency(item.spent)} />
        <SmallMetric label="Sisa" tone={item.remaining < 0 ? "negative" : "neutral"} value={formatCurrency(item.remaining)} />
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Progress</span>
          <span>{formatPercent(item.percent_used)}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-hover">
          <div className={`h-2 rounded-full ${progressTone}`} style={{ width }} />
        </div>
      </div>
      {item.notes ? <p className="mt-3 text-sm text-muted">{item.notes}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded-lg border border-subtle p-2 text-muted hover:border-emerald-500 hover:text-emerald-200" onClick={onEdit} type="button">
          <Pencil className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-subtle p-2 text-muted hover:border-red-500 hover:text-red-200" onClick={onDelete} type="button">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function SmallMetric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "negative" }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-sm font-medium ${tone === "negative" ? "text-danger" : "text-main"}`}>{value}</p>
    </div>
  );
}

function openCreate(
  month: string,
  setForm: (form: BudgetForm) => void,
  setEditing: (item: Budget | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(null);
  setForm({ ...emptyForm(), month });
  setFormErrors([]);
  setFormOpen(true);
}

function openEdit(
  item: Budget,
  setForm: (form: BudgetForm) => void,
  setEditing: (item: Budget | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(item);
  setForm({
    category_id: item.category_id,
    month: item.month,
    amount: String(item.amount ?? ""),
    notes: item.notes ?? "",
    is_active: item.is_active ?? true,
  });
  setFormErrors([]);
  setFormOpen(true);
}

function validateBudget(form: BudgetForm) {
  const errors: string[] = [];
  if (!form.category_id.trim()) errors.push("Kategori pengeluaran wajib dipilih.");
  if (!form.month.trim()) errors.push("Bulan anggaran wajib diisi.");
  if (form.amount.trim() === "" || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
    errors.push("Nominal anggaran wajib lebih dari 0.");
  }
  return errors;
}

function toPayload(form: BudgetForm) {
  return {
    category_id: form.category_id,
    month: form.month,
    amount: Number(form.amount),
    notes: form.notes.trim() || undefined,
    is_active: form.is_active,
  };
}

function invalidateBudgetWrites(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
  queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
}

function Feedback({ error, errors }: { error: string; errors: string[] }) {
  return <div className="mt-4"><InlineAlert messages={[error, ...errors]} /></div>;
}

function errorMessage(error: unknown) {
  if (!error) return "";
  if (error instanceof Error) return error.message;
  return "Request gagal diproses.";
}

function defaultMonth() {
  return new Date().toISOString().slice(0, 7);
}

const inputClass = "w-full rounded-lg border border-subtle bg-app px-3 py-2 text-sm text-main outline-none focus:border-emerald-500";
