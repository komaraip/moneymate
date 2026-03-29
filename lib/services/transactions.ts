import { AuditActionType, CategoryType, ReviewStatus, SourceType } from "@prisma/client";
import { PaginatedTransactions, TransactionListItem } from "@/lib/contracts";
import { createAuditEvent } from "@/lib/audit/service";
import { prisma } from "@/lib/db/prisma";
import {
  getCategoryTypeForTransactionType,
  getDirectionForTransactionType,
  manualTransactionTypes,
  type ManualTransactionType
} from "@/lib/finance";
import { toDecimal } from "@/lib/utils/decimal";
import { AppError } from "@/lib/utils/errors";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema
} from "@/lib/validation/transactions";
import { mapTransactionListItem } from "./mappers";

function parseOptionalDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Enter a valid date.", 422, "invalid_date");
  }

  return date;
}

function parseRequiredDecimal(value: string, code: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new AppError("Enter a valid amount.", 422, code);
  }

  const decimal = toDecimal(value);
  if (!decimal) {
    throw new AppError("Enter a valid amount.", 422, code);
  }

  return decimal;
}

async function requireOwnedAccount(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId
    }
  });

  if (!account) {
    throw new AppError("Account not found.", 404, "account_not_found");
  }

  return account;
}

async function upsertCategory(
  userId: string,
  categoryName: string | null | undefined,
  transactionType: ManualTransactionType
) {
  if (!categoryName) {
    return null;
  }

  return prisma.category.upsert({
    where: {
      userId_name_categoryType: {
        userId,
        name: categoryName,
        categoryType: getCategoryTypeForTransactionType(transactionType) as CategoryType
      }
    },
    update: {},
    create: {
      userId,
      name: categoryName,
      categoryType: getCategoryTypeForTransactionType(transactionType) as CategoryType
    }
  });
}

export async function listTransactions(
  userId: string,
  query: Record<string, string | string[] | undefined> = {}
): Promise<PaginatedTransactions> {
  const params = listTransactionsQuerySchema.parse(query);
  const fromDate = parseOptionalDate(params.from);
  const toDate = parseOptionalDate(params.to);

  const where = {
    userId,
    accountId: params.accountId,
    transactionType: params.type,
    transactionDate:
      fromDate || toDate
        ? {
            gte: fromDate ?? undefined,
            lte: toDate ?? undefined
          }
        : undefined,
    OR: params.search
      ? [
          {
            description: {
              contains: params.search,
              mode: "insensitive" as const
            }
          },
          {
            merchantName: {
              contains: params.search,
              mode: "insensitive" as const
            }
          },
          {
            counterpartyName: {
              contains: params.search,
              mode: "insensitive" as const
            }
          },
          {
            category: {
              is: {
                name: {
                  contains: params.search,
                  mode: "insensitive" as const
                }
              }
            }
          }
        ]
      : undefined
  };

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({
      where
    }),
    prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            name: true,
            accountType: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        {
          transactionDate: "desc"
        },
        {
          createdAt: "desc"
        }
      ],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize
    })
  ]);

  return {
    items: transactions.map(mapTransactionListItem),
    total,
    page: params.page,
    pageSize: params.pageSize
  };
}

export async function createTransaction(userId: string, input: Record<string, unknown>): Promise<TransactionListItem> {
  const payload = createTransactionSchema.parse(input);
  const account = await requireOwnedAccount(userId, payload.accountId);
  const category = await upsertCategory(userId, payload.categoryName ?? null, payload.transactionType);

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      accountId: account.id,
      sourceType: SourceType.MANUAL,
      transactionType: payload.transactionType,
      direction: getDirectionForTransactionType(payload.transactionType),
      transactionDate: parseOptionalDate(payload.transactionDate) ?? new Date(),
      postingDate: parseOptionalDate(payload.postingDate),
      amount: parseRequiredDecimal(payload.amount, "invalid_amount"),
      currency: payload.currency.toUpperCase(),
      description: payload.description,
      categoryId: category?.id,
      merchantName: payload.merchantName || undefined,
      counterpartyName: payload.counterpartyName || undefined,
      reviewStatus: ReviewStatus.APPROVED,
      isManual: true,
      notes: payload.notes || undefined
    },
    include: {
      account: {
        select: {
          name: true,
          accountType: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  await createAuditEvent({
    userId,
    entityType: "transaction",
    entityId: transaction.id,
    actionType: AuditActionType.CREATE,
    afterJson: {
      accountId: transaction.accountId,
      transactionType: transaction.transactionType,
      amount: transaction.amount.toString()
    }
  });

  return mapTransactionListItem(transaction);
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: Record<string, unknown>
): Promise<TransactionListItem> {
  const payload = updateTransactionSchema.parse(input);
  const existing = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
      isManual: true
    },
    include: {
      account: {
        select: {
          name: true,
          accountType: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!existing) {
    throw new AppError("Transaction not found.", 404, "transaction_not_found");
  }

  const nextTransactionType = (payload.transactionType ?? existing.transactionType) as ManualTransactionType;
  if (!manualTransactionTypes.includes(nextTransactionType)) {
    throw new AppError("Unsupported transaction type.", 422, "invalid_transaction_type");
  }

  const nextAccount =
    payload.accountId && payload.accountId !== existing.accountId
      ? await requireOwnedAccount(userId, payload.accountId)
      : null;

  const category =
    payload.categoryName !== undefined
      ? await upsertCategory(userId, payload.categoryName ?? null, nextTransactionType)
      : payload.transactionType
        ? await upsertCategory(userId, existing.category?.name ?? null, nextTransactionType)
        : existing.category;

  const updated = await prisma.transaction.update({
    where: {
      id: existing.id
    },
    data: {
      accountId: nextAccount?.id ?? undefined,
      transactionType: nextTransactionType,
      direction: getDirectionForTransactionType(nextTransactionType),
      transactionDate:
        payload.transactionDate !== undefined ? parseOptionalDate(payload.transactionDate) ?? existing.transactionDate : undefined,
      postingDate:
        payload.postingDate !== undefined
          ? parseOptionalDate(payload.postingDate)
          : undefined,
      amount: payload.amount !== undefined ? parseRequiredDecimal(payload.amount, "invalid_amount") : undefined,
      currency: payload.currency ? payload.currency.toUpperCase() : undefined,
      description: payload.description,
      categoryId:
        payload.categoryName !== undefined || payload.transactionType !== undefined
          ? category?.id ?? null
          : undefined,
      merchantName: payload.merchantName === null ? null : payload.merchantName || undefined,
      counterpartyName: payload.counterpartyName === null ? null : payload.counterpartyName || undefined,
      notes: payload.notes === null ? null : payload.notes || undefined
    },
    include: {
      account: {
        select: {
          name: true,
          accountType: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  await createAuditEvent({
    userId,
    entityType: "transaction",
    entityId: updated.id,
    actionType: AuditActionType.UPDATE,
    beforeJson: {
      transactionType: existing.transactionType,
      amount: existing.amount.toString()
    },
    afterJson: {
      transactionType: updated.transactionType,
      amount: updated.amount.toString()
    }
  });

  return mapTransactionListItem(updated);
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const existing = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
      isManual: true
    }
  });

  if (!existing) {
    throw new AppError("Transaction not found.", 404, "transaction_not_found");
  }

  await prisma.transaction.delete({
    where: {
      id: existing.id
    }
  });

  await createAuditEvent({
    userId,
    entityType: "transaction",
    entityId: existing.id,
    actionType: AuditActionType.DELETE,
    beforeJson: {
      transactionType: existing.transactionType,
      amount: existing.amount.toString()
    }
  });

  return {
    success: true
  };
}
