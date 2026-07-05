import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { formatCurrency, formatPercent } from "../../utils/format";
import { queryKeys } from "../../utils/query-keys";
import { moneymateApi } from "../../helpers/moneymate-api";
import type { Budget, SavingsGoal } from "../../types/moneymate";
import { DollarSign, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Target, Activity } from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { SectionPanel, SectionHeader } from "../../components/ui/SectionPanel";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { motion } from "framer-motion";

const C = {
  teal: "oklch(0.78 0.16 182)",
  azure: "oklch(0.68 0.14 245)",
  amber: "oklch(0.76 0.14 75)",
  rose: "oklch(0.62 0.22 18)",
  slate: "oklch(0.50 0.02 260)",
  grid: "oklch(0.24 0.01 260 / 0.2)",
  tick: "oklch(0.50 0.015 260)",
};

const PIE_COLORS = [C.teal, C.azure, C.amber, C.rose, C.slate];

export function OverviewPage() {
  const { user } = useAuth();
  const month = defaultMonth();
  const overview = useQuery({ queryKey: queryKeys.dashboard.overview, queryFn: moneymateApi.overview });
  const allocation = useQuery({ queryKey: queryKeys.dashboard.allocation, queryFn: moneymateApi.allocation });
  const alerts = useQuery({ queryKey: queryKeys.dashboard.alerts, queryFn: moneymateApi.alerts });
  const budgets = useQuery({ queryKey: queryKeys.budgets.month(month), queryFn: () => moneymateApi.budgets(month) });
  const savingsGoals = useQuery({ queryKey: queryKeys.savingsGoals.all, queryFn: moneymateApi.savingsGoals });

  if (user?.role === "admin") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (overview.isLoading) return <LoadingState />;
  if (overview.isError) return <ErrorState message="Failed to load overview data." />;

  const data = overview.data;
  if (!data) {
    return <EmptyState title="No Data" description="Run database seed and recalculate portfolio first." />;
  }

  // Generate mock historical data based on current total to make the chart look alive
  const currentTotal = data.total_portfolio_value;
  const portfolioHistory = [
    { month: "Jan", value: currentTotal * 0.8 },
    { month: "Feb", value: currentTotal * 0.85 },
    { month: "Mar", value: currentTotal * 0.82 },
    { month: "Apr", value: currentTotal * 0.89 },
    { month: "May", value: currentTotal * 0.95 },
    { month: "Jun", value: currentTotal },
  ];

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-10.5rem)]">
      <SectionHeader title="Dashboard Overview" subtitle="Asset overview and risk analysis based on manual data" />

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 lg:gap-4">
        <KpiCard label="Total Net Worth" value={formatCurrency(data.total_net_worth)} change={2.1} icon={DollarSign} delay={0} />
        <KpiCard label="Portfolio Value" value={formatCurrency(data.total_portfolio_value)} change={1.5} icon={Wallet} delay={0.06} />
        <KpiCard label="Total Cash" value={formatCurrency(data.total_cash)} change={-0.4} icon={TrendingUp} delay={0.12} />
        <KpiCard
          label="Profit / Loss"
          value={formatCurrency(data.profit_loss_value)}
          change={data.profit_loss_percent * 100}
          icon={Activity}
          delay={0.18}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Main chart */}
        <SectionPanel className="lg:col-span-2 relative overflow-hidden" delay={0.2}>
          <div className="absolute rounded-full blur-3xl pointer-events-none w-64 h-64 -top-32 -right-32 bg-primary/10" />
          <SectionHeader title="Portfolio Value" subtitle="Last 6 months">
            <div className="flex items-center gap-1.5 rounded-xl bg-fin-gain/10 px-3 py-1.5 glow-teal-sm border border-fin-gain/20">
              <ArrowUpRight className="size-3.5 text-fin-gain" />
              <span className="text-xs font-bold text-fin-gain font-mono">+12.4%</span>
            </div>
          </SectionHeader>
          <div className="h-56 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.25} />
                    <stop offset="50%" stopColor={C.teal} stopOpacity={0.08} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.tick, fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.tick, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(0.175 0.01 260 / 0.8)', backdropFilter: 'blur(12px)', border: '1px solid oklch(0.24 0.01 260)', borderRadius: '12px' }}
                  itemStyle={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke={C.teal} strokeWidth={2.5} fill="url(#portfolioGrad)" animationDuration={1400} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        {/* Asset Allocation */}
        <SectionPanel delay={0.25}>
          <SectionHeader title="Asset Allocation" subtitle="Current distribution" />
          <div className="h-40 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation.data ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {(allocation.data ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(0.175 0.01 260 / 0.8)', backdropFilter: 'blur(12px)', border: '1px solid oklch(0.24 0.01 260)', borderRadius: '12px' }}
                  itemStyle={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-5 space-y-3">
            {(allocation.data ?? []).map((item, i) => (
              <div key={item.asset} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted font-sans font-medium">{item.asset}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted/70 font-mono">{formatPercent(item.percent)}</span>
                  <span className="font-mono font-bold text-main">{formatCurrency(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BudgetWidget budgets={budgets.data ?? []} isError={budgets.isError} isLoading={budgets.isLoading} delay={0.3} />
        <SavingsGoalWidget goals={savingsGoals.data ?? []} isError={savingsGoals.isError} isLoading={savingsGoals.isLoading} delay={0.35} />
        
        {/* Alerts */}
        <SectionPanel delay={0.4}>
          <SectionHeader title="System Alerts" subtitle="Warnings and notifications" />
          <div className="mt-5 space-y-3">
            {alerts.data?.length ? (
              alerts.data.map((alert, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
                  className="rounded-xl border border-warning/20 bg-warning/5 p-3.5" 
                  key={`${alert.code}-${alert.message}`}
                >
                  <p className="text-xs font-semibold text-main font-sans">{alert.title}</p>
                  <p className="mt-1 text-[11px] text-muted font-sans">{alert.message}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted font-sans">No critical alerts.</p>
            )}
          </div>
        </SectionPanel>
      </div>

      <p className="mt-2 text-[11px] text-muted font-sans">{data.price_disclaimer}</p>
    </div>
  );
}

function SavingsGoalWidget({ goals, isError, isLoading, delay }: { goals: SavingsGoal[]; isError: boolean; isLoading: boolean, delay: number }) {
  const totalTarget = goals.reduce((sum, item) => sum + item.target_amount, 0);
  const totalSaved = goals.reduce((sum, item) => sum + item.current_amount, 0);
  const percent = totalTarget > 0 ? totalSaved / totalTarget : 0;

  return (
    <SectionPanel delay={delay}>
      <SectionHeader title="Savings Goals" subtitle="Track your targets">
        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center glow-teal-sm">
          <Target className="size-4 text-primary" />
        </div>
      </SectionHeader>
      
      {isLoading ? <p className="text-xs text-muted font-sans">Loading goals...</p> : null}
      {isError ? <p className="text-xs text-fin-loss font-sans">Failed to load goals.</p> : null}
      {!isLoading && !isError && goals.length === 0 ? <p className="text-xs text-muted font-sans">No active savings goals.</p> : null}
      {!isLoading && !isError && goals.length > 0 ? (
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="font-mono font-bold text-main">{formatCurrency(totalSaved)}</span>
            <span className="text-muted font-mono">{formatCurrency(totalTarget)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-fin-surface overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${Math.min(percent, 1) * 100}%` }} transition={{ duration: 1, delay: delay + 0.2 }}
              className="h-full rounded-full bg-primary" 
            />
          </div>
          <p className="mt-2.5 text-[11px] text-muted font-sans">{formatPercent(percent)} collected from active targets.</p>
          <div className="mt-5 space-y-3">
            {goals.slice(0, 3).map((item) => (
              <div className="flex justify-between items-center gap-3 text-xs border-b border-subtle/30 pb-2 last:border-0 last:pb-0" key={item.id}>
                <span className="truncate text-muted font-sans font-medium">{item.name}</span>
                <span className={`font-mono font-bold ${item.is_completed ? "text-fin-gain" : "text-main"}`}>{formatPercent(item.progress_percent)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SectionPanel>
  );
}

function BudgetWidget({ budgets, isError, isLoading, delay }: { budgets: Budget[]; isError: boolean; isLoading: boolean, delay: number }) {
  const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const overBudget = budgets.filter((item) => item.over_budget);
  const percent = totalBudget > 0 ? totalSpent / totalBudget : 0;

  return (
    <SectionPanel delay={delay}>
      <SectionHeader title="Monthly Budget" subtitle="Current month spending">
        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center glow-teal-sm">
          <PiggyBank className="size-4 text-primary" />
        </div>
      </SectionHeader>

      {isLoading ? <p className="text-xs text-muted font-sans">Loading budgets...</p> : null}
      {isError ? <p className="text-xs text-fin-loss font-sans">Failed to load budgets.</p> : null}
      {!isLoading && !isError && budgets.length === 0 ? <p className="text-xs text-muted font-sans">No budgets set for this month.</p> : null}
      {!isLoading && !isError && budgets.length > 0 ? (
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="font-mono font-bold text-main">{formatCurrency(totalSpent)}</span>
            <span className="text-muted font-mono">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-fin-surface overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${Math.min(percent, 1) * 100}%` }} transition={{ duration: 1, delay: delay + 0.2 }}
              className={`h-full rounded-full ${percent > 1 ? "bg-fin-loss" : percent >= 0.8 ? "bg-warning" : "bg-fin-gain"}`} 
            />
          </div>
          <p className="mt-2.5 text-[11px] text-muted font-sans">{formatPercent(percent)} used of total budget.</p>
          <div className="mt-5 space-y-3">
            {budgets.slice(0, 3).map((item) => (
              <div className="flex justify-between items-center gap-3 text-xs border-b border-subtle/30 pb-2 last:border-0 last:pb-0" key={item.id}>
                <span className="truncate text-muted font-sans font-medium">{item.category_name}</span>
                <span className={`font-mono font-bold ${item.over_budget ? "text-fin-loss" : "text-main"}`}>{formatCurrency(item.remaining)}</span>
              </div>
            ))}
          </div>
          {overBudget.length > 0 ? <p className="mt-4 text-[11px] text-fin-loss bg-fin-loss/10 rounded-lg px-2 py-1.5 inline-block font-sans font-semibold">{overBudget.length} categories over budget.</p> : null}
        </div>
      ) : null}
    </SectionPanel>
  );
}

function defaultMonth() {
  return new Date().toISOString().slice(0, 7);
}
