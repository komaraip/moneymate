import { describe, expect, it } from "vitest";
import {
  createBrokerSchema,
  createInvestmentCategorySchema,
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
      includeDividendsInIncome: true
    });

    expect(payload.defaultCashflowMode).toBe("SEPARATE");
    expect(payload.includeDividendsInIncome).toBe(true);
  });
});

