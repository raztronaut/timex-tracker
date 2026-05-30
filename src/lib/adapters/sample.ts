import type { ListingAdapter, RawListing, AdapterResult } from "../types";
import { REFERENCE_BUYS } from "../taste-profile";

/** Local reference photos in /public — reliable for demo UI. */
const DEMO_IMAGES = ["/marlin.png", "/breyers.png", "/dekalb.png"] as const;

function demoImage(index: number): string {
  return DEMO_IMAGES[index % DEMO_IMAGES.length];
}

function toSampleListing(listing: RawListing, imageIndex: number): RawListing {
  return {
    ...listing,
    source: "sample",
    sourceId: `sample-${listing.sourceId}`,
    images: listing.images.length > 0 ? listing.images : [demoImage(imageIndex)],
  };
}

const SAMPLE_LISTINGS: RawListing[] = [
  ...REFERENCE_BUYS.map((listing, i) => toSampleListing(listing, i)),
  {
    source: "sample",
    sourceId: "sample-vintage-expedition",
    url: "https://www.ebay.ca/itm/sample-expedition",
    title: "Timex Expedition Indiglo Field Watch 36mm Military Style Vintage",
    price: 22.0,
    currency: "CAD",
    shippingCost: 8.0,
    conditionRaw: "Pre-Owned",
    images: [demoImage(0)],
    location: "Canada",
    listedAt: "2025-05-10T14:00:00Z",
  },
  {
    source: "sample",
    sourceId: "sample-ironman-collab",
    url: "https://www.ebay.ca/itm/sample-ironman",
    title: "Timex Ironman Triathlon x Todd Snyder Collaboration Watch Limited Edition",
    price: 35.0,
    currency: "USD",
    shippingCost: 10.0,
    conditionRaw: "Pre-Owned",
    images: [demoImage(1)],
    location: "United States",
    listedAt: "2025-05-08T09:00:00Z",
  },
  {
    source: "sample",
    sourceId: "sample-broken-skip",
    url: "https://www.ebay.ca/itm/sample-broken",
    title: "Timex Vintage Watch For Parts Not Working - Gold Tone",
    price: 12.0,
    currency: "CAD",
    shippingCost: 5.0,
    conditionRaw: "For parts or not working",
    images: [],
    location: "Canada",
    listedAt: "2025-05-05T11:00:00Z",
  },
  {
    source: "sample",
    sourceId: "sample-needs-battery",
    url: "https://www.ebay.ca/itm/sample-battery",
    title: "Timex Easy Reader 35mm Classic Watch - Needs New Battery",
    price: 18.0,
    currency: "CAD",
    shippingCost: 7.0,
    conditionRaw: "Pre-Owned - needs battery",
    images: [demoImage(2)],
    location: "Canada",
    listedAt: "2025-05-12T16:00:00Z",
  },
  {
    source: "sample",
    sourceId: "sample-too-expensive",
    url: "https://www.ebay.ca/itm/sample-expensive",
    title: "Timex Marlin Automatic 40mm Gold Reissue",
    price: 180.0,
    currency: "CAD",
    shippingCost: 0,
    conditionRaw: "New with tags",
    images: [demoImage(0)],
    location: "Canada",
    listedAt: "2025-05-11T12:00:00Z",
  },
  {
    source: "sample",
    sourceId: "sample-waterbury-legacy",
    url: "https://www.ebay.ca/itm/sample-waterbury",
    title: "Timex Waterbury Legacy 34mm Sub-Dial Vintage Inspired Watch",
    price: 28.0,
    currency: "CAD",
    shippingCost: 9.0,
    conditionRaw: "Pre-Owned",
    images: [demoImage(1)],
    location: "Canada",
    listedAt: "2025-05-13T08:30:00Z",
  },
  {
    source: "sample",
    sourceId: "sample-snoopy-collab",
    url: "https://www.etsy.com/ca/listing/sample-snoopy",
    title: "Timex x Peanuts Snoopy Tennis Watch Limited Collaboration 38mm",
    price: 39.0,
    currency: "CAD",
    shippingCost: 6.0,
    conditionRaw: "Pre-Owned",
    images: [demoImage(2)],
    location: "United States",
    listedAt: "2025-05-02T10:00:00Z",
  },
];

export const sampleAdapter: ListingAdapter = {
  source: "sample",

  async fetchListings(_query: string): Promise<AdapterResult> {
    return { listings: SAMPLE_LISTINGS };
  },
};
