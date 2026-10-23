import { describe, expect, it } from "vitest";
import { analysisItems, itemText } from "@/lib/api";

describe("Structured analysis values", () => {
  it("converts the reported proposed solution object into readable text", () => {
    expect(itemText({ overview: "Secure portal", components: [{ name: "Accounts", features: ["Login", "Reports"] }], implementation_phases: [{ phase: 1, description: "Discovery" }] }))
      .toBe("Secure portal — Accounts — Login — Reports — 1 — Discovery");
  });

  it("preserves plain text answers", () => {
    expect(itemText("Build a customer portal.")).toBe("Build a customer portal.");
  });

  it("accepts objects and strings in fields normally returned as lists", () => {
    expect(analysisItems({ name: "React" })).toEqual([{ name: "React" }]);
    expect(analysisItems("Email notifications")).toEqual(["Email notifications"]);
    expect(analysisItems(["React", "PostgreSQL"])).toEqual(["React", "PostgreSQL"]);
  });

  it("handles missing answers without producing object children", () => {
    expect(analysisItems(null)).toEqual([]);
    expect(analysisItems(undefined)).toEqual([]);
    expect(itemText(null)).toBe("");
  });
});