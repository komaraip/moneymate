import {
  AuditActionType,
  DocumentStatus,
  Prisma,
  ReviewStatus
} from "@prisma/client";
import { createAuditEvent } from "@/lib/audit/service";
import { DocumentDetail } from "@/lib/contracts";
import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/env";
import { publishJob, queueNames } from "@/lib/jobs/boss";
import { createStorageKey, createSignedUploadUrl } from "@/lib/storage/s3";
import { AppError } from "@/lib/utils/errors";
import { toJsonSafe } from "@/lib/utils/json";
import { finalizeUploadSchema, listDocumentsQuerySchema, uploadInitSchema } from "@/lib/validation/documents";
import { mapDocumentListItem, mapReviewQueueItem, mapTradeActivityRow } from "./mappers";

const supportedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function createUploadDraft(
  userId: string,
  input: Prisma.JsonObject | { filename: string; mimeType: string; fileSizeBytes: number }
) {
  const payload = uploadInitSchema.parse(input);
  const env = getEnv();

  if (!supportedMimeTypes.includes(payload.mimeType)) {
    throw new AppError("Unsupported file type. Upload PDF, JPG, PNG, or WEBP.", 415, "unsupported_file_type");
  }

  if (payload.fileSizeBytes > env.PDF_MAX_SIZE_BYTES) {
    throw new AppError(`Files larger than ${env.PDF_MAX_SIZE_BYTES} bytes are not supported.`, 413, "file_too_large");
  }

  const storageKey = createStorageKey(userId, payload.filename);
  const upload = await createSignedUploadUrl(storageKey, payload.mimeType);
  const document = await prisma.document.create({
    data: {
      userId,
      filename: payload.filename,
      originalMimeType: payload.mimeType,
      storageKey,
      fileSizeBytes: payload.fileSizeBytes,
      parseStatus: DocumentStatus.DRAFT
    }
  });

  await createAuditEvent({
    userId,
    entityType: "document",
    entityId: document.id,
    actionType: AuditActionType.UPLOAD,
    afterJson: {
      filename: document.filename,
      storageKey: document.storageKey
    }
  });

  return {
    documentId: document.id,
    storageKey,
    uploadUrl: upload.uploadUrl,
    method: upload.method
  };
}

export async function finalizeUpload(userId: string, input: Prisma.JsonObject | { documentId: string; sha256Hash: string }) {
  const payload = finalizeUploadSchema.parse(input);
  const document = await prisma.document.findFirst({
    where: {
      id: payload.documentId,
      userId
    }
  });

  if (!document) {
    throw new AppError("Upload draft not found.", 404, "document_not_found");
  }

  const duplicate = await prisma.document.findFirst({
    where: {
      userId,
      sha256Hash: payload.sha256Hash,
      id: {
        not: document.id
      }
    },
    orderBy: {
      uploadedAt: "desc"
    }
  });

  const updated = await prisma.document.update({
    where: {
      id: document.id
    },
    data: {
      sha256Hash: payload.sha256Hash,
      parseStatus: duplicate ? DocumentStatus.DUPLICATE : DocumentStatus.UPLOADED,
      duplicateOfDocumentId: duplicate?.id,
      needsReview: Boolean(duplicate)
    }
  });

  if (!duplicate) {
    await publishJob(queueNames.processDocument, {
      documentId: document.id
    });
  }

  return mapDocumentListItem(updated);
}

export async function listDocuments(userId: string, query: Record<string, string | string[] | undefined>) {
  const params = listDocumentsQuerySchema.parse(query);

  const documents = await prisma.document.findMany({
    where: {
      userId,
      parseStatus: params.status ? (params.status as never) : undefined,
      documentType: params.type ? (params.type as never) : undefined,
      duplicateOfDocumentId: params.duplicatesOnly ? { not: null } : undefined,
      overallConfidence:
        params.confidenceBelow !== undefined
          ? {
              lt: params.confidenceBelow
            }
          : undefined,
      filename: params.search
        ? {
            contains: params.search,
            mode: "insensitive"
          }
        : undefined
    },
    orderBy: {
      uploadedAt: "desc"
    },
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize
  });

  return documents.map(mapDocumentListItem);
}

export async function getDocumentDetail(userId: string, documentId: string): Promise<DocumentDetail | null> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId
    },
    include: {
      metadata: true,
      extractionJobs: {
        orderBy: {
          createdAt: "desc"
        }
      },
      parsedFields: {
        orderBy: {
          createdAt: "asc"
        }
      },
      tradeActivities: {
        orderBy: {
          activityDate: "desc"
        }
      }
    }
  });

  if (!document) {
    return null;
  }

  const reviewFields = await prisma.parsedField.findMany({
    where: {
      documentId: document.id
    },
    include: {
      document: {
        select: {
          filename: true,
          uploadedAt: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const validationIssueMetadata = document.metadata.find((entry) => entry.key === "validation_issues");
  const validationIssues = Array.isArray(validationIssueMetadata?.valueJson)
    ? validationIssueMetadata?.valueJson.map((item) => `${item}`)
    : [];

  return toJsonSafe({
    document: {
      ...mapDocumentListItem(document),
      storageKey: document.storageKey,
      parserVersion: document.parserVersion ?? null
    },
    metadata: document.metadata.map((entry) => ({
      key: entry.key,
      valueText: entry.valueText,
      valueJson: entry.valueJson
    })),
    extractionJobs: document.extractionJobs.map((job) => ({
      id: job.id,
      status: job.status,
      stage: job.stage,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt.toISOString(),
      finishedAt: job.finishedAt?.toISOString() ?? null
    })),
    reviewItems: reviewFields.map(mapReviewQueueItem),
    activities: document.tradeActivities.map((activity) => ({
      ...mapTradeActivityRow(activity),
      documentId: document.id
    })),
    validationIssues
  });
}

export async function approveDocument(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId
    }
  });

  if (!document) {
    throw new AppError("Document not found.", 404, "document_not_found");
  }

  await prisma.$transaction([
    prisma.document.update({
      where: {
        id: document.id
      },
      data: {
        parseStatus: DocumentStatus.APPROVED,
        needsReview: false,
        processedAt: new Date()
      }
    }),
    prisma.parsedField.updateMany({
      where: {
        documentId: document.id,
        reviewStatus: {
          notIn: [ReviewStatus.REJECTED, ReviewStatus.IGNORED]
        }
      },
      data: {
        reviewStatus: ReviewStatus.APPROVED,
        requiresReview: false
      }
    }),
    prisma.tradeActivity.updateMany({
      where: {
        sourceDocumentId: document.id,
        reviewStatus: {
          notIn: [ReviewStatus.REJECTED, ReviewStatus.IGNORED]
        }
      },
      data: {
        reviewStatus: ReviewStatus.APPROVED,
        requiresReview: false
      }
    }),
    prisma.holdingSnapshot.updateMany({
      where: {
        sourceDocumentId: document.id,
        reviewStatus: {
          notIn: [ReviewStatus.REJECTED, ReviewStatus.IGNORED]
        }
      },
      data: {
        reviewStatus: ReviewStatus.APPROVED
      }
    })
  ]);

  await createAuditEvent({
    userId,
    entityType: "document",
    entityId: document.id,
    actionType: AuditActionType.APPROVE
  });

  return getDocumentDetail(userId, document.id);
}

export async function rejectDocument(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId
    }
  });

  if (!document) {
    throw new AppError("Document not found.", 404, "document_not_found");
  }

  await prisma.$transaction([
    prisma.document.update({
      where: {
        id: document.id
      },
      data: {
        parseStatus: DocumentStatus.REJECTED,
        needsReview: false
      }
    }),
    prisma.parsedField.updateMany({
      where: {
        documentId: document.id
      },
      data: {
        reviewStatus: ReviewStatus.REJECTED,
        requiresReview: false
      }
    }),
    prisma.tradeActivity.updateMany({
      where: {
        sourceDocumentId: document.id
      },
      data: {
        reviewStatus: ReviewStatus.REJECTED,
        requiresReview: false
      }
    }),
    prisma.holdingSnapshot.updateMany({
      where: {
        sourceDocumentId: document.id
      },
      data: {
        reviewStatus: ReviewStatus.REJECTED
      }
    })
  ]);

  await createAuditEvent({
    userId,
    entityType: "document",
    entityId: document.id,
    actionType: AuditActionType.REJECT
  });

  return getDocumentDetail(userId, document.id);
}

export async function reprocessDocument(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId
    }
  });

  if (!document) {
    throw new AppError("Document not found.", 404, "document_not_found");
  }

  const updated = await prisma.document.update({
    where: {
      id: document.id
    },
    data: {
      parseStatus: DocumentStatus.UPLOADED,
      needsReview: false
    }
  });

  await publishJob(queueNames.processDocument, {
    documentId: document.id
  });

  await createAuditEvent({
    userId,
    entityType: "document",
    entityId: document.id,
    actionType: AuditActionType.REPROCESS
  });

  return mapDocumentListItem(updated);
}
