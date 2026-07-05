import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { queryKeys } from "../../utils/query-keys";
import { useAuth } from "../../hooks/useAuth";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

export function AdminDashboardPage() {
  const { user } = useAuth();
  const overview = useQuery({ queryKey: queryKeys.admin.overview, queryFn: moneymateApi.adminOverview, enabled: user?.role === "admin" });

  if (user?.role !== "admin") {
    return <ErrorState message="Halaman admin hanya tersedia untuk admin." />;
  }
  if (overview.isLoading) return <LoadingState />;
  if (overview.isError) return <ErrorState message="Ringkasan admin belum bisa dimuat." />;

  const data = overview.data;
  if (!data) return null;

  return (
    <div>
      <PageHeader description="Pantau platform tanpa membuka data finansial privat pengguna" title="Admin Dashboard" />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Total Pengguna" value={String(data.total_users)} />
        <Metric label="Pengguna Aktif" value={String(data.active_users)} />
        <Metric label="Pengguna Nonaktif" value={String(data.inactive_users)} />
        <Metric label="Admin" value={String(data.admin_users)} />
        <Metric label="User" value={String(data.regular_users)} />
        <Metric label="Audit 7 Hari" value={String(data.audit_logs_last_7d)} />
      </div>
      <Card className="mt-5">
        <h3 className="font-semibold text-main">Batas Privasi Admin</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{data.privacy_statement}</p>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-main">{value}</p>
    </Card>
  );
}
