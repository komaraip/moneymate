import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@moneymate.local";
  const user = await prisma.user.upsert({
    where: {
      email
    },
    update: {
      displayName: "MoneyMate Demo"
    },
    create: {
      email,
      passwordHash: await hashPassword("DemoPass123!"),
      displayName: "MoneyMate Demo"
    }
  });

  const defaultInvestmentCategories = [
    "Stocks",
    "Mutual Funds",
    "ETFs",
    "Bonds",
    "Gold",
    "Crypto",
    "Other Investments"
  ];

  await prisma.investmentCategory.deleteMany({
    where: {
      userId: user.id,
      isSystemDefault: true
    }
  });

  await prisma.investmentCategory.createMany({
    data: defaultInvestmentCategories.map((name, index) => ({
      userId: user.id,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      isSystemDefault: true,
      sortOrder: index
    }))
  });

  await prisma.reportPreference.upsert({
    where: {
      userId: user.id
    },
    update: {
      defaultCashflowMode: "SEPARATE",
      includeDividendsInIncome: true,
      includeStockSaleProceedsInIncome: false,
      includeBrokerFeesInExpenses: false,
      includeInvestmentCashInTotalCash: true
    },
    create: {
      userId: user.id,
      defaultCashflowMode: "SEPARATE",
      includeDividendsInIncome: true,
      includeStockSaleProceedsInIncome: false,
      includeBrokerFeesInExpenses: false,
      includeInvestmentCashInTotalCash: true
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
