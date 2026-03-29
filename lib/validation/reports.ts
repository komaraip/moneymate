import { z } from "zod";
import { booleanQuerySchema } from "./shared";

export const reportRangeSchema = z.object({
  from: z.string().trim().optional(),
  to: z.string().trim().optional()
});

export const exportKindSchema = z.enum(["cashflow", "transactions", "documents", "holdings"]);

export const exportReportQuerySchema = reportRangeSchema.extend({
  kind: exportKindSchema,
  duplicatesOnly: booleanQuerySchema,
  confidenceBelow: z.coerce.number().min(0).max(1).optional(),
  accountId: z.string().optional(),
  type: z.string().optional(),
  search: z.string().trim().optional()
});
