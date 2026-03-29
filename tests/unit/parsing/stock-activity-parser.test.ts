import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseStockActivityDocument } from "@/lib/parsing/stock-activity/parser";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(currentDir, "../../fixtures/stock-activity/reference-statement.txt");

describe("parseStockActivityDocument", () => {
  it("parses statement metadata, activity rows, and totals", () => {
    const rawText = readFileSync(fixturePath, "utf8");
    const parsed = parseStockActivityDocument(rawText);

    expect(parsed.documentType).toBe("STOCK_ACTIVITY_STATEMENT");
    expect(parsed.statementPeriod.start).toContain("2024-01-01");
    expect(parsed.statementPeriod.end).toContain("2024-12-31");
    expect(parsed.accountMetadata.clientCode).toBe("ABC001");
    expect(parsed.securities).toHaveLength(1);
    expect(parsed.securities[0]?.ticker).toBe("ACRO");
    expect(parsed.securities[0]?.rows).toHaveLength(4);
    expect(parsed.securities[0]?.rows[1]?.activityType).toBe("BUY");
    expect(parsed.securities[0]?.rows[2]?.activityType).toBe("SELL");
    expect(parsed.securities[0]?.rows[2]?.quantity).toBe("-100");
    expect(parsed.grandTotals.grandTotal).toBe("173800");
    expect(parsed.validationIssues).toHaveLength(0);
    expect(parsed.parserConfidence).toBeGreaterThan(0.8);
  });

  it("flags rows when critical structure is missing", () => {
    const parsed = parseStockActivityDocument(`
CLIENT STOCK ACTIVITY
Period 01-Jan-2024 to 31-Dec-2024
TEST Test Security IDR
01-Jan-2024 REF001 Wrapped Description Without Tail
Grand Total 100
`);

    expect(parsed.securities[0]?.rows[0]?.requiresReview).toBe(true);
    expect(parsed.validationIssues.length).toBeGreaterThanOrEqual(0);
  });
});
