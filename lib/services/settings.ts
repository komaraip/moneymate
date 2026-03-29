import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/errors";
import {
  createBrokerSchema,
  createInvestmentCategorySchema,
  updateBrokerSchema,
  updateInvestmentCategorySchema,
  updateReportPreferenceSchema
} from "@/lib/validation/settings";

function toCategorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listInvestmentCategories(userId: string) {
  return prisma.investmentCategory.findMany({
    where: {
      userId
    },
    orderBy: [
      {
        sortOrder: "asc"
      },
      {
        createdAt: "asc"
      }
    ]
  });
}

export async function createInvestmentCategory(userId: string, input: Record<string, unknown>) {
  const payload = createInvestmentCategorySchema.parse(input);

  return prisma.investmentCategory.create({
    data: {
      userId,
      name: payload.name,
      slug: payload.slug || toCategorySlug(payload.name),
      description: payload.description || undefined,
      iconToken: payload.iconToken || undefined,
      colorToken: payload.colorToken || undefined,
      isActive: payload.isActive ?? true,
      includeInNetWorth: payload.includeInNetWorth ?? true,
      includeInDashboard: payload.includeInDashboard ?? true,
      includeInReports: payload.includeInReports ?? true,
      sortOrder: payload.sortOrder ?? 0
    }
  });
}

export async function updateInvestmentCategory(userId: string, id: string, input: Record<string, unknown>) {
  const payload = updateInvestmentCategorySchema.parse(input);
  const existing = await prisma.investmentCategory.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Investment category not found.", 404, "investment_category_not_found");
  }

  return prisma.investmentCategory.update({
    where: {
      id: existing.id
    },
    data: {
      name: payload.name,
      slug: payload.slug,
      description: payload.description === null ? null : payload.description || undefined,
      iconToken: payload.iconToken === null ? null : payload.iconToken || undefined,
      colorToken: payload.colorToken === null ? null : payload.colorToken || undefined,
      isActive: payload.isActive,
      includeInNetWorth: payload.includeInNetWorth,
      includeInDashboard: payload.includeInDashboard,
      includeInReports: payload.includeInReports,
      sortOrder: payload.sortOrder
    }
  });
}

export async function deleteInvestmentCategory(userId: string, id: string) {
  const existing = await prisma.investmentCategory.findFirst({
    where: {
      id,
      userId
    },
    include: {
      investmentAccounts: {
        select: {
          id: true
        },
        take: 1
      }
    }
  });

  if (!existing) {
    throw new AppError("Investment category not found.", 404, "investment_category_not_found");
  }

  if (existing.investmentAccounts.length > 0) {
    throw new AppError("This category is in use by investment accounts.", 409, "investment_category_in_use");
  }

  await prisma.investmentCategory.delete({
    where: {
      id: existing.id
    }
  });

  return {
    success: true
  };
}

export async function listBrokers(userId: string) {
  return prisma.broker.findMany({
    where: {
      userId
    },
    orderBy: [
      {
        isActive: "desc"
      },
      {
        brokerName: "asc"
      }
    ]
  });
}

export async function createBroker(userId: string, input: Record<string, unknown>) {
  const payload = createBrokerSchema.parse(input);

  if (payload.investmentCategoryId) {
    const category = await prisma.investmentCategory.findFirst({
      where: {
        id: payload.investmentCategoryId,
        userId
      }
    });

    if (!category) {
      throw new AppError("Investment category not found.", 404, "investment_category_not_found");
    }
  }

  return prisma.broker.create({
    data: {
      userId,
      investmentCategoryId: payload.investmentCategoryId || undefined,
      brokerName: payload.brokerName,
      brokerCode: payload.brokerCode || undefined,
      legalEntityName: payload.legalEntityName || undefined,
      branchName: payload.branchName || undefined,
      clientCode: payload.clientCode || undefined,
      sid: payload.sid || undefined,
      sre: payload.sre || undefined,
      rdnAccountId: payload.rdnAccountId || undefined,
      defaultCurrency: payload.defaultCurrency?.toUpperCase() ?? "IDR",
      country: payload.country || undefined,
      isActive: payload.isActive ?? true,
      notes: payload.notes || undefined
    }
  });
}

export async function updateBroker(userId: string, id: string, input: Record<string, unknown>) {
  const payload = updateBrokerSchema.parse(input);
  const existing = await prisma.broker.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Broker not found.", 404, "broker_not_found");
  }

  if (payload.investmentCategoryId) {
    const category = await prisma.investmentCategory.findFirst({
      where: {
        id: payload.investmentCategoryId,
        userId
      }
    });

    if (!category) {
      throw new AppError("Investment category not found.", 404, "investment_category_not_found");
    }
  }

  return prisma.broker.update({
    where: {
      id: existing.id
    },
    data: {
      investmentCategoryId: payload.investmentCategoryId === null ? null : payload.investmentCategoryId || undefined,
      brokerName: payload.brokerName,
      brokerCode: payload.brokerCode === null ? null : payload.brokerCode || undefined,
      legalEntityName: payload.legalEntityName === null ? null : payload.legalEntityName || undefined,
      branchName: payload.branchName === null ? null : payload.branchName || undefined,
      clientCode: payload.clientCode === null ? null : payload.clientCode || undefined,
      sid: payload.sid === null ? null : payload.sid || undefined,
      sre: payload.sre === null ? null : payload.sre || undefined,
      rdnAccountId: payload.rdnAccountId === null ? null : payload.rdnAccountId || undefined,
      defaultCurrency: payload.defaultCurrency ? payload.defaultCurrency.toUpperCase() : undefined,
      country: payload.country === null ? null : payload.country || undefined,
      isActive: payload.isActive,
      notes: payload.notes === null ? null : payload.notes || undefined
    }
  });
}

export async function deleteBroker(userId: string, id: string) {
  const existing = await prisma.broker.findFirst({
    where: {
      id,
      userId
    },
    include: {
      investmentAccounts: {
        select: {
          id: true
        },
        take: 1
      }
    }
  });

  if (!existing) {
    throw new AppError("Broker not found.", 404, "broker_not_found");
  }

  if (existing.investmentAccounts.length > 0) {
    throw new AppError("This broker is in use by investment activity.", 409, "broker_in_use");
  }

  await prisma.broker.delete({
    where: {
      id: existing.id
    }
  });

  return {
    success: true
  };
}

export async function getReportPreference(userId: string) {
  return prisma.reportPreference.upsert({
    where: {
      userId
    },
    update: {},
    create: {
      userId,
      defaultCashflowMode: "SEPARATE",
      includeDividendsInIncome: true,
      includeStockSaleProceedsInIncome: false,
      includeBrokerFeesInExpenses: false,
      includeInvestmentCashInTotalCash: true
    }
  });
}

export async function updateReportPreference(userId: string, input: Record<string, unknown>) {
  const payload = updateReportPreferenceSchema.parse(input);
  const current = await getReportPreference(userId);

  return prisma.reportPreference.update({
    where: {
      id: current.id
    },
    data: {
      defaultCashflowMode: payload.defaultCashflowMode,
      includeDividendsInIncome: payload.includeDividendsInIncome,
      includeStockSaleProceedsInIncome: payload.includeStockSaleProceedsInIncome,
      includeBrokerFeesInExpenses: payload.includeBrokerFeesInExpenses,
      includeInvestmentCashInTotalCash: payload.includeInvestmentCashInTotalCash
    }
  });
}

