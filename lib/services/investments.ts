import { ReviewStatus } from "@prisma/client";
import { HoldingSummary, SecurityDetail } from "@/lib/contracts";
import { prisma } from "@/lib/db/prisma";
import { mapTradeActivityRow } from "@/lib/services/mappers";
import { decimalToString } from "@/lib/utils/decimal";

export async function getApprovedHoldings(userId: string) {
  const snapshots = await prisma.holdingSnapshot.findMany({
    where: {
      userId,
      reviewStatus: ReviewStatus.APPROVED
    },
    include: {
      security: true,
      investmentAccount: {
        include: {
          broker: true
        }
      }
    },
    orderBy: [
      {
        snapshotDate: "desc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  const latestByKey = new Map<string, (typeof snapshots)[number]>();
  for (const snapshot of snapshots) {
    const key = `${snapshot.securityId}:${snapshot.investmentAccountId}`;
    if (!latestByKey.has(key)) {
      latestByKey.set(key, snapshot);
    }
  }

  return [...latestByKey.values()].map(
    (snapshot) =>
      ({
        securityId: snapshot.securityId,
        ticker: snapshot.security.ticker,
        securityName: snapshot.security.securityName,
        currency: snapshot.security.currency,
        quantity: decimalToString(snapshot.quantity) ?? "0",
        averageCost: decimalToString(snapshot.averageCost),
        marketValue: decimalToString(snapshot.marketValue),
        latestSnapshotDate: snapshot.snapshotDate.toISOString(),
        sourceDocumentId: snapshot.sourceDocumentId,
        investmentAccountName:
          snapshot.investmentAccount.broker?.brokerName ??
          snapshot.investmentAccount.displayName ??
          snapshot.investmentAccount.brokerName ??
          snapshot.investmentAccount.clientCode ??
          null
      }) satisfies HoldingSummary
  );
}

export async function getApprovedActivities(userId: string) {
  const activities = await prisma.tradeActivity.findMany({
    where: {
      userId,
      reviewStatus: ReviewStatus.APPROVED
    },
    include: {
      security: true
    },
    orderBy: {
      activityDate: "desc"
    }
  });

  return activities.map((activity) => ({
    ...mapTradeActivityRow(activity),
    ticker: activity.security.ticker,
    securityName: activity.security.securityName
  }));
}

export async function getSecurityDetail(userId: string, ticker: string): Promise<SecurityDetail | null> {
  const security = await prisma.security.findFirst({
    where: {
      userId,
      ticker
    }
  });

  if (!security) {
    return null;
  }

  const [latestHolding, activities] = await Promise.all([
    prisma.holdingSnapshot.findFirst({
      where: {
        userId,
        securityId: security.id,
        reviewStatus: ReviewStatus.APPROVED
      },
      include: {
        investmentAccount: {
          include: {
            broker: true
          }
        }
      },
      orderBy: {
        snapshotDate: "desc"
      }
    }),
    prisma.tradeActivity.findMany({
      where: {
        userId,
        securityId: security.id,
        reviewStatus: ReviewStatus.APPROVED
      },
      orderBy: {
        activityDate: "desc"
      }
    })
  ]);

  return {
    securityId: security.id,
    ticker: security.ticker,
    securityName: security.securityName,
    currency: security.currency,
    latestHolding: latestHolding
      ? {
          securityId: latestHolding.securityId,
          ticker: security.ticker,
          securityName: security.securityName,
          currency: security.currency,
          quantity: decimalToString(latestHolding.quantity) ?? "0",
          averageCost: decimalToString(latestHolding.averageCost),
          marketValue: decimalToString(latestHolding.marketValue),
          latestSnapshotDate: latestHolding.snapshotDate.toISOString(),
          sourceDocumentId: latestHolding.sourceDocumentId,
          investmentAccountName:
            latestHolding.investmentAccount.broker?.brokerName ??
            latestHolding.investmentAccount.displayName ??
            latestHolding.investmentAccount.brokerName ??
            latestHolding.investmentAccount.clientCode ??
            null
        }
      : null,
    activities: activities.map((activity) => ({
      ...mapTradeActivityRow(activity),
      documentId: activity.sourceDocumentId
    }))
  };
}
