import { DocumentStatus, ReviewStatus } from "@prisma/client";
import { DashboardSummary } from "@/lib/contracts";
import { prisma } from "@/lib/db/prisma";
import { decimalToString } from "@/lib/utils/decimal";
import { listAccounts } from "./accounts";
import { getApprovedActivities, getApprovedHoldings } from "./investments";
import { mapDocumentListItem } from "./mappers";
import { getCashflowReport } from "./reporting";
import { listTransactions } from "./transactions";

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [
    processedDocuments,
    pendingReviewItems,
    recentDocuments,
    holdings,
    recentActivities,
    accounts,
    cashflow,
    recentTransactions
  ] = await Promise.all([
    prisma.document.count({
      where: {
        userId,
        parseStatus: {
          in: [DocumentStatus.PARSED, DocumentStatus.NEEDS_REVIEW, DocumentStatus.APPROVED]
        }
      }
    }),
    prisma.parsedField.count({
      where: {
        document: {
          userId
        },
        requiresReview: true,
        reviewStatus: ReviewStatus.PENDING
      }
    }),
    prisma.document.findMany({
      where: {
        userId
      },
      orderBy: {
        uploadedAt: "desc"
      },
      take: 5
    }),
    getApprovedHoldings(userId),
    getApprovedActivities(userId),
    listAccounts(userId, {}),
    getCashflowReport(userId, {}),
    listTransactions(userId, {
      page: "1",
      pageSize: "6"
    })
  ]);

  const totalHoldingsValue = holdings.reduce((sum, holding) => sum + Number(holding.marketValue ?? 0), 0);
  const totalCashBalance = accounts.reduce((sum, account) => sum + Number(account.currentBalance ?? 0), 0);
  const alerts: string[] = [];
  if (pendingReviewItems > 0) {
    alerts.push(`${pendingReviewItems} review item(s) still need confirmation.`);
  }
  if (holdings.length === 0) {
    alerts.push("No approved holdings yet. Approve a parsed document to populate the investments view.");
  }
  if (accounts.length === 0) {
    alerts.push("No cash accounts yet. Add an account to unlock manual cashflow tracking.");
  }

  return {
    metrics: {
      processedDocuments,
      pendingReviewItems,
      totalHoldingsValue: decimalToString(totalHoldingsValue) ?? "0",
      uniqueSecurities: new Set(holdings.map((holding) => holding.securityId)).size,
      totalCashBalance: decimalToString(totalCashBalance) ?? "0",
      monthlyIncome: cashflow.summary.income,
      monthlyExpenses: cashflow.summary.expense,
      monthlyNetCashflow: cashflow.summary.net
    },
    recentDocuments: recentDocuments.map(mapDocumentListItem),
    recentActivities: recentActivities.slice(0, 8),
    recentCashTransactions: recentTransactions.items,
    alerts
  };
}
