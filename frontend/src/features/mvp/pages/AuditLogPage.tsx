import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatDate } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

const actions = ["create", "update", "delete", "confirm_import"];
const entityTypes = ["transaction", "instrument", "cash_account", "price_snapshot", "import_job", "asset_category"];

export function AuditLogPage() {
  const [filters, setFilters] = useState({ entity_type: "", action: "" });
  const audit = useQuery({
    queryKey: queryKeys.auditLogs.filtered(filters),
    queryFn: () => mvpApi.auditLogs(filters),
  });

  if (audit.isLoading) return <LoadingState />;
  if (audit.isError) return <ErrorState message="Audit log belum bisa dimuat." />;

  return (
    <div>
      <PageHeader description="Riwayat perubahan data penting" title="Audit Log" />

      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select className={inputClass} onChange={(event) => setFilters({ ...filters, entity_type: event.target.value })} value={filters.entity_type}>
            <option value="">Semua entity</option>
            {entityTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className={inputClass} onChange={(event) => setFilters({ ...filters, action: event.target.value })} value={filters.action}>
            <option value="">Semua action</option>
            {actions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200" onClick={() => setFilters({ entity_type: "", action: "" })} type="button">
            Reset Filter
          </button>
        </div>
      </Card>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              {["Waktu", "Action", "Entity", "Entity ID", "IP"].map((header) => (
                <th className="px-4 py-3 text-left" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {audit.data?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                <td className="px-4 py-3">{item.action}</td>
                <td className="px-4 py-3">{item.entity_type}</td>
                <td className="px-4 py-3 font-mono text-xs">{item.entity_id}</td>
                <td className="px-4 py-3">{item.ip_address}</td>
              </tr>
            ))}
            {audit.data?.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-zinc-500" colSpan={5}>
                  Audit log belum ada untuk filter ini.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass = "rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500";
