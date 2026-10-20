import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, avatars, ucapan, balasan, progress, worldSettings } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { computeWorldStatus } from "../world-status/route";

export async function GET(req: NextRequest) {
  const me = await requireUser(req);
  if (!me) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });

  const [status, allUsers, allAvatars, allUcapan, allBalasan, myProgressRows, settings] = await Promise.all([
    computeWorldStatus(),
    db.select().from(users),
    db.select().from(avatars),
    db.select().from(ucapan),
    db.select().from(balasan),
    db.select().from(progress).where(eq(progress.playerId, me.id)),
    db.select().from(worldSettings).where(eq(worldSettings.id, "global")).limit(1),
  ]);

  const avatarMap = new Map(allAvatars.map((a) => [a.userId, a.config]));
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const publicUsers = allUsers
    .filter((u) => u.sudahIsiData)
    .map((u) => ({
      id: u.id,
      panggilan: u.namaPanggilan ?? u.namaLengkap.split(",")[0],
      namaLengkap: u.namaLengkap,
      peran: u.peran,
      jenisKelamin: u.jenisKelamin,
      sekolahPpl: u.sekolahPpl,
      modeAvatar: u.modeAvatar,
      avatar: avatarMap.get(u.id) ?? null,
    }));

  const ucapanList = allUcapan.map((u) => {
    const author = userMap.get(u.userId);
    const replies = allBalasan
      .filter((b) => b.ucapanId === u.id)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
      .map((b) => {
        const rb = userMap.get(b.userId);
        return {
          id: b.id,
          isi: b.isi,
          createdAt: b.createdAt,
          dari: rb?.namaPanggilan ?? rb?.namaLengkap?.split(",")[0] ?? "Anonim",
          peran: rb?.peran ?? "mahasiswa",
          milikku: b.userId === me.id,
        };
      });
    const readRow = myProgressRows.find((p) => p.ucapanId === u.id);
    return {
      id: u.id,
      judul: u.judul,
      isi: u.isi,
      mood: u.mood,
      zona: u.zona,
      createdAt: u.createdAt,
      penulis: {
        id: u.userId,
        nama: author?.namaLengkap ?? "—",
        panggilan: author?.namaPanggilan ?? author?.namaLengkap?.split(",")[0] ?? "—",
        peran: author?.peran ?? "mahasiswa",
        sekolahPpl: author?.sekolahPpl ?? null,
      },
      balasan: replies,
      sudahDibaca: !!readRow,
      milikku: u.userId === me.id,
    };
  });

  const myUcapan = allUcapan.find((u) => u.userId === me.id);
  const unreadReplies = myUcapan
    ? allBalasan.filter((b) => b.ucapanId === myUcapan.id && !b.sudahDibaca && b.userId !== me.id).length
    : 0;
  const totalRepliesOnMine = myUcapan ? allBalasan.filter((b) => b.ucapanId === myUcapan.id).length : 0;

  // 5 random quotes for the special moment
  const quotes = [...allUcapan]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((u) => {
      const a = userMap.get(u.userId);
      const snippet = u.isi.length > 90 ? u.isi.slice(0, 87) + "…" : u.isi;
      return { teks: snippet, dari: a?.namaPanggilan ?? a?.namaLengkap?.split(",")[0] ?? "Teman" };
    });

  return NextResponse.json({
    status,
    users: publicUsers,
    ucapan: ucapanList,
    myProgress: myProgressRows.map((p) => p.ucapanId),
    progressCount: myProgressRows.length,
    totalUcapan: ucapanList.length,
    unreadReplies,
    totalRepliesOnMine,
    quotes,
    adminMessage: settings[0]?.adminMessage ?? "",
  });
}
