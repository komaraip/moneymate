import { z } from "zod";
import { manualTransactionTypes } from "@/lib/finance";
import { paginationQuerySchema } from "./shared";

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const manualTransactionTypeSchema = z.enum(manualTransactionTypes);

export const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  transactionType: manualTransactionTypeSchema,
  transactionDate: z.string().trim().min(1),
  postingDate: optionalText(64),
  amount: z.string().trim().min(1),
  currency: z.string().trim().min(3).max(3).default("IDR"),
  description: z.string().trim().min(2).max(240),
  categoryName: optionalText(120),
  merchantName: optionalText(120),
  counterpartyName: optionalText(120),
  notes: optionalText(1000)
});

export const updateTransactionSchema = z.object({
  accountId: z.string().min(1).optional(),
  transactionType: manualTransactionTypeSchema.optional(),
  transactionDate: z.string().trim().min(1).optional(),
  postingDate: optionalText(64),
  amount: z.string().trim().min(1).optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  description: z.string().trim().min(2).max(240).optional(),
  categoryName: optionalText(120),
  merchantName: optionalText(120),
  counterpartyName: optionalText(120),
  notes: optionalText(1000)
});

export const listTransactionsQuerySchema = paginationQuerySchema.extend({
  accountId: z.string().optional(),
  type: manualTransactionTypeSchema.optional(),
  search: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});

export const cashflowReportQuerySchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});
