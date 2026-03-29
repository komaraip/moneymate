import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const cashflowModeSchema = z.enum(["COMBINED", "SEPARATE"]);

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
  investmentCategoryId: z.string().min(1).optional().nullable(),
  brokerName: z.string().trim().min(2).max(120),
  brokerCode: optionalText(32),
  legalEntityName: optionalText(120),
  branchName: optionalText(120),
  clientCode: optionalText(64),
  sid: optionalText(64),
  sre: optionalText(64),
  rdnAccountId: z.string().min(1).optional().nullable(),
  defaultCurrency: z.string().trim().min(3).max(3).optional(),
  country: optionalText(3),
  isActive: z.boolean().optional(),
  notes: optionalText(400)
});

export const updateBrokerSchema = createBrokerSchema.partial();

export const updateReportPreferenceSchema = z.object({
  defaultCashflowMode: cashflowModeSchema.optional(),
  includeDividendsInIncome: z.boolean().optional(),
  includeStockSaleProceedsInIncome: z.boolean().optional(),
  includeBrokerFeesInExpenses: z.boolean().optional(),
  includeInvestmentCashInTotalCash: z.boolean().optional()
});

