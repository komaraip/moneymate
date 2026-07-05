import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { EmptyState } from "../../../components/feedback/EmptyState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency, formatDate, formatPercent } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import type { SavingsGoal } from "../types";

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
  const goals = useQuery({ queryKey: queryKeys.savingsGoals.all, queryFn: mvpApi.savingsGoals });
  const [form, setForm] = useState<GoalForm>(emptyForm);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const create = useMutation({
    mutationFn: () => mvpApi.createSavingsGoal(toPayload(form)),
    onSuccess: () => {
      closeForm();
      setSuccessMessage("Tujuan tabungan berhasil ditambahkan.");
      invalidateSavingsWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Tujuan tabungan belum dipilih.");
      return mvpApi.updateSavingsGoal(editing.id, toPayload(form));
    },
    onSuccess: () => {
      closeForm();
      setSuccessMessage("Tujuan tabungan berhasil diperbarui.");
      invalidateSavingsWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => mvpApi.deleteSavingsGoal(id),
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          onClick={() => openCreate(setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah Tujuan
        </button>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">{successMessage}</div>
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
          {items.map((item) => (
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
            <Field label="Catatan">
              <textarea className={`${inputClass} min-h-24`} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" />
              Tujuan aktif
            </label>
          </div>
          <Feedback error={errorMessage(create.error ?? update.error)} errors={formErrors} />
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300" onClick={closeForm} type="button">
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
        <Modal title="Hapus Tujuan Tabungan" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-zinc-300">Tujuan {deleteTarget.name} akan dinonaktifkan. Catatan historis tetap tersimpan di database lokal.</p>
          <Feedback error={errorMessage(remove.error)} errors={[]} />
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300" onClick={() => setDeleteTarget(null)} type="button">
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
          <p className="text-sm text-zinc-400">Tujuan pribadi</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{item.name}</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs ${item.is_completed ? "bg-emerald-500/10 text-emerald-200" : "bg-zinc-800 text-zinc-300"}`}>
          {item.is_completed ? "Tercapai" : "Berjalan"}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SmallMetric label="Target" value={formatCurrency(item.target_amount)} />
        <SmallMetric label="Terkumpul" value={formatCurrency(item.current_amount)} />
        <SmallMetric label="Sisa" value={formatCurrency(item.remaining_amount)} />
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-zinc-400">
          <span>Progress</span>
          <span>{formatPercent(item.progress_percent)}</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800">
          <div className={`h-2 rounded-full ${item.is_completed ? "bg-emerald-400" : "bg-sky-300"}`} style={{ width }} />
        </div>
      </div>
      {item.target_date ? (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4" />
          Deadline {formatDate(item.target_date)}
        </p>
      ) : null}
      {item.notes ? <p className="mt-3 text-sm text-zinc-500">{item.notes}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-emerald-500 hover:text-emerald-200" onClick={onEdit} type="button">
          <Pencil className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-red-500 hover:text-red-200" onClick={onDelete} type="button">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">{value}</p>
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

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <section className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button className="rounded-lg border border-zinc-800 p-2 text-zinc-300" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}

function Feedback({ error, errors }: { error: string; errors: string[] }) {
  if (!error && errors.length === 0) return null;
  return (
    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
      {error ? <p>{error}</p> : null}
      {errors.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

function errorMessage(error: unknown) {
  if (!error) return "";
  if (error instanceof Error) return error.message;
  return "Request gagal diproses.";
}

const inputClass = "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500";
