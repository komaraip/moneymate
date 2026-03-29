import { z } from "zod";

export const updateReviewFieldSchema = z.object({
  normalizedValue: z.unknown().optional(),
  decision: z.enum(["approve", "reject", "ignore"]).default("approve")
});

