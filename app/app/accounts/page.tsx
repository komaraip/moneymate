import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AccountForm } from "@/components/forms/account-form";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getAccountTypeLabel } from "@/lib/finance";
import { listAccounts } from "@/lib/services/accounts";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function AccountsPage() {
  const user = await requireUser();
  const accounts = await listAccounts(user.id, {});
  const totalCashBalance = accounts.reduce((sum, account) => sum + Number(account.currentBalance ?? 0), 0);
  const accountsWithoutSnapshot = accounts.filter((account) => !account.latestSnapshotDate).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cashflow"
        title="Accounts"
        description="Create savings, e-wallet, credit, investment cash, and manual cash accounts before adding manual transactions."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Tracked Accounts" value={`${accounts.length}`} />
        <MetricCard
          label="Total Cash Balance"
          value={formatCurrency(totalCashBalance)}
          tone="accent"
          trend="Latest snapshots"
        />
        <MetricCard
          label="Accounts Needing Snapshots"
          value={`${accountsWithoutSnapshot}`}
          tone={accountsWithoutSnapshot > 0 ? "warning" : "success"}
          trend={accountsWithoutSnapshot > 0 ? "Add balances" : "Covered"}
        />
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Add a cash account</h2>
          <p className="text-sm text-muted-foreground">
            Account context comes first in Phase 3, so every manual cashflow entry starts from a known account.
          </p>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Tracked accounts</h2>
          <p className="text-sm text-muted-foreground">
            Open an account to add balance snapshots and inspect its transaction timeline.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts yet"
              description="Create your first account to unlock manual cashflow tracking and account balance snapshots."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {accounts.map((account) => (
                <Link
                  key={account.id}
                  href={`/app/accounts/${account.id}`}
                  className="rounded-[24px] border border-border/70 bg-white/65 p-5 transition hover:border-[hsl(var(--accent)/0.3)] hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.institutionName ?? "Manual account"} - {getAccountTypeLabel(account.accountType)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current balance</p>
                      <p className="font-semibold text-foreground">
                        {account.currentBalance ? formatCurrency(account.currentBalance, account.currency) : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{account.maskedAccountNumber ?? "No masked account number yet"}</span>
                    <span>Snapshot: {formatDate(account.latestSnapshotDate)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
