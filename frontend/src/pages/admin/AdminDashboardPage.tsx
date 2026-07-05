import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { queryKeys } from "../../utils/query-keys";
import { useAuth } from "../../hooks/useAuth";
import { moneymateApi } from "../../helpers/moneymate-api";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { Users, ShieldCheck, Activity, History } from "lucide-react";
import { motion } from "framer-motion";

export function AdminDashboardPage() {
  const { user } = useAuth();
  const overview = useQuery({ queryKey: queryKeys.admin.overview, queryFn: moneymateApi.adminOverview, enabled: user?.role === "admin" });

  if (user?.role !== "admin") {
    return <ErrorState message="Admin page is only available for admin users." />;
  }
  if (overview.isLoading) return <LoadingState />;
  if (overview.isError) return <ErrorState message="Failed to load admin overview." />;

  const data = overview.data;
  if (!data) return null;

  return (
    <div>
      <PageHeader description="Monitor platform without exposing user financial data" title="Admin Dashboard" />
      <div className="grid gap-3 md:grid-cols-3 lg:gap-4">
        <Metric label="Total Users" value={String(data.total_users)} icon={Users} />
        <Metric label="Active Users" value={String(data.active_users)} icon={Activity} />
        <Metric label="Inactive Users" value={String(data.inactive_users)} icon={Users} />
        <Metric label="Admins" value={String(data.admin_users)} icon={ShieldCheck} />
        <Metric label="Regular Users" value={String(data.regular_users)} icon={Users} />
        <Metric label="Audit Logs (7d)" value={String(data.audit_logs_last_7d)} icon={History} />
      </div>
      <Card className="mt-5">
        <h3 className="text-sm font-bold text-main tracking-tight font-display">Privacy Boundary</h3>
        <p className="mt-2 text-xs leading-6 text-muted font-sans">{data.privacy_statement}</p>
      </Card>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <Card className="relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
      {Icon && (
        <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.04] pointer-events-none">
          <Icon className="size-20 -translate-y-3 translate-x-3" />
        </div>
      )}
      <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-muted mb-2.5 font-sans">{label}</p>
      <p className="text-2xl lg:text-3xl font-bold text-main font-mono tracking-tighter leading-none">{value}</p>
    </Card>
  );
}
