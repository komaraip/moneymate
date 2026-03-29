import { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { mapReviewQueueItem } from "@/lib/services/mappers";
import { updateReviewFieldSchema } from "@/lib/validation/review";
import { toDecimal } from "@/lib/utils/decimal";
import { AppError } from "@/lib/utils/errors";

type UpdateReviewInput = {
  normalizedValue?: unknown;
  decision?: "approve" | "reject" | "ignore";
};

export async function getReviewQueue(userId: string) {
  const fields = await prisma.parsedField.findMany({
    where: {
      document: {
        userId
      },
      requiresReview: true
    },
    include: {
      document: {
        select: {
          filename: true,
          uploadedAt: true
        }
      }
    },
    orderBy: [
      {
        document: {
          uploadedAt: "desc"
        }
      },
      {
        createdAt: "asc"
      }
    ]
  });

  return fields.map(mapReviewQueueItem);
}

function getReviewStatus(decision: "approve" | "reject" | "ignore") {
  if (decision === "reject") return ReviewStatus.REJECTED;
  if (decision === "ignore") return ReviewStatus.IGNORED;
  return ReviewStatus.APPROVED;
}

async function syncLinkedEntity(fieldId: string, normalizedValue: unknown, decision: "approve" | "reject" | "ignore") {
  const field = await prisma.parsedField.findUnique({
    where: {
      id: fieldId
    }
  });

  if (!field) {
    throw new AppError("Review field not found.", 404, "field_not_found");
  }

  if (!field.linkedEntityType || !field.linkedEntityId) {
    return field;
  }

  if (field.linkedEntityType !== "trade_activity") {
    return field;
  }

  const row = normalizedValue as Record<string, unknown>;
  const nextReviewStatus = decision === "approve" ? ReviewStatus.PENDING : getReviewStatus(decision);

  await prisma.tradeActivity.update({
    where: {
      id: field.linkedEntityId
    },
    data: {
      activityDate: typeof row?.activityDate === "string" ? new Date(row.activityDate) : undefined,
      settleDate:
        typeof row?.settleDate === "string" && row.settleDate ? new Date(row.settleDate) : row?.settleDate === null
          ? null
          : undefined,
      externalReference:
        typeof row?.referenceNumber === "string" ? row.referenceNumber : row?.referenceNumber === null ? null : undefined,
      rawDescription: typeof row?.description === "string" ? row.description : undefined,
      activityType: typeof row?.activityType === "string" ? (row.activityType as never) : undefined,
      price: typeof row?.price === "string" ? toDecimal(row.price) : row?.price === null ? null : undefined,
      quantity:
        typeof row?.quantity === "string" ? toDecimal(row.quantity) : row?.quantity === null ? null : undefined,
      balanceAfter:
        typeof row?.balanceAfter === "string"
          ? toDecimal(row.balanceAfter)
          : row?.balanceAfter === null
            ? null
            : undefined,
      averagePriceAfter:
        typeof row?.averagePriceAfter === "string"
          ? toDecimal(row.averagePriceAfter)
          : row?.averagePriceAfter === null
            ? null
            : undefined,
      marketValueAfter:
        typeof row?.marketValueAfter === "string"
          ? toDecimal(row.marketValueAfter)
          : row?.marketValueAfter === null
            ? null
            : undefined,
      realizedProfitLoss:
        typeof row?.realizedProfitLoss === "string"
          ? toDecimal(row.realizedProfitLoss)
          : row?.realizedProfitLoss === null
            ? null
            : undefined,
      confidence: typeof row?.confidence === "number" ? row.confidence : undefined,
      requiresReview: false,
      reviewStatus: nextReviewStatus,
      rawRowJson: row as never
    }
  });

  const metadata = field.sourceBboxJson as { holdingSnapshotId?: string } | null;
  if (metadata?.holdingSnapshotId) {
    const quantityValue =
      typeof row?.balanceAfter === "string" ? (toDecimal(row.balanceAfter) ?? undefined) : undefined;
    await prisma.holdingSnapshot.update({
      where: {
        id: metadata.holdingSnapshotId
      },
      data: {
        quantity: quantityValue,
        averageCost:
          typeof row?.averagePriceAfter === "string"
            ? toDecimal(row.averagePriceAfter)
            : row?.averagePriceAfter === null
              ? null
              : undefined,
        marketValue:
          typeof row?.marketValueAfter === "string"
            ? toDecimal(row.marketValueAfter)
            : row?.marketValueAfter === null
              ? null
              : undefined,
        reviewStatus: nextReviewStatus
      }
    });
  }

  return field;
}

export async function updateReviewField(userId: string, fieldId: string, input: UpdateReviewInput) {
  const payload = updateReviewFieldSchema.parse(input);

  const existing = await prisma.parsedField.findFirst({
    where: {
      id: fieldId,
      document: {
        userId
      }
    }
  });

  if (!existing) {
    throw new AppError("Review field not found.", 404, "field_not_found");
  }

  await syncLinkedEntity(fieldId, payload.normalizedValue ?? existing.normalizedValue, payload.decision);

  const updated = await prisma.parsedField.update({
    where: {
      id: fieldId
    },
    data: {
      normalizedValue: (payload.normalizedValue ?? existing.normalizedValue) as never,
      requiresReview: false,
      reviewStatus: getReviewStatus(payload.decision)
    },
    include: {
      document: {
        select: {
          filename: true,
          uploadedAt: true
        }
      }
    }
  });

  return mapReviewQueueItem(updated);
}
