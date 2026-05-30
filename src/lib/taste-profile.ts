import type { RawListing } from "./types";

export interface TasteReference {
  listing: RawListing;
  shortTitle: string;
  note: string;
  totalPriceCad: string;
}

export const TASTE_PROFILE: TasteReference[] = [
  {
    listing: {
      source: "ebay",
      sourceId: "377073705816",
      url: "https://www.ebay.ca/itm/377073705816",
      title: "Vintage Timex Marlin Mechanical Watch - Gold Tone Hand-Wind 1970s",
      price: 34.99,
      currency: "CAD",
      shippingCost: 8.5,
      conditionRaw: "Pre-Owned",
      images: ["/marlin.png"],
      location: "Canada",
      listedAt: "2025-05-01T12:00:00Z",
    },
    shortTitle: "Timex Marlin Mechanical",
    note: "1970s gold tone hand-wind dress watch",
    totalPriceCad: "$43.49",
  },
  {
    listing: {
      source: "ebay",
      sourceId: "377073705817",
      url: "https://www.ebay.ca/itm/377073705817",
      title: "Vintage Timex Breyers Ice Cream Watch - Promo Character Logo Dial",
      price: 38.00,
      currency: "CAD",
      shippingCost: 7.0,
      conditionRaw: "Pre-Owned",
      images: ["/breyers.png"],
      location: "Canada",
      listedAt: "2025-04-15T10:00:00Z",
    },
    shortTitle: "Timex Breyers",
    note: "Vintage Breyers promotional watch",
    totalPriceCad: "$45.00",
  },
  {
    listing: {
      source: "ebay",
      sourceId: "377073705818",
      url: "https://www.ebay.ca/itm/377073705818",
      title: "Vintage Timex DeKalb Corn Watch - Flying Seed Corn Promo Manual Wind",
      price: 45.00,
      currency: "CAD",
      shippingCost: 8.0,
      conditionRaw: "New Old Stock",
      images: ["/dekalb.png"],
      location: "United States",
      listedAt: "2025-03-20T08:00:00Z",
    },
    shortTitle: "Timex DeKalb",
    note: "Rare DeKalb flying seed corn promo",
    totalPriceCad: "$53.00",
  },
];

export const REFERENCE_BUYS: RawListing[] = TASTE_PROFILE.map((t) => t.listing);

export const TASTE_SUMMARY = `The collector loves:
- 1960s-80s vintage (Marlin, Mercury, Viscount, Electric, Dynabeat)
- Collaborations & promotional items (Todd Snyder, Peanuts/Snoopy, DeKalb, Breyers)
- Deadstock/NOS finds, reissues (Q Timex, Marlin reissue)
- Military/field watches (Camper, MK1)`;
