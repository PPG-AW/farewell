import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, worldSettings } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function computeWorldStatus() {
  const settings = await db.select().from(worldSettings).where(eq(worldSettings.id, "global")).limit(1);
  const lockMode = settings[0]?.lockMode ?? "auto";

  const mhs = await db
    .select({
      total: sql<number>`count(*)::int`,
      filled: sql<number>`count(*) filter (where ${users.sudahIsiData})::int`,
    })
    .from(users)
    .where(inArray(users.peran, ["mahasiswa", "admin"]));
  const dsn = await db
    .select({
      total: sql<number>`count(*)::int`,
      filled: sql<number>`count(*) filter (where ${users.sudahIsiData})::int`,
    })
    .from(users)
    .where(and(eq(users.peran, "dosen")));

  const mTotal = mhs[0]?.total ?? 0;
  const mFilled = mhs[0]?.filled ?? 0;
  const dTotal = dsn[0]?.total ?? 0;
  const dFilled = dsn[0]?.filled ?? 0;

  const isOpen =
    lockMode === "open" ? true : lockMode === "locked" ? false : mTotal > 0 && mFilled >= mTotal;

  return { mahasiswa: { total: mTotal, filled: mFilled }, dosen: { total: dTotal, filled: dFilled }, lockMode, isOpen };
}

export async function GET() {
  const status = await computeWorldStatus();
  return NextResponse.json(status);
}
