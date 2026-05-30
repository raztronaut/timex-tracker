import type { ListingAdapter, RawListing } from "../types";

// Reference buys from the collector's brief -- these anchor the taste profile.
// Images use public eBay/Etsy thumbnail patterns that survive listing expiry.
export const REFERENCE_BUYS: RawListing[] = [
  {
    source: "ebay",
    sourceId: "377073705816",
    url: "https://www.ebay.ca/itm/377073705816",
    title: "Vintage Timex Marlin Mechanical Watch - Gold Tone Hand-Wind 1970s",
    price: 34.99,
    currency: "CAD",
    shippingCost: 8.5,
    conditionRaw: "Pre-Owned",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Timex_Marlin_watch.jpg/440px-Timex_Marlin_watch.jpg",
    ],
    location: "Canada",
    listedAt: "2025-05-01T12:00:00Z",
  },
  {
    source: "ebay",
    sourceId: "117111976291",
    url: "https://www.ebay.ca/itm/117111976291",
    title: "Timex Q Reissue 38mm Stainless Steel Bracelet Watch - Pepsi Bezel",
    price: 29.99,
    currency: "CAD",
    shippingCost: 6.0,
    conditionRaw: "Pre-Owned",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Timex_Q_1979_Reissue.jpg/440px-Timex_Q_1979_Reissue.jpg",
    ],
    location: "Canada",
    listedAt: "2025-04-15T10:00:00Z",
  },
  {
    source: "etsy",
    sourceId: "4469739360",
    url: "https://www.etsy.com/ca/listing/4469739360",
    title: "NOS Timex Electric Dynabeat Vintage Watch 1970s Deadstock New Old Stock",
    price: 42.0,
    currency: "CAD",
    shippingCost: 5.0,
    conditionRaw: "New Old Stock",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Timex_Electric_watch.jpg/440px-Timex_Electric_watch.jpg",
    ],
    location: "United States",
    listedAt: "2025-03-20T08:00:00Z",
  },
];

const SAMPLE_LISTINGS: RawListing[] = [
  ...REFERENCE_BUYS,
  {
    source: "ebay",
    sourceId: "sample-vintage-expedition",
    url: "https://www.ebay.ca/itm/sample-expedition",
    title: "Timex Expedition Indiglo Field Watch 36mm Military Style Vintage",
    price: 22.0,
    currency: "CAD",
    shippingCost: 8.0,
    conditionRaw: "Pre-Owned",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Timex_Expedition_watch.jpg/440px-Timex_Expedition_watch.jpg",
    ],
    location: "Canada",
    listedAt: "2025-05-10T14:00:00Z",
  },
  {
    source: "ebay",
    sourceId: "sample-ironman-collab",
    url: "https://www.ebay.ca/itm/sample-ironman",
    title: "Timex Ironman Triathlon x Todd Snyder Collaboration Watch Limited Edition",
    price: 35.0,
    currency: "USD",
    shippingCost: 10.0,
    conditionRaw: "Pre-Owned",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Timex_Ironman_Triathlon.jpg/440px-Timex_Ironman_Triathlon.jpg",
    ],
    location: "United States",
    listedAt: "2025-05-08T09:00:00Z",
  },
  {
    source: "ebay",
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
    source: "ebay",
    sourceId: "sample-needs-battery",
    url: "https://www.ebay.ca/itm/sample-battery",
    title: "Timex Easy Reader 35mm Classic Watch - Needs New Battery",
    price: 18.0,
    currency: "CAD",
    shippingCost: 7.0,
    conditionRaw: "Pre-Owned - needs battery",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Timex_Easy_Reader_watch.jpg/440px-Timex_Easy_Reader_watch.jpg",
    ],
    location: "Canada",
    listedAt: "2025-05-12T16:00:00Z",
  },
  {
    source: "ebay",
    sourceId: "sample-too-expensive",
    url: "https://www.ebay.ca/itm/sample-expensive",
    title: "Timex Marlin Automatic 40mm Gold Reissue",
    price: 180.0,
    currency: "CAD",
    shippingCost: 0,
    conditionRaw: "New with tags",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Timex_Marlin_watch.jpg/440px-Timex_Marlin_watch.jpg",
    ],
    location: "Canada",
    listedAt: "2025-05-11T12:00:00Z",
  },
  {
    source: "ebay",
    sourceId: "sample-waterbury-legacy",
    url: "https://www.ebay.ca/itm/sample-waterbury",
    title: "Timex Waterbury Legacy 34mm Sub-Dial Vintage Inspired Watch",
    price: 28.0,
    currency: "CAD",
    shippingCost: 9.0,
    conditionRaw: "Pre-Owned",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Timex_Expedition_watch.jpg/440px-Timex_Expedition_watch.jpg",
    ],
    location: "Canada",
    listedAt: "2025-05-13T08:30:00Z",
  },
  {
    source: "etsy",
    sourceId: "sample-snoopy-collab",
    url: "https://www.etsy.com/ca/listing/sample-snoopy",
    title: "Timex x Peanuts Snoopy Tennis Watch Limited Collaboration 38mm",
    price: 39.0,
    currency: "CAD",
    shippingCost: 6.0,
    conditionRaw: "Pre-Owned",
    images: [
      "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Snoopy_Peanuts.png/220px-Snoopy_Peanuts.png",
    ],
    location: "United States",
    listedAt: "2025-05-02T10:00:00Z",
  },
];

export const sampleAdapter: ListingAdapter = {
  source: "sample",

  async fetchListings(_query: string): Promise<RawListing[]> {
    return SAMPLE_LISTINGS;
  },
};
