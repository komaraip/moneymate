import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { formatCurrency, formatDate, formatNumber } from "../../utils/format";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import type { CashAccount, Instrument, Transaction, TransactionCategory } from "../../types/moneymate";
import { motion } from "framer-motion";

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

type TransactionFilters = {
  type: string;
  category_id: string;
  cash_account_id: string;
  from: string;
  to: string;
  search: string;
};

type QuickForm = {
  type: "expense" | "income";
  transaction_date: string;
  cash_account_id: string;
  category_id: string;
  amount: string;
  notes: string;
};

const transactionTypes = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
  { label: "Transfer", value: "transfer" },
  { label: "Buy Investment", value: "buy" },
  { label: "Sell Investment", value: "sell" },
  { label: "Dividend", value: "dividend" },
  { label: "Fee", value: "fee" },
  { label: "Adjustment", value: "adjustment" },
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

const emptyFilters = (): TransactionFilters => ({
  cash_account_id: "",
  category_id: "",
  from: "",
  search: "",
  to: "",
  type: "",
});

const emptyQuickForm = (): QuickForm => ({
  amount: "",
  cash_account_id: "",
  category_id: "",
  notes: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  type: "expense",
});

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const transactions = useQuery({ queryKey: queryKeys.transactions.filtered(filters), queryFn: () => moneymateApi.transactions(cleanFilters(filters)) });
  const instruments = useQuery({ queryKey: queryKeys.instruments.all, queryFn: moneymateApi.instruments });
  const cashAccounts = useQuery({ queryKey: queryKeys.cashAccounts.all, queryFn: moneymateApi.cashAccounts });
  const categories = useQuery({ queryKey: queryKeys.transactionCategories.all, queryFn: () => moneymateApi.transactionCategories() });
  const [quickForm, setQuickForm] = useState<QuickForm>(emptyQuickForm);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [quickErrors, setQuickErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const create = useMutation({
    mutationFn: () => moneymateApi.createTransaction(toPayload(form)),
    onSuccess: () => {
      setSuccessMessage("Transaction added successfully.");
      closeForm();
      invalidateTransactionWrites(queryClient);
    },
  });

  const quickCreate = useMutation({
    mutationFn: () => moneymateApi.createTransaction(quickPayload(quickForm)),
    onSuccess: () => {
      setSuccessMessage("Quick transaction saved successfully.");
      setQuickErrors([]);
      setQuickForm(emptyQuickForm());
      invalidateTransactionWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Transaction not selected.");
      return moneymateApi.updateTransaction(editing.id, toPayload(form));
    },
    onSuccess: () => {
      setSuccessMessage("Transaction updated successfully.");
      closeForm();
      invalidateTransactionWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => moneymateApi.deleteTransaction(id),
    onSuccess: () => {
      setSuccessMessage("Transaction deleted successfully.");
      setDeleteTarget(null);
      invalidateTransactionWrites(queryClient);
    },
  });

  if (transactions.isLoading) return <LoadingState />;
  if (transactions.isError) return <ErrorState message="Transactions could not be loaded." />;

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
        <PageHeader description="Record income, expenses, transfers, and manual investment transactions" title="Transactions" />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover"
          onClick={() => openCreate(setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      <QuickAddCard
        accounts={cashAccounts.data ?? []}
        categories={categories.data ?? []}
        error={errorMessage(quickCreate.error)}
        errors={quickErrors}
        form={quickForm}
        isSaving={quickCreate.isPending}
        onSubmit={() => {
          const errors = validateQuickForm(quickForm);
          setQuickErrors(errors);
          if (errors.length > 0) return;
          quickCreate.mutate();
        }}
        setForm={setQuickForm}
      />

      <TransactionFiltersCard
        accounts={cashAccounts.data ?? []}
        categories={categories.data ?? []}
        filters={filters}
        onReset={() => setFilters(emptyFilters())}
        setFilters={setFilters}
      />

      {successMessage ? <p className="mb-4 rounded-xl border border-fin-gain/30 bg-fin-gain/5 px-4 py-2.5 text-xs font-semibold text-fin-gain font-sans">{successMessage}</p> : null}

      <Table headers={["Date", "Type", "Category/Instrument", "Account", "Amount", "Actions"]}>
        {transactions.data?.map((item, index) => (
          <motion.tr key={item.id} className="border-b border-subtle/30 hover:bg-fin-surface/50 transition-all duration-200" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <td className="p-4 text-xs font-mono text-muted">{formatDate(item.transaction_date)}</td>
            <td className="p-4">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${item.type === 'income' || item.type === 'buy' || item.type === 'dividend' ? 'bg-fin-gain/10 text-fin-gain' : item.type === 'expense' || item.type === 'sell' || item.type === 'fee' ? 'bg-fin-loss/10 text-fin-loss' : 'bg-primary/10 text-primary'}`}>
                {transactionTypeLabel(item.type)}
              </span>
            </td>
            <td className="p-4 text-sm font-semibold text-main font-sans">{item.category_name ?? item.instrument_ticker ?? item.instrument_name ?? "-"}</td>
            <td className="p-4 text-xs text-muted font-sans">{accountLabel(item)}</td>
            <td className="p-4 text-right font-mono font-bold text-main">
              {isPersonalType(item.type)
                ? formatCurrency(item.amount ?? item.net_value ?? 0, item.currency)
                : `${formatCurrency(item.net_value ?? 0, item.currency)} / ${formatNumber(item.units ?? 0)} unit`}
            </td>
            <td className="p-4">
              <div className="flex justify-end gap-1.5">
                <button
                  className="rounded-xl p-2 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => openEdit(item, setForm, setEditing, setFormOpen, setFormErrors)}
                  title="Edit transaction"
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="rounded-xl p-2 text-muted hover:bg-fin-loss/10 hover:text-fin-loss transition-colors"
                  onClick={() => setDeleteTarget(item)}
                  title="Delete transaction"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </motion.tr>
        ))}
        {transactions.data?.length === 0 ? (
          <tr>
            <td className="px-4 py-8 text-center text-xs text-muted font-sans" colSpan={6}>
              No transactions yet. Add your first income or expense.
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

function QuickAddCard({
  accounts,
  categories,
  error,
  errors,
  form,
  isSaving,
  onSubmit,
  setForm,
}: {
  accounts: CashAccount[];
  categories: TransactionCategory[];
  error: string;
  errors: string[];
  form: QuickForm;
  isSaving: boolean;
  onSubmit: () => void;
  setForm: (form: QuickForm) => void;
}) {
  const activeAccounts = accounts.filter((item) => item.is_active !== false);
  const filteredCategories = categories.filter((item) => item.type === form.type && item.is_active !== false);

  return (
    <Card className="mb-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-main tracking-tight font-display">Quick Add</h3>
        <p className="text-[11px] text-muted mt-0.5 font-sans">For daily income and expenses. Use the full form for transfers and investments.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-[140px_150px_1fr_1fr_160px_1fr_auto] lg:items-end">
        <Field label="Type">
          <Select
            options={[
              { label: "Expense", value: "expense" },
              { label: "Income", value: "income" },
            ]}
            value={form.type}
            onChange={(val) => setForm({ ...form, category_id: "", type: val as QuickForm["type"] })}
          />
        </Field>
        <Field label="Date">
          <input className={inputClass} onChange={(event) => setForm({ ...form, transaction_date: event.target.value })} type="date" value={form.transaction_date} />
        </Field>
        <Field label="Account">
          <Select
            options={[{ label: "Select account...", value: "" }, ...activeAccounts.map((a) => ({ label: a.account_name, value: a.id }))]}
            value={form.cash_account_id}
            onChange={(val) => setForm({ ...form, cash_account_id: val })}
          />
        </Field>
        <Field label="Category">
          <Select
            options={[{ label: "Select category...", value: "" }, ...filteredCategories.map((c) => ({ label: c.name, value: c.id }))]}
            value={form.category_id}
            onChange={(val) => setForm({ ...form, category_id: val })}
          />
        </Field>
        <Field label="Amount">
          <input className={inputClass} inputMode="decimal" onChange={(event) => setForm({ ...form, amount: event.target.value })} value={form.amount} />
        </Field>
        <Field label="Notes">
          <input className={inputClass} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional" value={form.notes} />
        </Field>
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app disabled:opacity-60 hover:bg-primary-hover transition-colors" disabled={isSaving} onClick={onSubmit} type="button">
          {isSaving ? "Saving..." : "Quick Save"}
        </button>
      </div>
      <Feedback error={error} errors={errors} />
    </Card>
  );
}

function TransactionFiltersCard({
  accounts,
  categories,
  filters,
  onReset,
  setFilters,
}: {
  accounts: CashAccount[];
  categories: TransactionCategory[];
  filters: TransactionFilters;
  onReset: () => void;
  setFilters: (filters: TransactionFilters) => void;
}) {
  return (
    <Card className="mb-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 xl:items-end">
        <Field label="Search">
          <input className={inputClass} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Notes, account, category" value={filters.search} />
        </Field>
        <Field label="Type">
          <Select
            options={[{ label: "All types", value: "" }, ...transactionTypes]}
            value={filters.type}
            onChange={(val) => setFilters({ ...filters, type: val })}
          />
        </Field>
        <Field label="Category">
          <Select
            options={[{ label: "All categories", value: "" }, ...categories.map((c) => ({ label: c.name, value: c.id }))]}
            value={filters.category_id}
            onChange={(val) => setFilters({ ...filters, category_id: val })}
          />
        </Field>
        <Field label="Account">
          <Select
            options={[{ label: "All accounts", value: "" }, ...accounts.map((a) => ({ label: a.account_name, value: a.id }))]}
            value={filters.cash_account_id}
            onChange={(val) => setFilters({ ...filters, cash_account_id: val })}
          />
        </Field>
        <Field label="From">
          <input className={inputClass} onChange={(event) => setFilters({ ...filters, from: event.target.value })} type="date" value={filters.from} />
        </Field>
        <Field label="To">
          <input className={inputClass} onChange={(event) => setFilters({ ...filters, to: event.target.value })} type="date" value={filters.to} />
        </Field>
      </div>
      <div className="mt-3 flex justify-end">
        <button className="rounded-xl border border-subtle/50 px-4 py-2 text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all" onClick={onReset} type="button">
          Reset Filters
        </button>
      </div>
    </Card>
  );
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
    <Modal onClose={onClose} size="xl" title={isEditing ? "Edit Transaction" : "Add Transaction"}>
      <p className="mb-5 text-[11px] text-muted font-sans">Manual data entry — not real-time</p>

      <div className="grid gap-4 md:grid-cols-2">
          <Field label="Type">
            <Select
              options={transactionTypes.map((item) => ({ label: item.label, value: item.value }))}
              value={form.type}
              onChange={(val) =>
                setForm({
                  ...form,
                  category_id: "",
                  instrument_id: "",
                  transfer_cash_account_id: "",
                  type: val,
                })
              }
            />
          </Field>
          <Field label="Date">
            <input className={inputClass} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} type="date" value={form.transaction_date} />
          </Field>

          {personal ? (
            <>
              <Field label={transfer ? "Source Account" : "Account"}>
                <Select
                  options={[{ label: "Pilih akun", value: "" }, ...activeAccounts.map((item) => ({ label: `${item.account_name} - ${formatCurrency(item.balance ?? 0, item.currency)}`, value: item.id }))]}
                  value={form.cash_account_id}
                  onChange={(val) => setForm({ ...form, cash_account_id: val })}
                />
              </Field>
              {transfer ? (
                <Field label="Destination Account">
                  <Select
                    options={[{ label: "Pilih akun tujuan", value: "" }, ...activeAccounts.map((item) => ({ label: `${item.account_name} - ${item.currency}`, value: item.id }))]}
                    value={form.transfer_cash_account_id}
                    onChange={(val) => setForm({ ...form, transfer_cash_account_id: val })}
                  />
                </Field>
              ) : (
                <Field label="Category">
                  <Select
                    options={[{ label: "Pilih kategori", value: "" }, ...filteredCategories.map((item) => ({ label: item.name, value: item.id }))]}
                    value={form.category_id}
                    onChange={(val) => setForm({ ...form, category_id: val })}
                  />
                </Field>
              )}
              <Field label="Amount">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, amount: e.target.value })} value={form.amount} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Instrument">
                <Select
                  options={[{ label: "Pilih instrumen", value: "" }, ...instruments.map((item) => ({ label: item.ticker ? `${item.ticker} - ${item.name}` : item.name, value: item.id }))]}
                  value={form.instrument_id}
                  onChange={(val) => setForm({ ...form, instrument_id: val })}
                />
              </Field>
              <Field label="Price">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, price: e.target.value })} value={form.price} />
              </Field>
              <Field label="Units">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, units: e.target.value })} value={form.units} />
              </Field>
            </>
          )}

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
          {form.currency !== "IDR" ? (
            <Field label="Exchange Rate to IDR">
              <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, fx_rate_to_idr: e.target.value })} value={form.fx_rate_to_idr} />
            </Field>
          ) : null}
          {!personal ? (
            <>
              <Field label="Fees">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, fees: e.target.value })} value={form.fees} />
              </Field>
              <Field label="Tax">
                <input className={inputClass} inputMode="decimal" onChange={(e) => setForm({ ...form, tax: e.target.value })} value={form.tax} />
              </Field>
            </>
          ) : null}
          <Field label="Notes">
            <input className={inputClass} onChange={(e) => setForm({ ...form, notes: e.target.value })} value={form.notes} />
          </Field>
      </div>

      <Feedback error={error} errors={errors} />

      <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-xl border border-subtle/50 px-4 py-2.5 text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app disabled:opacity-60 hover:bg-primary-hover transition-colors" disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? "Saving..." : "Save"}
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
    <Modal onClose={onCancel} size="sm" title="Delete Transaction">
      <p className="text-xs text-muted font-sans">Transaction "{label}" will be deleted. Cash balance effects will be automatically reversed for personal transactions.</p>
      {error ? <p className="mt-3 rounded-xl border border-fin-loss/30 bg-fin-loss/5 px-4 py-2.5 text-xs font-semibold text-fin-loss font-sans">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-3">
          <button className="rounded-xl border border-subtle/50 px-4 py-2.5 text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="rounded-xl bg-fin-loss px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 transition-colors" disabled={isDeleting} onClick={onConfirm} type="button">
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
      </div>
    </Modal>
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
  if (!form.transaction_date) errors.push("Transaction date is required.");
  if (!transactionTypes.some((item) => item.value === form.type)) errors.push("Invalid transaction type.");
  if (!form.currency) errors.push("Currency is required.");
  if (form.currency !== "IDR" && (!isNumeric(form.fx_rate_to_idr) || numberValue(form.fx_rate_to_idr) <= 0)) errors.push("Exchange rate is required for non-IDR transactions.");

  if (isPersonalType(form.type)) {
    if (!form.cash_account_id) errors.push("Account must be selected.");
    if (!isNumeric(form.amount) || numberValue(form.amount) <= 0) errors.push("Amount must be greater than 0.");
    if ((form.type === "income" || form.type === "expense") && !form.category_id) errors.push("Category must be selected.");
    if (form.type === "transfer" && !form.transfer_cash_account_id) errors.push("Destination account must be selected.");
    if (form.type === "transfer" && form.cash_account_id && form.transfer_cash_account_id && form.cash_account_id === form.transfer_cash_account_id) {
      errors.push("Source and destination accounts must be different.");
    }
  } else {
    if (!form.instrument_id) errors.push("Instrument must be selected.");
    if (!isNumeric(form.price) || numberValue(form.price) < 0) errors.push("Price must be provided and cannot be negative.");
    if ((form.type === "buy" || form.type === "sell") && (!isNumeric(form.units) || numberValue(form.units) <= 0)) errors.push("Units must be greater than 0 for buy/sell.");
    if (!isNumeric(form.fees) || numberValue(form.fees) < 0) errors.push("Fees cannot be negative.");
    if (!isNumeric(form.tax) || numberValue(form.tax) < 0) errors.push("Tax cannot be negative.");
  }
  return errors;
}

function validateQuickForm(form: QuickForm) {
  const errors: string[] = [];
  if (!form.transaction_date) errors.push("Transaction date is required.");
  if (!form.cash_account_id) errors.push("Account must be selected.");
  if (!form.category_id) errors.push("Category must be selected.");
  if (!isNumeric(form.amount) || numberValue(form.amount) <= 0) errors.push("Amount must be greater than 0.");
  return errors;
}

function quickPayload(form: QuickForm) {
  const amount = numberValue(form.amount);
  return {
    amount,
    cash_account_id: form.cash_account_id,
    category_id: form.category_id,
    currency: "IDR",
    gross_value: amount,
    net_value: amount,
    notes: form.notes || undefined,
    price: amount,
    transaction_date: form.transaction_date,
    type: form.type,
    units: 1,
  };
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

function cleanFilters(filters: TransactionFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value.trim() !== ""));
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

function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl surface-card card-shadow overflow-hidden">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-subtle/50">
            {headers.map((header, index) => (
              <th className="text-left p-4 text-[11px] font-semibold text-muted uppercase tracking-[0.08em] font-sans" key={header}>
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
    adjustment: "Adjustment",
    buy: "Buy Investment",
    dividend: "Dividend",
    expense: "Expense",
    fee: "Fee",
    income: "Income",
    sell: "Sell Investment",
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

const inputClass = "input-field font-sans";
