import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "../../components/feedback/ErrorState";
import { InlineAlert } from "../../components/feedback/InlineAlert";
import { LoadingState } from "../../components/feedback/LoadingState";
import { FormField as Field } from "../../components/forms/FormField";
import { formatDate } from "../../utils/format";
import { queryKeys } from "../../utils/query-keys";
import { useAuth } from "../../hooks/useAuth";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import type { AdminUser } from "../../types/moneymate";
import { motion } from "framer-motion";

type Filters = {
  search: string;
  role: string;
  is_active: string;
};

type UserForm = {
  role: "admin" | "user";
  is_active: boolean;
};

export function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({ search: "", role: "", is_active: "" });
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserForm>({ role: "user", is_active: true });
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", full_name: "", password: "", role: "user" as "admin" | "user" });
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const users = useQuery({
    enabled: user?.role === "admin",
    queryKey: queryKeys.admin.users(cleanFilters(filters)),
    queryFn: () => moneymateApi.adminUsers(cleanFilters(filters)),
  });
  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("Pengguna belum dipilih.");
      return moneymateApi.updateAdminUser(editing.id, form);
    },
    onSuccess: () => {
      setEditing(null);
      setSuccessMessage("Pengguna berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(cleanFilters(filters)) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
    },
  });
  const create = useMutation({
    mutationFn: () => moneymateApi.createAdminUser(createForm),
    onSuccess: () => {
      setCreating(false);
      setSuccessMessage("Pengguna berhasil dibuat.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(cleanFilters(filters)) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => moneymateApi.deleteAdminUser(id),
    onSuccess: () => {
      setDeleting(null);
      setSuccessMessage("Pengguna berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users(cleanFilters(filters)) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
    },
  });

  if (user?.role !== "admin") {
    return <ErrorState message="Halaman admin hanya tersedia untuk admin." />;
  }
  if (users.isLoading) return <LoadingState />;
  if (users.isError) return <ErrorState message="Daftar pengguna belum bisa dimuat." />;

  return (
    <div>
      <PageHeader description="Kelola metadata akun tanpa membuka data finansial privat" title="Pengguna">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover"
          onClick={() => {
            setCreateForm({ email: "", full_name: "", password: "", role: "user" });
            setCreating(true);
          }}
          type="button"
        >
          Tambah Pengguna
        </button>
      </PageHeader>

      <Card className="mb-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_10rem_10rem]">
          <label className="text-sm text-muted">
            <span className="mb-2 block font-medium">Cari pengguna</span>
            <input className={inputClass} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Email atau nama" value={filters.search} />
          </label>
          <label className="text-sm text-muted">
            <span className="mb-2 block font-medium">Role</span>
            <Select
              options={[
                { label: "Semua", value: "" },
                { label: "Admin", value: "admin" },
                { label: "User", value: "user" },
              ]}
              value={filters.role}
              onChange={(val) => setFilters((current) => ({ ...current, role: val }))}
            />
          </label>
          <label className="text-sm text-muted">
            <span className="mb-2 block font-medium">Status</span>
            <Select
              options={[
                { label: "Semua", value: "" },
                { label: "Aktif", value: "true" },
                { label: "Nonaktif", value: "false" },
              ]}
              value={filters.is_active}
              onChange={(val) => setFilters((current) => ({ ...current, is_active: val }))}
            />
          </label>
        </div>
        <p className="mt-3 text-sm text-muted">Admin tidak melihat transaksi, kas, portofolio, anggaran, atau tujuan tabungan pengguna lain di halaman ini.</p>
      </Card>

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-fin-gain/30 bg-fin-gain/5 px-4 py-2.5 text-xs font-semibold text-fin-gain font-sans">{successMessage}</div>
      ) : null}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-3 pr-4">Pengguna</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Dibuat</th>
                <th className="py-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {(users.data ?? []).map((item, index) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-main">{item.full_name}</p>
                    <p className="mt-1 text-xs text-muted">{item.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-muted">{item.role === "admin" ? "Admin" : "User"}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${item.is_active ? "bg-success/10 text-emerald-200" : "bg-surface-hover text-muted"}`}>
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted">{formatDate(item.created_at)}</td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-xl p-2 text-muted hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => openEdit(item, setEditing, setForm)} type="button" title="Edit Pengguna">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg border border-subtle p-2 text-muted hover:border-danger hover:text-danger" onClick={() => setDeleting(item)} type="button" disabled={item.id === user?.id} title={item.id === user?.id ? "Tidak dapat menghapus akun sendiri" : "Hapus Pengguna"}>
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(users.data ?? []).length === 0 ? <p className="mt-4 text-sm text-muted">Tidak ada pengguna untuk filter ini.</p> : null}
      </Card>

      {editing ? (
        <Modal title="Edit Pengguna" onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-main">{editing.full_name}</p>
              <p className="mt-1 text-sm text-muted">{editing.email}</p>
            </div>
            <Field label="Role">
              <Select
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "User", value: "user" },
                ]}
                value={form.role}
                onChange={(val) => setForm((current) => ({ ...current, role: val as "admin" | "user" }))}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" />
              Akun aktif
            </label>
          </div>
          <div className="mt-4">
            <InlineAlert messages={[errorMessage(update.error)]} tone="error" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-subtle px-4 py-2 text-sm text-muted" onClick={() => setEditing(null)} type="button">
              Batal
            </button>
            <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover disabled:opacity-60" disabled={update.isPending} onClick={() => update.mutate()} type="button">
              Simpan
            </button>
          </div>
        </Modal>
      ) : null}

      {creating ? (
        <Modal title="Tambah Pengguna" onClose={() => setCreating(false)}>
          <div className="space-y-4">
            <Field label="Nama Lengkap">
              <input className={inputClass} onChange={(event) => setCreateForm((current) => ({ ...current, full_name: event.target.value }))} type="text" value={createForm.full_name} />
            </Field>
            <Field label="Email">
              <input className={inputClass} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} type="email" value={createForm.email} />
            </Field>
            <Field label="Password">
              <input className={inputClass} onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))} type="text" value={createForm.password} />
            </Field>
            <Field label="Role">
              <Select
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "User", value: "user" },
                ]}
                value={createForm.role}
                onChange={(val) => setCreateForm((current) => ({ ...current, role: val as "admin" | "user" }))}
              />
            </Field>
          </div>
          <div className="mt-4">
            <InlineAlert messages={[errorMessage(create.error)]} tone="error" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-subtle px-4 py-2 text-sm text-muted" onClick={() => setCreating(false)} type="button">
              Batal
            </button>
            <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-app transition-all hover:bg-primary-hover disabled:opacity-60" disabled={create.isPending} onClick={() => create.mutate()} type="button">
              Simpan
            </button>
          </div>
        </Modal>
      ) : null}

      {deleting ? (
        <Modal title="Hapus Pengguna" onClose={() => setDeleting(null)}>
          <p className="text-sm text-muted">
            Apakah Anda yakin ingin menghapus akun <strong>{deleting.email}</strong> secara permanen?
            Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh data yang bersangkutan.
          </p>
          <div className="mt-4">
            <InlineAlert messages={[errorMessage(remove.error)]} tone="error" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-subtle px-4 py-2 text-sm text-muted" onClick={() => setDeleting(null)} type="button">
              Batal
            </button>
            <button className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-zinc-50 disabled:opacity-60" disabled={remove.isPending} onClick={() => remove.mutate(deleting.id)} type="button">
              {remove.isPending ? "Menghapus..." : "Hapus Permanen"}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function openEdit(item: AdminUser, setEditing: (item: AdminUser) => void, setForm: (form: UserForm) => void) {
  setEditing(item);
  setForm({ role: item.role === "admin" ? "admin" : "user", is_active: item.is_active });
}

function cleanFilters(filters: Filters) {
  return {
    search: filters.search.trim() || undefined,
    role: filters.role || undefined,
    is_active: filters.is_active || undefined,
  };
}

function errorMessage(error: unknown) {
  if (!error) return "";
  if (error instanceof Error) return error.message;
  return "Request gagal diproses.";
}

const inputClass = "input-field font-sans";
