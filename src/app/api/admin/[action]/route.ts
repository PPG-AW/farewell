import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, avatars, ucapan, balasan, progress, adminLog, worldSettings } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdmin, logAdmin } from "@/lib/session";
import { computeWorldStatus } from "../../world-status/route";
import { SEKOLAH_LIST } from "@/lib/constants";

type Ctx = { params: Promise<{ action: string }> };

async function guard(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return null;
  return admin;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const admin = await guard(req);
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 403 });
  const { action } = await ctx.params;

  if (action === "stats") {
    const status = await computeWorldStatus();
    const [uRows, ucapanCount, balasanCount, progressCount, logs] = await Promise.all([
      db.select().from(users).orderBy(users.createdAt),
      db.select({ c: sql<number>`count(*)::int` }).from(ucapan),
      db.select({ c: sql<number>`count(*)::int` }).from(balasan),
      db.select({ c: sql<number>`count(*)::int` }).from(progress),
      db.select().from(adminLog).orderBy(desc(adminLog.timestamp)).limit(30),
    ]);
    const progByUser = await db
      .select({ playerId: progress.playerId, c: sql<number>`count(*)::int` })
      .from(progress)
      .groupBy(progress.playerId);
    const progMap = new Map(progByUser.map((p) => [p.playerId, p.c]));
    const totalUcapan = ucapanCount[0]?.c ?? 0;
    return NextResponse.json({
      status,
      totals: { ucapan: totalUcapan, balasan: balasanCount[0]?.c ?? 0, progress: progressCount[0]?.c ?? 0 },
      users: uRows.map((u) => ({
        id: u.id,
        namaLengkap: u.namaLengkap,
        namaPanggilan: u.namaPanggilan,
        peran: u.peran,
        jenisKelamin: u.jenisKelamin,
        sekolahPpl: u.sekolahPpl,
        modeAvatar: u.modeAvatar,
        sudahIsiData: u.sudahIsiData,
        progress: progMap.get(u.id) ?? 0,
        createdAt: u.createdAt,
      })),
      logs,
    });
  }

  if (action === "users") {
    const rows = await db.select().from(users).orderBy(users.peran, users.createdAt);
    return NextResponse.json({ users: rows, sekolah: SEKOLAH_LIST });
  }

  if (action === "balasan") {
    const rows = await db
      .select({
        b: balasan,
        penulis: { nama: users.namaLengkap, peran: users.peran },
      })
      .from(balasan)
      .leftJoin(users, eq(balasan.userId, users.id))
      .orderBy(desc(balasan.createdAt))
      .limit(200);
    const ucapanRows = await db.select().from(ucapan);
    const uMap = new Map(ucapanRows.map((u) => [u.id, u.judul]));
    return NextResponse.json({
      balasan: rows.map((r) => ({
        id: r.b.id,
        isi: r.b.isi,
        createdAt: r.b.createdAt,
        dari: r.penulis?.nama ?? "?",
        peran: r.penulis?.peran ?? "?",
        ucapanJudul: uMap.get(r.b.ucapanId) ?? "—",
      })),
    });
  }

  if (action === "export") {
    const [u, a, uc, b, p, l] = await Promise.all([
      db.select().from(users),
      db.select().from(avatars),
      db.select().from(ucapan),
      db.select().from(balasan),
      db.select().from(progress),
      db.select().from(adminLog),
    ]);
    return NextResponse.json({ exportedAt: new Date().toISOString(), users: u, avatars: a, ucapan: uc, balasan: b, progress: p, adminLog: l });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 404 });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await guard(req);
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 403 });
  const { action } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (action === "users") {
    const namaLengkap = String(body?.namaLengkap ?? "").trim().slice(0, 120);
    const peran = ["mahasiswa", "dosen"].includes(body?.peran) ? body.peran : "mahasiswa";
    const jenisKelamin = body?.jenisKelamin === "L" ? "L" : "P";
    if (namaLengkap.length < 3) return NextResponse.json({ error: "Nama minimal 3 karakter." }, { status: 400 });
    const ins = await db.insert(users).values({ namaLengkap, peran, jenisKelamin }).returning();
    await logAdmin("TAMBAH_USER", `${namaLengkap} (${peran})`);
    return NextResponse.json({ ok: true, user: ins[0] });
  }

  if (action === "world") {
    const mode = ["auto", "open", "locked"].includes(body?.lockMode) ? body.lockMode : "auto";
    await db
      .insert(worldSettings)
      .values({ id: "global", lockMode: mode, updatedAt: new Date() })
      .onConflictDoUpdate({ target: worldSettings.id, set: { lockMode: mode, updatedAt: new Date() } });
    await logAdmin("UBAH_KUNCI", `lockMode → ${mode}`);
    return NextResponse.json({ ok: true, lockMode: mode });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 404 });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await guard(req);
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 403 });
  const { action } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (action === "users" && body?.action === "reset" && typeof body?.id === "string") {
    const target = await db.select().from(users).where(eq(users.id, body.id)).limit(1);
    if (!target[0]) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    const their = await db.select().from(ucapan).where(eq(ucapan.userId, body.id)).limit(1);
    await db.transaction(async (tx) => {
      if (their[0]) await tx.delete(ucapan).where(eq(ucapan.id, their[0].id));
      await tx.delete(avatars).where(eq(avatars.userId, body.id));
      await tx.delete(balasan).where(eq(balasan.userId, body.id));
      await tx.delete(progress).where(eq(progress.playerId, body.id));
      await tx
        .update(users)
        .set({ sudahIsiData: false, namaPanggilan: null, sekolahPpl: null, modeAvatar: "biasa" })
        .where(eq(users.id, body.id));
    });
    await logAdmin("RESET_USER", target[0].namaLengkap);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 404 });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const admin = await guard(req);
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 403 });
  const { action } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (action === "users" && typeof body?.id === "string") {
    const target = await db.select().from(users).where(eq(users.id, body.id)).limit(1);
    if (!target[0]) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    if (target[0].peran === "admin") return NextResponse.json({ error: "Tidak bisa menghapus admin." }, { status: 400 });
    await db.delete(users).where(eq(users.id, body.id));
    await logAdmin("HAPUS_USER", target[0].namaLengkap);
    return NextResponse.json({ ok: true });
  }

  if (action === "balasan" && typeof body?.id === "string") {
    await db.delete(balasan).where(eq(balasan.id, body.id));
    await logAdmin("HAPUS_BALASAN", body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 404 });
}
