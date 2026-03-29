import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ManualTransactionForm } from "@/components/forms/manual-transaction-form";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";
import { getManualTransactionTypeLabel } from "@/lib/finance";
import { listAccounts } from "@/lib/services/accounts";
import { getCashflowReport } from "@/lib/services/reporting";
import { listTransactions } from "@/lib/services/transactions";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function TransactionsPage() {
  const user = await requireUser();
  const [accounts, transactions, cashflow] = await Promise.all([
    listAccounts(user.id, {}),
    listTransactions(user.id, {
      page: "1",
      pageSize: "30"
    }),
    getCashflowReport(user.id, {})
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cashflow"
        title="Transactions"
        description="Manual cash entries live here first, always anchored to a selected account."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tracked Entries" value={`${cashflow.summary.transactionCount}`} />
        <MetricCard label="Period Income" value={formatCurrency(cashflow.summary.income)} tone="success" />
        <MetricCard label="Period Expense" value={formatCurrency(cashflow.summary.expense)} tone="warning" />
        <MetricCard
          label="Net Cashflow"
          value={formatCurrency(cashflow.summary.net)}
          tone={Number(cashflow.summary.net) >= 0 ? "success" : "warning"}
        />
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-xl font-semibold">Add a manual transaction</h2>
          <p className="text-sm text-muted-foreground">
            The account-first flow keeps expenses, income, transfers, and adjustments tied to the right place.
          </p>
        </CardHeader>
        <CardContent>
          <ManualTransactionForm accounts={accounts} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Transaction timeline</h2>
            <p className="text-sm text-muted-foreground">
              A combined view across all currently tracked cash accounts.
            </p>
          </CardHeader>
          <CardContent>
            {transactions.items.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Create an account first, then add a manual transaction to build the cashflow timeline."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Account</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Description</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {transactions.items.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="py-3 pr-4">{formatDate(transaction.transactionDate)}</td>
                        <td className="py-3 pr-4">
                          {transaction.accountId ? (
                            <Link
                              href={`/app/accounts/${transaction.accountId}`}
                              className="font-medium text-[hsl(var(--accent))]"
                            >
                              {transaction.accountName ?? "Account"}
                            </Link>
                          ) : (
                            <span>{transaction.accountName ?? "Unassigned"}</span>
                          )}
                        </td>
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

        <Card>
          <CardHeader className="flex-col items-start gap-2">
            <h2 className="text-xl font-semibold">Top categories this period</h2>
            <p className="text-sm text-muted-foreground">
              Income and expense categories from the current cashflow reporting window.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {cashflow.categories.length === 0 ? (
              <EmptyState
                title="No categorized cashflow yet"
                description="Add categorized income or expense rows to see the breakdown here."
              />
            ) : (
              cashflow.categories.map((entry) => (
                <div
                  key={`${entry.categoryType}-${entry.categoryName}`}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{entry.categoryName}</p>
                    <p className="text-sm text-muted-foreground">{entry.categoryType}</p>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(entry.total)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
