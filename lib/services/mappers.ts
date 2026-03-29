import {
  Account,
  AccountSnapshot,
  ParsedField,
  Prisma,
  ReviewStatus,
  TradeActivity,
  Transaction
} from "@prisma/client";
import {
  AccountSnapshotItem,
  AccountSummary,
  DocumentDetail,
  DocumentListItem,
  ReviewQueueItem,
  StockActivityRow,
  TransactionListItem
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

export function mapAccountSummary(
  account: Pick<
    Account,
    | "id"
    | "name"
    | "institutionName"
    | "accountType"
    | "accountSubtype"
    | "accountNickname"
    | "accountGroup"
    | "investmentRole"
    | "currency"
    | "maskedAccountNumber"
    | "externalReference"
    | "includeInTotalCash"
    | "includeInNetWorth"
    | "includeInDashboard"
    | "includeInDailyCashflow"
    | "includeInInvestmentCashflow"
    | "isActive"
  > & {
    latestSnapshot?: Pick<AccountSnapshot, "balance" | "availableBalance" | "snapshotDate" | "sourceType"> | null;
  }
): AccountSummary {
  return {
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
    currentBalance: decimalToString(account.latestSnapshot?.balance),
    availableBalance: decimalToString(account.latestSnapshot?.availableBalance),
    latestSnapshotDate: account.latestSnapshot?.snapshotDate?.toISOString() ?? null,
    latestSourceType: account.latestSnapshot?.sourceType ?? null
  };
}

export function mapAccountSnapshot(snapshot: Pick<
  AccountSnapshot,
  "id" | "snapshotDate" | "balance" | "availableBalance" | "sourceType" | "sourceDocumentId" | "confidence"
>): AccountSnapshotItem {
  return {
    id: snapshot.id,
    snapshotDate: snapshot.snapshotDate.toISOString(),
    balance: decimalToString(snapshot.balance) ?? "0",
    availableBalance: decimalToString(snapshot.availableBalance),
    sourceType: snapshot.sourceType,
    sourceDocumentId: snapshot.sourceDocumentId ?? null,
    confidence: snapshot.confidence ?? null
  };
}

export function mapTransactionListItem(
  transaction: Pick<
    Transaction,
    | "id"
    | "accountId"
    | "transactionType"
    | "direction"
    | "transactionDate"
    | "postingDate"
    | "amount"
    | "currency"
    | "description"
    | "merchantName"
    | "counterpartyName"
    | "reviewStatus"
    | "isManual"
    | "notes"
    | "sourceDocumentId"
  > & {
    account?: {
      name: string;
      accountType: string;
    } | null;
    category?: {
      name: string;
    } | null;
  }
): TransactionListItem {
  return {
    id: transaction.id,
    accountId: transaction.accountId ?? null,
    accountName: transaction.account?.name ?? null,
    accountType: transaction.account?.accountType ?? null,
    transactionType: transaction.transactionType,
    direction: transaction.direction,
    transactionDate: transaction.transactionDate.toISOString(),
    postingDate: transaction.postingDate?.toISOString() ?? null,
    amount: decimalToString(transaction.amount) ?? "0",
    currency: transaction.currency,
    description: transaction.description,
    categoryName: transaction.category?.name ?? null,
    merchantName: transaction.merchantName ?? null,
    counterpartyName: transaction.counterpartyName ?? null,
    reviewStatus: transaction.reviewStatus,
    isManual: transaction.isManual,
    notes: transaction.notes ?? null,
    sourceDocumentId: transaction.sourceDocumentId ?? null
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
