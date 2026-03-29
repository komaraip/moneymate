import { AuditActionType, SourceType } from "@prisma/client";
import { AccountDetail, AccountSummary } from "@/lib/contracts";
import { createAuditEvent } from "@/lib/audit/service";
import { prisma } from "@/lib/db/prisma";
import { cashAccountTypes, maskAccountNumber } from "@/lib/finance";
import { toDecimal } from "@/lib/utils/decimal";
import { AppError } from "@/lib/utils/errors";
import {
  createAccountSchema,
  createAccountSnapshotSchema,
  listAccountsQuerySchema,
  updateAccountSchema
} from "@/lib/validation/accounts";
import { mapAccountSnapshot, mapAccountSummary, mapTransactionListItem } from "./mappers";

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

async function getLatestSnapshots(accountIds: string[]) {
  if (accountIds.length === 0) {
    return new Map<string, null>();
  }

  const snapshots = await prisma.accountSnapshot.findMany({
    where: {
      accountId: {
        in: accountIds
      }
    },
    orderBy: [
      {
        snapshotDate: "desc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  const latestByAccount = new Map<string, (typeof snapshots)[number] | null>();
  for (const snapshot of snapshots) {
    if (!latestByAccount.has(snapshot.accountId)) {
      latestByAccount.set(snapshot.accountId, snapshot);
    }
  }

  for (const accountId of accountIds) {
    if (!latestByAccount.has(accountId)) {
      latestByAccount.set(accountId, null);
    }
  }

  return latestByAccount;
}

export async function listAccounts(userId: string, query: Record<string, string | string[] | undefined> = {}) {
  const params = listAccountsQuerySchema.parse(query);

  const accounts = await prisma.account.findMany({
    where: {
      userId,
      accountType: {
        in: params.accountType ? [params.accountType] : [...cashAccountTypes]
      },
      isActive: params.includeInactive ? undefined : true,
      OR: params.search
        ? [
            {
              name: {
                contains: params.search,
                mode: "insensitive"
              }
            },
            {
              institutionName: {
                contains: params.search,
                mode: "insensitive"
              }
            },
            {
              maskedAccountNumber: {
                contains: params.search,
                mode: "insensitive"
              }
            },
            {
              externalReference: {
                contains: params.search,
                mode: "insensitive"
              }
            }
          ]
        : undefined
    },
    orderBy: [
      {
        isActive: "desc"
      },
      {
        updatedAt: "desc"
      }
    ]
  });

  const latestSnapshots = await getLatestSnapshots(accounts.map((account) => account.id));

  return accounts.map((account) =>
    mapAccountSummary({
      ...account,
      latestSnapshot: latestSnapshots.get(account.id) ?? null
    })
  );
}

export async function createAccount(
  userId: string,
  input: Record<string, unknown>
): Promise<AccountSummary> {
  const payload = createAccountSchema.parse(input);
  const normalizedAccountNumber = payload.accountNumber.replace(/\s+/g, "");

  const existing = await prisma.account.findFirst({
    where: {
      userId,
      accountType: payload.accountType,
      externalReference: normalizedAccountNumber
    }
  });

  if (existing) {
    throw new AppError("An account with that number already exists.", 409, "account_exists");
  }

  const created = await prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        userId,
        name: payload.name,
        institutionName: payload.institutionName || undefined,
        accountType: payload.accountType,
        currency: payload.currency.toUpperCase(),
        maskedAccountNumber: maskAccountNumber(normalizedAccountNumber),
        externalReference: normalizedAccountNumber
      }
    });

    if (payload.openingBalance) {
      await tx.accountSnapshot.create({
        data: {
          accountId: account.id,
          snapshotDate: parseOptionalDate(payload.openingBalanceDate) ?? new Date(),
          balance: parseRequiredDecimal(payload.openingBalance, "invalid_opening_balance"),
          availableBalance: parseRequiredDecimal(payload.openingBalance, "invalid_opening_balance"),
          sourceType: SourceType.MANUAL,
          confidence: 1
        }
      });
    }

    return account;
  });

  await createAuditEvent({
    userId,
    entityType: "account",
    entityId: created.id,
    actionType: AuditActionType.CREATE,
    afterJson: {
      name: created.name,
      accountType: created.accountType
    }
  });

  const [account] = await listAccounts(userId, {
    search: normalizedAccountNumber,
    includeInactive: "true"
  });

  return account ?? mapAccountSummary(created);
}

export async function updateAccount(userId: string, accountId: string, input: Record<string, unknown>) {
  const payload = updateAccountSchema.parse(input);
  const existing = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId
    }
  });

  if (!existing) {
    throw new AppError("Account not found.", 404, "account_not_found");
  }

  const nextAccountNumber = payload.accountNumber?.replace(/\s+/g, "");
  if (nextAccountNumber && nextAccountNumber !== existing.externalReference) {
    const duplicate = await prisma.account.findFirst({
      where: {
        userId,
        accountType: payload.accountType ?? existing.accountType,
        externalReference: nextAccountNumber,
        id: {
          not: existing.id
        }
      }
    });

    if (duplicate) {
      throw new AppError("An account with that number already exists.", 409, "account_exists");
    }
  }

  const updated = await prisma.account.update({
    where: {
      id: existing.id
    },
    data: {
      name: payload.name,
      institutionName: payload.institutionName === null ? null : payload.institutionName || undefined,
      accountType: payload.accountType,
      currency: payload.currency ? payload.currency.toUpperCase() : undefined,
      maskedAccountNumber: nextAccountNumber ? maskAccountNumber(nextAccountNumber) : undefined,
      externalReference: nextAccountNumber ?? undefined,
      isActive: payload.isActive
    }
  });

  await createAuditEvent({
    userId,
    entityType: "account",
    entityId: updated.id,
    actionType: AuditActionType.UPDATE,
    beforeJson: {
      name: existing.name,
      accountType: existing.accountType,
      isActive: existing.isActive
    },
    afterJson: {
      name: updated.name,
      accountType: updated.accountType,
      isActive: updated.isActive
    }
  });

  const detail = await getAccountDetail(userId, updated.id);
  if (!detail) {
    throw new AppError("Account not found.", 404, "account_not_found");
  }

  return detail.account;
}

export async function createAccountSnapshot(userId: string, accountId: string, input: Record<string, unknown>) {
  const payload = createAccountSnapshotSchema.parse(input);
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId
    }
  });

  if (!account) {
    throw new AppError("Account not found.", 404, "account_not_found");
  }

  const snapshot = await prisma.accountSnapshot.create({
    data: {
      accountId: account.id,
      snapshotDate: parseOptionalDate(payload.snapshotDate) ?? new Date(),
      balance: parseRequiredDecimal(payload.balance, "invalid_balance"),
      availableBalance: payload.availableBalance ? parseRequiredDecimal(payload.availableBalance, "invalid_balance") : null,
      sourceType: SourceType.MANUAL,
      confidence: 1
    }
  });

  await createAuditEvent({
    userId,
    entityType: "account_snapshot",
    entityId: snapshot.id,
    actionType: AuditActionType.CREATE,
    afterJson: {
      accountId: account.id,
      balance: snapshot.balance.toString()
    }
  });

  return mapAccountSnapshot(snapshot);
}

export async function getAccountDetail(userId: string, accountId: string): Promise<AccountDetail | null> {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId,
      accountType: {
        in: [...cashAccountTypes]
      }
    }
  });

  if (!account) {
    return null;
  }

  const [latestSnapshots, snapshots, transactions] = await Promise.all([
    getLatestSnapshots([account.id]),
    prisma.accountSnapshot.findMany({
      where: {
        accountId: account.id
      },
      orderBy: [
        {
          snapshotDate: "desc"
        },
        {
          createdAt: "desc"
        }
      ],
      take: 12
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        accountId: account.id
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
      take: 25
    })
  ]);

  return {
    account: mapAccountSummary({
      ...account,
      latestSnapshot: latestSnapshots.get(account.id) ?? null
    }),
    snapshots: snapshots.map(mapAccountSnapshot),
    recentTransactions: transactions.map(mapTransactionListItem)
  };
}
