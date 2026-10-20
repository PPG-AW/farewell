import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const next = user.peran === "admin" ? "/dashboard" : user.sudahIsiData ? "/world" : "/form";
  return NextResponse.json({
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
