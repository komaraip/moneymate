import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatCurrency, formatDate, formatNumber } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { PageHeader } from "../components/PageHeader";
import type { CashAccount, Instrument, Transaction, TransactionCategory } from "../types";

type TransactionForm = {
  cash_account_id: string;
  transfer_cash_account_id: string;
  category_id: string;
  instrument_id: string;
  transaction_date: string;
  type: string;
  amount: string;
  price: string;
  units: string;
  fees: string;
  tax: string;
  currency: string;
  fx_rate_to_idr: string;
  notes: string;
};

const transactionTypes = [
  { label: "Pengeluaran", value: "expense" },
  { label: "Pemasukan", value: "income" },
  { label: "Transfer", value: "transfer" },
  { label: "Beli Investasi", value: "buy" },
  { label: "Jual Investasi", value: "sell" },
  { label: "Dividen", value: "dividend" },
  { label: "Fee", value: "fee" },
  { label: "Penyesuaian", value: "adjustment" },
] as const;

const emptyForm = (): TransactionForm => ({
  cash_account_id: "",
  transfer_cash_account_id: "",
  category_id: "",
  instrument_id: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  type: "expense",
  amount: "",
  price: "",
  units: "",
  fees: "0",
  tax: "0",
  currency: "IDR",
  fx_rate_to_idr: "",
  notes: "",
});

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const transactions = useQuery({ queryKey: queryKeys.transactions.all, queryFn: mvpApi.transactions });
  const instruments = useQuery({ queryKey: queryKeys.instruments.all, queryFn: mvpApi.instruments });
  const cashAccounts = useQuery({ queryKey: queryKeys.cashAccounts.all, queryFn: mvpApi.cashAccounts });
  const categories = useQuery({ queryKey: queryKeys.transactionCategories.all, queryFn: () => mvpApi.transactionCategories() });
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const create = useMutation({
    mutationFn: () => mvpApi.createTransaction(toPayload(form)),
    onSuccess: () => {
      closeForm();
      invalidateTransactionWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Transaksi belum dipilih.");
      return mvpApi.updateTransaction(editing.id, toPayload(form));
    },
    onSuccess: () => {
      closeForm();
      invalidateTransactionWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => mvpApi.deleteTransaction(id),
    onSuccess: () => {
      setDeleteTarget(null);
      invalidateTransactionWrites(queryClient);
    },
  });

  if (transactions.isLoading) return <LoadingState />;
  if (transactions.isError) return <ErrorState message="Transaksi belum bisa dimuat." />;

  const submit = () => {
    const errors = validateTransaction(form);
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
        <PageHeader description="Catat pemasukan, pengeluaran, transfer, dan transaksi investasi manual." title="Transaksi" />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          onClick={() => openCreate(setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </button>
      </div>

      <Table headers={["Tanggal", "Tipe", "Kategori/Instrumen", "Akun", "Nominal", "Aksi"]}>
        {transactions.data?.map((item) => (
          <tr className="border-t border-zinc-800" key={item.id}>
            <td className="px-4 py-3">{formatDate(item.transaction_date)}</td>
            <td className="px-4 py-3">{transactionTypeLabel(item.type)}</td>
            <td className="px-4 py-3">{item.category_name ?? item.instrument_ticker ?? item.instrument_name ?? "-"}</td>
            <td className="px-4 py-3">{accountLabel(item)}</td>
            <td className="px-4 py-3 text-right">
              {isPersonalType(item.type)
                ? formatCurrency(item.amount ?? item.net_value ?? 0, item.currency)
                : `${formatCurrency(item.net_value ?? 0, item.currency)} / ${formatNumber(item.units ?? 0)} unit`}
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-emerald-500 hover:text-emerald-200"
                  onClick={() => openEdit(item, setForm, setEditing, setFormOpen, setFormErrors)}
                  title="Edit transaksi"
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-rose-500 hover:text-rose-200"
                  onClick={() => setDeleteTarget(item)}
                  title="Hapus transaksi"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {transactions.data?.length === 0 ? (
          <tr>
            <td className="px-4 py-8 text-center text-zinc-500" colSpan={6}>
              Belum ada transaksi. Tambahkan pemasukan atau pengeluaran pertama.
            </td>
          </tr>
        ) : null}
      </Table>

      {formOpen ? (
        <TransactionModal
          accounts={cashAccounts.data ?? []}
          categories={categories.data ?? []}
          error={errorMessage(create.error || update.error)}
          errors={formErrors}
          form={form}
          instruments={instruments.data ?? []}
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
          label={deleteLabel(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove.mutate(deleteTarget.id)}
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
}

function TransactionModal({
  accounts,
  categories,
  error,
  errors,
  form,
  instruments,
  isEditing,
  isSaving,
  onClose,
  onSubmit,
  setForm,
}: {
  accounts: CashAccount[];
  categories: TransactionCategory[];
  error: string;
  errors: string[];
  form: TransactionForm;
  instruments: Instrument[];
  isEditing: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setForm: (form: TransactionForm) => void;
}) {
  const personal = isPersonalType(form.type);
  const transfer = form.type === "transfer";
  const filteredCategories = categories.filter((item) => item.type === form.type && item.is_active !== false);
  const activeAccounts = accounts.filter((item) => item.is_active !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Data manual, bukan real-time</p>
            <h3 className="text-lg font-semibold text-white">{isEditing ? "Edit Transaksi" : "Tambah Transaksi"}</h3>
          </div>
          <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300" onClick={onClose} title="Tutup" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipe">
            <select
              className={inputClass}
              onChange={(event) =>
                setForm({
                  ...form,
                  category_id: "",
                  instrument_id: "",
                  transfer_cash_account_id: "",
                  type: event.target.value,
                })
              }
              value={form.type}
            >
              {transactionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal">
            <input className={inputClass} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} type="date" value={form.transaction_date} />
          </Field>

          {personal ? (
            <>
              <Field label={transfer ? "Akun asal" : "Akun"}>
                <select className={inputClass} onChange={(e) => setForm({ ...form, cash_account_id: e.target.value })} value={form.cash_account_id}>
                  <option value="">Pilih akun</option>
                  {activeAccounts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.account_name} - {formatCurrency(item.balance ?? 0, item.currency)}
                    </option>
                  ))}
                </select>
              </Field>
              {transfer ? (
                <Field label="Akun tujuan">
                  <select className={inputClass} onChange={(e) => setForm({ ...form, transfer_cash_account_id: e.target.value })} value={form.transfer_cash_account_id}>
                    <option value="">Pilih akun tujuan</option>
                    {activeAccounts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.account_name} - {item.currency}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="Kategori">
                  <select className={inputClass} onChange={(e) => setForm({ ...form, category_id: e.target.value })} value={form.category_id}>
                    <option value="">Pilih kategori</option>
                    {filteredCategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Nominal">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, amount: e.target.value })} value={form.amount} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Instrumen">
                <select className={inputClass} onChange={(e) => setForm({ ...form, instrument_id: e.target.value })} value={form.instrument_id}>
                  <option value="">Pilih instrumen</option>
                  {instruments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.ticker ? `${item.ticker} - ${item.name}` : item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Harga">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, price: e.target.value })} value={form.price} />
              </Field>
              <Field label="Unit">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, units: e.target.value })} value={form.units} />
              </Field>
            </>
          )}

          <Field label="Mata uang">
            <select className={inputClass} onChange={(e) => setForm({ ...form, currency: e.target.value })} value={form.currency}>
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          {form.currency !== "IDR" ? (
            <Field label="Kurs ke IDR">
              <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, fx_rate_to_idr: e.target.value })} value={form.fx_rate_to_idr} />
            </Field>
          ) : null}
          {!personal ? (
            <>
              <Field label="Biaya">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, fees: e.target.value })} value={form.fees} />
              </Field>
              <Field label="Pajak">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, tax: e.target.value })} value={form.tax} />
              </Field>
            </>
          ) : null}
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
        <h3 className="text-lg font-semibold text-white">Hapus Transaksi</h3>
        <p className="mt-2 text-sm text-zinc-400">Transaksi {label} akan dihapus. Efek saldo kas akan dibalik otomatis untuk transaksi personal.</p>
        {error ? <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200" onClick={onCancel} type="button">
            Batal
          </button>
          <button className="rounded-lg bg-rose-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60" disabled={isDeleting} onClick={onConfirm} type="button">
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </section>
    </div>
  );
}

function openCreate(
  setForm: (form: TransactionForm) => void,
  setEditing: (item: Transaction | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(null);
  setForm(emptyForm());
  setFormErrors([]);
  setFormOpen(true);
}

function openEdit(
  item: Transaction,
  setForm: (form: TransactionForm) => void,
  setEditing: (item: Transaction | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(item);
  setForm({
    amount: item.amount == null ? String(item.net_value ?? "") : String(item.amount),
    cash_account_id: item.cash_account_id ?? "",
    category_id: item.category_id ?? "",
    currency: item.currency ?? "IDR",
    fees: String(item.fees ?? 0),
    fx_rate_to_idr: item.fx_rate_to_idr ? String(item.fx_rate_to_idr) : "",
    instrument_id: item.instrument_id ?? "",
    notes: item.notes ?? "",
    price: String(item.price ?? ""),
    tax: String(item.tax ?? 0),
    transaction_date: String(item.transaction_date).slice(0, 10),
    transfer_cash_account_id: item.transfer_cash_account_id ?? "",
    type: item.type,
    units: String(item.units ?? ""),
  });
  setFormErrors([]);
  setFormOpen(true);
}

function validateTransaction(form: TransactionForm) {
  const errors: string[] = [];
  if (!form.transaction_date) errors.push("Tanggal transaksi wajib diisi.");
  if (!transactionTypes.some((item) => item.value === form.type)) errors.push("Tipe transaksi tidak valid.");
  if (!form.currency) errors.push("Mata uang wajib diisi.");
  if (form.currency !== "IDR" && (!isNumeric(form.fx_rate_to_idr) || numberValue(form.fx_rate_to_idr) <= 0)) errors.push("Kurs ke IDR wajib diisi untuk transaksi non-IDR.");

  if (isPersonalType(form.type)) {
    if (!form.cash_account_id) errors.push("Akun wajib dipilih.");
    if (!isNumeric(form.amount) || numberValue(form.amount) <= 0) errors.push("Nominal wajib lebih dari 0.");
    if ((form.type === "income" || form.type === "expense") && !form.category_id) errors.push("Kategori wajib dipilih.");
    if (form.type === "transfer" && !form.transfer_cash_account_id) errors.push("Akun tujuan wajib dipilih.");
    if (form.type === "transfer" && form.cash_account_id && form.transfer_cash_account_id && form.cash_account_id === form.transfer_cash_account_id) {
      errors.push("Akun asal dan tujuan transfer harus berbeda.");
    }
  } else {
    if (!form.instrument_id) errors.push("Instrumen wajib dipilih.");
    if (!isNumeric(form.price) || numberValue(form.price) < 0) errors.push("Harga wajib diisi dan tidak boleh negatif.");
    if ((form.type === "buy" || form.type === "sell") && (!isNumeric(form.units) || numberValue(form.units) <= 0)) errors.push("Unit wajib lebih dari 0 untuk beli/jual.");
    if (!isNumeric(form.fees) || numberValue(form.fees) < 0) errors.push("Biaya tidak boleh negatif.");
    if (!isNumeric(form.tax) || numberValue(form.tax) < 0) errors.push("Pajak tidak boleh negatif.");
  }
  return errors;
}

function toPayload(form: TransactionForm) {
  const fxRate = form.currency === "IDR" ? undefined : numberValue(form.fx_rate_to_idr);
  if (isPersonalType(form.type)) {
    const amount = numberValue(form.amount);
    return {
      amount,
      cash_account_id: form.cash_account_id,
      category_id: form.type === "transfer" ? undefined : form.category_id,
      currency: form.currency,
      fx_rate_to_idr: fxRate,
      gross_value: amount,
      net_value: amount,
      notes: form.notes || undefined,
      price: amount,
      transaction_date: form.transaction_date,
      transfer_cash_account_id: form.type === "transfer" ? form.transfer_cash_account_id : undefined,
      type: form.type,
      units: 1,
    };
  }

  return {
    currency: form.currency,
    fees: numberValue(form.fees),
    fx_rate_to_idr: fxRate,
    instrument_id: form.instrument_id,
    notes: form.notes || undefined,
    price: numberValue(form.price),
    tax: numberValue(form.tax),
    transaction_date: form.transaction_date,
    type: form.type,
    units: numberValue(form.units),
  };
}

function invalidateTransactionWrites(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.cashAccounts.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.allocation });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.alerts });
  queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
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

function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-zinc-900 text-zinc-400">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3 text-left" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function accountLabel(item: Transaction) {
  if (item.type === "transfer") {
    return `${item.cash_account_name ?? "-"} -> ${item.transfer_cash_account_name ?? "-"}`;
  }
  return item.cash_account_name ?? "-";
}

function deleteLabel(item: Transaction) {
  return item.category_name ?? item.instrument_ticker ?? item.instrument_name ?? transactionTypeLabel(item.type);
}

function errorMessage(error: unknown) {
  if (!error) return "";
  if (error instanceof Error) return error.message;
  return "Request gagal diproses.";
}

function transactionTypeLabel(type: string) {
  const labels: Record<string, string> = {
    adjustment: "Penyesuaian",
    buy: "Beli Investasi",
    dividend: "Dividen",
    expense: "Pengeluaran",
    fee: "Fee",
    income: "Pemasukan",
    sell: "Jual Investasi",
    transfer: "Transfer",
  };
  return labels[type] ?? type;
}

function isPersonalType(type: string) {
  return type === "income" || type === "expense" || type === "transfer";
}

function numberValue(value: string) {
  if (value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isNumeric(value: string) {
  return value.trim() !== "" && Number.isFinite(Number(value));
}

const inputClass = "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500";
