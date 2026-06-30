import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { formatDate } from "../../../lib/format";
import { queryKeys } from "../../../lib/query-keys";
import { mvpApi } from "../api";
import { PageHeader } from "../components/PageHeader";

export function AuditLogPage() {
  const audit = useQuery({ queryKey: queryKeys.auditLogs.all, queryFn: mvpApi.auditLogs });
  if (audit.isLoading) return <LoadingState />;
  if (audit.isError) return <ErrorState message="Audit log belum bisa dimuat." />;
  return (
    <div>
      <PageHeader description="Riwayat create/update/delete data penting" title="Audit Log" />
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-zinc-900 text-zinc-400"><tr>{["Waktu", "Action", "Entity", "Entity ID", "IP"].map((h) => <th className="px-4 py-3 text-left" key={h}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {audit.data?.map((item) => <tr key={item.id}><td className="px-4 py-3">{formatDate(item.created_at)}</td><td className="px-4 py-3">{item.action}</td><td className="px-4 py-3">{item.entity_type}</td><td className="px-4 py-3 font-mono text-xs">{item.entity_id}</td><td className="px-4 py-3">{item.ip_address}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
