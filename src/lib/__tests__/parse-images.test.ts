import { describe, it, expect } from "vitest";
import {
  enrichListingsWithHtmlImages,
  extractMarketplaceImageUrls,
} from "../adapters/parse-images";
import type { RawListing } from "../types";

describe("extractMarketplaceImageUrls", () => {
  it("extracts eBay image URLs from markdown image syntax", () => {
    const line = "![](https://i.ebayimg.com/images/g/abc123/s-l225.jpg)";
    expect(extractMarketplaceImageUrls(line, "ebay")).toEqual([
      "https://i.ebayimg.com/images/g/abc123/s-l225.jpg",
    ]);
  });

  it("extracts ir.ebaystatic.com thumbnails", () => {
    const html =
      '<img src="https://ir.ebaystatic.com/pictures/aw/watch.jpg" alt="watch">';
    expect(extractMarketplaceImageUrls(html, "ebay")[0]).toContain("ir.ebaystatic.com");
  });

  it("extracts Etsy static URLs", () => {
    const line = "![](https://i.etsystatic.com/abc/il_340x270.jpg)";
    expect(extractMarketplaceImageUrls(line, "etsy")[0]).toContain("etsystatic.com");
  });
});

describe("enrichListingsWithHtmlImages", () => {
  const baseListing: RawListing = {
    source: "ebay",
    sourceId: "v1|123456789|0",
    url: "https://www.ebay.ca/itm/123456789",
    title: "Timex Watch",
    price: 25,
    currency: "CAD",
    shippingCost: null,
    conditionRaw: "Pre-Owned",
    images: [],
    location: null,
    listedAt: null,
  };

  it("fills missing images from HTML near the item URL", () => {
    const html = `
      <div class="s-item">
        <a href="https://www.ebay.ca/itm/123456789">Timex</a>
        <img src="https://i.ebayimg.com/images/g/xyz/s-l225.jpg" />
      </div>
    `;
    const [enriched] = enrichListingsWithHtmlImages([baseListing], html, "ebay");
    expect(enriched.images).toHaveLength(1);
    expect(enriched.images[0]).toContain("i.ebayimg.com");
  });

  it("does not overwrite images already parsed from markdown", () => {
    const withImage = {
      ...baseListing,
      images: ["https://i.ebayimg.com/images/g/existing/s-l225.jpg"],
    };
    const html = `<img src="https://i.ebayimg.com/images/g/other/s-l225.jpg" />`;
    const [enriched] = enrichListingsWithHtmlImages([withImage], html, "ebay");
    expect(enriched.images).toEqual(withImage.images);
  });
});
