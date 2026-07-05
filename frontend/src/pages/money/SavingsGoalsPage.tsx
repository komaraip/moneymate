import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { InlineAlert } from "../../components/feedback/InlineAlert";
import { LoadingState } from "../../components/feedback/LoadingState";
import { FormField as Field } from "../../components/forms/FormField";
import { SummaryMetric as Summary } from "../../components/data-display/SummaryMetric";
import { formatCurrency, formatDate, formatPercent } from "../../utils/format";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import type { SavingsGoal } from "../../types/moneymate";
import { motion } from "framer-motion";

type GoalForm = {
  name: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
  notes: string;
  is_active: boolean;
};

const emptyForm = (): GoalForm => ({
  name: "",
  target_amount: "",
  current_amount: "0",
  target_date: "",
  notes: "",
  is_active: true,
});

export function SavingsGoalsPage() {
  const queryClient = useQueryClient();
  const goals = useQuery({ queryKey: queryKeys.savingsGoals.all, queryFn: moneymateApi.savingsGoals });
  const [form, setForm] = useState<GoalForm>(emptyForm);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const create = useMutation({
    mutationFn: () => moneymateApi.createSavingsGoal(toPayload(form)),
    onSuccess: () => {
      closeForm();
      setSuccessMessage("Tujuan tabungan berhasil ditambahkan.");
      invalidateSavingsWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Tujuan tabungan belum dipilih.");
      return moneymateApi.updateSavingsGoal(editing.id, toPayload(form));
    },
    onSuccess: () => {
      closeForm();
      setSuccessMessage("Tujuan tabungan berhasil diperbarui.");
      invalidateSavingsWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => moneymateApi.deleteSavingsGoal(id),
    onSuccess: () => {
      setDeleteTarget(null);
      setSuccessMessage("Tujuan tabungan berhasil dinonaktifkan.");
      invalidateSavingsWrites(queryClient);
    },
  });

  if (goals.isLoading) return <LoadingState />;
  if (goals.isError) return <ErrorState message="Tujuan tabungan belum bisa dimuat." />;

  const items = goals.data ?? [];
  const totalTarget = items.reduce((sum, item) => sum + item.target_amount, 0);
  const totalSaved = items.reduce((sum, item) => sum + item.current_amount, 0);
  const completedCount = items.filter((item) => item.is_completed).length;

  const submit = () => {
    const errors = validateGoal(form);
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
        <PageHeader description="Rencanakan dana darurat, liburan, dan tujuan tabungan pribadi" title="Tujuan Tabungan" />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover"
          onClick={() => openCreate(setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah Tujuan
        </button>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-fin-gain/30 bg-fin-gain/5 px-4 py-2.5 text-xs font-semibold text-fin-gain font-sans">{successMessage}</div>
      ) : null}

      <Card className="mb-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Summary label="Target Total" value={formatCurrency(totalTarget)} />
          <Summary label="Terkumpul" value={formatCurrency(totalSaved)} />
          <Summary label="Selesai" value={`${completedCount} tujuan`} />
        </div>
      </Card>

      {items.length === 0 ? (
        <EmptyState title="Belum ada tujuan tabungan" description="Tambahkan tujuan tabungan pribadi untuk memantau progress." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item, index) => (
            <GoalCard
              item={item}
              key={item.id}
              onDelete={() => setDeleteTarget(item)}
              onEdit={() => openEdit(item, setForm, setEditing, setFormOpen, setFormErrors)}
            />
          ))}
        </div>
      )}

      {formOpen ? (
        <Modal title={editing ? "Edit Tujuan Tabungan" : "Tambah Tujuan Tabungan"} onClose={closeForm}>
          <div className="space-y-4">
            <Field label="Nama Tujuan">
              <input className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target Nominal">
                <input className={inputClass} inputMode="decimal" value={form.target_amount} onChange={(event) => setForm((current) => ({ ...current, target_amount: event.target.value }))} />
              </Field>
              <Field label="Progress Saat Ini">
                <input className={inputClass} inputMode="decimal" value={form.current_amount} onChange={(event) => setForm((current) => ({ ...current, current_amount: event.target.value }))} />
              </Field>
            </div>
            <Field label="Deadline">
              <input className={inputClass} type="date" value={form.target_date} onChange={(event) => setForm((current) => ({ ...current, target_date: event.target.value }))} />
            </Field>
            <Field label="Notes">
              <textarea className={`${inputClass} min-h-24`} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" />
              Tujuan aktif
            </label>
          </div>
          <Feedback error={errorMessage(create.error ?? update.error)} errors={formErrors} />
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-subtle px-4 py-2 text-sm text-muted" onClick={closeForm} type="button">
              Batal
            </button>
            <button
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover disabled:opacity-60"
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
        <Modal title="Hapus Tujuan Tabungan" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-muted">Tujuan {deleteTarget.name} akan dinonaktifkan. Catatan historis tetap tersimpan di database lokal.</p>
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

function GoalCard({ item, onDelete, onEdit }: { item: SavingsGoal; onDelete: () => void; onEdit: () => void }) {
  const width = `${Math.min(Math.max(item.progress_percent, 0), 1) * 100}%`;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Tujuan pribadi</p>
          <h3 className="mt-1 text-lg font-semibold text-main">{item.name}</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs ${item.is_completed ? "bg-success/10 text-emerald-200" : "bg-surface-hover text-muted"}`}>
          {item.is_completed ? "Tercapai" : "Berjalan"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SmallMetric label="Target" value={formatCurrency(item.target_amount)} />
        <SmallMetric label="Terkumpul" value={formatCurrency(item.current_amount)} />
        <SmallMetric label="Sisa" value={formatCurrency(item.remaining_amount)} />
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Progress</span>
          <span>{formatPercent(item.progress_percent)}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-hover">
          <div className={`h-2 rounded-full ${item.is_completed ? "bg-emerald-400" : "bg-sky-300"}`} style={{ width }} />
        </div>
      </div>
      {item.target_date ? (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
          <CalendarDays className="h-4 w-4" />
          Deadline {formatDate(item.target_date)}
        </p>
      ) : null}
      {item.notes ? <p className="mt-3 text-sm text-muted">{item.notes}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded-xl p-2 text-muted hover:bg-primary/10 hover:text-primary transition-colors" onClick={onEdit} type="button">
          <Pencil className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-subtle p-2 text-muted hover:border-red-500 hover:text-red-200" onClick={onDelete} type="button">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-main">{value}</p>
    </div>
  );
}

function openCreate(
  setForm: (form: GoalForm) => void,
  setEditing: (item: SavingsGoal | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(null);
  setForm(emptyForm());
  setFormErrors([]);
  setFormOpen(true);
}

function openEdit(
  item: SavingsGoal,
  setForm: (form: GoalForm) => void,
  setEditing: (item: SavingsGoal | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(item);
  setForm({
    name: item.name,
    target_amount: String(item.target_amount ?? ""),
    current_amount: String(item.current_amount ?? "0"),
    target_date: item.target_date ?? "",
    notes: item.notes ?? "",
    is_active: item.is_active ?? true,
  });
  setFormErrors([]);
  setFormOpen(true);
}

function validateGoal(form: GoalForm) {
  const errors: string[] = [];
  if (!form.name.trim()) errors.push("Nama tujuan tabungan wajib diisi.");
  if (form.target_amount.trim() === "" || !Number.isFinite(Number(form.target_amount)) || Number(form.target_amount) <= 0) {
    errors.push("Target tabungan wajib lebih dari 0.");
  }
  if (form.current_amount.trim() === "" || !Number.isFinite(Number(form.current_amount)) || Number(form.current_amount) < 0) {
    errors.push("Progress tabungan tidak boleh negatif.");
  }
  return errors;
}

function toPayload(form: GoalForm) {
  return {
    name: form.name.trim(),
    target_amount: Number(form.target_amount),
    current_amount: Number(form.current_amount),
    target_date: form.target_date || undefined,
    notes: form.notes.trim() || undefined,
    is_active: form.is_active,
  };
}

function invalidateSavingsWrites(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
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

const inputClass = "input-field font-sans";
