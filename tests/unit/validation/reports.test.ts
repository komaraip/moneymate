import { describe, expect, it } from "vitest";
import { exportReportQuerySchema } from "@/lib/validation/reports";

describe("report validation", () => {
  it("accepts optional cashflow mode in export queries", () => {
    const payload = exportReportQuerySchema.parse({
      kind: "cashflow",
      mode: "SEPARATE"
    });

    expect(payload.mode).toBe("SEPARATE");
  });

  it("rejects unsupported mode values", () => {
    expect(() =>
      exportReportQuerySchema.parse({
        kind: "cashflow",
        mode: "HYBRID"
      })
    ).toThrow();
  });
});

