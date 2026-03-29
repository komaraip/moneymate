import { CashflowMode, DocumentStatus, ReviewStatus } from "@prisma/client";
import {
  BalanceReport,
  CashflowReport,
  DocumentHealthReport,
  InvestmentReport
} from "@/lib/contracts";
import { prisma } from "@/lib/db/prisma";
import { cashAccountTypes } from "@/lib/finance";
import { decimalToNumber, decimalToString } from "@/lib/utils/decimal";
import { listDocuments } from "./documents";
import { getApprovedHoldings } from "./investments";
import { mapDocumentListItem } from "./mappers";

function parseOptionalDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function resolveDateRange(fromRaw?: string, toRaw?: string) {
  const now = new Date();
  const parsedTo = parseOptionalDate(toRaw) ?? endOfMonth(now);
  const parsedFrom = parseOptionalDate(fromRaw) ?? startOfMonth(addMonths(parsedTo, -5));

  return {
    from: parsedFrom,
    to: parsedTo
  };
}

function buildMonthlyKeys(from: Date, to: Date) {
  const keys: string[] = [];
  let cursor = startOfMonth(from);

  while (cursor <= to) {
    keys.push(formatMonthKey(cursor));
    cursor = addMonths(cursor, 1);
  }

  return keys;
}

function normalizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function calculateDocumentSimilarity(
  left: {
    filename: string;
    sha256Hash: string | null;
    fileSizeBytes: number;
    documentType: string;
    statementStartDate: Date | null;
    statementEndDate: Date | null;
    uploadedAt: Date;
  },
  right: {
    filename: string;
    sha256Hash: string | null;
    fileSizeBytes: number;
    documentType: string;
    statementStartDate: Date | null;
    statementEndDate: Date | null;
    uploadedAt: Date;
  }
) {
  if (left.sha256Hash && left.sha256Hash === right.sha256Hash) {
    return 1;
  }

  let score = 0;
  if (normalizeFilename(left.filename) === normalizeFilename(right.filename)) {
    score += 0.45;
  }

  if (left.documentType === right.documentType && left.documentType !== "UNKNOWN") {
    score += 0.15;
  }

  if (
    left.statementStartDate &&
    left.statementEndDate &&
    right.statementStartDate &&
    right.statementEndDate &&
    left.statementStartDate.toISOString() === right.statementStartDate.toISOString() &&
    left.statementEndDate.toISOString() === right.statementEndDate.toISOString()
  ) {
    score += 0.25;
  }

  const sizeDenominator = Math.max(left.fileSizeBytes, right.fileSizeBytes, 1);
  const sizeDelta = Math.abs(left.fileSizeBytes - right.fileSizeBytes) / sizeDenominator;
  if (sizeDelta <= 0.02) {
    score += 0.1;
  }

  const uploadedDeltaDays = Math.abs(left.uploadedAt.getTime() - right.uploadedAt.getTime()) / (24 * 60 * 60 * 1000);
  if (uploadedDeltaDays <= 7) {
    score += 0.05;
  }

  return Number(Math.min(1, score).toFixed(4));
}

function pickLatestNumericValue<T extends { snapshotDate: Date }>(
  rows: T[],
  targetDate: Date,
  valueGetter: (row: T) => number
) {
  let latestValue = 0;

  for (const row of rows) {
    if (row.snapshotDate > targetDate) {
      break;
    }

    latestValue = valueGetter(row);
  }

  return latestValue;
}

function normalizeDescription(value: string) {
  return value.toLowerCase();
}

function isInvestmentDescriptor(description: string, keyword: "dividend" | "sale_proceeds" | "broker_fee") {
  const normalized = normalizeDescription(description);
  if (keyword === "dividend") {
    return normalized.includes("dividend");
  }

  if (keyword === "sale_proceeds") {
    return normalized.includes("sale") || normalized.includes("sell");
  }

  return (
    normalized.includes("broker fee") ||
    normalized.includes("brokerage fee") ||
    normalized.includes("stamp duty") ||
    normalized.includes("levy")
  );
}

async function getOrCreateReportPreference(userId: string) {
  return prisma.reportPreference.upsert({
    where: {
      userId
    },
    update: {},
    create: {
      userId,
      defaultCashflowMode: CashflowMode.SEPARATE,
      includeDividendsInIncome: true,
      includeStockSaleProceedsInIncome: false,
      includeBrokerFeesInExpenses: false,
      includeInvestmentCashInTotalCash: true
    }
  });
}

export async function getCashflowReport(
  userId: string,
  query: Record<string, string | string[] | undefined> = {}
): Promise<CashflowReport> {
  const fromRaw = typeof query.from === "string" ? query.from : undefined;
  const toRaw = typeof query.to === "string" ? query.to : undefined;
  const { from, to } = resolveDateRange(fromRaw, toRaw);
  const requestedModeRaw = typeof query.mode === "string" ? query.mode.toUpperCase() : undefined;
  const preferences = await getOrCreateReportPreference(userId);
  const mode =
    requestedModeRaw === CashflowMode.COMBINED || requestedModeRaw === CashflowMode.SEPARATE
      ? (requestedModeRaw as CashflowMode)
      : preferences.defaultCashflowMode;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: from,
        lte: to
      }
    },
    include: {
      category: {
        select: {
          name: true,
          categoryType: true
        }
      },
      account: {
        select: {
          accountType: true
        }
      }
    },
    orderBy: {
      transactionDate: "asc"
    }
  });

  let income = 0;
  let expense = 0;
  let regularIncome = 0;
  let regularExpense = 0;
  let investmentIncome = 0;
  let investmentExpense = 0;
  let regularTransactionCount = 0;
  let investmentTransactionCount = 0;
  const monthly = new Map<string, { income: number; expense: number }>();
  const categories = new Map<string, { categoryName: string; categoryType: string; total: number }>();

  for (const month of buildMonthlyKeys(from, to)) {
    monthly.set(month, {
      income: 0,
      expense: 0
    });
  }

  for (const transaction of transactions) {
    const amount = decimalToNumber(transaction.amount);
    const monthKey = formatMonthKey(transaction.transactionDate);
    const bucket = monthly.get(monthKey) ?? {
      income: 0,
      expense: 0
    };
    const isInvestmentAccount = transaction.account?.accountType === "INVESTMENT_CASH_ACCOUNT";
    const description = transaction.description ?? "";

    if (isInvestmentAccount) {
      investmentTransactionCount += 1;
    } else {
      regularTransactionCount += 1;
    }

    if (transaction.transactionType === "income") {
      if (isInvestmentAccount) {
        investmentIncome += amount;
      } else {
        regularIncome += amount;
      }
    }

    if (transaction.transactionType === "expense") {
      if (isInvestmentAccount) {
        investmentExpense += amount;
      } else {
        regularExpense += amount;
      }
    }

    const includeInvestmentByPreference =
      (transaction.transactionType === "income" &&
        isInvestmentDescriptor(description, "dividend") &&
        preferences.includeDividendsInIncome) ||
      (transaction.transactionType === "income" &&
        isInvestmentDescriptor(description, "sale_proceeds") &&
        preferences.includeStockSaleProceedsInIncome) ||
      (transaction.transactionType === "expense" &&
        isInvestmentDescriptor(description, "broker_fee") &&
        preferences.includeBrokerFeesInExpenses);
    const includeInGeneral = !isInvestmentAccount
      ? true
      : mode === CashflowMode.COMBINED
        ? preferences.includeInvestmentCashInTotalCash || includeInvestmentByPreference
        : includeInvestmentByPreference;

    if (includeInGeneral && transaction.transactionType === "income") {
      income += amount;
      bucket.income += amount;
    }

    if (includeInGeneral && transaction.transactionType === "expense") {
      expense += amount;
      bucket.expense += amount;
    }

    if (
      includeInGeneral &&
      (transaction.transactionType === "income" || transaction.transactionType === "expense") &&
      transaction.category
    ) {
      const categoryKey = `${transaction.category.categoryType}:${transaction.category.name}`;
      const existing = categories.get(categoryKey) ?? {
        categoryName: transaction.category.name,
        categoryType: transaction.category.categoryType,
        total: 0
      };

      existing.total += amount;
      categories.set(categoryKey, existing);
    }

    monthly.set(monthKey, bucket);
  }

  return {
    mode,
    summary: {
      periodStart: from.toISOString(),
      periodEnd: to.toISOString(),
      income: decimalToString(income) ?? "0",
      expense: decimalToString(expense) ?? "0",
      net: decimalToString(income - expense) ?? "0",
      transactionCount: transactions.filter((transaction) => {
        if (transaction.account?.accountType !== "INVESTMENT_CASH_ACCOUNT") {
          return true;
        }

        const description = transaction.description ?? "";
        const includeInvestmentByPreference =
          (transaction.transactionType === "income" &&
            isInvestmentDescriptor(description, "dividend") &&
            preferences.includeDividendsInIncome) ||
          (transaction.transactionType === "income" &&
            isInvestmentDescriptor(description, "sale_proceeds") &&
            preferences.includeStockSaleProceedsInIncome) ||
          (transaction.transactionType === "expense" &&
            isInvestmentDescriptor(description, "broker_fee") &&
            preferences.includeBrokerFeesInExpenses);

        if (mode === CashflowMode.COMBINED) {
          return preferences.includeInvestmentCashInTotalCash || includeInvestmentByPreference;
        }

        return includeInvestmentByPreference;
      }).length
    },
    streams: {
      regular: {
        income: decimalToString(regularIncome) ?? "0",
        expense: decimalToString(regularExpense) ?? "0",
        net: decimalToString(regularIncome - regularExpense) ?? "0",
        transactionCount: regularTransactionCount
      },
      investment: {
        income: decimalToString(investmentIncome) ?? "0",
        expense: decimalToString(investmentExpense) ?? "0",
        net: decimalToString(investmentIncome - investmentExpense) ?? "0",
        transactionCount: investmentTransactionCount
      }
    },
    monthly: [...monthly.entries()].map(([month, totals]) => ({
      month,
      income: decimalToString(totals.income) ?? "0",
      expense: decimalToString(totals.expense) ?? "0",
      net: decimalToString(totals.income - totals.expense) ?? "0"
    })),
    categories: [...categories.values()]
      .sort((left, right) => right.total - left.total)
      .slice(0, 8)
      .map((entry) => ({
        categoryName: entry.categoryName,
        categoryType: entry.categoryType,
        total: decimalToString(entry.total) ?? "0"
      }))
  };
}

export async function getBalanceReport(
  userId: string,
  query: Record<string, string | string[] | undefined> = {}
): Promise<BalanceReport> {
  const fromRaw = typeof query.from === "string" ? query.from : undefined;
  const toRaw = typeof query.to === "string" ? query.to : undefined;
  const { from, to } = resolveDateRange(fromRaw, toRaw);
  const monthKeys = buildMonthlyKeys(from, to);
  const preferences = await getOrCreateReportPreference(userId);

  const [accounts, currentHoldings, accountSnapshots, holdingSnapshots] = await Promise.all([
    prisma.account.findMany({
      where: {
        userId,
        accountType: {
          in: [...cashAccountTypes]
        },
        isActive: true
      },
      include: {
        snapshots: {
          orderBy: [
            {
              snapshotDate: "desc"
            },
            {
              createdAt: "desc"
            }
          ],
          take: 1
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    }),
    getApprovedHoldings(userId),
    prisma.accountSnapshot.findMany({
      where: {
        account: {
          userId,
          accountType: {
            in: [...cashAccountTypes]
          }
        },
        snapshotDate: {
          lte: to
        }
      },
      include: {
        account: {
          select: {
            id: true,
            accountType: true,
            includeInTotalCash: true
          }
        }
      },
      orderBy: [
        {
          snapshotDate: "asc"
        },
        {
          createdAt: "asc"
        }
      ]
    }),
    prisma.holdingSnapshot.findMany({
      where: {
        userId,
        reviewStatus: ReviewStatus.APPROVED,
        snapshotDate: {
          lte: to
        }
      },
      orderBy: [
        {
          snapshotDate: "asc"
        },
        {
          createdAt: "asc"
        }
      ]
    })
  ]);

  const accountSnapshotsByAccount = new Map<string, typeof accountSnapshots>();
  for (const snapshot of accountSnapshots) {
    const includeByAccount =
      snapshot.account.includeInTotalCash &&
      (snapshot.account.accountType !== "INVESTMENT_CASH_ACCOUNT" || preferences.includeInvestmentCashInTotalCash);
    if (!includeByAccount) {
      continue;
    }

    const existing = accountSnapshotsByAccount.get(snapshot.account.id) ?? [];
    existing.push(snapshot);
    accountSnapshotsByAccount.set(snapshot.account.id, existing);
  }

  const holdingSnapshotsByKey = new Map<string, typeof holdingSnapshots>();
  for (const snapshot of holdingSnapshots) {
    const key = `${snapshot.securityId}:${snapshot.investmentAccountId}`;
    const existing = holdingSnapshotsByKey.get(key) ?? [];
    existing.push(snapshot);
    holdingSnapshotsByKey.set(key, existing);
  }

  const monthly = monthKeys.map((month) => {
    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const monthEnd = endOfMonth(monthStart) > to ? to : endOfMonth(monthStart);

    const cashBalance = [...accountSnapshotsByAccount.values()].reduce(
      (sum, snapshots) => sum + pickLatestNumericValue(snapshots, monthEnd, (snapshot) => decimalToNumber(snapshot.balance)),
      0
    );
    const investmentValue = [...holdingSnapshotsByKey.values()].reduce(
      (sum, snapshots) => sum + pickLatestNumericValue(snapshots, monthEnd, (snapshot) => decimalToNumber(snapshot.marketValue)),
      0
    );

    return {
      month,
      cashBalance: decimalToString(cashBalance) ?? "0",
      investmentValue: decimalToString(investmentValue) ?? "0",
      netWorth: decimalToString(cashBalance + investmentValue) ?? "0"
    };
  });

  const totalCash = accounts.reduce((sum, account) => {
    const includeByAccount =
      account.includeInTotalCash &&
      (account.accountType !== "INVESTMENT_CASH_ACCOUNT" || preferences.includeInvestmentCashInTotalCash);
    if (!includeByAccount) {
      return sum;
    }

    return sum + decimalToNumber(account.snapshots[0]?.balance);
  }, 0);
  const totalInvestments = currentHoldings.reduce((sum, holding) => sum + Number(holding.marketValue ?? 0), 0);

  return {
    summary: {
      totalCash: decimalToString(totalCash) ?? "0",
      totalInvestments: decimalToString(totalInvestments) ?? "0",
      totalNetWorth: decimalToString(totalCash + totalInvestments) ?? "0"
    },
    monthly,
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      institutionName: account.institutionName ?? null,
      accountType: account.accountType,
      accountSubtype: account.accountSubtype ?? null,
      accountNickname: account.accountNickname ?? null,
      accountGroup: account.accountGroup ?? null,
      investmentRole: account.investmentRole ?? null,
      currency: account.currency,
      maskedAccountNumber: account.maskedAccountNumber ?? null,
      externalReference: account.externalReference ?? null,
      includeInTotalCash: account.includeInTotalCash,
      includeInNetWorth: account.includeInNetWorth,
      includeInDashboard: account.includeInDashboard,
      includeInDailyCashflow: account.includeInDailyCashflow,
      includeInInvestmentCashflow: account.includeInInvestmentCashflow,
      isActive: account.isActive,
      currentBalance: decimalToString(account.snapshots[0]?.balance),
      availableBalance: decimalToString(account.snapshots[0]?.availableBalance),
      latestSnapshotDate: account.snapshots[0]?.snapshotDate?.toISOString() ?? null,
      latestSourceType: account.snapshots[0]?.sourceType ?? null
    }))
  };
}

export async function getInvestmentReport(
  userId: string,
  query: Record<string, string | string[] | undefined> = {}
): Promise<InvestmentReport> {
  const fromRaw = typeof query.from === "string" ? query.from : undefined;
  const toRaw = typeof query.to === "string" ? query.to : undefined;
  const { from, to } = resolveDateRange(fromRaw, toRaw);
  const holdings = await getApprovedHoldings(userId);

  const activities = await prisma.tradeActivity.findMany({
    where: {
      userId,
      reviewStatus: ReviewStatus.APPROVED,
      activityDate: {
        gte: from,
        lte: to
      }
    },
    include: {
      security: {
        select: {
          ticker: true,
          securityName: true
        }
      }
    },
    orderBy: {
      activityDate: "asc"
    }
  });

  const monthly = new Map<string, { activityCount: number; realizedProfitLoss: number }>();
  const realizedBySecurity = new Map<string, { ticker: string; securityName: string; realizedProfitLoss: number; activityCount: number }>();

  for (const month of buildMonthlyKeys(from, to)) {
    monthly.set(month, {
      activityCount: 0,
      realizedProfitLoss: 0
    });
  }

  for (const activity of activities) {
    const monthKey = activity.activityDate ? formatMonthKey(activity.activityDate) : null;
    const realizedProfitLoss = decimalToNumber(activity.realizedProfitLoss);

    if (monthKey) {
      const bucket = monthly.get(monthKey) ?? {
        activityCount: 0,
        realizedProfitLoss: 0
      };
      bucket.activityCount += 1;
      bucket.realizedProfitLoss += realizedProfitLoss;
      monthly.set(monthKey, bucket);
    }

    const existing = realizedBySecurity.get(activity.security.ticker) ?? {
      ticker: activity.security.ticker,
      securityName: activity.security.securityName,
      realizedProfitLoss: 0,
      activityCount: 0
    };
    existing.realizedProfitLoss += realizedProfitLoss;
    existing.activityCount += 1;
    realizedBySecurity.set(activity.security.ticker, existing);
  }

  const holdingsValue = holdings.reduce((sum, holding) => sum + Number(holding.marketValue ?? 0), 0);
  const totalRealizedProfitLoss = [...realizedBySecurity.values()].reduce((sum, item) => sum + item.realizedProfitLoss, 0);

  return {
    summary: {
      holdingsValue: decimalToString(holdingsValue) ?? "0",
      realizedProfitLoss: decimalToString(totalRealizedProfitLoss) ?? "0",
      activityCount: activities.length,
      uniqueSecurities: new Set(holdings.map((holding) => holding.securityId)).size
    },
    monthlyActivity: [...monthly.entries()].map(([month, values]) => ({
      month,
      activityCount: values.activityCount,
      realizedProfitLoss: decimalToString(values.realizedProfitLoss) ?? "0"
    })),
    realizedBySecurity: [...realizedBySecurity.values()]
      .sort((left, right) => right.realizedProfitLoss - left.realizedProfitLoss)
      .slice(0, 8)
      .map((entry) => ({
        ticker: entry.ticker,
        securityName: entry.securityName,
        realizedProfitLoss: decimalToString(entry.realizedProfitLoss) ?? "0",
        activityCount: entry.activityCount
      })),
    holdingsBreakdown: holdings
      .slice()
      .sort((left, right) => Number(right.marketValue ?? 0) - Number(left.marketValue ?? 0))
      .slice(0, 8)
  };
}

export async function getDocumentHealthReport(userId: string): Promise<DocumentHealthReport> {
  const documents = await prisma.document.findMany({
    where: {
      userId
    },
    include: {
      duplicateOf: {
        select: {
          id: true,
          filename: true,
          uploadedAt: true,
          overallConfidence: true
        }
      }
    },
    orderBy: {
      uploadedAt: "desc"
    }
  });

  const statusBreakdownMap = new Map<string, number>();
  const duplicateCandidates: DocumentHealthReport["duplicateCandidates"] = [];
  const duplicateKeys = new Set<string>();

  for (const document of documents) {
    statusBreakdownMap.set(document.parseStatus, (statusBreakdownMap.get(document.parseStatus) ?? 0) + 1);

    if (document.duplicateOf) {
      const pairKey = [document.id, document.duplicateOf.id].sort().join(":");
      if (duplicateKeys.has(pairKey)) {
        continue;
      }

      duplicateKeys.add(pairKey);
      duplicateCandidates.push({
        documentId: document.id,
        duplicateOfDocumentId: document.duplicateOf.id,
        filename: document.filename,
        duplicateFilename: document.duplicateOf.filename,
        uploadedAt: document.uploadedAt.toISOString(),
        duplicateUploadedAt: document.duplicateOf.uploadedAt.toISOString(),
        confidence: document.overallConfidence ?? null,
        duplicateConfidence: document.duplicateOf.overallConfidence ?? null,
        similarityScore: 1
      });
    }
  }

  for (let index = 0; index < documents.length; index += 1) {
    const left = documents[index];

    for (let otherIndex = index + 1; otherIndex < documents.length; otherIndex += 1) {
      const right = documents[otherIndex];
      const pairKey = [left.id, right.id].sort().join(":");

      if (duplicateKeys.has(pairKey)) {
        continue;
      }

      const similarityScore = calculateDocumentSimilarity(left, right);
      if (similarityScore < 0.75) {
        continue;
      }

      duplicateKeys.add(pairKey);
      duplicateCandidates.push({
        documentId: left.id,
        duplicateOfDocumentId: right.id,
        filename: left.filename,
        duplicateFilename: right.filename,
        uploadedAt: left.uploadedAt.toISOString(),
        duplicateUploadedAt: right.uploadedAt.toISOString(),
        confidence: left.overallConfidence ?? null,
        duplicateConfidence: right.overallConfidence ?? null,
        similarityScore
      });
    }
  }

  const confidenceValues = documents
    .map((document) => document.overallConfidence)
    .filter((confidence): confidence is number => typeof confidence === "number");
  const lowConfidenceDocuments = documents
    .filter((document) => typeof document.overallConfidence === "number" && document.overallConfidence < 0.75)
    .slice(0, 8)
    .map(mapDocumentListItem);

  return {
    summary: {
      totalDocuments: documents.length,
      duplicateDocuments: documents.filter((document) => document.duplicateOfDocumentId !== null).length,
      needsReviewDocuments: documents.filter((document) => document.needsReview).length,
      failedDocuments: documents.filter((document) => document.parseStatus === DocumentStatus.FAILED).length,
      lowConfidenceDocuments: documents.filter(
        (document) => typeof document.overallConfidence === "number" && document.overallConfidence < 0.75
      ).length,
      averageConfidence:
        confidenceValues.length > 0
          ? Number((confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length).toFixed(4))
          : null
    },
    statusBreakdown: [...statusBreakdownMap.entries()].map(([status, count]) => ({
      status,
      count
    })),
    duplicateCandidates: duplicateCandidates
      .sort((left, right) => right.similarityScore - left.similarityScore)
      .slice(0, 8),
    lowConfidenceDocuments
  };
}

export async function getDocumentsExportRows(
  userId: string,
  query: Record<string, string | string[] | undefined> = {}
) {
  return listDocuments(userId, query);
}
