import { NextRequest, NextResponse } from "next/server";
import { runFullSync } from "@/lib/sync";
import { getServiceClient } from "@/lib/supabase";

export const maxDuration = 120;

const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5-minute server-side cooldown

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function isWithinCooldown(): Promise<boolean> {
  const db = getServiceClient();
  const { data } = await db
    .from("sync_runs")
    .select("started_at")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (!data?.started_at) return false;
  return Date.now() - new Date(data.started_at).getTime() < MIN_SYNC_INTERVAL_MS;
}

async function handleSync() {
  const results = await runFullSync();
  return NextResponse.json({ ok: true, results });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (await isWithinCooldown()) {
    return NextResponse.json(
      { ok: false, error: "Sync cooldown — try again in a few minutes" },
      { status: 429 }
    );
  }

  try {
    return await handleSync();
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await handleSync();
  } catch (err) {
    console.error("Sync cron error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
