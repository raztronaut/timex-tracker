import { describe, it, expect } from "vitest";
import { isBroken } from "../condition";

describe("isBroken", () => {
  it("detects 'for parts' as broken", () => {
    expect(isBroken("For parts or not working", "Timex Watch")).toBe(true);
  });

  it("detects 'not working' as broken", () => {
    expect(isBroken("Pre-Owned", "Timex Watch Not Working")).toBe(true);
  });

  it("detects 'broken' keyword", () => {
    expect(isBroken("broken glass", "Timex")).toBe(true);
  });

  it("detects 'as-is' as broken", () => {
    expect(isBroken("sold as-is", "Timex")).toBe(true);
  });

  it("detects 'defective' as broken", () => {
    expect(isBroken("defective", "Timex")).toBe(true);
  });

  it("allows 'needs battery' even with broken-adjacent wording", () => {
    expect(isBroken("Pre-Owned - needs battery", "Timex Watch")).toBe(false);
  });

  it("allows 'new battery' phrasing", () => {
    expect(isBroken("Pre-Owned", "Timex Watch Needs New Battery")).toBe(false);
  });

  it("treats normal pre-owned as not broken", () => {
    expect(isBroken("Pre-Owned", "Timex Marlin Mechanical")).toBe(false);
  });

  it("treats new items as not broken", () => {
    expect(isBroken("New with tags", "Timex Q Reissue")).toBe(false);
  });

  it("treats empty condition as not broken", () => {
    expect(isBroken("", "Timex Expedition")).toBe(false);
  });
});
