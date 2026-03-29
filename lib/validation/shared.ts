import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(1000).default(25)
});

export const booleanQuerySchema = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");
