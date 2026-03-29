import { Prisma } from "@prisma/client";

export function toDecimal(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return new Prisma.Decimal(value);
}

export function decimalToString(
  value: Prisma.Decimal | string | number | null | undefined
) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toString();
  }

  return `${value}`;
}

export function decimalToNumber(
  value: Prisma.Decimal | string | number | null | undefined,
  fallback = 0
) {
  const serialised = decimalToString(value);
  if (!serialised) {
    return fallback;
  }

  const numeric = Number(serialised);
  return Number.isFinite(numeric) ? numeric : fallback;
}

