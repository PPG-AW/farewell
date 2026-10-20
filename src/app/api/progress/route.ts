import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const me = await requireUser(req);
  if (!me) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const ucapanId = String(body?.ucapanId ?? "");
  if (!ucapanId) return NextResponse.json({ error: "ucapanId diperlukan." }, { status: 400 });

  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.playerId, me.id), eq(progress.ucapanId, ucapanId)))
    .limit(1);
  if (existing[0]) return NextResponse.json({ ok: true, already: true });

  await db.insert(progress).values({ playerId: me.id, ucapanId });
  return NextResponse.json({ ok: true, already: false });
}

export async function GET(req: NextRequest) {
  const me = await requireUser(req);
  if (!me) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const rows = await db.select().from(progress).where(eq(progress.playerId, me.id));
  return NextResponse.json({ read: rows.map((r) => r.ucapanId) });
}
