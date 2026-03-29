import { Prisma } from "@prisma/client";

export function toJsonSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, current) => {
      if (current instanceof Prisma.Decimal) {
        return current.toString();
      }

      if (current instanceof Date) {
        return current.toISOString();
      }

      return current;
    })
  ) as T;
}

