import { NextResponse } from "next/server";
import { runFullSync } from "@/lib/sync";

export const maxDuration = 60;

export async function POST() {
  try {
    const results = await runFullSync();
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

// Vercel Cron calls GET
export async function GET() {
  try {
    const results = await runFullSync();
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("Sync cron error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
