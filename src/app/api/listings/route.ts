import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filter = searchParams.get("filter") || "candidates";
  const sort = searchParams.get("sort") || "interest_score";
  const source = searchParams.get("source");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  const db = getServiceClient();

  let query = db.from("listings").select("*", { count: "exact" });

  if (filter === "candidates") {
    query = query.eq("is_candidate", true);
  } else if (filter === "excluded") {
    query = query.eq("is_candidate", false);
  }

  if (source) {
    query = query.eq("source", source);
  }

  const sortColumn = ["interest_score", "total_cost_cad", "last_seen_at", "price"].includes(sort)
    ? sort
    : "interest_score";

  const ascending = sortColumn === "total_cost_cad" || sortColumn === "price";

  query = query
    .order(sortColumn, { ascending, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data, total: count });
}
