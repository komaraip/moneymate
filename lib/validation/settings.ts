import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const optionalId = z.string().trim().min(1).max(191).optional().nullable();

export const cashflowModeSchema = z.enum(["COMBINED", "SEPARATE"]);
export const ruleMatchModeSchema = z.enum(["CONTAINS", "EXACT", "REGEX"]);
export const classificationRuleScopeSchema = z.enum(["CASHFLOW", "INGESTION"]);
export const classificationRuleActionTypeSchema = z.enum([
  "INCLUDE_IN_GENERAL_CASHFLOW",
  "EXCLUDE_FROM_GENERAL_CASHFLOW",
  "FORCE_TRANSACTION_TYPE",
  "FORCE_CATEGORY_NAME"
]);
export const dashboardDateRangePresetSchema = z.enum(["DAYS_30", "DAYS_90", "MONTHS_6", "MONTHS_12"]);

export const dashboardWidgetKeySchema = z.enum([
  "metrics",
  "recent_documents",
  "review_alerts",
  "recent_activities",
  "recent_cash_transactions"
]);

export const createInvestmentCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  description: optionalText(240),
  iconToken: optionalText(64),
  colorToken: optionalText(32),
  isActive: z.boolean().optional(),
  includeInNetWorth: z.boolean().optional(),
  includeInDashboard: z.boolean().optional(),
  includeInReports: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional()
});

export const updateInvestmentCategorySchema = createInvestmentCategorySchema.partial();

export const createBrokerSchema = z.object({
  investmentCategoryId: optionalId,
  brokerName: z.string().trim().min(2).max(120),
  brokerCode: optionalText(32),
  legalEntityName: optionalText(120),
  branchName: optionalText(120),
  clientCode: optionalText(64),
  sid: optionalText(64),
  sre: optionalText(64),
  rdnAccountId: optionalId,
  defaultCurrency: z.string().trim().min(3).max(3).optional(),
  country: optionalText(3),
  isActive: z.boolean().optional(),
  notes: optionalText(400)
});

export const updateBrokerSchema = createBrokerSchema.partial();

export const createClassificationRuleSchema = z
  .object({
    scope: classificationRuleScopeSchema.optional(),
    pattern: z.string().trim().min(1).max(200),
    matchMode: ruleMatchModeSchema.optional(),
    actionType: classificationRuleActionTypeSchema,
    actionValue: optionalText(120),
    priority: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional()
  })
  .superRefine((value, context) => {
    if (value.actionType === "FORCE_TRANSACTION_TYPE") {
      const normalized = value.actionValue?.toLowerCase();
      if (!normalized || !["income", "expense", "transfer", "adjustment"].includes(normalized)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["actionValue"],
          message: "Use one of: income, expense, transfer, adjustment."
        });
      }
      return;
    }

    if (value.actionType === "FORCE_CATEGORY_NAME" && !value.actionValue?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["actionValue"],
        message: "Category name is required for FORCE_CATEGORY_NAME."
      });
    }
  });

export const updateClassificationRuleSchema = z
  .object({
    scope: classificationRuleScopeSchema.optional(),
    pattern: z.string().trim().min(1).max(200).optional(),
    matchMode: ruleMatchModeSchema.optional(),
    actionType: classificationRuleActionTypeSchema.optional(),
    actionValue: optionalText(120),
    priority: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update."
  });

export const createTransferRuleSchema = z.object({
  pattern: z.string().trim().min(1).max(200),
  matchMode: ruleMatchModeSchema.optional(),
  accountPattern: optionalText(200),
  accountMatchMode: ruleMatchModeSchema.optional(),
  counterpartyPattern: optionalText(200),
  counterpartyMatchMode: ruleMatchModeSchema.optional(),
  excludeAsInternalTransfer: z.boolean().optional(),
  priority: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional()
});

export const updateTransferRuleSchema = createTransferRuleSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Provide at least one field to update."
});

export const createDocumentMappingRuleSchema = z
  .object({
    pattern: z.string().trim().min(1).max(200),
    matchMode: ruleMatchModeSchema.optional(),
    brokerId: optionalId,
    investmentAccountId: optionalId,
    categoryId: optionalId,
    priority: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional()
  })
  .refine(
    (value) => Boolean(value.brokerId || value.investmentAccountId || value.categoryId),
    "Select at least one mapping target."
  );

export const updateDocumentMappingRuleSchema = z
  .object({
    pattern: z.string().trim().min(1).max(200).optional(),
    matchMode: ruleMatchModeSchema.optional(),
    brokerId: optionalId,
    investmentAccountId: optionalId,
    categoryId: optionalId,
    priority: z.number().int().min(0).max(9999).optional(),
    isActive: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update."
  });

export const updateReportPreferenceSchema = z.object({
  defaultCashflowMode: cashflowModeSchema.optional(),
  includeDividendsInIncome: z.boolean().optional(),
  includeStockSaleProceedsInIncome: z.boolean().optional(),
  includeBrokerFeesInExpenses: z.boolean().optional(),
  includeInvestmentCashInTotalCash: z.boolean().optional(),
  includeRealizedPlInIncome: z.boolean().optional(),
  includeUnrealizedPlInDashboard: z.boolean().optional()
});

export const updateDashboardPreferenceSchema = z.object({
  defaultDateRange: dashboardDateRangePresetSchema.optional()
});

export const updateDashboardWidgetsSchema = z.object({
  widgets: z
    .array(
      z.object({
        widgetKey: dashboardWidgetKeySchema,
        isVisible: z.boolean()
      })
    )
    .min(1)
});
