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
    uniqueSecurities: z.number()
  }),
  recentDocuments: z.array(documentListItemSchema),
  recentActivities: z.array(
    stockActivityRowSchema.extend({
      ticker: z.string(),
      securityName: z.string()
    })
  ),
  alerts: z.array(z.string())
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

