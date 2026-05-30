import { describe, it, expect } from "vitest";
import { normalize, passesRules, MAX_TOTAL_COST_CAD, CANDIDATE_THRESHOLD } from "../normalize";
import type { RawListing } from "../types";

function makeRaw(overrides: Partial<RawListing> = {}): RawListing {
  return {
    source: "ebay",
    sourceId: "123",
    url: "https://www.ebay.ca/itm/123",
    title: "Timex Marlin Watch",
    price: 25,
    currency: "CAD",
    shippingCost: 10,
    conditionRaw: "Pre-Owned",
    images: [],
    location: "Canada",
    listedAt: null,
    ...overrides,
  };
}

describe("normalize", () => {
  it("calculates total cost as price + shipping in CAD", () => {
    const result = normalize(makeRaw({ price: 20, shippingCost: 8 }));
    expect(result.totalCostCad).toBe(28);
  });

  it("treats null shipping as $0", () => {
    const result = normalize(makeRaw({ price: 30, shippingCost: null }));
    expect(result.totalCostCad).toBe(30);
  });

  it("converts foreign currency before summing", () => {
    const result = normalize(makeRaw({ price: 20, shippingCost: 5, currency: "USD" }));
    // (20 * 1.37) + (5 * 1.37) = 27.40 + 6.85 = 34.25
    expect(result.totalCostCad).toBe(34.25);
  });

  it("rounds total to two decimal places", () => {
    const result = normalize(makeRaw({ price: 33.33, shippingCost: 11.11 }));
    expect(result.totalCostCad).toBe(44.44);
  });

  it("detects broken items via condition text", () => {
    const result = normalize(makeRaw({ conditionRaw: "For parts or not working" }));
    expect(result.isBroken).toBe(true);
  });

  it("marks normal items as not broken", () => {
    const result = normalize(makeRaw({ conditionRaw: "Pre-Owned" }));
    expect(result.isBroken).toBe(false);
  });

  it("preserves source fields", () => {
    const result = normalize(makeRaw({ source: "etsy", sourceId: "456" }));
    expect(result.source).toBe("etsy");
    expect(result.sourceId).toBe("456");
  });
});

describe("passesRules", () => {
  it("passes when under budget and not broken", () => {
    expect(passesRules({ totalCostCad: 40, isBroken: false })).toBe(true);
  });

  it("passes at exactly the cost ceiling", () => {
    expect(passesRules({ totalCostCad: MAX_TOTAL_COST_CAD, isBroken: false })).toBe(true);
  });

  it("fails when over budget", () => {
    expect(passesRules({ totalCostCad: MAX_TOTAL_COST_CAD + 1, isBroken: false })).toBe(false);
  });

  it("fails when broken", () => {
    expect(passesRules({ totalCostCad: 20, isBroken: true })).toBe(false);
  });

  it("fails when both over budget and broken", () => {
    expect(passesRules({ totalCostCad: 100, isBroken: true })).toBe(false);
  });
});

describe("shippingUnknown flag", () => {
  it("sets shippingUnknown true when shippingCost is null", () => {
    const result = normalize(makeRaw({ shippingCost: null }));
    expect(result.shippingUnknown).toBe(true);
  });

  it("sets shippingUnknown false when shippingCost is 0 (free)", () => {
    const result = normalize(makeRaw({ shippingCost: 0 }));
    expect(result.shippingUnknown).toBe(false);
  });

  it("sets shippingUnknown false when shippingCost is a positive number", () => {
    const result = normalize(makeRaw({ shippingCost: 12 }));
    expect(result.shippingUnknown).toBe(false);
  });

  it("unknown shipping still allows passing rules if price alone is under budget", () => {
    const result = normalize(makeRaw({ price: 45, shippingCost: null }));
    expect(result.totalCostCad).toBe(45);
    expect(passesRules(result)).toBe(true);
  });

  it("unknown shipping at edge: price exactly $50 still passes (shipping treated as $0)", () => {
    const result = normalize(makeRaw({ price: 50, shippingCost: null }));
    expect(result.totalCostCad).toBe(50);
    expect(passesRules(result)).toBe(true);
  });
});

describe("currency conversion edge cases", () => {
  it("USD listing near boundary respects conversion rate", () => {
    // $35 USD + $5 USD shipping = $40 USD → 40 * 1.37 = $54.80 CAD
    const result = normalize(makeRaw({ price: 35, shippingCost: 5, currency: "USD" }));
    expect(result.totalCostCad).toBe(54.8);
    expect(passesRules(result)).toBe(false);
  });

  it("EUR listing converts correctly", () => {
    // €30 + €5 = €35 → 35 * 1.50 = $52.50 CAD
    const result = normalize(makeRaw({ price: 30, shippingCost: 5, currency: "EUR" }));
    expect(result.totalCostCad).toBe(52.5);
    expect(passesRules(result)).toBe(false);
  });
});

describe("constants", () => {
  it("exports MAX_TOTAL_COST_CAD as 50", () => {
    expect(MAX_TOTAL_COST_CAD).toBe(50);
  });

  it("exports CANDIDATE_THRESHOLD as 55", () => {
    expect(CANDIDATE_THRESHOLD).toBe(55);
  });
});
