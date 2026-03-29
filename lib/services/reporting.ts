import { CashflowReport } from "@/lib/contracts";
import { prisma } from "@/lib/db/prisma";
import { decimalToString, decimalToNumber } from "@/lib/utils/decimal";
import { cashflowReportQuerySchema } from "@/lib/validation/transactions";

function parseOptionalDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function resolveDateRange(fromRaw?: string, toRaw?: string) {
  const now = new Date();
  const parsedTo = parseOptionalDate(toRaw) ?? endOfMonth(now);
  const parsedFrom = parseOptionalDate(fromRaw) ?? startOfMonth(addMonths(parsedTo, -5));

  return {
    from: parsedFrom,
    to: parsedTo
  };
}

export async function getCashflowReport(
  userId: string,
  query: Record<string, string | string[] | undefined> = {}
): Promise<CashflowReport> {
  const params = cashflowReportQuerySchema.parse(query);
  const { from, to } = resolveDateRange(params.from, params.to);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: from,
        lte: to
      }
    },
    include: {
      category: {
        select: {
          name: true,
          categoryType: true
        }
      }
    },
    orderBy: {
      transactionDate: "asc"
    }
  });

  let income = 0;
  let expense = 0;
  const monthly = new Map<string, { income: number; expense: number }>();
  const categories = new Map<string, { categoryName: string; categoryType: string; total: number }>();

  let cursor = startOfMonth(from);
  while (cursor <= to) {
    monthly.set(formatMonthKey(cursor), {
      income: 0,
      expense: 0
    });
    cursor = addMonths(cursor, 1);
  }

  for (const transaction of transactions) {
    const amount = decimalToNumber(transaction.amount);
    const monthKey = formatMonthKey(transaction.transactionDate);
    const bucket = monthly.get(monthKey) ?? {
      income: 0,
      expense: 0
    };

    if (transaction.transactionType === "income") {
      income += amount;
      bucket.income += amount;
    }

    if (transaction.transactionType === "expense") {
      expense += amount;
      bucket.expense += amount;
    }

    if ((transaction.transactionType === "income" || transaction.transactionType === "expense") && transaction.category) {
      const categoryKey = `${transaction.category.categoryType}:${transaction.category.name}`;
      const existing = categories.get(categoryKey) ?? {
        categoryName: transaction.category.name,
        categoryType: transaction.category.categoryType,
        total: 0
      };

      existing.total += amount;
      categories.set(categoryKey, existing);
    }

    monthly.set(monthKey, bucket);
  }

  return {
    summary: {
      periodStart: from.toISOString(),
      periodEnd: to.toISOString(),
      income: decimalToString(income) ?? "0",
      expense: decimalToString(expense) ?? "0",
      net: decimalToString(income - expense) ?? "0",
      transactionCount: transactions.length
    },
    monthly: [...monthly.entries()].map(([month, totals]) => ({
      month,
      income: decimalToString(totals.income) ?? "0",
      expense: decimalToString(totals.expense) ?? "0",
      net: decimalToString(totals.income - totals.expense) ?? "0"
    })),
    categories: [...categories.values()]
      .sort((left, right) => right.total - left.total)
      .slice(0, 8)
      .map((entry) => ({
        categoryName: entry.categoryName,
        categoryType: entry.categoryType,
        total: decimalToString(entry.total) ?? "0"
      }))
  };
}
