import { loadEnvConfig } from "@next/env";
import { z } from "zod";

const runtimeEnvSchema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_COOKIE_NAME: z.string().default("moneymate_session"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  AWS_REGION: z.string().default("ap-southeast-1"),
  AWS_ACCESS_KEY_ID: z.string().optional().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(""),
  AWS_S3_BUCKET: z.string().optional().default(""),
  AWS_S3_ENDPOINT: z.string().optional().default(""),
  UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  PDF_MAX_SIZE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  PG_BOSS_SCHEMA: z.string().default("pbboss"),
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(19456),
  ARGON2_TIME_COST: z.coerce.number().int().positive().default(2)
});

const envSchema = runtimeEnvSchema.extend({
  DATABASE_URL: z.string().min(1)
});

let cachedRuntimeEnv: z.infer<typeof runtimeEnvSchema> | null = null;
let cachedEnv: z.infer<typeof envSchema> | null = null;
let envLoaded = false;

function ensureEnvLoaded() {
  if (!envLoaded) {
    loadEnvConfig(process.cwd());
    envLoaded = true;
  }
}

export function getRuntimeEnv() {
  ensureEnvLoaded();
  if (!cachedRuntimeEnv) {
    cachedRuntimeEnv = runtimeEnvSchema.parse(process.env);
  }

  return cachedRuntimeEnv;
}

export function getEnv() {
  ensureEnvLoaded();
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}
