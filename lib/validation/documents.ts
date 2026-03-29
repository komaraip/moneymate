import { z } from "zod";

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
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25)
});

