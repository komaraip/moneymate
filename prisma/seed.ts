import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@moneymate.local";
  const existing = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("DemoPass123!"),
        displayName: "MoneyMate Demo"
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
