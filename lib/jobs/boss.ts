import PgBoss from "pg-boss";
import { getEnv } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __moneymateBoss__: PgBoss | undefined;
}

export const queueNames = {
  processDocument: "documents.process",
  recomputeApproval: "documents.recompute-approval"
} as const;

async function buildBoss() {
  const env = getEnv();
  const boss = new PgBoss({
    connectionString: env.DATABASE_URL,
    schema: env.PG_BOSS_SCHEMA
  });

  await boss.start();
  return boss;
}

export async function getBoss() {
  if (!global.__moneymateBoss__) {
    global.__moneymateBoss__ = await buildBoss();
  }

  return global.__moneymateBoss__;
}

export async function publishJob<T extends object>(queueName: string, payload: T) {
  const boss = await getBoss();
  return boss.send(queueName, payload);
}

