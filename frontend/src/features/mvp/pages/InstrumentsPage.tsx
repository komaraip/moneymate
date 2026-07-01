import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { PageHeader } from "../components/PageHeader";
import type { AssetCategory, Instrument } from "../types";

type InstrumentForm = {
  type: string;
  ticker: string;
  name: string;
  provider: string;
  currency: string;
  category_id: string;
  is_active: boolean;
};

const emptyForm = (): InstrumentForm => ({
  type: "stock",
  ticker: "",
  name: "",
  provider: "",
  currency: "IDR",
  category_id: "",
  is_active: true,
});

export function InstrumentsPage() {
  const queryClient = useQueryClient();
  const instruments = useQuery({ queryKey: queryKeys.instruments.all, queryFn: mvpApi.instruments });
  const categories = useQuery({ queryKey: queryKeys.assetCategories.all, queryFn: mvpApi.assetCategories });
  const [form, setForm] = useState<InstrumentForm>(emptyForm);
  const [editing, setEditing] = useState<Instrument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Instrument | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const create = useMutation({
    mutationFn: () => mvpApi.createInstrument(toPayload(form)),
    onSuccess: () => {
      closeForm();
      invalidateInstrumentWrites(queryClient);
    },
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Instrumen belum dipilih.");
      return mvpApi.updateInstrument(editing.id, toPayload(form));
    },
    onSuccess: () => {
      closeForm();
      invalidateInstrumentWrites(queryClient);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => mvpApi.deleteInstrument(id),
    onSuccess: () => {
      setDeleteTarget(null);
      invalidateInstrumentWrites(queryClient);
    },
  });

  if (instruments.isLoading) return <LoadingState />;
  if (instruments.isError) return <ErrorState message="Instrumen belum bisa dimuat." />;

  const submit = () => {
    const errors = validateInstrument(form);
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
        <PageHeader description="Master data instrumen investasi" title="Instrumen" />
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          onClick={() => openCreate(setForm, setEditing, setFormOpen, setFormErrors)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Tambah Instrumen
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              {["Tipe", "Ticker", "Nama", "Kategori", "Currency", "Status", "Aksi"].map((header) => (
                <th className="px-4 py-3 text-left" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {instruments.data?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{instrumentTypeLabel(item.type)}</td>
                <td className="px-4 py-3">{item.ticker ?? "-"}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.category_names?.join(", ") || "-"}</td>
                <td className="px-4 py-3">{item.currency}</td>
                <td className="px-4 py-3">{item.is_active ? "Aktif" : "Nonaktif"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-emerald-500 hover:text-emerald-200"
                      onClick={() => openEdit(item, setForm, setEditing, setFormOpen, setFormErrors)}
                      title="Edit instrumen"
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-rose-500 hover:text-rose-200"
                      onClick={() => setDeleteTarget(item)}
                      title="Nonaktifkan instrumen"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {instruments.data?.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={7}>
                  Belum ada instrumen.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {formOpen ? (
        <InstrumentModal
          categories={categories.data ?? []}
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
          label={deleteTarget.ticker ? `${deleteTarget.ticker} - ${deleteTarget.name}` : deleteTarget.name}
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

function InstrumentModal({
  categories,
  error,
  errors,
  form,
  isEditing,
  isSaving,
  onClose,
  onSubmit,
  setForm,
}: {
  categories: AssetCategory[];
  error: string;
  errors: string[];
  form: InstrumentForm;
  isEditing: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setForm: (form: InstrumentForm) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Master data manual</p>
            <h3 className="text-lg font-semibold text-white">{isEditing ? "Edit Instrumen" : "Tambah Instrumen"}</h3>
          </div>
          <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300" onClick={onClose} title="Tutup" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipe">
            <select className={inputClass} onChange={(e) => setForm({ ...form, type: e.target.value })} value={form.type}>
              <option value="stock">Saham</option>
              <option value="etf">ETF</option>
              <option value="mutual_fund">Reksadana</option>
              <option value="gold">Emas</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Kategori">
            <select className={inputClass} onChange={(e) => setForm({ ...form, category_id: e.target.value })} value={form.category_id}>
              <option value="">Tanpa kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ticker">
            <input className={inputClass} onChange={(e) => setForm({ ...form, ticker: e.target.value })} value={form.ticker} />
          </Field>
          <Field label="Nama">
            <input className={inputClass} onChange={(e) => setForm({ ...form, name: e.target.value })} value={form.name} />
          </Field>
          <Field label="Provider">
            <input className={inputClass} onChange={(e) => setForm({ ...form, provider: e.target.value })} value={form.provider} />
          </Field>
          <Field label="Currency">
            <select className={inputClass} onChange={(e) => setForm({ ...form, currency: e.target.value })} value={form.currency}>
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })} value={String(form.is_active)}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
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
        <h3 className="text-lg font-semibold text-white">Nonaktifkan Instrumen</h3>
        <p className="mt-2 text-sm text-zinc-400">Instrumen {label} akan dibuat nonaktif. Transaksi historis tidak dihapus.</p>
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

function openCreate(
  setForm: (form: InstrumentForm) => void,
  setEditing: (item: Instrument | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(null);
  setForm(emptyForm());
  setFormErrors([]);
  setFormOpen(true);
}

function openEdit(
  item: Instrument,
  setForm: (form: InstrumentForm) => void,
  setEditing: (item: Instrument | null) => void,
  setFormOpen: (open: boolean) => void,
  setFormErrors: (errors: string[]) => void,
) {
  setEditing(item);
  setForm({
    type: item.type,
    ticker: item.ticker ?? "",
    name: item.name,
    provider: item.provider ?? "",
    currency: item.currency,
    category_id: item.category_ids?.[0] ?? "",
    is_active: item.is_active ?? true,
  });
  setFormErrors([]);
  setFormOpen(true);
}

function validateInstrument(form: InstrumentForm) {
  const errors: string[] = [];
  if (!["stock", "etf", "mutual_fund", "gold", "cash", "other"].includes(form.type)) errors.push("Tipe instrumen tidak valid.");
  if (!form.name.trim()) errors.push("Nama instrumen wajib diisi.");
  if (!form.currency.trim()) errors.push("Currency wajib diisi.");
  return errors;
}

function toPayload(form: InstrumentForm) {
  return {
    type: form.type,
    ticker: form.ticker.trim() || undefined,
    name: form.name.trim(),
    provider: form.provider.trim() || undefined,
    currency: form.currency,
    category_ids: form.category_id ? [form.category_id] : [],
    is_active: form.is_active,
  };
}

function invalidateInstrumentWrites(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.instruments.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.allocation });
  queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
}

function instrumentTypeLabel(type: string) {
  const labels: Record<string, string> = {
    stock: "Saham",
    etf: "ETF",
    mutual_fund: "Reksadana",
    gold: "Emas",
    cash: "Cash",
    other: "Other",
  };
  return labels[type] ?? type;
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
