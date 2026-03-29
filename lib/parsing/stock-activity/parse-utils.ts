const monthMap: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12"
};

export const dateTokenRegex = /^\d{1,2}[-/ ][A-Za-z]{3}[-/ ]\d{2,4}$/;

export function normalizeLine(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

export function parseLooseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/\//g, "-").replace(/\s+/g, "-");
  const match = normalized.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (!match) {
    return null;
  }

  const [, day, monthToken, yearToken] = match;
  const month = monthMap[monthToken.toLowerCase()];
  if (!month) {
    return null;
  }

  const year = yearToken.length === 2 ? `20${yearToken}` : yearToken;
  const iso = `${year}-${month}-${day.padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseNumericString(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/[A-Za-z$€£¥]/g, "")
    .replace(/\(([^)]+)\)/, "-$1")
    .replace(/,/g, "")
    .trim();

  if (!/^[-+]?\d*\.?\d+$/.test(normalized)) {
    return null;
  }

  return normalized.replace(/^\+/, "");
}

export function looksLikeNumericToken(token: string) {
  return parseNumericString(token) !== null;
}

export function averageConfidence(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(4));
}

