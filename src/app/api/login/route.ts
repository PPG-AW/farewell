import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { createSession } from "@/lib/session";
import { rateLimitCheck, rateLimitHit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `login:${ip}`;
  const rl = rateLimitCheck(key);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${rl.retryAfter ?? 60} detik.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const nama = typeof body?.nama === "string" ? body.nama.trim().replace(/\s+/g, " ") : "";
  if (nama.length < 2) {
    rateLimitHit(key, true);
    return NextResponse.json({ error: "Masukkan nama lengkap kamu dulu ya." }, { status: 400 });
  }

  let rows;
  if (/^(admin ppg|admin)$/i.test(nama)) {
    rows = await db.select().from(users).where(eq(users.peran, "admin")).limit(1);
  } else {
    rows = await db
      .select()
      .from(users)
      .where(sql`lower(${users.namaLengkap}) = lower(${nama})`)
      .limit(1);
  }
  const user = rows[0];
  if (!user) {
    rateLimitHit(key, true);
    return NextResponse.json({ error: "Nama tidak ditemukan. Hubungi admin PPG." }, { status: 404 });
  }

  rateLimitHit(key, false);
  const { token, expires } = await createSession(user.id);
  const next = user.peran === "admin" ? "/dashboard" : user.sudahIsiData ? "/world" : "/form";

  return NextResponse.json({
    token,
    expires,
    next,
    user: {
      id: user.id,
      namaLengkap: user.namaLengkap,
      namaPanggilan: user.namaPanggilan,
      peran: user.peran,
      jenisKelamin: user.jenisKelamin,
      sekolahPpl: user.sekolahPpl,
      modeAvatar: user.modeAvatar,
      sudahIsiData: user.sudahIsiData,
      isAdminAvatar: user.isAdminAvatar,
    },
  });
}
