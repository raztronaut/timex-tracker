import { NextRequest, NextResponse } from "next/server";
import { queryListings } from "@/lib/listings";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filter = searchParams.get("filter") || "candidates";
  const sort = searchParams.get("sort") || "interest_score";
  const source = searchParams.get("source") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const { listings, total, error } = await queryListings({ filter, sort, source, limit, offset });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings, total });
}
