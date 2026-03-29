import crypto from "node:crypto";
import {
  AuditActionType,
  Document,
  DocumentStatus,
  DocumentType,
  ExtractionJobStatus,
  ExtractionStage,
  Prisma,
  ReviewStatus
} from "@prisma/client";
import { createAuditEvent } from "@/lib/audit/service";
import { prisma } from "@/lib/db/prisma";
import { parseStockActivityDocument } from "@/lib/parsing/stock-activity/parser";
import { getStoredObject } from "@/lib/storage/s3";
import { toDecimal } from "@/lib/utils/decimal";
import { AppError } from "@/lib/utils/errors";
import { toJsonSafe } from "@/lib/utils/json";
import { classifyDocument } from "./classification";
import { extractTextFromPdf } from "./pdf";
import { buildRuleSearchText, findMatchingDocumentMappingRule } from "./rules";

const parserVersion = "stock-activity-v1";
const lowParserConfidenceThreshold = 0.72;

type PersistParseInput = {
  document: Document;
  extractionJobId: string;
  rawText: string;
};

type AppliedDocumentMapping = {
  id: string;
  brokerId: string | null;
  investmentAccountId: string | null;
  categoryId: string | null;
};

async function updateJobStage(jobId: string, stage: ExtractionStage, status = ExtractionJobStatus.RUNNING) {
  return prisma.extractionJob.update({
    where: {
      id: jobId
    },
    data: {
      stage,
      status
    }
  });
}

async function ensureStocksInvestmentCategory(tx: Prisma.TransactionClient, userId: string) {
  const existing = await tx.investmentCategory.findFirst({
    where: {
      userId,
      slug: "stocks"
    }
  });

  if (existing) {
    return existing;
  }

  return tx.investmentCategory.create({
    data: {
      userId,
      name: "Stocks",
      slug: "stocks",
      isSystemDefault: true,
      sortOrder: 0
    }
  });
}

async function resolveDocumentMappingRule(
  userId: string,
  rawText: string,
  parsed: ReturnType<typeof parseStockActivityDocument>
) {
  const rules = await prisma.documentMappingRule.findMany({
    where: {
      userId
    }
  });

  const searchText = buildRuleSearchText([
    rawText,
    parsed.accountMetadata.office,
    parsed.accountMetadata.clientCode,
    parsed.accountMetadata.sid,
    parsed.accountMetadata.sre,
    parsed.accountMetadata.rdn,
    parsed.securities.map((security) => security.ticker).join(" "),
    parsed.securities.map((security) => security.securityName).join(" ")
  ]);
  const matchedRule = findMatchingDocumentMappingRule(rules, searchText);
  if (!matchedRule) {
    return null;
  }

  return {
    id: matchedRule.id,
    brokerId: matchedRule.brokerId,
    investmentAccountId: matchedRule.investmentAccountId,
    categoryId: matchedRule.categoryId
  } satisfies AppliedDocumentMapping;
}

async function upsertInvestmentAccount(
  tx: Prisma.TransactionClient,
  document: Document,
  parsed: ReturnType<typeof parseStockActivityDocument>,
  mappedRule: AppliedDocumentMapping | null
) {
  const mappedCategory = mappedRule?.categoryId
    ? await tx.investmentCategory.findFirst({
        where: {
          id: mappedRule.categoryId,
          userId: document.userId
        }
      })
    : null;
  const stocksCategory = mappedCategory ?? (await ensureStocksInvestmentCategory(tx, document.userId));

  const brokerName = parsed.accountMetadata.office?.trim() || "Imported broker profile";
  const mappedBroker = mappedRule?.brokerId
    ? await tx.broker.findFirst({
        where: {
          id: mappedRule.brokerId,
          userId: document.userId
        }
      })
    : null;
  const broker = mappedBroker
    ? await tx.broker.update({
        where: {
          id: mappedBroker.id
        },
        data: {
          investmentCategoryId: stocksCategory.id,
          clientCode: parsed.accountMetadata.clientCode ?? undefined,
          sid: parsed.accountMetadata.sid ?? undefined,
          sre: parsed.accountMetadata.sre ?? undefined
        }
      })
    : await tx.broker.upsert({
        where: {
          userId_brokerName: {
            userId: document.userId,
            brokerName
          }
        },
        update: {
          investmentCategoryId: stocksCategory.id,
          clientCode: parsed.accountMetadata.clientCode ?? undefined,
          sid: parsed.accountMetadata.sid ?? undefined,
          sre: parsed.accountMetadata.sre ?? undefined
        },
        create: {
          userId: document.userId,
          investmentCategoryId: stocksCategory.id,
          brokerName,
          clientCode: parsed.accountMetadata.clientCode,
          sid: parsed.accountMetadata.sid,
          sre: parsed.accountMetadata.sre
        }
      });

  const mappedInvestmentAccount = mappedRule?.investmentAccountId
    ? await tx.investmentAccount.findFirst({
        where: {
          id: mappedRule.investmentAccountId,
          userId: document.userId
        }
      })
    : null;
  if (mappedInvestmentAccount) {
    return tx.investmentAccount.update({
      where: {
        id: mappedInvestmentAccount.id
      },
      data: {
        investmentCategoryId: stocksCategory.id,
        brokerId: broker.id,
        brokerName: parsed.accountMetadata.office ?? broker.brokerName,
        sid: parsed.accountMetadata.sid ?? mappedInvestmentAccount.sid,
        clientCode: parsed.accountMetadata.clientCode ?? mappedInvestmentAccount.clientCode,
        sre: parsed.accountMetadata.sre ?? mappedInvestmentAccount.sre,
        rdn: parsed.accountMetadata.rdn ?? mappedInvestmentAccount.rdn,
        officeName: parsed.accountMetadata.office ?? mappedInvestmentAccount.officeName,
        salesperson: parsed.accountMetadata.salesperson ?? mappedInvestmentAccount.salesperson
      }
    });
  }

  const uniqueReference = parsed.accountMetadata.clientCode ?? parsed.accountMetadata.sid ?? crypto.randomUUID();
  const identifierClauses = [
    parsed.accountMetadata.clientCode
      ? {
          clientCode: parsed.accountMetadata.clientCode
        }
      : null,
    parsed.accountMetadata.sid
      ? {
          sid: parsed.accountMetadata.sid
        }
      : null
  ].filter(Boolean) as Prisma.InvestmentAccountWhereInput[];

  const existing =
    identifierClauses.length > 0
      ? await tx.investmentAccount.findFirst({
          where: {
            userId: document.userId,
            brokerId: broker.id,
            OR: identifierClauses
          }
        })
      : null;

  if (existing) {
    return tx.investmentAccount.update({
      where: {
        id: existing.id
      },
      data: {
        investmentCategoryId: stocksCategory.id,
        brokerId: broker.id,
        brokerName: parsed.accountMetadata.office ?? existing.brokerName ?? broker.brokerName,
        sid: parsed.accountMetadata.sid ?? existing.sid,
        clientCode: parsed.accountMetadata.clientCode ?? existing.clientCode,
        sre: parsed.accountMetadata.sre ?? existing.sre,
        rdn: parsed.accountMetadata.rdn ?? existing.rdn,
        officeName: parsed.accountMetadata.office ?? existing.officeName,
        salesperson: parsed.accountMetadata.salesperson ?? existing.salesperson
      }
    });
  }

  return tx.investmentAccount.create({
    data: {
      userId: document.userId,
      investmentCategoryId: stocksCategory.id,
      brokerId: broker.id,
      brokerName: parsed.accountMetadata.office ?? broker.brokerName,
      sid: parsed.accountMetadata.sid ?? uniqueReference,
      clientCode: parsed.accountMetadata.clientCode,
      sre: parsed.accountMetadata.sre,
      rdn: parsed.accountMetadata.rdn,
      officeName: parsed.accountMetadata.office,
      salesperson: parsed.accountMetadata.salesperson
    }
  });
}

async function persistParsedDocument(input: PersistParseInput) {
  const parsed = parseStockActivityDocument(input.rawText);
  const mappedRule = await resolveDocumentMappingRule(input.document.userId, input.rawText, parsed);
  const validationMessages = parsed.validationIssues.map((issue) => issue.message);
  if (parsed.parserConfidence < lowParserConfidenceThreshold) {
    validationMessages.push(
      `Overall parser confidence is ${Math.round(parsed.parserConfidence * 100)}%, so this document needs review before approval.`
    );
  }
  const requiresReview =
    parsed.validationIssues.some((issue) => issue.severity === "error") ||
    parsed.securities.some((security) => security.rows.some((row) => row.requiresReview)) ||
    parsed.parserConfidence < lowParserConfidenceThreshold ||
    !parsed.statementPeriod.start ||
    !parsed.statementPeriod.end;

  await prisma.$transaction(async (tx) => {
    const investmentAccount = await upsertInvestmentAccount(tx, input.document, parsed, mappedRule);

    await tx.documentMetadata.deleteMany({
      where: {
        documentId: input.document.id
      }
    });
    await tx.parsedField.deleteMany({
      where: {
        documentId: input.document.id
      }
    });
    await tx.tradeActivity.deleteMany({
      where: {
        sourceDocumentId: input.document.id
      }
    });
    await tx.holdingSnapshot.deleteMany({
      where: {
        sourceDocumentId: input.document.id
      }
    });

    const metadataRows: Prisma.DocumentMetadataCreateManyInput[] = [
      {
        documentId: input.document.id,
        key: "statement_period",
        valueJson: {
          start: parsed.statementPeriod.start,
          end: parsed.statementPeriod.end
        } as Prisma.InputJsonValue
      },
      {
        documentId: input.document.id,
        key: "account_metadata",
        valueJson: parsed.accountMetadata as Prisma.InputJsonValue
      },
      {
        documentId: input.document.id,
        key: "validation_issues",
        valueJson: validationMessages as Prisma.InputJsonValue
      },
      {
        documentId: input.document.id,
        key: "confidence_summary",
        valueJson: {
          parserConfidence: parsed.parserConfidence,
          threshold: lowParserConfidenceThreshold,
          requiresReview: parsed.parserConfidence < lowParserConfidenceThreshold
        } as Prisma.InputJsonValue
      },
      {
        documentId: input.document.id,
        key: "grand_total",
        valueText: parsed.grandTotals.grandTotal
      }
    ];
    if (mappedRule) {
      metadataRows.push({
        documentId: input.document.id,
        key: "applied_document_mapping_rule_id",
        valueText: mappedRule.id
      });
    }

    for (const security of parsed.securities) {
      metadataRows.push({
        documentId: input.document.id,
        key: `security_total:${security.ticker}`,
        valueText: security.totals.sectionTotal
      });
    }

    if (metadataRows.length > 0) {
      await tx.documentMetadata.createMany({
        data: metadataRows
      });
    }

    const parsedFieldRows: Prisma.ParsedFieldCreateManyInput[] = [];
    const metadataFields = [
      {
        fieldPath: "statementPeriod.start",
        rawValue: parsed.statementPeriod.start ?? "",
        normalizedValue: parsed.statementPeriod.start,
        confidence: parsed.statementPeriod.start ? 0.95 : 0.45,
        requiresReview: !parsed.statementPeriod.start
      },
      {
        fieldPath: "statementPeriod.end",
        rawValue: parsed.statementPeriod.end ?? "",
        normalizedValue: parsed.statementPeriod.end,
        confidence: parsed.statementPeriod.end ? 0.95 : 0.45,
        requiresReview: !parsed.statementPeriod.end
      },
      {
        fieldPath: "accountMetadata",
        rawValue: JSON.stringify(parsed.accountMetadata),
        normalizedValue: parsed.accountMetadata,
        confidence: 0.9,
        requiresReview: !parsed.accountMetadata.clientCode && !parsed.accountMetadata.sid
      }
    ];

    for (const field of metadataFields) {
      parsedFieldRows.push({
        documentId: input.document.id,
        extractionJobId: input.extractionJobId,
        fieldPath: field.fieldPath,
        rawValue: field.rawValue,
        normalizedValue: field.normalizedValue as Prisma.InputJsonValue,
        confidence: field.confidence,
        requiresReview: field.requiresReview,
        reviewStatus: ReviewStatus.PENDING
      });
    }

    for (const [securityIndex, securitySection] of parsed.securities.entries()) {
      const security = await tx.security.upsert({
        where: {
          userId_ticker: {
            userId: input.document.userId,
            ticker: securitySection.ticker
          }
        },
        update: {
          securityName: securitySection.securityName,
          currency: securitySection.currency
        },
        create: {
          userId: input.document.userId,
          ticker: securitySection.ticker,
          securityName: securitySection.securityName,
          currency: securitySection.currency
        }
      });

      for (const [rowIndex, row] of securitySection.rows.entries()) {
        const tradeActivityId = crypto.randomUUID();
        const holdingSnapshotId =
          row.activityType === "BEGINNING_BALANCE" || row.activityType === "END_BALANCE"
            ? crypto.randomUUID()
            : null;

        await tx.tradeActivity.create({
          data: {
            id: tradeActivityId,
            userId: input.document.userId,
            investmentAccountId: investmentAccount.id,
            securityId: security.id,
            sourceDocumentId: input.document.id,
            activityDate: row.activityDate ? new Date(row.activityDate) : null,
            settleDate: row.settleDate ? new Date(row.settleDate) : null,
            externalReference: row.referenceNumber,
            activityType: row.activityType as never,
            rawDescription: row.description || row.rawRowText,
            quantity: toDecimal(row.quantity),
            price: toDecimal(row.price),
            balanceAfter: toDecimal(row.balanceAfter),
            averagePriceAfter: toDecimal(row.averagePriceAfter),
            marketValueAfter: toDecimal(row.marketValueAfter),
            realizedProfitLoss: toDecimal(row.realizedProfitLoss),
            currency: securitySection.currency,
            confidence: row.confidence,
            requiresReview: row.requiresReview,
            reviewStatus: ReviewStatus.PENDING,
            rawRowJson: row as Prisma.InputJsonValue
          }
        });

        if (holdingSnapshotId && row.balanceAfter) {
          await tx.holdingSnapshot.create({
            data: {
              id: holdingSnapshotId,
              userId: input.document.userId,
              investmentAccountId: investmentAccount.id,
              securityId: security.id,
              snapshotDate: row.activityDate
                ? new Date(row.activityDate)
                : row.activityType === "BEGINNING_BALANCE" && parsed.statementPeriod.start
                  ? new Date(parsed.statementPeriod.start)
                  : parsed.statementPeriod.end
                    ? new Date(parsed.statementPeriod.end)
                    : new Date(),
              quantity: toDecimal(row.balanceAfter) ?? new Prisma.Decimal(0),
              averageCost: toDecimal(row.averagePriceAfter),
              marketValue: toDecimal(row.marketValueAfter),
              sourceDocumentId: input.document.id,
              reviewStatus: ReviewStatus.PENDING
            }
          });
        }

        parsedFieldRows.push({
          documentId: input.document.id,
          extractionJobId: input.extractionJobId,
          fieldPath: `securities[${securityIndex}].rows[${rowIndex}]`,
          rawValue: row.rawRowText,
          normalizedValue: row as Prisma.InputJsonValue,
          confidence: row.confidence,
          requiresReview: row.requiresReview,
          reviewStatus: ReviewStatus.PENDING,
          linkedEntityType: "trade_activity",
          linkedEntityId: tradeActivityId,
          sourceBboxJson: holdingSnapshotId ? ({ holdingSnapshotId } as Prisma.InputJsonValue) : undefined
        });
      }
    }

    if (parsedFieldRows.length > 0) {
      await tx.parsedField.createMany({
        data: parsedFieldRows
      });
    }

    await tx.document.update({
      where: {
        id: input.document.id
      },
      data: {
        documentType: DocumentType.STOCK_ACTIVITY_STATEMENT,
        statementStartDate: parsed.statementPeriod.start ? new Date(parsed.statementPeriod.start) : null,
        statementEndDate: parsed.statementPeriod.end ? new Date(parsed.statementPeriod.end) : null,
        parseStatus: requiresReview ? DocumentStatus.NEEDS_REVIEW : DocumentStatus.PARSED,
        parserVersion,
        overallConfidence: parsed.parserConfidence,
        needsReview: requiresReview,
        processedAt: new Date()
      }
    });
  });

  return parsed;
}

export async function processDocumentById(documentId: string) {
  const document = await prisma.document.findUnique({
    where: {
      id: documentId
    }
  });

  if (!document) {
    throw new AppError("Document not found.", 404, "document_not_found");
  }

  const extractionJob = await prisma.extractionJob.create({
    data: {
      documentId: document.id,
      status: ExtractionJobStatus.RUNNING,
      stage: ExtractionStage.FINGERPRINTING,
      startedAt: new Date()
    }
  });

  try {
    await prisma.document.update({
      where: {
        id: document.id
      },
      data: {
        parseStatus: DocumentStatus.PROCESSING,
        needsReview: false
      }
    });

    if (document.originalMimeType !== "application/pdf") {
      throw new AppError(
        "Only text-based PDF uploads are fully supported in the Phase 2 MVP.",
        415,
        "unsupported_file_type"
      );
    }

    await updateJobStage(extractionJob.id, ExtractionStage.TEXT_EXTRACTION);
    const buffer = await getStoredObject(document.storageKey);
    const rawText = await extractTextFromPdf(buffer);

    await updateJobStage(extractionJob.id, ExtractionStage.CLASSIFICATION);
    const classification = classifyDocument(rawText);
    if (classification.documentType !== DocumentType.STOCK_ACTIVITY_STATEMENT) {
      throw new AppError(
        "The uploaded document could not be classified as a stock activity statement.",
        422,
        "unsupported_document_type"
      );
    }

    await updateJobStage(extractionJob.id, ExtractionStage.STRUCTURED_PARSING);
    const parsed = await persistParsedDocument({
      document,
      extractionJobId: extractionJob.id,
      rawText
    });

    await prisma.extractionJob.update({
      where: {
        id: extractionJob.id
      },
      data: {
        status: ExtractionJobStatus.SUCCEEDED,
        stage: ExtractionStage.COMPLETED,
        rawText,
        extractedJson: toJsonSafe(parsed) as Prisma.InputJsonValue,
        finishedAt: new Date()
      }
    });

    await createAuditEvent({
      userId: document.userId,
      entityType: "document",
      entityId: document.id,
      actionType: AuditActionType.UPDATE,
      afterJson: {
        parseStatus:
          parsed.validationIssues.some((issue) => issue.severity === "error") ||
          parsed.securities.some((security) => security.rows.some((row) => row.requiresReview)) ||
          parsed.parserConfidence < lowParserConfidenceThreshold ||
          !parsed.statementPeriod.start ||
          !parsed.statementPeriod.end
            ? DocumentStatus.NEEDS_REVIEW
            : DocumentStatus.PARSED,
        parserVersion
      },
      metadataJson: {
        extractionJobId: extractionJob.id
      }
    });

    return parsed;
  } catch (error) {
    const appError =
      error instanceof AppError ? error : new AppError("Document processing failed.", 500, "processing_failed");

    await prisma.extractionJob.update({
      where: {
        id: extractionJob.id
      },
      data: {
        status: ExtractionJobStatus.FAILED,
        errorMessage: appError.message,
        finishedAt: new Date()
      }
    });

    await prisma.document.update({
      where: {
        id: document.id
      },
      data: {
        parseStatus: DocumentStatus.FAILED,
        needsReview: true,
        processedAt: new Date()
      }
    });

    await createAuditEvent({
      userId: document.userId,
      entityType: "document",
      entityId: document.id,
      actionType: AuditActionType.UPDATE,
      afterJson: {
        parseStatus: DocumentStatus.FAILED,
        error: appError.message
      }
    });

    throw appError;
  }
}
