import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ListingAdapter, RawListing, AdapterResult } from "../types";

vi.mock("../supabase", () => ({
  getServiceClient: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "mock-run-id" } }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      upsert: () => Promise.resolve({ error: null }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  }),
}));

function makeListing(overrides: Partial<RawListing> = {}): RawListing {
  return {
    source: "ebay",
    sourceId: `item-${Math.random().toString(36).slice(2)}`,
    url: "https://www.ebay.ca/itm/123",
    title: "Timex Marlin Vintage Watch",
    price: 25,
    currency: "CAD",
    shippingCost: 10,
    conditionRaw: "Pre-Owned",
    images: ["https://i.ebayimg.com/img.jpg"],
    location: "Canada",
    listedAt: null,
    ...overrides,
  };
}

function makeAdapter(source: string, result: AdapterResult): ListingAdapter {
  return {
    source: source as ListingAdapter["source"],
    fetchListings: vi.fn().mockResolvedValue(result),
  };
}

describe("runFullSync", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function importSync(adapters: {
    liveAdapters: ListingAdapter[];
    sampleAdapter: ListingAdapter;
  }) {
    vi.doMock("../adapters", () => adapters);
    const mod = await import("../sync");
    return mod.runFullSync;
  }

  it("returns results for each live adapter", async () => {
    const run = await importSync({
      liveAdapters: [
        makeAdapter("ebay", { listings: [makeListing()] }),
        makeAdapter("etsy", { listings: [] }),
      ],
      sampleAdapter: makeAdapter("sample", { listings: [makeListing({ source: "sample" })] }),
    });

    const results = await run();
    expect(results.length).toBe(2);
    expect(results[0].source).toBe("ebay");
    expect(results[0].found).toBe(1);
    expect(results[1].source).toBe("etsy");
    expect(results[1].found).toBe(0);
  });

  it("does NOT fall back to sample when adapters have errors", async () => {
    const run = await importSync({
      liveAdapters: [
        makeAdapter("ebay", { listings: [], error: "Olostep timeout" }),
        makeAdapter("etsy", { listings: [], error: "Network error" }),
      ],
      sampleAdapter: makeAdapter("sample", { listings: [makeListing({ source: "sample" })] }),
    });

    const results = await run();
    const sampleResult = results.find((r) => r.source === "sample");
    expect(sampleResult).toBeUndefined();
    expect(results.some((r) => !!r.adapterError)).toBe(true);
  });

  it("falls back to sample when all adapters succeed but find nothing", async () => {
    const run = await importSync({
      liveAdapters: [
        makeAdapter("ebay", { listings: [] }),
        makeAdapter("etsy", { listings: [] }),
      ],
      sampleAdapter: makeAdapter("sample", { listings: [makeListing({ source: "sample" })] }),
    });

    const results = await run();
    const sampleResult = results.find((r) => r.source === "sample");
    expect(sampleResult).toBeDefined();
    expect(sampleResult!.found).toBe(1);
  });

  it("reports adapterError in result when adapter returns error with listings", async () => {
    const run = await importSync({
      liveAdapters: [
        makeAdapter("ebay", { listings: [makeListing()], error: "partial failure" }),
      ],
      sampleAdapter: makeAdapter("sample", { listings: [] }),
    });

    const results = await run();
    expect(results[0].adapterError).toBe("partial failure");
    expect(results[0].found).toBe(1);
  });

  it("separates passing and excluded listings correctly", async () => {
    const passing = makeListing({ price: 20, shippingCost: 5 });
    const excluded = makeListing({ price: 100, shippingCost: 20 });

    const run = await importSync({
      liveAdapters: [makeAdapter("ebay", { listings: [passing, excluded] })],
      sampleAdapter: makeAdapter("sample", { listings: [] }),
    });

    const results = await run();
    expect(results[0].found).toBe(2);
    expect(results[0].passed).toBe(1);
    expect(results[0].excluded).toBe(1);
  });

  it("handles adapter throwing an exception gracefully", async () => {
    const errorAdapter: ListingAdapter = {
      source: "ebay",
      fetchListings: vi.fn().mockRejectedValue(new Error("Network timeout")),
    };

    const run = await importSync({
      liveAdapters: [errorAdapter],
      sampleAdapter: makeAdapter("sample", { listings: [] }),
    });

    const results = await run();
    expect(results[0].errors).toBeGreaterThanOrEqual(1);
    expect(results[0].adapterError).toContain("Network timeout");
  });

  it("does not trigger sample fallback when at least one adapter finds listings", async () => {
    const run = await importSync({
      liveAdapters: [
        makeAdapter("ebay", { listings: [makeListing()] }),
        makeAdapter("etsy", { listings: [] }),
      ],
      sampleAdapter: makeAdapter("sample", { listings: [makeListing({ source: "sample" })] }),
    });

    const results = await run();
    const sampleResult = results.find((r) => r.source === "sample");
    expect(sampleResult).toBeUndefined();
  });
});
