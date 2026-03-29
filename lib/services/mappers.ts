import { ParsedField, Prisma, ReviewStatus, TradeActivity } from "@prisma/client";
import {
  DocumentDetail,
  DocumentListItem,
  ReviewQueueItem,
  StockActivityRow
} from "@/lib/contracts";
import { decimalToString } from "@/lib/utils/decimal";

type DocumentSummaryLike = {
  id: string;
  filename: string;
  documentType: string;
  parseStatus: string;
  originalMimeType: string;
  uploadedAt: Date;
  processedAt: Date | null;
  overallConfidence: number | null;
  needsReview: boolean;
  duplicateOfDocumentId: string | null;
  statementStartDate: Date | null;
  statementEndDate: Date | null;
};

export function mapDocumentListItem(document: DocumentSummaryLike): DocumentListItem {
  return {
    id: document.id,
    filename: document.filename,
    documentType: document.documentType,
    parseStatus: document.parseStatus,
    originalMimeType: document.originalMimeType,
    uploadedAt: document.uploadedAt.toISOString(),
    processedAt: document.processedAt?.toISOString() ?? null,
    overallConfidence: document.overallConfidence ?? null,
    needsReview: document.needsReview,
    duplicateOfDocumentId: document.duplicateOfDocumentId ?? null,
    statementPeriod: {
      start: document.statementStartDate?.toISOString() ?? null,
      end: document.statementEndDate?.toISOString() ?? null
    }
  };
}

export function mapTradeActivityRow(activity: Pick<
  TradeActivity,
  | "id"
  | "activityDate"
  | "settleDate"
  | "externalReference"
  | "rawDescription"
  | "activityType"
  | "price"
  | "quantity"
  | "balanceAfter"
  | "averagePriceAfter"
  | "marketValueAfter"
  | "realizedProfitLoss"
  | "confidence"
  | "requiresReview"
>) {
  return {
    id: activity.id,
    rawRowText: activity.rawDescription,
    activityDate: activity.activityDate?.toISOString() ?? null,
    settleDate: activity.settleDate?.toISOString() ?? null,
    referenceNumber: activity.externalReference ?? null,
    description: activity.rawDescription,
    activityType: activity.activityType,
    price: decimalToString(activity.price),
    quantity: decimalToString(activity.quantity),
    balanceAfter: decimalToString(activity.balanceAfter),
    averagePriceAfter: decimalToString(activity.averagePriceAfter),
    marketValueAfter: decimalToString(activity.marketValueAfter),
    realizedProfitLoss: decimalToString(activity.realizedProfitLoss),
    confidence: activity.confidence ?? null,
    requiresReview: activity.requiresReview
  } satisfies StockActivityRow;
}

export function mapReviewQueueItem(
  field: Pick<
    ParsedField,
    | "id"
    | "documentId"
    | "fieldPath"
    | "rawValue"
    | "normalizedValue"
    | "confidence"
    | "requiresReview"
    | "reviewStatus"
    | "linkedEntityType"
    | "linkedEntityId"
  > & {
    document: {
      filename: string;
      uploadedAt: Date;
    };
  }
): ReviewQueueItem {
  return {
    id: field.id,
    documentId: field.documentId,
    documentFilename: field.document.filename,
    fieldPath: field.fieldPath,
    rawValue: field.rawValue,
    normalizedValue: field.normalizedValue as Prisma.JsonValue,
    confidence: field.confidence ?? null,
    requiresReview: field.requiresReview,
    reviewStatus: field.reviewStatus,
    linkedEntityType: field.linkedEntityType ?? null,
    linkedEntityId: field.linkedEntityId ?? null,
    uploadedAt: field.document.uploadedAt.toISOString()
  };
}

export function summariseValidationState(detail: DocumentDetail) {
  if (detail.document.parseStatus === "FAILED") {
    return ReviewStatus.REJECTED;
  }

  if (detail.reviewItems.some((item) => item.reviewStatus === "REJECTED")) {
    return ReviewStatus.REJECTED;
  }

  if (detail.reviewItems.some((item) => item.requiresReview)) {
    return ReviewStatus.PENDING;
  }

  return ReviewStatus.APPROVED;
}

