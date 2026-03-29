import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

declare global {
  // eslint-disable-next-line no-var
  var __moneymatePrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__moneymatePrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__moneymatePrisma__ = prisma;
}
