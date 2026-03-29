import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/errors";
import {
  createBrokerSchema,
  createClassificationRuleSchema,
  createDocumentMappingRuleSchema,
  createInvestmentCategorySchema,
  createTransferRuleSchema,
  dashboardWidgetKeySchema,
  updateBrokerSchema,
  updateClassificationRuleSchema,
  updateDashboardPreferenceSchema,
  updateDashboardWidgetsSchema,
  updateDocumentMappingRuleSchema,
  updateInvestmentCategorySchema,
  updateReportPreferenceSchema,
  updateTransferRuleSchema
} from "@/lib/validation/settings";

export const dashboardWidgetKeys = dashboardWidgetKeySchema.options;
export const dashboardDateRangePresets = ["DAYS_30", "DAYS_90", "MONTHS_6", "MONTHS_12"] as const;
export type DashboardDateRangePreset = (typeof dashboardDateRangePresets)[number];

function toCategorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireOwnedInvestmentCategory(userId: string, categoryId: string) {
  const category = await prisma.investmentCategory.findFirst({
    where: {
      id: categoryId,
      userId
    }
  });

  if (!category) {
    throw new AppError("Investment category not found.", 404, "investment_category_not_found");
  }

  return category;
}

async function requireOwnedBroker(userId: string, brokerId: string) {
  const broker = await prisma.broker.findFirst({
    where: {
      id: brokerId,
      userId
    }
  });

  if (!broker) {
    throw new AppError("Broker not found.", 404, "broker_not_found");
  }

  return broker;
}

async function requireOwnedInvestmentAccount(userId: string, investmentAccountId: string) {
  const investmentAccount = await prisma.investmentAccount.findFirst({
    where: {
      id: investmentAccountId,
      userId
    }
  });

  if (!investmentAccount) {
    throw new AppError("Investment account not found.", 404, "investment_account_not_found");
  }

  return investmentAccount;
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
    await requireOwnedInvestmentCategory(userId, payload.investmentCategoryId);
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
    await requireOwnedInvestmentCategory(userId, payload.investmentCategoryId);
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

export async function listClassificationRules(userId: string) {
  return prisma.classificationRule.findMany({
    where: {
      userId
    },
    orderBy: [
      {
        priority: "asc"
      },
      {
        createdAt: "asc"
      }
    ]
  });
}

export async function createClassificationRule(userId: string, input: Record<string, unknown>) {
  const payload = createClassificationRuleSchema.parse(input);

  return prisma.classificationRule.create({
    data: {
      userId,
      scope: payload.scope ?? "CASHFLOW",
      pattern: payload.pattern,
      matchMode: payload.matchMode ?? "CONTAINS",
      actionType: payload.actionType,
      actionValue:
        payload.actionType === "FORCE_TRANSACTION_TYPE" && payload.actionValue
          ? payload.actionValue.toLowerCase()
          : payload.actionValue || null,
      priority: payload.priority ?? 100,
      isActive: payload.isActive ?? true
    }
  });
}

export async function updateClassificationRule(userId: string, id: string, input: Record<string, unknown>) {
  const payload = updateClassificationRuleSchema.parse(input);
  const existing = await prisma.classificationRule.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Classification rule not found.", 404, "classification_rule_not_found");
  }

  return prisma.classificationRule.update({
    where: {
      id: existing.id
    },
    data: {
      scope: payload.scope,
      pattern: payload.pattern,
      matchMode: payload.matchMode,
      actionType: payload.actionType,
      actionValue:
        payload.actionType === "FORCE_TRANSACTION_TYPE" && payload.actionValue
          ? payload.actionValue.toLowerCase()
          : payload.actionValue === null
            ? null
            : payload.actionValue || undefined,
      priority: payload.priority,
      isActive: payload.isActive
    }
  });
}

export async function deleteClassificationRule(userId: string, id: string) {
  const existing = await prisma.classificationRule.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Classification rule not found.", 404, "classification_rule_not_found");
  }

  await prisma.classificationRule.delete({
    where: {
      id: existing.id
    }
  });

  return {
    success: true
  };
}

export async function listTransferRules(userId: string) {
  return prisma.transferRule.findMany({
    where: {
      userId
    },
    orderBy: [
      {
        priority: "asc"
      },
      {
        createdAt: "asc"
      }
    ]
  });
}

export async function createTransferRule(userId: string, input: Record<string, unknown>) {
  const payload = createTransferRuleSchema.parse(input);

  return prisma.transferRule.create({
    data: {
      userId,
      pattern: payload.pattern,
      matchMode: payload.matchMode ?? "CONTAINS",
      accountPattern: payload.accountPattern || null,
      accountMatchMode: payload.accountMatchMode ?? "CONTAINS",
      counterpartyPattern: payload.counterpartyPattern || null,
      counterpartyMatchMode: payload.counterpartyMatchMode ?? "CONTAINS",
      excludeAsInternalTransfer: payload.excludeAsInternalTransfer ?? true,
      priority: payload.priority ?? 100,
      isActive: payload.isActive ?? true
    }
  });
}

export async function updateTransferRule(userId: string, id: string, input: Record<string, unknown>) {
  const payload = updateTransferRuleSchema.parse(input);
  const existing = await prisma.transferRule.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Transfer rule not found.", 404, "transfer_rule_not_found");
  }

  return prisma.transferRule.update({
    where: {
      id: existing.id
    },
    data: {
      pattern: payload.pattern,
      matchMode: payload.matchMode,
      accountPattern: payload.accountPattern === null ? null : payload.accountPattern || undefined,
      accountMatchMode: payload.accountMatchMode,
      counterpartyPattern: payload.counterpartyPattern === null ? null : payload.counterpartyPattern || undefined,
      counterpartyMatchMode: payload.counterpartyMatchMode,
      excludeAsInternalTransfer: payload.excludeAsInternalTransfer,
      priority: payload.priority,
      isActive: payload.isActive
    }
  });
}

export async function deleteTransferRule(userId: string, id: string) {
  const existing = await prisma.transferRule.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Transfer rule not found.", 404, "transfer_rule_not_found");
  }

  await prisma.transferRule.delete({
    where: {
      id: existing.id
    }
  });

  return {
    success: true
  };
}

export async function listDocumentMappingRules(userId: string) {
  return prisma.documentMappingRule.findMany({
    where: {
      userId
    },
    include: {
      broker: {
        select: {
          brokerName: true
        }
      },
      investmentAccount: {
        select: {
          displayName: true,
          brokerName: true
        }
      },
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      {
        priority: "asc"
      },
      {
        createdAt: "asc"
      }
    ]
  });
}

export async function listInvestmentAccountsForSettings(userId: string) {
  return prisma.investmentAccount.findMany({
    where: {
      userId
    },
    select: {
      id: true,
      displayName: true,
      brokerName: true,
      clientCode: true,
      sid: true
    },
    orderBy: [
      {
        updatedAt: "desc"
      },
      {
        createdAt: "desc"
      }
    ]
  });
}

export async function createDocumentMappingRule(userId: string, input: Record<string, unknown>) {
  const payload = createDocumentMappingRuleSchema.parse(input);

  if (payload.brokerId) {
    await requireOwnedBroker(userId, payload.brokerId);
  }

  if (payload.investmentAccountId) {
    await requireOwnedInvestmentAccount(userId, payload.investmentAccountId);
  }

  if (payload.categoryId) {
    await requireOwnedInvestmentCategory(userId, payload.categoryId);
  }

  return prisma.documentMappingRule.create({
    data: {
      userId,
      pattern: payload.pattern,
      matchMode: payload.matchMode ?? "CONTAINS",
      brokerId: payload.brokerId || null,
      investmentAccountId: payload.investmentAccountId || null,
      categoryId: payload.categoryId || null,
      priority: payload.priority ?? 100,
      isActive: payload.isActive ?? true
    }
  });
}

export async function updateDocumentMappingRule(userId: string, id: string, input: Record<string, unknown>) {
  const payload = updateDocumentMappingRuleSchema.parse(input);
  const existing = await prisma.documentMappingRule.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Document mapping rule not found.", 404, "document_mapping_rule_not_found");
  }

  if (payload.brokerId) {
    await requireOwnedBroker(userId, payload.brokerId);
  }

  if (payload.investmentAccountId) {
    await requireOwnedInvestmentAccount(userId, payload.investmentAccountId);
  }

  if (payload.categoryId) {
    await requireOwnedInvestmentCategory(userId, payload.categoryId);
  }

  return prisma.documentMappingRule.update({
    where: {
      id: existing.id
    },
    data: {
      pattern: payload.pattern,
      matchMode: payload.matchMode,
      brokerId: payload.brokerId === null ? null : payload.brokerId || undefined,
      investmentAccountId:
        payload.investmentAccountId === null ? null : payload.investmentAccountId || undefined,
      categoryId: payload.categoryId === null ? null : payload.categoryId || undefined,
      priority: payload.priority,
      isActive: payload.isActive
    }
  });
}

export async function deleteDocumentMappingRule(userId: string, id: string) {
  const existing = await prisma.documentMappingRule.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Document mapping rule not found.", 404, "document_mapping_rule_not_found");
  }

  await prisma.documentMappingRule.delete({
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
      includeInvestmentCashInTotalCash: true,
      includeRealizedPlInIncome: false,
      includeUnrealizedPlInDashboard: false
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
      includeInvestmentCashInTotalCash: payload.includeInvestmentCashInTotalCash,
      includeRealizedPlInIncome: payload.includeRealizedPlInIncome,
      includeUnrealizedPlInDashboard: payload.includeUnrealizedPlInDashboard
    }
  });
}

export async function getDashboardPreference(userId: string) {
  return prisma.dashboardPreference.upsert({
    where: {
      userId
    },
    update: {},
    create: {
      userId,
      defaultDateRange: "DAYS_90"
    }
  });
}

export async function updateDashboardPreference(userId: string, input: Record<string, unknown>) {
  const payload = updateDashboardPreferenceSchema.parse(input);
  const current = await getDashboardPreference(userId);

  return prisma.dashboardPreference.update({
    where: {
      id: current.id
    },
    data: {
      defaultDateRange: payload.defaultDateRange
    }
  });
}

export async function listDashboardWidgetPreferences(userId: string) {
  const existing = await prisma.dashboardWidgetPreference.findMany({
    where: {
      userId,
      widgetKey: {
        in: [...dashboardWidgetKeys]
      }
    }
  });
  const byKey = new Map(existing.map((item) => [item.widgetKey, item]));

  return dashboardWidgetKeys.map((widgetKey) => ({
    widgetKey,
    isVisible: byKey.get(widgetKey)?.isVisible ?? true
  }));
}

export async function updateDashboardWidgets(userId: string, input: Record<string, unknown>) {
  const payload = updateDashboardWidgetsSchema.parse(input);

  await prisma.$transaction(
    payload.widgets.map((widget) =>
      prisma.dashboardWidgetPreference.upsert({
        where: {
          userId_widgetKey: {
            userId,
            widgetKey: widget.widgetKey
          }
        },
        update: {
          isVisible: widget.isVisible
        },
        create: {
          userId,
          widgetKey: widget.widgetKey,
          isVisible: widget.isVisible
        }
      })
    )
  );

  return listDashboardWidgetPreferences(userId);
}
