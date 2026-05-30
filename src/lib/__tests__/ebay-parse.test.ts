import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseMarkdownListings } from "../adapters/ebay";

const SAMPLE_MD = `
# Search results for "timex watch"

[Vintage Timex Marlin Mechanical Watch Gold Tone 1970s](https://www.ebay.ca/itm/377073705816)

C $34.99

+C $8.50 shipping

Pre-Owned

![](https://i.ebayimg.com/images/g/abc123/s-l225.jpg)

from Canada

[Timex Q Reissue 38mm Pepsi Bezel Watch](https://www.ebay.ca/itm/117111976291)

C $29.99

Free shipping

Pre-Owned

![](https://i.ebayimg.com/images/g/def456/s-l225.jpg)

from United States
`;

describe("eBay parseMarkdownListings", () => {
  it("parses multiple listings from markdown", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings).toHaveLength(2);
  });

  it("extracts title and URL correctly", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].title).toBe("Vintage Timex Marlin Mechanical Watch Gold Tone 1970s");
    expect(listings[0].url).toBe("https://www.ebay.ca/itm/377073705816");
  });

  it("extracts price from CAD format", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].price).toBe(34.99);
  });

  it("extracts shipping cost", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].shippingCost).toBe(8.50);
  });

  it("handles free shipping", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[1].shippingCost).toBe(0);
  });

  it("extracts condition", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].conditionRaw).toBe("Pre-Owned");
  });

  it("extracts image URLs", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].images.length).toBeGreaterThan(0);
    expect(listings[0].images[0]).toContain("i.ebayimg.com");
  });

  it("derives sourceId from item URL", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].sourceId).toContain("377073705816");
  });

  it("sets source to 'ebay'", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].source).toBe("ebay");
  });

  it("returns empty array for empty markdown", () => {
    expect(parseMarkdownListings("")).toHaveLength(0);
  });

  it("skips listings with no price", () => {
    const md = `[Some Watch](https://www.ebay.ca/itm/999)\nPre-Owned`;
    expect(parseMarkdownListings(md)).toHaveLength(0);
  });

  it("deduplicates listings with the same sourceId", () => {
    const md = `
[Timex Watch First](https://www.ebay.ca/itm/123456789)
C $20.00
Pre-Owned

[Timex Watch Duplicate](https://www.ebay.ca/itm/123456789)
C $20.00
Pre-Owned
`;
    const listings = parseMarkdownListings(md);
    expect(listings).toHaveLength(1);
    expect(listings[0].title).toBe("Timex Watch First");
  });

  it("deduplicates image URLs within a single listing", () => {
    const md = `
[Timex With Dupe Images](https://www.ebay.ca/itm/555555555)
C $25.00
Pre-Owned
![](https://i.ebayimg.com/images/g/abc/s-l225.jpg)
![](https://i.ebayimg.com/images/g/abc/s-l225.jpg)
![](https://i.ebayimg.com/images/g/def/s-l225.jpg)
`;
    const listings = parseMarkdownListings(md);
    expect(listings[0].images).toHaveLength(2);
  });

  it("handles listings with comma-formatted prices", () => {
    const md = `
[Timex Expensive Watch](https://www.ebay.ca/itm/888888888)
C $1,234.56
Pre-Owned
`;
    const listings = parseMarkdownListings(md);
    expect(listings[0].price).toBe(1234.56);
  });

  it("extracts shipping in non-prefixed format", () => {
    const md = `
[Timex Shipping Test](https://www.ebay.ca/itm/777777777)
C $30.00
+$12.99 shipping
Pre-Owned
`;
    const listings = parseMarkdownListings(md);
    expect(listings[0].shippingCost).toBe(12.99);
  });

  it("leaves shippingCost null when no shipping info present", () => {
    const md = `
[Timex No Ship Info](https://www.ebay.ca/itm/666666666)
C $15.00
Pre-Owned
`;
    const listings = parseMarkdownListings(md);
    expect(listings[0].shippingCost).toBeNull();
  });
});

describe("eBay parseMarkdownListings (live Olostep format)", () => {
  const liveMd = readFileSync(
    join(__dirname, "fixtures/ebay-live-sample.md"),
    "utf8",
  );

  it("parses image-wrapped title links from live markdown", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings.length).toBeGreaterThanOrEqual(4);
  });

  it("extracts title from [![Title](img)](url) format", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].title).toContain("Timex");
    expect(listings[0].title.length).toBeGreaterThan(10);
  });

  it("extracts image URL from the image-link", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].images.length).toBeGreaterThan(0);
    expect(listings[0].images[0]).toContain("ebayimg.com");
  });

  it("extracts item ID into sourceId", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].sourceId).toMatch(/^v1\|\d+\|0$/);
  });

  it("strips query params from item URL", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].url).not.toContain("?");
    expect(listings[0].url).toMatch(/ebay\.ca\/itm\/\d+$/);
  });

  it("extracts price from indented C $ lines", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].price).toBeGreaterThan(0);
  });

  it("extracts shipping from +C $ lines", () => {
    const listings = parseMarkdownListings(liveMd);
    const withShipping = listings.filter((l) => l.shippingCost !== null);
    expect(withShipping.length).toBeGreaterThan(0);
  });

  it("extracts Pre-Owned condition without matching 'new window' text", () => {
    const listings = parseMarkdownListings(liveMd);
    const preOwned = listings.filter((l) => l.conditionRaw === "Pre-Owned");
    expect(preOwned.length).toBeGreaterThan(0);
    const wrongNew = listings.filter((l) => l.conditionRaw.toLowerCase() === "new");
    expect(wrongNew).toHaveLength(0);
  });
});
