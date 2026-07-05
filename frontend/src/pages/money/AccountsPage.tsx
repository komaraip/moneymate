import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Pencil, Plus, Trash2, WalletCards } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { formatCurrency, formatDate } from "../../utils/format";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import type { CashAccount, CashAdjustment } from "../../types/moneymate";
import { motion } from "framer-motion";

type CashForm = {
  account_name: string;
  account_type: string;
  currency: string;
  balance: string;
  notes: string;
  is_active: boolean;
};

const emptyForm = (): CashForm => ({
  account_name: "",
  account_type: "bank",
  currency: "IDR",
  balance: "",
  notes: "",
  is_active: true,
});

type AdjustmentForm = {
  adjustment_date: string;
  type: string;
  amount: string;
  note: string;
};

const emptyAdjustmentForm = (): AdjustmentForm => ({
  adjustment_date: new Date().toISOString().slice(0, 10),
  type: "deposit",
  amount: "",
  note: "",
});

export function AccountsPage() {
  const queryClient = useQueryClient();
  const cash = useQuery({ queryKey: queryKeys.cashAccounts.all, queryFn: moneymateApi.cashAccounts });
  const [adjustmentForm, setAdjustmentForm] = useState<AdjustmentForm>(emptyAdjustmentForm);
  const [form, setForm] = useState<CashForm>(emptyForm);
  const [editing, setEditing] = useState<CashAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CashAccount | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<CashAccount | null>(null);
  const [historyTarget, setHistoryTarget] = useState<CashAccount | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [adjustmentErrors, setAdjustmentErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const adjustmentHistory = useQuery({
    enabled: Boolean(historyTarget),
    queryKey: queryKeys.cashAccounts.adjustments(historyTarget?.id ?? ""),
    queryFn: () => {
      if (!historyTarget) throw new Error("Akun kas belum dipilih.");
      return moneymateApi.cashAdjustments(historyTarget.id);
    },
  });

  const create = useMutation({
    mutationFn: () => moneymateApi.createCashAccount(toPayload(form)),
    onSuccess: () => {
      closeForm();
      invalidateCashWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Akun kas belum dipilih.");
      return moneymateApi.updateCashAccount(editing.id, toPayload(form));
    },
    onSuccess: () => {
      closeForm();
      invalidateCashWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => moneymateApi.deleteCashAccount(id),
    onSuccess: () => {
      setDeleteTarget(null);
      invalidateCashWrites(queryClient);
    },
  });

  const adjust = useMutation({
    mutationFn: () => {
      if (!adjustTarget) throw new Error("Akun kas belum dipilih.");
      return moneymateApi.createCashAdjustment(adjustTarget.id, toAdjustmentPayload(adjustmentForm));
    },
    onSuccess: (_data, _variables, _context) => {
      const adjustedID = adjustTarget?.id;
      closeAdjustment();
      setSuccessMessage("Adjustment cash berhasil disimpan.");
      invalidateCashWrites(queryClient, adjustedID);
    },
  });

  if (cash.isLoading) return <LoadingState />;
  if (cash.isError) return <ErrorState message="Akun kas belum bisa dimuat." />;

  const submit = () => {
    const errors = validateCash(form);
    setFormErrors(errors);
    if (errors.length > 0) return;
    if (editing) {
      update.mutate();
      return;
    }
    create.mutate();
  };

  const submitAdjustment = () => {
    const errors = validateAdjustment(adjustmentForm);
    setAdjustmentErrors(errors);
    if (errors.length > 0) return;
    adjust.mutate();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <PageHeader description="Saldo kas dikelola manual pada MVP" title="Kas" />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover"
          onClick={() => openCreate(setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah Akun Kas
        </button>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-fin-gain/30 bg-fin-gain/5 px-4 py-2.5 text-xs font-semibold text-fin-gain font-sans">{successMessage}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {cash.data?.map((item, index) => (
          <Card key={item.id} className="relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted font-sans">{item.account_type}</p>
                <h3 className="mt-1.5 text-lg font-bold text-main font-display tracking-tight">{item.account_name}</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider ${item.is_active ? "bg-fin-gain/10 text-fin-gain" : "bg-fin-surface-hover text-muted"}`}>
                {item.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <p className="mt-4 text-2xl lg:text-3xl font-bold text-main font-mono tracking-tighter leading-none">{formatCurrency(item.balance, item.currency)}</p>
            {item.notes ? <p className="mt-2 text-xs text-muted font-sans">{item.notes}</p> : null}
            <div className="mt-5 flex flex-wrap justify-end gap-1.5">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-subtle/50 px-4 py-2 text-sm text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => openAdjustment(item)}
                type="button"
              >
                <WalletCards className="h-4 w-4" />
                Sesuaikan Saldo
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-subtle/50 px-4 py-2 text-sm text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setHistoryTarget(item)}
                type="button"
              >
                <History className="h-4 w-4" />
                Histori
              </button>
              <button
                className="rounded-xl p-2 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => openEdit(item, setForm, setEditing, setFormOpen, setFormErrors)}
                title="Edit akun cash"
                type="button"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                className="rounded-xl p-2 text-muted hover:bg-fin-loss/10 hover:text-fin-loss transition-colors"
                onClick={() => setDeleteTarget(item)}
                title="Nonaktifkan akun cash"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {cash.data?.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">Belum ada akun cash.</p>
        </Card>
      ) : null}

      {formOpen ? (
        <CashModal
          error={errorMessage(create.error || update.error)}
          errors={formErrors}
          form={form}
          isEditing={Boolean(editing)}
          isSaving={create.isPending || update.isPending}
          onClose={closeForm}
          onSubmit={submit}
          setForm={setForm}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDelete
          error={errorMessage(remove.error)}
          isDeleting={remove.isPending}
          label={deleteTarget.account_name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove.mutate(deleteTarget.id)}
        />
      ) : null}

      {adjustTarget ? (
        <AdjustmentModal
          account={adjustTarget}
          error={errorMessage(adjust.error)}
          errors={adjustmentErrors}
          form={adjustmentForm}
          isSaving={adjust.isPending}
          onClose={closeAdjustment}
          onSubmit={submitAdjustment}
          setForm={setAdjustmentForm}
        />
      ) : null}

      {historyTarget ? (
        <HistoryModal
          account={historyTarget}
          error={adjustmentHistory.isError}
          isLoading={adjustmentHistory.isLoading}
          onClose={() => setHistoryTarget(null)}
          rows={adjustmentHistory.data ?? []}
        />
      ) : null}
    </div>
  );

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm());
    setFormErrors([]);
  }

  function openAdjustment(item: CashAccount) {
    setAdjustTarget(item);
    setAdjustmentForm(emptyAdjustmentForm());
    setAdjustmentErrors([]);
    setSuccessMessage("");
  }

  function closeAdjustment() {
    setAdjustTarget(null);
    setAdjustmentForm(emptyAdjustmentForm());
    setAdjustmentErrors([]);
  }
}

function CashModal({
  error,
  errors,
  form,
  isEditing,
  isSaving,
  onClose,
  onSubmit,
  setForm,
}: {
  error: string;
  errors: string[];
  form: CashForm;
  isEditing: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setForm: (form: CashForm) => void;
}) {
  return (
    <Modal onClose={onClose} size="lg" title={isEditing ? "Edit Akun Kas" : "Tambah Akun Kas"}>
      <p className="mb-5 text-sm text-muted">Saldo manual</p>

      <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama akun">
            <input className={inputClass} onChange={(e) => setForm({ ...form, account_name: e.target.value })} value={form.account_name} />
          </Field>
          <Field label="Tipe akun">
            <Select
              options={[
                { label: "Bank", value: "bank" },
                { label: "E-wallet", value: "wallet" },
                { label: "Tunai", value: "cash" },
                { label: "Lainnya", value: "other" },
              ]}
              value={form.account_type}
              onChange={(val) => setForm({ ...form, account_type: val })}
            />
          </Field>
          <Field label="Currency">
            <Select
              options={[
                { label: "IDR", value: "IDR" },
                { label: "USD", value: "USD" },
              ]}
              value={form.currency}
              onChange={(val) => setForm({ ...form, currency: val })}
            />
          </Field>
          <Field label="Saldo">
            <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, balance: e.target.value })} value={form.balance} />
          </Field>
          <Field label="Status">
            <Select
              options={[
                { label: "Aktif", value: "true" },
                { label: "Nonaktif", value: "false" },
              ]}
              value={String(form.is_active)}
              onChange={(val) => setForm({ ...form, is_active: val === "true" })}
            />
          </Field>
          <Field label="Notes">
            <input className={inputClass} onChange={(e) => setForm({ ...form, notes: e.target.value })} value={form.notes} />
          </Field>
      </div>

      <Feedback error={error} errors={errors} />

      <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-xl border border-subtle/50 px-4 py-2.5 text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all" onClick={onClose} type="button">
            Batal
          </button>
          <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover disabled:opacity-60" disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
      </div>
    </Modal>
  );
}

function ConfirmDelete({
  error,
  isDeleting,
  label,
  onCancel,
  onConfirm,
}: {
  error: string;
  isDeleting: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal onClose={onCancel} size="sm" title="Nonaktifkan Akun Kas">
      <p className="text-sm text-muted">Akun {label} akan dibuat nonaktif. Saldo historis tetap tersimpan.</p>
      {error ? <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-xl border border-subtle/50 px-4 py-2.5 text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all" onClick={onCancel} type="button">
            Batal
          </button>
          <button className="rounded-xl bg-fin-loss px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60" disabled={isDeleting} onClick={onConfirm} type="button">
            {isDeleting ? "Memproses..." : "Nonaktifkan"}
          </button>
      </div>
    </Modal>
  );
}

function AdjustmentModal({
  account,
  error,
  errors,
  form,
  isSaving,
  onClose,
  onSubmit,
  setForm,
}: {
  account: CashAccount;
  error: string;
  errors: string[];
  form: AdjustmentForm;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setForm: (form: AdjustmentForm) => void;
}) {
  return (
    <Modal onClose={onClose} size="lg" title="Sesuaikan Saldo Kas">
      <p className="mb-5 text-sm text-muted">{account.account_name}</p>

      <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tanggal penyesuaian">
            <input className={inputClass} onChange={(e) => setForm({ ...form, adjustment_date: e.target.value })} type="date" value={form.adjustment_date} />
          </Field>
          <Field label="Tipe penyesuaian">
            <Select
              options={[
                { label: "Deposit", value: "deposit" },
                { label: "Penarikan", value: "withdrawal" },
                { label: "Koreksi", value: "correction" },
                { label: "Transfer Masuk", value: "transfer_in" },
                { label: "Transfer Keluar", value: "transfer_out" },
              ]}
              value={form.type}
              onChange={(val) => setForm({ ...form, type: val })}
            />
          </Field>
          <Field label="Amount">
            <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, amount: e.target.value })} value={form.amount} />
          </Field>
          <Field label="Notes">
            <input className={inputClass} onChange={(e) => setForm({ ...form, note: e.target.value })} value={form.note} />
          </Field>
      </div>

      <p className="mt-4 text-sm text-muted">
          Penarikan dan transfer keluar akan mengurangi saldo. Saldo kas negatif tidak diizinkan.
      </p>
      <Feedback error={error} errors={errors} />

      <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-xl border border-subtle/50 px-4 py-2.5 text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all" onClick={onClose} type="button">
            Batal
          </button>
          <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover disabled:opacity-60" disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? "Menyimpan..." : "Simpan Penyesuaian"}
          </button>
      </div>
    </Modal>
  );
}

function HistoryModal({
  account,
  error,
  isLoading,
  onClose,
  rows,
}: {
  account: CashAccount;
  error: boolean;
  isLoading: boolean;
  onClose: () => void;
  rows: CashAdjustment[];
}) {
  return (
    <Modal onClose={onClose} size="xl" title="Histori Penyesuaian Kas">
      <p className="mb-5 text-sm text-muted">{account.account_name}</p>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message="Histori penyesuaian belum bisa dimuat." /> : null}
      {!isLoading && !error && rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-subtle bg-surface/40 p-6 text-center text-sm text-muted">
            Belum ada penyesuaian kas.
          </div>
      ) : null}
      {!isLoading && !error && rows.length > 0 ? <AdjustmentTable rows={rows} /> : null}
    </Modal>
  );
}

function AdjustmentTable({ rows }: { rows: CashAdjustment[] }) {
  return (
    <div className="overflow-auto rounded-2xl surface-card card-shadow overflow-hidden">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-subtle/50">
            {["Date", "Type", "Amount", "Balance Before", "Balance After", "Notes"].map((header, index) => (
              <th className="text-left p-4 text-[11px] font-semibold text-muted uppercase tracking-[0.08em] font-sans" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle/30">
          {rows.map((row, index) => (
            <motion.tr key={row.id} className="hover:bg-fin-surface/50 transition-all duration-200" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <td className="p-4 text-xs font-mono text-muted">{formatDate(row.adjustment_date ?? row.created_at)}</td>
              <td className="p-4 text-xs font-sans text-main font-medium">{adjustmentTypeLabel(row.type)}</td>
              <td className={`p-4 font-mono font-bold ${row.amount < 0 ? "text-fin-loss" : "text-fin-gain"}`}>{formatCurrency(row.amount, row.currency)}</td>
              <td className="p-4 text-xs font-mono text-muted">{formatCurrency(row.balance_before, row.currency)}</td>
              <td className="p-4 text-xs font-mono text-muted">{formatCurrency(row.balance_after, row.currency)}</td>
              <td className="p-4 text-xs font-sans text-muted">{row.note ?? "-"}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function openCreate(
  setForm: (form: CashForm) => void,
  setEditing: (item: CashAccount | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(null);
  setForm(emptyForm());
  setFormErrors([]);
  setFormOpen(true);
}

function openEdit(
  item: CashAccount,
  setForm: (form: CashForm) => void,
  setEditing: (item: CashAccount | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(item);
  setForm({
    account_name: item.account_name,
    account_type: item.account_type,
    currency: item.currency,
    balance: String(item.balance ?? ""),
    notes: item.notes ?? "",
    is_active: item.is_active ?? true,
  });
  setFormErrors([]);
  setFormOpen(true);
}

function validateCash(form: CashForm) {
  const errors: string[] = [];
  if (!form.account_name.trim()) errors.push("Nama akun cash wajib diisi.");
  if (!form.currency.trim()) errors.push("Currency is required.");
  if (form.balance.trim() === "" || !Number.isFinite(Number(form.balance))) errors.push("Saldo wajib berupa angka.");
  return errors;
}

function validateAdjustment(form: AdjustmentForm) {
  const errors: string[] = [];
  if (!form.adjustment_date.trim()) errors.push("Tanggal penyesuaian wajib diisi.");
  if (!form.type.trim()) errors.push("Tipe penyesuaian wajib dipilih.");
  if (form.amount.trim() === "" || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
    errors.push("Nominal penyesuaian wajib lebih dari 0.");
  }
  return errors;
}

function toPayload(form: CashForm) {
  return {
    account_name: form.account_name.trim(),
    account_type: form.account_type,
    currency: form.currency,
    balance: Number(form.balance),
    notes: form.notes.trim() || undefined,
    is_active: form.is_active,
  };
}

function toAdjustmentPayload(form: AdjustmentForm) {
  return {
    adjustment_date: form.adjustment_date,
    type: form.type,
    amount: Number(form.amount),
    note: form.note.trim() || undefined,
  };
}

function adjustmentTypeLabel(type: string) {
  const labels: Record<string, string> = {
    correction: "Koreksi",
    deposit: "Deposit",
    transfer_in: "Transfer Masuk",
    transfer_out: "Transfer Keluar",
    withdrawal: "Penarikan",
  };
  return labels[type] ?? type;
}

function invalidateCashWrites(queryClient: ReturnType<typeof useQueryClient>, cashAccountID?: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
  if (cashAccountID) {
    queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.adjustments(cashAccountID) });
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.allocation });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.alerts });
  queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.06em] mb-2 block font-sans">{label}</span>
      {children}
    </label>
  );
}

function Feedback({ error, errors }: { error: string; errors: string[] }) {
  if (!error && errors.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-xs text-warning font-sans">
      {error ? <p className="font-semibold">{error}</p> : null}
      {errors.map((item, index) => (
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

const inputClass = "input-field font-sans";
