import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
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
import type { AdminUser } from "../../types/moneymate";

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

  if (user?.role !== "admin") {
    return <ErrorState message="Halaman admin hanya tersedia untuk admin." />;
  }
  if (users.isLoading) return <LoadingState />;
  if (users.isError) return <ErrorState message="Daftar pengguna belum bisa dimuat." />;

  return (
    <div>
      <PageHeader description="Kelola metadata akun tanpa membuka data finansial privat" title="Pengguna" />

      <Card className="mb-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_10rem_10rem]">
          <label className="text-sm text-zinc-300">
            <span className="mb-2 block font-medium">Cari pengguna</span>
            <input className={inputClass} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Email atau nama" value={filters.search} />
          </label>
          <label className="text-sm text-zinc-300">
            <span className="mb-2 block font-medium">Role</span>
            <select className={inputClass} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))} value={filters.role}>
              <option value="">Semua</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>
          <label className="text-sm text-zinc-300">
            <span className="mb-2 block font-medium">Status</span>
            <select className={inputClass} onChange={(event) => setFilters((current) => ({ ...current, is_active: event.target.value }))} value={filters.is_active}>
              <option value="">Semua</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Admin tidak melihat transaksi, kas, portofolio, anggaran, atau tujuan tabungan pengguna lain di halaman ini.</p>
      </Card>

      {successMessage ? (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">{successMessage}</div>
      ) : null}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-3 pr-4">Pengguna</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Dibuat</th>
                <th className="py-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(users.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-zinc-100">{item.full_name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">{item.role === "admin" ? "Admin" : "User"}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${item.is_active ? "bg-emerald-500/10 text-emerald-200" : "bg-zinc-800 text-zinc-400"}`}>
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">{formatDate(item.created_at)}</td>
                  <td className="py-3 pr-4 text-right">
                    <button className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-emerald-500 hover:text-emerald-200" onClick={() => openEdit(item, setEditing, setForm)} type="button">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(users.data ?? []).length === 0 ? <p className="mt-4 text-sm text-zinc-500">Tidak ada pengguna untuk filter ini.</p> : null}
      </Card>

      {editing ? (
        <Modal title="Edit Pengguna" onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-white">{editing.full_name}</p>
              <p className="mt-1 text-sm text-zinc-500">{editing.email}</p>
            </div>
            <Field label="Role">
              <select className={inputClass} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as "admin" | "user" }))} value={form.role}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" />
              Akun aktif
            </label>
          </div>
          <div className="mt-4">
            <InlineAlert messages={[errorMessage(update.error)]} tone="error" />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300" onClick={() => setEditing(null)} type="button">
              Batal
            </button>
            <button className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-60" disabled={update.isPending} onClick={() => update.mutate()} type="button">
              Simpan
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

const inputClass = "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500";
