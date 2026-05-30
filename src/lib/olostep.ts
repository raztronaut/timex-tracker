const API_URL = "https://api.olostep.com/v1/scrapes";

export interface OlostepScrapeOptions {
  url: string;
  formats: string[];
  waitBeforeScraping?: number;
  country?: string;
}

export interface OlostepResult {
  markdown_content?: string;
  html_content?: string;
}

export async function scrape(options: OlostepScrapeOptions): Promise<OlostepResult> {
  const apiKey = process.env.OLOSTEP_API_KEY;
  if (!apiKey) {
    throw new Error("OLOSTEP_API_KEY must be set");
  }

  const body: Record<string, unknown> = {
    url_to_scrape: options.url,
    formats: options.formats,
  };

  if (options.waitBeforeScraping) {
    body.wait_before_scraping = options.waitBeforeScraping;
  }
  if (options.country) {
    body.country = options.country;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Olostep API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.result as OlostepResult;
}
