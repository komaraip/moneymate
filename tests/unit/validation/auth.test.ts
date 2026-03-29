import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

describe("auth validation", () => {
  it("accepts valid credentials payloads", () => {
    expect(
      registerSchema.parse({
        email: "demo@example.com",
        password: "strong-pass-123",
        displayName: "Demo User"
      })
    ).toBeTruthy();

    expect(
      loginSchema.parse({
        email: "demo@example.com",
        password: "strong-pass-123"
      })
    ).toBeTruthy();
  });

  it("rejects short passwords", () => {
    expect(() =>
      registerSchema.parse({
        email: "demo@example.com",
        password: "short"
      })
    ).toThrow();
  });
});

