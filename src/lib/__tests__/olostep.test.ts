import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("olostep scrape", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, OLOSTEP_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("throws when OLOSTEP_API_KEY is not set", async () => {
    delete process.env.OLOSTEP_API_KEY;
    const { scrape } = await import("../olostep");
    await expect(
      scrape({ url: "https://example.com", formats: ["markdown"] })
    ).rejects.toThrow("OLOSTEP_API_KEY must be set");
  });

  it("sends correct request to Olostep API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: { markdown_content: "# Test" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { scrape } = await import("../olostep");
    await scrape({
      url: "https://www.ebay.ca/sch/test",
      formats: ["markdown"],
      waitBeforeScraping: 2000,
      country: "CA",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.olostep.com/v1/scrapes");
    expect(opts.method).toBe("POST");
    expect(opts.headers.Authorization).toBe("Bearer test-key");

    const body = JSON.parse(opts.body);
    expect(body.url_to_scrape).toBe("https://www.ebay.ca/sch/test");
    expect(body.formats).toEqual(["markdown"]);
    expect(body.wait_before_scraping).toBe(2000);
    expect(body.country).toBe("CA");
  });

  it("returns markdown_content from response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: { markdown_content: "# Listings\n[Watch](url)" } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { scrape } = await import("../olostep");
    const result = await scrape({ url: "https://example.com", formats: ["markdown"] });

    expect(result.markdown_content).toBe("# Listings\n[Watch](url)");
  });

  it("throws on non-OK HTTP response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("Rate limited"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { scrape } = await import("../olostep");
    await expect(
      scrape({ url: "https://example.com", formats: ["markdown"] })
    ).rejects.toThrow("Olostep API error 429: Rate limited");
  });

  it("throws on network failure", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    vi.stubGlobal("fetch", mockFetch);

    const { scrape } = await import("../olostep");
    await expect(
      scrape({ url: "https://example.com", formats: ["markdown"] })
    ).rejects.toThrow("ECONNREFUSED");
  });
});
