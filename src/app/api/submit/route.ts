import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, avatars, ucapan } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, logAdmin } from "@/lib/session";
import { ADMIN_AVATAR, dosenAvatar, randomAvatar, UKSW_ZONES, paginateText, type AvatarConfig } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Sesi tidak valid. Silakan masuk ulang." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  const judul = String(body?.ucapan?.judul ?? "").trim().slice(0, 50) || "Untuk Kalian";
  const isi = String(body?.ucapan?.isi ?? "").trim();
  const mood = String(body?.ucapan?.mood ?? "syukur");
  if (isi.length < 10) return NextResponse.json({ error: "Isi ucapan minimal 10 karakter ya." }, { status: 400 });

  const isDosen = user.peran === "dosen";
  let sekolahPpl: string | null = user.sekolahPpl;
  let modeAvatar: string = user.modeAvatar;
  let panggilan = user.namaPanggilan;
  let config: AvatarConfig;
  let zona: string;

  if (isDosen) {
    config = dosenAvatar(user.jenisKelamin as "L" | "P");
    panggilan = panggilan ?? (String(body?.namaPanggilan ?? "").trim() || user.namaLengkap.split(",")[0]);
    zona = UKSW_ZONES[Math.floor(Math.random() * UKSW_ZONES.length)].id;
  } else {
    panggilan = String(body?.namaPanggilan ?? "").trim().slice(0, 20);
    if (panggilan.length < 2) return NextResponse.json({ error: "Nama panggilan wajib diisi (2–20 karakter)." }, { status: 400 });
    sekolahPpl = String(body?.sekolahPpl ?? "").trim();
    if (!sekolahPpl) return NextResponse.json({ error: "Pilih sekolah PPL kamu dulu." }, { status: 400 });
    modeAvatar = user.isAdminAvatar ? "biasa" : body?.modeAvatar === "tni" ? "tni" : "biasa";
    if (user.isAdminAvatar) {
      config = ADMIN_AVATAR;
    } else {
      const c = body?.avatarConfig as AvatarConfig | undefined;
      config = c && typeof c === "object" ? c : randomAvatar(user.jenisKelamin as "L" | "P", modeAvatar as "biasa" | "tni");
    }
    if (modeAvatar === "tni") {
      config = { ...config, atasan: "seragam-tni", atasanWarna: "#4a5d3a", bawahan: "celana-loreng", bawahanWarna: "#3d4f31", sepatu: "boots", sepatuWarna: "#17130f" };
    }
    zona = sekolahPpl;
  }

  const halaman = paginateText(isi).length;

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ namaPanggilan: panggilan, sekolahPpl, modeAvatar, sudahIsiData: true })
      .where(eq(users.id, user.id));

    await tx
      .insert(avatars)
      .values({ userId: user.id, config: config as unknown as Record<string, unknown> })
      .onConflictDoUpdate({ target: avatars.userId, set: { config: config as unknown as Record<string, unknown> } });

    const existing = await tx.select().from(ucapan).where(eq(ucapan.userId, user.id)).limit(1);
    if (existing[0]) {
      await tx.update(ucapan).set({ judul, isi, mood, zona, halamanCount: halaman }).where(eq(ucapan.id, existing[0].id));
    } else {
      await tx.insert(ucapan).values({ userId: user.id, judul, isi, mood, zona, halamanCount: halaman });
    }
  });

  if (user.peran === "admin") await logAdmin("ISI_FORM", user.namaLengkap);
  return NextResponse.json({ ok: true, user: { namaPanggilan: panggilan, sekolahPpl, modeAvatar, zona } });
}
