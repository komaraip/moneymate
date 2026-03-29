import { describe, expect, it } from "vitest";
import {
  createBrokerSchema,
  createClassificationRuleSchema,
  createDocumentMappingRuleSchema,
  createInvestmentCategorySchema,
  createTransferRuleSchema,
  updateDashboardWidgetsSchema,
  updateReportPreferenceSchema
} from "@/lib/validation/settings";

describe("settings validation", () => {
  it("accepts a valid investment category payload", () => {
    const payload = createInvestmentCategorySchema.parse({
      name: "Government Securities",
      slug: "government-securities",
      includeInDashboard: true,
      includeInNetWorth: true,
      includeInReports: true
    });

    expect(payload.slug).toBe("government-securities");
  });

  it("rejects invalid investment category slugs", () => {
    expect(() =>
      createInvestmentCategorySchema.parse({
        name: "Invalid",
        slug: "Invalid Slug"
      })
    ).toThrow();
  });

  it("accepts a broker payload with optional category linkage", () => {
    const payload = createBrokerSchema.parse({
      brokerName: "Mirae Asset",
      brokerCode: "YP",
      investmentCategoryId: null
    });

    expect(payload.brokerName).toBe("Mirae Asset");
    expect(payload.brokerCode).toBe("YP");
  });

  it("accepts partial report preference updates", () => {
    const payload = updateReportPreferenceSchema.parse({
      defaultCashflowMode: "SEPARATE",
      includeDividendsInIncome: true,
      includeRealizedPlInIncome: true,
      includeUnrealizedPlInDashboard: false
    });

    expect(payload.defaultCashflowMode).toBe("SEPARATE");
    expect(payload.includeDividendsInIncome).toBe(true);
    expect(payload.includeRealizedPlInIncome).toBe(true);
  });

  it("accepts classification rules that force transaction type", () => {
    const payload = createClassificationRuleSchema.parse({
      scope: "CASHFLOW",
      pattern: "dividend payout",
      matchMode: "CONTAINS",
      actionType: "FORCE_TRANSACTION_TYPE",
      actionValue: "income",
      priority: 10
    });

    expect(payload.actionType).toBe("FORCE_TRANSACTION_TYPE");
    expect(payload.actionValue).toBe("income");
  });

  it("rejects invalid forced transaction type values", () => {
    expect(() =>
      createClassificationRuleSchema.parse({
        pattern: "fee",
        actionType: "FORCE_TRANSACTION_TYPE",
        actionValue: "invalid_type"
      })
    ).toThrow();
  });

  it("requires at least one target for document mapping rules", () => {
    expect(() =>
      createDocumentMappingRuleSchema.parse({
        pattern: "mirae asset",
        matchMode: "CONTAINS"
      })
    ).toThrow();
  });

  it("accepts transfer rules with account and counterparty patterns", () => {
    const payload = createTransferRuleSchema.parse({
      pattern: "transfer",
      accountPattern: "BCA",
      counterpartyPattern: "RDN",
      excludeAsInternalTransfer: true
    });

    expect(payload.pattern).toBe("transfer");
    expect(payload.excludeAsInternalTransfer).toBe(true);
  });

  it("accepts dashboard widgets payload", () => {
    const payload = updateDashboardWidgetsSchema.parse({
      widgets: [
        {
          widgetKey: "metrics",
          isVisible: true
        },
        {
          widgetKey: "recent_documents",
          isVisible: false
        }
      ]
    });

    expect(payload.widgets).toHaveLength(2);
  });
});
