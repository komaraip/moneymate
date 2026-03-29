import { describe, expect, it } from "vitest";
import {
  findMatchingClassificationRule,
  findMatchingDocumentMappingRule,
  findMatchingTransferRule,
  matchPattern,
  orderActiveRules
} from "@/lib/services/rules";

describe("rule engine", () => {
  it("matches CONTAINS, EXACT, and REGEX modes", () => {
    expect(matchPattern("Dividend Payout", "dividend", "CONTAINS")).toBe(true);
    expect(matchPattern("Dividend Payout", "dividend payout", "EXACT")).toBe(true);
    expect(matchPattern("Dividend Payout", "^dividend\\s+payout$", "REGEX")).toBe(true);
  });

  it("applies priority first and createdAt as tie-breaker", () => {
    const ordered = orderActiveRules([
      {
        id: "newer",
        pattern: "foo",
        matchMode: "CONTAINS" as const,
        priority: 10,
        createdAt: new Date("2026-03-05T00:00:00.000Z"),
        isActive: true
      },
      {
        id: "older",
        pattern: "foo",
        matchMode: "CONTAINS" as const,
        priority: 10,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        isActive: true
      },
      {
        id: "lowest-priority-number",
        pattern: "foo",
        matchMode: "CONTAINS" as const,
        priority: 5,
        createdAt: new Date("2026-03-10T00:00:00.000Z"),
        isActive: true
      }
    ]);

    expect(ordered.map((rule) => rule.id)).toEqual(["lowest-priority-number", "older", "newer"]);
  });

  it("finds first matching classification rule", () => {
    const matched = findMatchingClassificationRule(
      [
        {
          id: "a",
          scope: "CASHFLOW",
          pattern: "dividend",
          matchMode: "CONTAINS",
          actionType: "INCLUDE_IN_GENERAL_CASHFLOW",
          actionValue: null,
          priority: 20,
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          isActive: true
        },
        {
          id: "b",
          scope: "CASHFLOW",
          pattern: "dividend payout",
          matchMode: "EXACT",
          actionType: "FORCE_CATEGORY_NAME",
          actionValue: "Dividend Income",
          priority: 10,
          createdAt: new Date("2026-03-02T00:00:00.000Z"),
          isActive: true
        }
      ],
      {
        scope: "CASHFLOW",
        text: "dividend payout"
      }
    );

    expect(matched?.id).toBe("b");
    expect(matched?.actionType).toBe("FORCE_CATEGORY_NAME");
  });

  it("matches transfer rule with account and counterparty context", () => {
    const matched = findMatchingTransferRule(
      [
        {
          id: "transfer-rule",
          pattern: "transfer",
          matchMode: "CONTAINS",
          accountPattern: "bca",
          accountMatchMode: "CONTAINS",
          counterpartyPattern: "rdn",
          counterpartyMatchMode: "CONTAINS",
          excludeAsInternalTransfer: true,
          priority: 5,
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          isActive: true
        }
      ],
      {
        text: "transfer to rdn",
        accountName: "BCA Blue",
        counterpartyName: "Mirae RDN"
      }
    );

    expect(matched?.id).toBe("transfer-rule");
    expect(matched?.excludeAsInternalTransfer).toBe(true);
  });

  it("finds first matching document mapping rule", () => {
    const matched = findMatchingDocumentMappingRule(
      [
        {
          id: "mapping-a",
          pattern: "ajaib",
          matchMode: "CONTAINS",
          brokerId: "broker-a",
          investmentAccountId: null,
          categoryId: null,
          priority: 10,
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          isActive: true
        },
        {
          id: "mapping-b",
          pattern: "ajaib sekuritas",
          matchMode: "CONTAINS",
          brokerId: "broker-b",
          investmentAccountId: null,
          categoryId: null,
          priority: 5,
          createdAt: new Date("2026-03-02T00:00:00.000Z"),
          isActive: true
        }
      ],
      "Stock activity from Ajaib Sekuritas"
    );

    expect(matched?.id).toBe("mapping-b");
  });
});
