import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const db = getServiceClient();

  const { data } = await db
    .from("sync_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  const { count: totalListings } = await db
    .from("listings")
    .select("*", { count: "exact", head: true });

  const { count: candidateCount } = await db
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("is_candidate", true);

  return NextResponse.json({
    recentRuns: data || [],
    totalListings: totalListings || 0,
    candidateCount: candidateCount || 0,
  });
}
