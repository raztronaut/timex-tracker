"use client";

import { ExternalLink } from "lucide-react";

interface ReferenceBuy {
  title: string;
  url: string;
  image: string;
  price: string;
  note: string;
}

const REFERENCE_BUYS: ReferenceBuy[] = [
  {
    title: "Timex Marlin Mechanical",
    url: "https://www.ebay.ca/itm/377073705816",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Timex_Marlin_watch.jpg/440px-Timex_Marlin_watch.jpg",
    price: "$43.49",
    note: "1970s gold tone hand-wind dress watch",
  },
  {
    title: "Timex Q Reissue",
    url: "https://www.ebay.ca/itm/117111976291",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Timex_Q_1979_Reissue.jpg/440px-Timex_Q_1979_Reissue.jpg",
    price: "$35.99",
    note: "38mm Pepsi bezel reissue",
  },
  {
    title: "Timex Electric Dynabeat",
    url: "https://www.etsy.com/ca/listing/4469739360",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Timex_Electric_watch.jpg/440px-Timex_Electric_watch.jpg",
    price: "$47.00",
    note: "NOS 1970s deadstock",
  },
];

export function ReferenceCollection() {
  return (
    <div className="mb-6 rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Taste Profile
        </h2>
        <p className="text-xs text-muted">
          Scoring is anchored on these recent buys — vintage mechanicals,
          reissues, and deadstock finds
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {REFERENCE_BUYS.map((buy) => (
          <a
            key={buy.url}
            href={buy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-3 rounded-md border border-stone-100 p-2 transition-colors hover:border-stone-300 hover:bg-stone-50"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-stone-100">
              <img
                src={buy.image}
                alt={buy.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-tight text-foreground truncate">
                {buy.title}
              </p>
              <p className="text-[10px] text-muted truncate">{buy.note}</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground">
                  {buy.price}
                </span>
                <ExternalLink
                  size={10}
                  className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
