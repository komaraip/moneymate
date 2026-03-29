import argon2 from "argon2";
import { getEnv } from "@/lib/env";

export async function hashPassword(password: string) {
  const env = getEnv();
  return argon2.hash(password, {
    memoryCost: env.ARGON2_MEMORY_COST,
    timeCost: env.ARGON2_TIME_COST,
    type: argon2.argon2id
  });
}

export async function verifyPassword(password: string, passwordHash: string) {
  return argon2.verify(passwordHash, password);
}

