import { z } from "zod";

export const stockActivityRowSchema = z.object({
  id: z.string().optional(),
  rawRowText: z.string(),
  activityDate: z.string().nullable(),
  settleDate: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  description: z.string(),
  activityType: z.string(),
  price: z.string().nullable(),
  quantity: z.string().nullable(),
  balanceAfter: z.string().nullable(),
  averagePriceAfter: z.string().nullable(),
  marketValueAfter: z.string().nullable(),
  realizedProfitLoss: z.string().nullable(),
  confidence: z.number().nullable(),
  requiresReview: z.boolean()
});

export const documentListItemSchema = z.object({
  id: z.string(),
  filename: z.string(),
  documentType: z.string(),
  parseStatus: z.string(),
  originalMimeType: z.string(),
  uploadedAt: z.string(),
  processedAt: z.string().nullable(),
  overallConfidence: z.number().nullable(),
  needsReview: z.boolean(),
  duplicateOfDocumentId: z.string().nullable(),
  statementPeriod: z.object({
    start: z.string().nullable(),
    end: z.string().nullable()
  })
});

export const reviewQueueItemSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  documentFilename: z.string(),
  fieldPath: z.string(),
  rawValue: z.string(),
  normalizedValue: z.unknown().nullable(),
  confidence: z.number().nullable(),
  requiresReview: z.boolean(),
  reviewStatus: z.string(),
  linkedEntityType: z.string().nullable(),
  linkedEntityId: z.string().nullable(),
  uploadedAt: z.string()
});

export const holdingSummarySchema = z.object({
  securityId: z.string(),
  ticker: z.string(),
  securityName: z.string(),
  currency: z.string(),
  quantity: z.string(),
  averageCost: z.string().nullable(),
  marketValue: z.string().nullable(),
  latestSnapshotDate: z.string().nullable(),
  sourceDocumentId: z.string(),
  investmentAccountName: z.string().nullable()
});

export const securityDetailSchema = z.object({
  securityId: z.string(),
  ticker: z.string(),
  securityName: z.string(),
  currency: z.string(),
  latestHolding: holdingSummarySchema.nullable(),
  activities: z.array(stockActivityRowSchema.extend({ documentId: z.string().nullable() }))
});

export const dashboardSummarySchema = z.object({
  metrics: z.object({
    processedDocuments: z.number(),
    pendingReviewItems: z.number(),
    totalHoldingsValue: z.string(),
    uniqueSecurities: z.number(),
    totalCashBalance: z.string(),
    monthlyIncome: z.string(),
    monthlyExpenses: z.string(),
    monthlyNetCashflow: z.string()
  }),
  recentDocuments: z.array(documentListItemSchema),
  recentActivities: z.array(
    stockActivityRowSchema.extend({
      ticker: z.string(),
      securityName: z.string()
    })
  ),
  recentCashTransactions: z.array(
    z.object({
      id: z.string(),
      accountId: z.string().nullable(),
      accountName: z.string().nullable(),
      accountType: z.string().nullable(),
      transactionType: z.string(),
      direction: z.string(),
      transactionDate: z.string(),
      postingDate: z.string().nullable(),
      amount: z.string(),
      currency: z.string(),
      description: z.string(),
      categoryName: z.string().nullable(),
      merchantName: z.string().nullable(),
      counterpartyName: z.string().nullable(),
      reviewStatus: z.string(),
      isManual: z.boolean(),
      notes: z.string().nullable(),
      sourceDocumentId: z.string().nullable()
    })
  ),
  alerts: z.array(z.string())
});

export const accountSnapshotItemSchema = z.object({
  id: z.string(),
  snapshotDate: z.string(),
  balance: z.string(),
  availableBalance: z.string().nullable(),
  sourceType: z.string(),
  sourceDocumentId: z.string().nullable(),
  confidence: z.number().nullable()
});

export const accountSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  institutionName: z.string().nullable(),
  accountType: z.string(),
  currency: z.string(),
  maskedAccountNumber: z.string().nullable(),
  externalReference: z.string().nullable(),
  isActive: z.boolean(),
  currentBalance: z.string().nullable(),
  availableBalance: z.string().nullable(),
  latestSnapshotDate: z.string().nullable(),
  latestSourceType: z.string().nullable()
});

export const transactionListItemSchema = z.object({
  id: z.string(),
  accountId: z.string().nullable(),
  accountName: z.string().nullable(),
  accountType: z.string().nullable(),
  transactionType: z.string(),
  direction: z.string(),
  transactionDate: z.string(),
  postingDate: z.string().nullable(),
  amount: z.string(),
  currency: z.string(),
  description: z.string(),
  categoryName: z.string().nullable(),
  merchantName: z.string().nullable(),
  counterpartyName: z.string().nullable(),
  reviewStatus: z.string(),
  isManual: z.boolean(),
  notes: z.string().nullable(),
  sourceDocumentId: z.string().nullable()
});

export const paginatedTransactionsSchema = z.object({
  items: z.array(transactionListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number()
});

export const accountDetailSchema = z.object({
  account: accountSummarySchema,
  snapshots: z.array(accountSnapshotItemSchema),
  recentTransactions: z.array(transactionListItemSchema)
});

export const cashflowReportSchema = z.object({
  summary: z.object({
    periodStart: z.string(),
    periodEnd: z.string(),
    income: z.string(),
    expense: z.string(),
    net: z.string(),
    transactionCount: z.number()
  }),
  monthly: z.array(
    z.object({
      month: z.string(),
      income: z.string(),
      expense: z.string(),
      net: z.string()
    })
  ),
  categories: z.array(
    z.object({
      categoryName: z.string(),
      categoryType: z.string(),
      total: z.string()
    })
  )
});

export const balanceReportSchema = z.object({
  summary: z.object({
    totalCash: z.string(),
    totalInvestments: z.string(),
    totalNetWorth: z.string()
  }),
  monthly: z.array(
    z.object({
      month: z.string(),
      cashBalance: z.string(),
      investmentValue: z.string(),
      netWorth: z.string()
    })
  ),
  accounts: z.array(accountSummarySchema)
});

export const investmentReportSchema = z.object({
  summary: z.object({
    holdingsValue: z.string(),
    realizedProfitLoss: z.string(),
    activityCount: z.number(),
    uniqueSecurities: z.number()
  }),
  monthlyActivity: z.array(
    z.object({
      month: z.string(),
      activityCount: z.number(),
      realizedProfitLoss: z.string()
    })
  ),
  realizedBySecurity: z.array(
    z.object({
      ticker: z.string(),
      securityName: z.string(),
      realizedProfitLoss: z.string(),
      activityCount: z.number()
    })
  ),
  holdingsBreakdown: z.array(holdingSummarySchema)
});

export const documentHealthReportSchema = z.object({
  summary: z.object({
    totalDocuments: z.number(),
    duplicateDocuments: z.number(),
    needsReviewDocuments: z.number(),
    failedDocuments: z.number(),
    lowConfidenceDocuments: z.number(),
    averageConfidence: z.number().nullable()
  }),
  statusBreakdown: z.array(
    z.object({
      status: z.string(),
      count: z.number()
    })
  ),
  duplicateCandidates: z.array(
    z.object({
      documentId: z.string(),
      duplicateOfDocumentId: z.string(),
      filename: z.string(),
      duplicateFilename: z.string(),
      uploadedAt: z.string(),
      duplicateUploadedAt: z.string(),
      confidence: z.number().nullable(),
      duplicateConfidence: z.number().nullable(),
      similarityScore: z.number()
    })
  ),
  lowConfidenceDocuments: z.array(documentListItemSchema)
});

export const documentDetailSchema = z.object({
  document: documentListItemSchema.extend({
    storageKey: z.string(),
    parserVersion: z.string().nullable()
  }),
  metadata: z.array(
    z.object({
      key: z.string(),
      valueText: z.string().nullable(),
      valueJson: z.unknown().nullable()
    })
  ),
  extractionJobs: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      stage: z.string(),
      errorMessage: z.string().nullable(),
      createdAt: z.string(),
      finishedAt: z.string().nullable()
    })
  ),
  reviewItems: z.array(reviewQueueItemSchema),
  activities: z.array(stockActivityRowSchema.extend({ documentId: z.string().nullable() })),
  validationIssues: z.array(z.string())
});

export type DocumentListItem = z.infer<typeof documentListItemSchema>;
export type ReviewQueueItem = z.infer<typeof reviewQueueItemSchema>;
export type StockActivityRow = z.infer<typeof stockActivityRowSchema>;
export type HoldingSummary = z.infer<typeof holdingSummarySchema>;
export type SecurityDetail = z.infer<typeof securityDetailSchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
export type DocumentDetail = z.infer<typeof documentDetailSchema>;
export type AccountSummary = z.infer<typeof accountSummarySchema>;
export type AccountSnapshotItem = z.infer<typeof accountSnapshotItemSchema>;
export type TransactionListItem = z.infer<typeof transactionListItemSchema>;
export type PaginatedTransactions = z.infer<typeof paginatedTransactionsSchema>;
export type AccountDetail = z.infer<typeof accountDetailSchema>;
export type CashflowReport = z.infer<typeof cashflowReportSchema>;
export type BalanceReport = z.infer<typeof balanceReportSchema>;
export type InvestmentReport = z.infer<typeof investmentReportSchema>;
export type DocumentHealthReport = z.infer<typeof documentHealthReportSchema>;
