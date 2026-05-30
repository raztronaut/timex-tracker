import { describe, it, expect } from "vitest";
import { toCad } from "../currency";

describe("toCad", () => {
  it("returns CAD amounts unchanged", () => {
    expect(toCad(25, "CAD")).toBe(25);
  });

  it("converts USD to CAD", () => {
    const result = toCad(100, "USD");
    expect(result).toBe(137);
  });

  it("converts EUR to CAD", () => {
    const result = toCad(100, "EUR");
    expect(result).toBe(150);
  });

  it("converts GBP to CAD", () => {
    const result = toCad(100, "GBP");
    expect(result).toBe(173);
  });

  it("handles lowercase currency codes", () => {
    expect(toCad(100, "usd")).toBe(137);
  });

  it("treats unknown currencies as CAD", () => {
    expect(toCad(50, "XYZ")).toBe(50);
  });

  it("rounds to two decimal places", () => {
    const result = toCad(33.33, "USD");
    expect(result).toBe(45.66);
  });

  it("handles zero amounts", () => {
    expect(toCad(0, "USD")).toBe(0);
  });
});
