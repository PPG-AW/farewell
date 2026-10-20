import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { balasan, ucapan, users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const me = await requireUser(req);
  if (!me) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  // Mark replies on my ucapan as read
  if (body.action === "markRead" && typeof body.ucapanId === "string") {
    const myUcapan = await db.select().from(ucapan).where(eq(ucapan.id, body.ucapanId)).limit(1);
    if (myUcapan[0] && myUcapan[0].userId === me.id) {
      await db
        .update(balasan)
        .set({ sudahDibaca: true })
        .where(and(eq(balasan.ucapanId, body.ucapanId), ne(balasan.userId, me.id)));
    }
    return NextResponse.json({ ok: true });
  }

  const ucapanId = String(body?.ucapanId ?? "");
  const isi = String(body?.isi ?? "").trim().slice(0, 150);
  if (!ucapanId || isi.length < 1) return NextResponse.json({ error: "Balasan tidak boleh kosong." }, { status: 400 });

  const target = await db.select().from(ucapan).where(eq(ucapan.id, ucapanId)).limit(1);
  if (!target[0]) return NextResponse.json({ error: "Ucapan tidak ditemukan." }, { status: 404 });
  if (target[0].userId === me.id) return NextResponse.json({ error: "Kamu tidak bisa membalas ucapanmu sendiri." }, { status: 400 });

  const existing = await db
    .select()
    .from(balasan)
    .where(and(eq(balasan.ucapanId, ucapanId), eq(balasan.userId, me.id)))
    .limit(1);
  if (existing[0]) return NextResponse.json({ error: "Kamu sudah membalas ucapan ini (1 orang = 1 balasan)." }, { status: 409 });

  const inserted = await db.insert(balasan).values({ ucapanId, userId: me.id, isi }).returning();
  return NextResponse.json({
    ok: true,
    balasan: {
      id: inserted[0].id,
      isi,
      createdAt: inserted[0].createdAt,
      dari: me.namaPanggilan ?? me.namaLengkap.split(",")[0],
      peran: me.peran,
      milikku: true,
    },
  });
}

export async function GET(req: NextRequest) {
  const me = await requireUser(req);
  if (!me) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const ucapanId = req.nextUrl.searchParams.get("ucapanId");
  if (!ucapanId) return NextResponse.json({ error: "ucapanId diperlukan." }, { status: 400 });
  const rows = await db
    .select({ b: balasan, u: { nama: users.namaLengkap, panggilan: users.namaPanggilan, peran: users.peran } })
    .from(balasan)
    .leftJoin(users, eq(balasan.userId, users.id))
    .where(eq(balasan.ucapanId, ucapanId));
  return NextResponse.json({
    balasan: rows
      .map((r) => ({
        id: r.b.id,
        isi: r.b.isi,
        createdAt: r.b.createdAt,
        dari: r.u?.panggilan ?? r.u?.nama?.split(",")[0] ?? "Anonim",
        peran: r.u?.peran ?? "mahasiswa",
        milikku: r.b.userId === me.id,
      }))
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
  });
}
