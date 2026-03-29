import { DocumentStatus, ReviewStatus } from "@prisma/client";
import { DashboardSummary } from "@/lib/contracts";
import { prisma } from "@/lib/db/prisma";
import { decimalToString } from "@/lib/utils/decimal";
import { getApprovedActivities, getApprovedHoldings } from "./investments";
import { mapDocumentListItem } from "./mappers";

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [processedDocuments, pendingReviewItems, recentDocuments, holdings, recentActivities] = await Promise.all([
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
    getApprovedActivities(userId)
  ]);

  const totalHoldingsValue = holdings.reduce((sum, holding) => sum + Number(holding.marketValue ?? 0), 0);
  const alerts: string[] = [];
  if (pendingReviewItems > 0) {
    alerts.push(`${pendingReviewItems} review item(s) still need confirmation.`);
  }
  if (holdings.length === 0) {
    alerts.push("No approved holdings yet. Approve a parsed document to populate the investments view.");
  }

  return {
    metrics: {
      processedDocuments,
      pendingReviewItems,
      totalHoldingsValue: decimalToString(totalHoldingsValue) ?? "0",
      uniqueSecurities: new Set(holdings.map((holding) => holding.securityId)).size
    },
    recentDocuments: recentDocuments.map(mapDocumentListItem),
    recentActivities: recentActivities.slice(0, 8),
    alerts
  };
}
