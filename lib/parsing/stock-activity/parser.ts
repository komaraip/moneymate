import { ParsedStockActivityDocument, ParsedStockActivityRow, ValidationIssue } from "./types";
import {
  averageConfidence,
  dateTokenRegex,
  looksLikeNumericToken,
  normalizeLine,
  parseLooseDate,
  parseNumericString
} from "./parse-utils";

const supportedCurrencies = ["IDR", "USD", "SGD", "AUD", "EUR", "JPY"];

function parseMetadata(lines: string[]) {
  const joined = lines.join("\n");
  const periodMatch = joined.match(
    /(?:period|statement period|from)\s*(?:range)?[^0-9]*(\d{1,2}[-/ ][A-Za-z]{3}[-/ ]\d{2,4})\s*(?:to|-)\s*(\d{1,2}[-/ ][A-Za-z]{3}[-/ ]\d{2,4})/i
  );

  const pickField = (label: string) => {
    const regex = new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, "i");
    const match = joined.match(regex);
    return match ? normalizeLine(match[1]) : null;
  };

  return {
    statementPeriod: {
      start: parseLooseDate(periodMatch?.[1]),
      end: parseLooseDate(periodMatch?.[2])
    },
    accountMetadata: {
      sid: pickField("SID"),
      clientCode: pickField("Client Code"),
      sre: pickField("SRE\\s*/\\s*RDN"),
      rdn: null,
      office: pickField("Office"),
      salesperson: pickField("Salesperson")
    }
  };
}

function parseActivityType(description: string, quantity: string | null) {
  const normalized = description.toLowerCase();
  const quantityValue = quantity ? Number(quantity) : 0;

  if (normalized.includes("beginning balance")) return "BEGINNING_BALANCE";
  if (normalized.includes("end balance")) return "END_BALANCE";
  if (normalized.includes("ipo") || normalized.includes("e-ipo")) return "IPO_ALLOTMENT";
  if (normalized.includes("warrant") && normalized.includes("expired")) return "WARRANT_EXPIRY";
  if (normalized.includes("warrant") && (normalized.includes("distribution") || normalized.includes("distribusi"))) {
    return "WARRANT_DISTRIBUTION";
  }
  if (normalized.includes("dividend")) return "DIVIDEND";
  if (normalized.includes("distribution") || normalized.includes("distribusi")) return "CORPORATE_DISTRIBUTION";
  if (normalized.includes("corporate action")) return "CORPORATE_ACTION";
  if (normalized.includes("sell") || quantityValue < 0) return "SELL";
  if (normalized.includes("buy") || quantityValue > 0) return "BUY";
  return "UNKNOWN_ACTIVITY";
}

function parseRowBlock(rawRowText: string, ticker: string): ParsedStockActivityRow {
  const normalized = normalizeLine(rawRowText);
  const tokens = normalized.split(" ");

  let tokenIndex = 0;
  const activityDateToken = tokens[tokenIndex] && dateTokenRegex.test(tokens[tokenIndex]) ? tokens[tokenIndex++] : null;
  const settleDateToken = tokens[tokenIndex] && dateTokenRegex.test(tokens[tokenIndex]) ? tokens[tokenIndex++] : null;
  const referenceToken =
    tokens[tokenIndex] &&
    !looksLikeNumericToken(tokens[tokenIndex]) &&
    !dateTokenRegex.test(tokens[tokenIndex]) &&
    /^[A-Za-z0-9./_-]{3,}$/.test(tokens[tokenIndex])
      ? tokens[tokenIndex++]
      : null;

  const remainingTokens = tokens.slice(tokenIndex);
  const numericTail: string[] = [];
  while (remainingTokens.length > 0 && looksLikeNumericToken(remainingTokens[remainingTokens.length - 1])) {
    numericTail.unshift(remainingTokens.pop() as string);
  }

  const description = remainingTokens.join(" ").trim();
  const mappedNumericFields = {
    price: numericTail[0] ? parseNumericString(numericTail[0]) : null,
    quantity: numericTail[1] ? parseNumericString(numericTail[1]) : null,
    balanceAfter: numericTail[2] ? parseNumericString(numericTail[2]) : null,
    averagePriceAfter: numericTail[3] ? parseNumericString(numericTail[3]) : null,
    marketValueAfter: numericTail[4] ? parseNumericString(numericTail[4]) : null,
    realizedProfitLoss: numericTail[5] ? parseNumericString(numericTail[5]) : null
  };

  let confidence = 0.88;
  if (!activityDateToken) confidence -= 0.2;
  if (!description) confidence -= 0.25;
  if (numericTail.length < 2) confidence -= 0.18;
  if (!ticker) confidence -= 0.15;

  return {
    rawRowText,
    activityDate: parseLooseDate(activityDateToken),
    settleDate: parseLooseDate(settleDateToken),
    referenceNumber: referenceToken,
    description,
    activityType: parseActivityType(description, mappedNumericFields.quantity),
    ...mappedNumericFields,
    confidence: Number(Math.max(0.15, Math.min(0.99, confidence)).toFixed(4)),
    requiresReview:
      !activityDateToken || !description || numericTail.length < 2 || mappedNumericFields.quantity === null
  };
}

function looksLikeSectionHeader(line: string) {
  const normalized = normalizeLine(line);
  if (!normalized || normalized.includes(":") || normalized.includes("Grand Total")) {
    return false;
  }

  const tokens = normalized.split(" ");
  const first = tokens[0];
  const last = tokens[tokens.length - 1];

  return /^[A-Z0-9-]{2,12}$/.test(first) && supportedCurrencies.includes(last) && !dateTokenRegex.test(first);
}

function splitSections(lines: string[]) {
  const sections: Array<{ header: string; lines: string[] }> = [];
  let current: { header: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (looksLikeSectionHeader(line)) {
      if (current) sections.push(current);
      current = { header: line, lines: [] };
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }

  if (current) sections.push(current);
  return sections;
}

function extractGrandTotal(lines: string[]) {
  const grandTotalLine = [...lines].reverse().find((line) => /grand total/i.test(line));
  if (!grandTotalLine) return null;
  const numeric = [...normalizeLine(grandTotalLine).split(" ")].reverse().find((token) => looksLikeNumericToken(token));
  return numeric ? parseNumericString(numeric) : null;
}

function parseSection(section: { header: string; lines: string[] }, issues: ValidationIssue[]) {
  const headerTokens = normalizeLine(section.header).split(" ");
  const currency = headerTokens[headerTokens.length - 1];
  const ticker = headerTokens[0];
  const securityName = headerTokens.slice(1, -1).join(" ").trim() || ticker;

  const rowBlocks: string[] = [];
  let currentRow: string[] = [];
  let sectionTotal: string | null = null;

  for (const rawLine of section.lines) {
    const line = normalizeLine(rawLine);
    if (!line) continue;
    if (/^(date|settle|description|ref|price|volume|balance|avg)/i.test(line)) continue;

    if (/^total/i.test(line)) {
      const lastNumeric = [...line.split(" ")].reverse().find((token) => looksLikeNumericToken(token));
      sectionTotal = lastNumeric ? parseNumericString(lastNumeric) : null;
      continue;
    }

    const firstToken = line.split(" ")[0];
    if (dateTokenRegex.test(firstToken)) {
      if (currentRow.length > 0) rowBlocks.push(currentRow.join(" "));
      currentRow = [line];
      continue;
    }

    if (currentRow.length > 0) currentRow.push(line);
  }

  if (currentRow.length > 0) rowBlocks.push(currentRow.join(" "));

  const rows = rowBlocks.map((rowText) => parseRowBlock(rowText, ticker));
  const numericRows = rows.filter((row) => row.quantity !== null);
  const startBalance = rows.find((row) => row.activityType === "BEGINNING_BALANCE")?.balanceAfter;
  const endBalance = [...rows].reverse().find((row) => row.activityType === "END_BALANCE")?.balanceAfter;

  if (startBalance && endBalance) {
    const movement = numericRows
      .filter((row) => !["BEGINNING_BALANCE", "END_BALANCE"].includes(row.activityType))
      .reduce((total, row) => total + Number(row.quantity ?? 0), 0);
    const expectedEnd = Number(startBalance) + movement;
    const actualEnd = Number(endBalance);
    if (Number.isFinite(expectedEnd) && Number.isFinite(actualEnd) && Math.abs(expectedEnd - actualEnd) > 0.0001) {
      issues.push({
        severity: "warning",
        path: `securities.${ticker}`,
        message: `Quantity reconciliation mismatch for ${ticker}: expected ${expectedEnd} but found ${actualEnd}.`
      });
    }
  }

  return {
    ticker,
    securityName,
    currency,
    rows,
    totals: {
      sectionTotal
    }
  };
}

export function parseStockActivityDocument(rawText: string): ParsedStockActivityDocument {
  const rawLines = rawText.split(/\r?\n/);
  const cleanedLines = rawLines.map(normalizeLine).filter(Boolean);
  const metadata = parseMetadata(cleanedLines);
  const validationIssues: ValidationIssue[] = [];

  const sections = splitSections(rawLines).map((section) => parseSection(section, validationIssues));
  if (sections.length === 0) {
    validationIssues.push({
      severity: "error",
      message: "No security sections were detected in the statement."
    });
  }

  if (!metadata.statementPeriod.start || !metadata.statementPeriod.end) {
    validationIssues.push({
      severity: "warning",
      path: "statementPeriod",
      message: "Statement period could not be parsed confidently."
    });
  }

  const allRows = sections.flatMap((section) => section.rows);
  const baseConfidence = averageConfidence([
    ...allRows.map((row) => row.confidence),
    metadata.statementPeriod.start && metadata.statementPeriod.end ? 0.94 : 0.55,
    sections.length > 0 ? 0.92 : 0.2
  ]);
  const warningPenalty = validationIssues.filter((issue) => issue.severity === "warning").length * 0.04;
  const errorPenalty = validationIssues.filter((issue) => issue.severity === "error").length * 0.12;
  const reviewPenalty =
    allRows.length > 0 ? (allRows.filter((row) => row.requiresReview).length / allRows.length) * 0.2 : 0.1;
  const unknownActivityPenalty =
    allRows.length > 0
      ? (allRows.filter((row) => row.activityType === "UNKNOWN_ACTIVITY").length / allRows.length) * 0.12
      : 0;
  const parserConfidence = Number(
    Math.max(0.1, Math.min(0.99, baseConfidence - warningPenalty - errorPenalty - reviewPenalty - unknownActivityPenalty)).toFixed(4)
  );

  return {
    documentType: "STOCK_ACTIVITY_STATEMENT",
    statementPeriod: metadata.statementPeriod,
    accountMetadata: metadata.accountMetadata,
    securities: sections,
    validationIssues,
    grandTotals: {
      grandTotal: extractGrandTotal(cleanedLines)
    },
    parserConfidence
  };
}
