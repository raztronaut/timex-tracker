import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseMarkdownListings } from "../adapters/etsy";

const SAMPLE_MD = `
# Search results for "timex watch"

[NOS Timex Electric Dynabeat Vintage Watch 1970s](https://www.etsy.com/ca/listing/4469739360/nos-timex-electric-dynabeat)

CA$42.00

Free delivery

![](https://i.etsystatic.com/abc/il_340x270.jpg)

[Vintage Timex Military Field Watch 1980s](https://www.etsy.com/ca/listing/9876543210/vintage-timex-military)

$28.50

![](https://i.etsystatic.com/def/il_340x270.jpg)
`;

describe("Etsy parseMarkdownListings", () => {
  it("parses multiple listings from markdown", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings).toHaveLength(2);
  });

  it("extracts title and URL correctly", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].title).toBe("NOS Timex Electric Dynabeat Vintage Watch 1970s");
    expect(listings[0].url).toContain("etsy.com");
  });

  it("extracts price from CA$ format", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].price).toBe(42);
  });

  it("handles free delivery as zero shipping", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].shippingCost).toBe(0);
  });

  it("extracts Etsy image URLs", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].images.length).toBeGreaterThan(0);
    expect(listings[0].images[0]).toContain("etsystatic.com");
  });

  it("derives sourceId from listing URL", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].sourceId).toBe("4469739360");
  });

  it("sets source to 'etsy'", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].source).toBe("etsy");
  });

  it("defaults condition to 'Pre-Owned'", () => {
    const listings = parseMarkdownListings(SAMPLE_MD);
    expect(listings[0].conditionRaw).toBe("Pre-Owned");
  });

  it("returns empty array for empty markdown", () => {
    expect(parseMarkdownListings("")).toHaveLength(0);
  });

  it("deduplicates listings with the same sourceId", () => {
    const md = `
[Timex First Listing](https://www.etsy.com/ca/listing/1111111111/timex-first)
CA$30.00

[Timex Duplicate](https://www.etsy.com/ca/listing/1111111111/timex-duplicate)
CA$30.00
`;
    const listings = parseMarkdownListings(md);
    expect(listings).toHaveLength(1);
    expect(listings[0].title).toBe("Timex First Listing");
  });

  it("deduplicates image URLs within a single listing", () => {
    const md = `
[Timex With Dupe Images](https://www.etsy.com/ca/listing/2222222222/images)
CA$25.00
![](https://i.etsystatic.com/abc/il_340x270.jpg)
![](https://i.etsystatic.com/abc/il_340x270.jpg)
![](https://i.etsystatic.com/def/il_340x270.jpg)
`;
    const listings = parseMarkdownListings(md);
    expect(listings[0].images).toHaveLength(2);
  });

  it("handles $-only price format", () => {
    const md = `
[Simple Dollar Watch](https://www.etsy.com/ca/listing/3333333333/simple)
$19.99
`;
    const listings = parseMarkdownListings(md);
    expect(listings[0].price).toBe(19.99);
  });

  it("leaves shippingCost null when no shipping info present", () => {
    const md = `
[No Shipping Info](https://www.etsy.com/ca/listing/4444444444/noship)
CA$35.00
`;
    const listings = parseMarkdownListings(md);
    expect(listings[0].shippingCost).toBeNull();
  });

  it("skips listing with zero price", () => {
    const md = `
[Free Watch](https://www.etsy.com/ca/listing/5555555555/free)
CA$0.00
`;
    const listings = parseMarkdownListings(md);
    expect(listings).toHaveLength(0);
  });
});

describe("Etsy parseMarkdownListings (image-wrapped link format)", () => {
  it("parses [![Title](img)](listing-url) format", () => {
    const md = `
*   [![Vintage Timex Marlin Watch](https://i.etsystatic.com/abc/il_340x270.jpg)](https://www.etsy.com/ca/listing/1234567890/vintage-timex-marlin?ref=search)

    CA$38.00

    Free delivery

*   [![Timex Expedition Field Watch](https://i.etsystatic.com/def/il_340x270.jpg)](https://www.etsy.com/ca/listing/9876543210/timex-expedition?ref=search)

    CA$22.50
`;
    const listings = parseMarkdownListings(md);
    expect(listings).toHaveLength(2);
    expect(listings[0].title).toBe("Vintage Timex Marlin Watch");
    expect(listings[0].sourceId).toBe("1234567890");
    expect(listings[0].images[0]).toContain("etsystatic.com");
    expect(listings[0].price).toBe(38);
    expect(listings[0].shippingCost).toBe(0);
    expect(listings[1].title).toBe("Timex Expedition Field Watch");
    expect(listings[1].price).toBe(22.5);
  });
});

describe("Etsy parseMarkdownListings (live Olostep multi-line format)", () => {
  const liveMd = readFileSync(
    join(__dirname, "fixtures/etsy-live-sample.md"),
    "utf8",
  );

  it("parses all listings from multi-line block format", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings).toHaveLength(4);
  });

  it("extracts title from image alt text", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].title).toContain("Leather watch for women");
    expect(listings[2].title).toContain("Vintage Timex Quartz");
  });

  it("extracts image URL from standalone ![](etsystatic) line", () => {
    const listings = parseMarkdownListings(liveMd);
    for (const l of listings) {
      expect(l.images.length).toBe(1);
      expect(l.images[0]).toContain("etsystatic.com");
    }
  });

  it("extracts listing ID into sourceId", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].sourceId).toBe("747503370");
    expect(listings[1].sourceId).toBe("4461761357");
  });

  it("strips query params from listing URL", () => {
    const listings = parseMarkdownListings(liveMd);
    for (const l of listings) {
      expect(l.url).not.toContain("?");
      expect(l.url).toMatch(/etsy\.com\/listing\/\d+\//);
    }
  });

  it("extracts regular price ($XX.XX)", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[0].price).toBe(41);
    expect(listings[3].price).toBe(42.99);
  });

  it("extracts sale price from 'Sale Price $XX.XX' format", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[1].price).toBe(42.41);
    expect(listings[2].price).toBe(15.75);
  });

  it("detects free shipping", () => {
    const listings = parseMarkdownListings(liveMd);
    expect(listings[2].shippingCost).toBe(0);
    expect(listings[0].shippingCost).toBeNull();
  });

  it("sets source to etsy and condition to Pre-Owned", () => {
    const listings = parseMarkdownListings(liveMd);
    for (const l of listings) {
      expect(l.source).toBe("etsy");
      expect(l.conditionRaw).toBe("Pre-Owned");
    }
  });
});
