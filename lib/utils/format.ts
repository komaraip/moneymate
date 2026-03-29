import { format } from "date-fns";

export function formatCurrency(value: number | string, currency = "IDR") {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return "-";
  }

  return new Intl.NumberFormat("en-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(numeric);
}

export function formatDate(value: Date | string | null | undefined, fallback = "-") {
  if (!value) {
    return fallback;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return format(date, "dd MMM yyyy");
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}
