const API_URL = "https://api.olostep.com/v1/scrapes";

export interface ScrapeAction {
  type: "wait" | "click" | "scroll" | "fill_input";
  milliseconds?: number;
  selector?: string;
  value?: string;
  direction?: "up" | "down" | "left" | "right";
  amount?: number;
}

export interface OlostepScrapeOptions {
  url: string;
  formats: string[];
  waitBeforeScraping?: number;
  country?: string;
  removeCssSelectors?: string;
  screenSize?: { screenType: "default" | "mobile" | "desktop" };
  actions?: ScrapeAction[];
}

export interface OlostepResult {
  markdown_content?: string;
  html_content?: string;
  markdown_hosted_url?: string;
  html_hosted_url?: string;
  page_metadata?: { status_code?: number; title?: string };
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
  if (options.removeCssSelectors) {
    body.remove_css_selectors = options.removeCssSelectors;
  }
  if (options.screenSize) {
    body.screen_size = { screen_type: options.screenSize.screenType };
  }
  if (options.actions) {
    body.actions = options.actions;
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
  const result = data.result as OlostepResult;

  if (result.page_metadata?.status_code && result.page_metadata.status_code >= 400) {
    throw new Error(
      `Olostep: target page returned ${result.page_metadata.status_code}` +
        (result.page_metadata.title ? ` (${result.page_metadata.title})` : ""),
    );
  }

  // Fall back to hosted URLs when inline content is empty (large pages)
  if (!result.markdown_content && result.markdown_hosted_url) {
    result.markdown_content = await fetchHostedContent(result.markdown_hosted_url);
  }
  if (!result.html_content && result.html_hosted_url) {
    result.html_content = await fetchHostedContent(result.html_hosted_url);
  }

  const mdLen = result.markdown_content?.length ?? 0;
  const htmlLen = result.html_content?.length ?? 0;
  console.log(
    `Olostep: scraped ${options.url.slice(0, 80)} → ${mdLen} md chars, ${htmlLen} html chars` +
      (result.page_metadata?.status_code ? `, status ${result.page_metadata.status_code}` : ""),
  );

  return result;
}

async function fetchHostedContent(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return await res.text();
  } catch {
    return undefined;
  }
}
