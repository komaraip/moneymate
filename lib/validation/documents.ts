import { z } from "zod";
import { booleanQuerySchema } from "./shared";

export const uploadInitSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().positive()
});

export const finalizeUploadSchema = z.object({
  documentId: z.string().cuid(),
  sha256Hash: z.string().min(32).max(128)
});

export const listDocumentsQuerySchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  duplicatesOnly: booleanQuerySchema,
  confidenceBelow: z.coerce.number().min(0).max(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(1000).default(25)
});
