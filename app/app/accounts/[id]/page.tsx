import { notFound } from "next/navigation";
import { BalanceSnapshotForm } from "@/components/forms/balance-snapshot-form";
import { ManualTransactionForm } from "@/components/forms/manual-transaction-form";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getAccountTypeLabel, getManualTransactionTypeLabel } from "@/lib/finance";
import { getAccountDetail } from "@/lib/services/accounts";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function AccountDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const detail = await getAccountDetail(user.id, id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cashflow"
        title={detail.account.name}
        description={`${detail.account.institutionName ?? "Manual account"} - ${getAccountTypeLabel(detail.account.accountType)} - ${detail.account.maskedAccountNumber ?? "No masked account number"}${detail.account.accountGroup ? ` - Group: ${detail.account.accountGroup}` : ""}`}
        action={
          <div className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest balance</p>
            <p className="text-lg font-semibold text-foreground">
              {detail.account.currentBalance
                ? formatCurrency(detail.account.currentBalance, detail.account.currency)
                : "-"}
            </p>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Add balance snapshot</h2>
            <p className="text-sm text-muted-foreground">
              Track how this account balance changes over time with manual snapshots.
            </p>
          </CardHeader>
          <CardContent>
            <BalanceSnapshotForm accountId={detail.account.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Add manual transaction</h2>
            <p className="text-sm text-muted-foreground">
              Record income, expenses, transfers, or adjustments against this account.
            </p>
          </CardHeader>
          <CardContent>
            <ManualTransactionForm
              accounts={[
                {
                  id: detail.account.id,
                  name: detail.account.name,
                  currency: detail.account.currency,
                  accountType: detail.account.accountType
                }
              ]}
              defaultAccountId={detail.account.id}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Balance history</h2>
          <p className="text-sm text-muted-foreground">The latest 12 snapshots for this account.</p>
        </CardHeader>
        <CardContent>
          {detail.snapshots.length === 0 ? (
            <EmptyState
              title="No balance snapshots yet"
              description="Add the first snapshot to anchor this account's cash position."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Balance</th>
                    <th className="pb-3 pr-4">Available</th>
                    <th className="pb-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {detail.snapshots.map((snapshot) => (
                    <tr key={snapshot.id}>
                      <td className="py-3 pr-4">{formatDate(snapshot.snapshotDate)}</td>
                      <td className="py-3 pr-4">
                        {formatCurrency(snapshot.balance, detail.account.currency)}
                      </td>
                      <td className="py-3 pr-4">
                        {snapshot.availableBalance
                          ? formatCurrency(snapshot.availableBalance, detail.account.currency)
                          : "-"}
                      </td>
                      <td className="py-3">{snapshot.sourceType.replaceAll("_", " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Recent transactions</h2>
          <p className="text-sm text-muted-foreground">The latest manual and imported cash movements for this account.</p>
        </CardHeader>
        <CardContent>
          {detail.recentTransactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Add the first manual transaction to begin the account timeline."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {detail.recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="py-3 pr-4">{formatDate(transaction.transactionDate)}</td>
                      <td className="py-3 pr-4">{getManualTransactionTypeLabel(transaction.transactionType)}</td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          {transaction.notes ? <p className="text-muted-foreground">{transaction.notes}</p> : null}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{transaction.categoryName ?? "-"}</td>
                      <td className="py-3">{formatCurrency(transaction.amount, transaction.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
