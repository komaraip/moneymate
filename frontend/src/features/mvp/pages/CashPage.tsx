import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Pencil, Plus, Trash2, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency, formatDate } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import type { CashAccount, CashAdjustment } from "../types";

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

export function CashPage() {
  const queryClient = useQueryClient();
  const cash = useQuery({ queryKey: queryKeys.cashAccounts.all, queryFn: mvpApi.cashAccounts });
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
      if (!historyTarget) throw new Error("Akun cash belum dipilih.");
      return mvpApi.cashAdjustments(historyTarget.id);
    },
  });

  const create = useMutation({
    mutationFn: () => mvpApi.createCashAccount(toPayload(form)),
    onSuccess: () => {
      closeForm();
      invalidateCashWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Akun cash belum dipilih.");
      return mvpApi.updateCashAccount(editing.id, toPayload(form));
    },
    onSuccess: () => {
      closeForm();
      invalidateCashWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => mvpApi.deleteCashAccount(id),
    onSuccess: () => {
      setDeleteTarget(null);
      invalidateCashWrites(queryClient);
    },
  });

  const adjust = useMutation({
    mutationFn: () => {
      if (!adjustTarget) throw new Error("Akun cash belum dipilih.");
      return mvpApi.createCashAdjustment(adjustTarget.id, toAdjustmentPayload(adjustmentForm));
    },
    onSuccess: (_data, _variables, _context) => {
      const adjustedID = adjustTarget?.id;
      closeAdjustment();
      setSuccessMessage("Adjustment cash berhasil disimpan.");
      invalidateCashWrites(queryClient, adjustedID);
    },
  });

  if (cash.isLoading) return <LoadingState />;
  if (cash.isError) return <ErrorState message="Akun cash belum bisa dimuat." />;

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
        <PageHeader description="Saldo cash dikelola manual pada MVP" title="Cash" />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          onClick={() => openCreate(setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah Akun Cash
        </button>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">{successMessage}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {cash.data?.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-400">{item.account_type}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{item.account_name}</h3>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${item.is_active ? "bg-emerald-500/10 text-emerald-200" : "bg-zinc-800 text-zinc-400"}`}>
                {item.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-emerald-300">{formatCurrency(item.balance, item.currency)}</p>
            {item.notes ? <p className="mt-2 text-sm text-zinc-500">{item.notes}</p> : null}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-200"
                onClick={() => openAdjustment(item)}
                type="button"
              >
                <WalletCards className="h-4 w-4" />
                Adjust Saldo
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-200"
                onClick={() => setHistoryTarget(item)}
                type="button"
              >
                <History className="h-4 w-4" />
                Histori
              </button>
              <button
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-emerald-500 hover:text-emerald-200"
                onClick={() => openEdit(item, setForm, setEditing, setFormOpen, setFormErrors)}
                title="Edit akun cash"
                type="button"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-rose-500 hover:text-rose-200"
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
          <p className="text-sm text-zinc-500">Belum ada akun cash.</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Saldo manual</p>
            <h3 className="text-lg font-semibold text-white">{isEditing ? "Edit Akun Cash" : "Tambah Akun Cash"}</h3>
          </div>
          <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300" onClick={onClose} title="Tutup" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama akun">
            <input className={inputClass} onChange={(e) => setForm({ ...form, account_name: e.target.value })} value={form.account_name} />
          </Field>
          <Field label="Tipe akun">
            <select className={inputClass} onChange={(e) => setForm({ ...form, account_type: e.target.value })} value={form.account_type}>
              <option value="bank">Bank</option>
              <option value="wallet">E-wallet</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Currency">
            <select className={inputClass} onChange={(e) => setForm({ ...form, currency: e.target.value })} value={form.currency}>
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label="Saldo">
            <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, balance: e.target.value })} value={form.balance} />
          </Field>
          <Field label="Status">
            <select className={inputClass} onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })} value={String(form.is_active)}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </Field>
          <Field label="Catatan">
            <input className={inputClass} onChange={(e) => setForm({ ...form, notes: e.target.value })} value={form.notes} />
          </Field>
        </div>

        <Feedback error={error} errors={errors} />

        <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200" onClick={onClose} type="button">
            Batal
          </button>
          <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60" disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </section>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <section className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-white">Nonaktifkan Akun Cash</h3>
        <p className="mt-2 text-sm text-zinc-400">Akun {label} akan dibuat nonaktif. Saldo historis tetap tersimpan.</p>
        {error ? <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200" onClick={onCancel} type="button">
            Batal
          </button>
          <button className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60" disabled={isDeleting} onClick={onConfirm} type="button">
            {isDeleting ? "Memproses..." : "Nonaktifkan"}
          </button>
        </div>
      </section>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">{account.account_name}</p>
            <h3 className="text-lg font-semibold text-white">Adjust Saldo Cash</h3>
          </div>
          <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300" onClick={onClose} title="Tutup" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tanggal adjustment">
            <input className={inputClass} onChange={(e) => setForm({ ...form, adjustment_date: e.target.value })} type="date" value={form.adjustment_date} />
          </Field>
          <Field label="Tipe adjustment">
            <select className={inputClass} onChange={(e) => setForm({ ...form, type: e.target.value })} value={form.type}>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="correction">Correction</option>
              <option value="transfer_in">Transfer In</option>
              <option value="transfer_out">Transfer Out</option>
            </select>
          </Field>
          <Field label="Nominal">
            <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, amount: e.target.value })} value={form.amount} />
          </Field>
          <Field label="Catatan">
            <input className={inputClass} onChange={(e) => setForm({ ...form, note: e.target.value })} value={form.note} />
          </Field>
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          Withdrawal dan transfer out akan mengurangi saldo. Saldo cash negatif tidak diizinkan.
        </p>
        <Feedback error={error} errors={errors} />

        <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200" onClick={onClose} type="button">
            Batal
          </button>
          <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60" disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? "Menyimpan..." : "Simpan Adjustment"}
          </button>
        </div>
      </section>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">{account.account_name}</p>
            <h3 className="text-lg font-semibold text-white">Histori Adjustment Cash</h3>
          </div>
          <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300" onClick={onClose} title="Tutup" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message="Histori adjustment belum bisa dimuat." /> : null}
        {!isLoading && !error && rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center text-sm text-zinc-400">
            Belum ada adjustment cash.
          </div>
        ) : null}
        {!isLoading && !error && rows.length > 0 ? <AdjustmentTable rows={rows} /> : null}
      </section>
    </div>
  );
}

function AdjustmentTable({ rows }: { rows: CashAdjustment[] }) {
  return (
    <div className="overflow-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-zinc-900 text-zinc-400">
          <tr>
            {["Tanggal", "Tipe", "Nominal", "Saldo Sebelum", "Saldo Setelah", "Catatan"].map((header) => (
              <th className="px-4 py-3 text-left" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 text-zinc-300">{formatDate(row.adjustment_date ?? row.created_at)}</td>
              <td className="px-4 py-3 text-zinc-300">{adjustmentTypeLabel(row.type)}</td>
              <td className={`px-4 py-3 ${row.amount < 0 ? "text-rose-200" : "text-emerald-200"}`}>{formatCurrency(row.amount, row.currency)}</td>
              <td className="px-4 py-3 text-zinc-300">{formatCurrency(row.balance_before, row.currency)}</td>
              <td className="px-4 py-3 text-zinc-300">{formatCurrency(row.balance_after, row.currency)}</td>
              <td className="px-4 py-3 text-zinc-400">{row.note ?? "-"}</td>
            </tr>
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
  if (!form.currency.trim()) errors.push("Currency wajib diisi.");
  if (form.balance.trim() === "" || !Number.isFinite(Number(form.balance))) errors.push("Saldo wajib berupa angka.");
  return errors;
}

function validateAdjustment(form: AdjustmentForm) {
  const errors: string[] = [];
  if (!form.adjustment_date.trim()) errors.push("Tanggal adjustment wajib diisi.");
  if (!form.type.trim()) errors.push("Tipe adjustment wajib dipilih.");
  if (form.amount.trim() === "" || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
    errors.push("Nominal adjustment wajib lebih dari 0.");
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
    correction: "Correction",
    deposit: "Deposit",
    transfer_in: "Transfer In",
    transfer_out: "Transfer Out",
    withdrawal: "Withdrawal",
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
    <label className="block text-sm">
      <span className="mb-2 block text-zinc-300">{label}</span>
      {children}
    </label>
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
