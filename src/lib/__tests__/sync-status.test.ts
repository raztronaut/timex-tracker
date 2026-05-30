import { describe, it, expect } from "vitest";
import { syncRunFromRow } from "../sync-status";

describe("syncRunFromRow", () => {
  it("maps snake_case row to camelCase SyncRun", () => {
    const row = {
      id: "abc-123",
      started_at: "2025-06-01T12:00:00Z",
      finished_at: "2025-06-01T12:05:00Z",
      source: "ebay",
      found: 42,
      inserted: 10,
      updated: 5,
      errors: 1,
    };

    const result = syncRunFromRow(row);

    expect(result).toEqual({
      id: "abc-123",
      startedAt: "2025-06-01T12:00:00Z",
      finishedAt: "2025-06-01T12:05:00Z",
      source: "ebay",
      found: 42,
      inserted: 10,
      updated: 5,
      errors: 1,
    });
  });

  it("handles null finishedAt for in-progress runs", () => {
    const row = {
      id: "def-456",
      started_at: "2025-06-01T12:00:00Z",
      finished_at: null,
      source: "etsy",
      found: 0,
      inserted: 0,
      updated: 0,
      errors: 0,
    };

    const result = syncRunFromRow(row);

    expect(result.finishedAt).toBeNull();
    expect(result.source).toBe("etsy");
  });
});
