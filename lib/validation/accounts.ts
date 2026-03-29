import { z } from "zod";
import { cashAccountTypes } from "@/lib/finance";

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const booleanQuerySchema = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

export const createAccountSchema = z.object({
  name: z.string().trim().min(2).max(120),
  institutionName: optionalText(120),
  accountType: z.enum(cashAccountTypes),
  currency: z.string().trim().min(3).max(3).default("IDR"),
  accountNumber: z.string().trim().min(4).max(64),
  openingBalance: optionalText(64),
  openingBalanceDate: optionalText(64)
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  institutionName: optionalText(120),
  accountType: z.enum(cashAccountTypes).optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  accountNumber: z.string().trim().min(4).max(64).optional(),
  isActive: z.boolean().optional()
});

export const createAccountSnapshotSchema = z.object({
  snapshotDate: z.string().trim().min(1),
  balance: z.string().trim().min(1),
  availableBalance: optionalText(64)
});

export const listAccountsQuerySchema = z.object({
  accountType: z.enum(cashAccountTypes).optional(),
  includeInactive: booleanQuerySchema,
  search: z.string().trim().optional()
});
