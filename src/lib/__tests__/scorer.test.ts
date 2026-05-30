import { describe, it, expect } from "vitest";
import { scoreListing } from "../scorer";

function makeListing(title: string, overrides: { conditionRaw?: string; totalCostCad?: number; source?: string } = {}) {
  return {
    title,
    conditionRaw: overrides.conditionRaw ?? "Pre-Owned",
    totalCostCad: overrides.totalCostCad ?? 30,
    source: overrides.source ?? "ebay",
  };
}

describe("keyword scorer", () => {
  it("scores 'Marlin' higher than baseline", async () => {
    const result = await scoreListing(makeListing("Timex Marlin Mechanical Watch"));
    expect(result.score).toBeGreaterThan(30);
    expect(result.tags).toContain("vintage");
  });

  it("scores 'deadstock' very high", async () => {
    const result = await scoreListing(makeListing("Timex Deadstock NOS Vintage"));
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.tags).toContain("deadstock");
  });

  it("scores Todd Snyder collab high", async () => {
    const result = await scoreListing(makeListing("Timex x Todd Snyder Collaboration"));
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.tags).toContain("collab");
  });

  it("penalizes 'Easy Reader'", async () => {
    const result = await scoreListing(makeListing("Timex Easy Reader Classic"));
    expect(result.score).toBeLessThan(30);
  });

  it("penalizes 'Weekender'", async () => {
    const result = await scoreListing(makeListing("Timex Weekender 38mm"));
    expect(result.score).toBeLessThan(30);
  });

  it("gives bonus for very low cost", async () => {
    const cheap = await scoreListing(makeListing("Timex Watch", { totalCostCad: 15 }));
    const normal = await scoreListing(makeListing("Timex Watch", { totalCostCad: 45 }));
    expect(cheap.score).toBeGreaterThan(normal.score);
  });

  it("clamps score to 0-100 range", async () => {
    const high = await scoreListing(makeListing("Timex Marlin Deadstock NOS Todd Snyder Limited Edition Vintage 1970s Mechanical Hand-Wind"));
    expect(high.score).toBeLessThanOrEqual(100);

    const low = await scoreListing(makeListing("Timex Easy Reader Weekender Band Only Strap Only"));
    expect(low.score).toBeGreaterThanOrEqual(0);
  });

  it("produces a rationale string", async () => {
    const result = await scoreListing(makeListing("Timex Marlin"));
    expect(result.rationale).toBeTruthy();
    expect(typeof result.rationale).toBe("string");
  });

  it("returns empty tags for generic listings", async () => {
    const result = await scoreListing(makeListing("Timex Watch"));
    expect(result.tags.length).toBe(0);
  });

  it("handles multiple matching tags", async () => {
    const result = await scoreListing(makeListing("Timex Marlin Mechanical Vintage 1970s"));
    expect(result.tags).toContain("vintage");
    expect(result.tags.length).toBeGreaterThanOrEqual(1);
  });
});
