"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, GraduationCap, BookOpen, MessageCircle, Lock, LockOpen, RefreshCw,
  UserPlus, Trash2, RotateCcw, Search, Eye, Download, ScrollText, Compass,
  LogOut, Home, PencilLine, LayoutDashboard, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { apiFetch, useStore } from "@/store/useStore";
import clsx from "clsx";

type UserRow = {
  id: string; namaLengkap: string; namaPanggilan: string | null; peran: string;
  jenisKelamin: string; sekolahPpl: string | null; modeAvatar: string; sudahIsiData: boolean;
  progress: number; createdAt: string;
};
type Stats = {
  status: { mahasiswa: { total: number; filled: number }; dosen: { total: number; filled: number }; lockMode: string; isOpen: boolean };
  totals: { ucapan: number; balasan: number; progress: number };
  users: UserRow[];
  logs: { id: string; aksi: string; target: string; timestamp: string }[];
};
type BalasanRow = { id: string; isi: string; createdAt: string; dari: string; peran: string; ucapanJudul: string };

const PERAN_STYLE: Record<string, string> = {
  mahasiswa: "border-[#81b29a]/40 bg-[#81b29a]/10 text-[#9fd4a8]",
  dosen: "border-[#f2cc8f]/40 bg-[#f2cc8f]/10 text-[#f2d38a]",
  admin: "border-[#9b6dd6]/40 bg-[#9b6dd6]/10 text-[#cdb4f5]",
};

export default function DashboardPage() {
  const router = useRouter();
  const session = useStore((s) => s.session);
  const sessionLoaded = useStore((s) => s.sessionLoaded);
  const loadSession = useStore((s) => s.loadSession);
  const logout = useStore((s) => s.logout);

  const [stats, setStats] = useState<Stats | null>(null);
  const [balasan, setBalasan] = useState<BalasanRow[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"semua" | "mahasiswa" | "dosen" | "admin">("semua");
  const [namaBaru, setNamaBaru] = useState("");
  const [peranBaru, setPeranBaru] = useState("mahasiswa");
  const [genderBaru, setGenderBaru] = useState("P");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const refresh = async () => {
    if (!session?.token) return;
    const [s, b] = await Promise.all([
      apiFetch(session.token, "/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
      apiFetch(session.token, "/api/admin/balasan").then((r) => (r.ok ? r.json() : null)),
    ]);
    if (s) setStats(s);
    if (b) setBalasan(b.balasan);
  };

  useEffect(() => {
    if (!sessionLoaded) return;
    if (!session || session.peran !== "admin") {
      router.replace("/");
      return;
    }
    refresh();
    const iv = window.setInterval(refresh, 15000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, session?.token]);

  const doAction = async (fn: () => Promise<Response>, label: string) => {
    setBusy(label);
    try {
      const res = await fn();
      const d = await res.json().catch(() => ({}));
      setNotice(res.ok ? `✓ ${label} berhasil` : d.error ?? "Gagal");
      await refresh();
    } catch {
      setNotice("Gagal terhubung ke server.");
    }
    setBusy("");
    window.setTimeout(() => setNotice(""), 3000);
  };

  const setLock = (mode: string) =>
    doAction(() => apiFetch(session!.token, "/api/admin/world", { method: "POST", body: JSON.stringify({ lockMode: mode }) }), `Kunci dunia → ${mode}`);

  const addUser = () => {
    if (namaBaru.trim().length < 3) return;
    doAction(
      () => apiFetch(session!.token, "/api/admin/users", { method: "POST", body: JSON.stringify({ namaLengkap: namaBaru.trim(), peran: peranBaru, jenisKelamin: genderBaru }) }),
      "Tambah user"
    );
    setNamaBaru("");
  };

  const resetUser = (u: UserRow) => doAction(() => apiFetch(session!.token, "/api/admin/users", { method: "PATCH", body: JSON.stringify({ id: u.id, action: "reset" }) }), `Reset ${u.namaLengkap}`);

  const deleteUser = (u: UserRow) => {
    setConfirmDel(null);
    doAction(() => apiFetch(session!.token, "/api/admin/users", { method: "DELETE", body: JSON.stringify({ id: u.id }) }), `Hapus ${u.namaLengkap}`);
  };

  const deleteBalasan = (id: string) => doAction(() => apiFetch(session!.token, "/api/admin/balasan", { method: "DELETE", body: JSON.stringify({ id }) }), "Hapus balasan");

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportJson = async () => {
    const d = await apiFetch(session!.token, "/api/admin/export").then((r) => r.json());
    download(JSON.stringify(d, null, 2), `jejak-langkah-export-${Date.now()}.json`, "application/json");
  };
  const exportCsv = async () => {
    const d = await apiFetch(session!.token, "/api/admin/export").then((r) => r.json());
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["nama_lengkap", "peran", "gender", "sekolah_ppl", "mode", "sudah_isi"].join(","),
      ...(d.users as UserRow[]).map((u) => [u.namaLengkap, u.peran, u.jenisKelamin, u.sekolahPpl ?? "", u.modeAvatar, u.sudahIsiData ? "ya" : "belum"].map(esc).join(",")),
      "",
      ["judul_ucapan", "zona", "mood", "tanggal"].join(","),
      ...(d.ucapan as { judul: string; zona: string; mood: string; createdAt: string }[]).map((u) => [u.judul, u.zona, u.mood, u.createdAt].map(esc).join(",")),
    ];
    download(rows.join("\n"), `jejak-langkah-${Date.now()}.csv`, "text/csv");
  };

  const users = useMemo(() => {
    let list = stats?.users ?? [];
    if (filter !== "semua") list = list.filter((u) => u.peran === filter);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((u) => u.namaLengkap.toLowerCase().includes(s) || (u.namaPanggilan ?? "").toLowerCase().includes(s));
    }
    return list;
  }, [stats?.users, filter, q]);

  if (!sessionLoaded || !session || session.peran !== "admin") return null;
  const status = stats?.status;

  return (
    <main className="grain min-h-screen px-3 py-5 sm:px-6" style={{ background: "linear-gradient(170deg, #141020 0%, #241a2e 50%, #2c1f2e 100%)" }}>
      <div className="mx-auto max-w-7xl">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#f2cc8f]">
              <LayoutDashboard size={13} /> Admin Dashboard
            </div>
            <h1 className="font-display mt-1 text-2xl font-black text-[#f4ecdd] sm:text-3xl">Jejak Langkah Guru Matematika</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.push("/world?admin=1")} className="flex items-center gap-1.5 rounded-xl border border-[#9db4ff]/40 bg-[#9db4ff]/10 px-3.5 py-2 text-xs font-bold text-[#9db4ff] transition hover:bg-[#9db4ff]/20">
              <Eye size={13} /> Mode Jelajah
            </button>
            <button onClick={() => router.push("/world")} className="flex items-center gap-1.5 rounded-xl border border-[#81b29a]/40 bg-[#81b29a]/10 px-3.5 py-2 text-xs font-bold text-[#9fd4a8] transition hover:bg-[#81b29a]/20">
              <Compass size={13} /> Dunia 3D
            </button>
            <button onClick={() => router.push("/form")} className="flex items-center gap-1.5 rounded-xl border border-[#e5989b]/40 bg-[#e5989b]/10 px-3.5 py-2 text-xs font-bold text-[#ebb0b3] transition hover:bg-[#e5989b]/20">
              <PencilLine size={13} /> Form Saya
            </button>
            <button onClick={() => router.push("/")} className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-[#f4ecdd]/75 transition hover:bg-white/10">
              <Home size={13} />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-[#f4ecdd]/75 transition hover:bg-white/10">
              <LogOut size={13} />
            </button>
          </div>
        </div>

        {/* stat cards */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { icon: GraduationCap, label: "Mahasiswa", val: `${status?.mahasiswa.filled ?? 0}/${status?.mahasiswa.total ?? 0}`, sub: "sudah mengisi", c: "#f2cc8f" },
            { icon: Users, label: "Dosen", val: `${status?.dosen.filled ?? 0}/${status?.dosen.total ?? 0}`, sub: "sudah mengisi", c: "#8ecae6" },
            { icon: BookOpen, label: "Ucapan", val: `${stats?.totals.ucapan ?? 0}`, sub: "tersimpan di dunia", c: "#81b29a" },
            { icon: MessageCircle, label: "Balasan", val: `${stats?.totals.balasan ?? 0}`, sub: "percakapan hangat", c: "#e5989b" },
            { icon: ScrollText, label: "Total Dibaca", val: `${stats?.totals.progress ?? 0}`, sub: "jejak pembacaan", c: "#cdb4f5" },
          ].map((c) => (
            <div key={c.label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: c.c }}>
                <c.icon size={13} /> {c.label}
              </div>
              <div className="font-display mt-1.5 text-2xl font-black text-[#f4ecdd]">{c.val}</div>
              <div className="text-[10px] text-[#f4ecdd]/50">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* kunci dunia + status */}
        <div className="glass mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", status?.isOpen ? "bg-[#81b29a]/20" : "bg-[#f2a93b]/20")}>
              {status?.isOpen ? <LockOpen size={17} className="text-[#9fd4a8]" /> : <Lock size={17} className="text-[#f2a93b]" />}
            </div>
            <div>
              <div className="text-sm font-black text-[#f4ecdd]">{status?.isOpen ? "Dunia 3D: TERBUKA" : "Dunia 3D: TERKUNCI"}</div>
              <div className="text-[10px] text-[#f4ecdd]/55">Mode: {status?.lockMode === "auto" ? "Otomatis (29/29 mahasiswa)" : status?.lockMode === "open" ? "Dibuka paksa oleh admin" : "Dikunci paksa oleh admin"}</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[
              { id: "auto", label: "Otomatis" },
              { id: "open", label: "Buka Paksa" },
              { id: "locked", label: "Kunci" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setLock(m.id)}
                className={clsx(
                  "rounded-xl border px-3.5 py-2 text-[11px] font-bold transition",
                  status?.lockMode === m.id ? "border-[#f2cc8f] bg-[#f2cc8f]/20 text-[#f2cc8f]" : "border-white/15 bg-white/5 text-[#f4ecdd]/70 hover:bg-white/10"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* tabel user */}
          <div className="glass rounded-2xl p-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#f4ecdd]">
                <Users size={14} className="text-[#f2cc8f]" /> Daftar Penjelajah
              </div>
              <div className="flex items-center gap-1.5">
                {(["semua", "mahasiswa", "dosen", "admin"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={clsx("rounded-lg border px-2.5 py-1.5 text-[10px] font-bold capitalize transition", filter === f ? "border-[#f2cc8f] bg-[#f2cc8f]/15 text-[#f2cc8f]" : "border-white/15 bg-white/5 text-[#f4ecdd]/60 hover:bg-white/10")}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-3 py-2">
              <Search size={13} className="text-[#f4ecdd]/45" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama…" className="w-full bg-transparent text-xs text-[#f4ecdd] placeholder:text-[#f4ecdd]/35" />
            </div>
            <div className="mt-3 max-h-[52vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#1b1611] text-[9px] uppercase tracking-[0.2em] text-[#f4ecdd]/50">
                  <tr>
                    <th className="px-2 py-2">Nama</th>
                    <th className="px-2 py-2">Peran</th>
                    <th className="px-2 py-2">PPL/Mode</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Baca</th>
                    <th className="px-2 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-white/5 transition hover:bg-white/[0.04]">
                      <td className="px-2 py-2.5">
                        <div className="font-bold text-[#f4ecdd]">{u.namaLengkap}</div>
                        {u.namaPanggilan && <div className="text-[10px] text-[#f4ecdd]/50">“{u.namaPanggilan}”</div>}
                      </td>
                      <td className="px-2 py-2.5">
                        <span className={clsx("rounded-full border px-2 py-0.5 text-[10px] font-bold", PERAN_STYLE[u.peran])}>{u.peran}</span>
                      </td>
                      <td className="px-2 py-2.5 text-[10px] text-[#f4ecdd]/65">
                        {u.sekolahPpl ? u.sekolahPpl.replace(" Salatiga", "") : "—"}
                        {u.peran !== "dosen" && <div className="text-[9px] text-[#f4ecdd]/45">{u.modeAvatar === "tni" ? "TNI" : "Biasa"} · {u.jenisKelamin}</div>}
                      </td>
                      <td className="px-2 py-2.5">
                        {u.sudahIsiData ? (
                          <span className="rounded-full bg-[#81b29a]/15 px-2 py-0.5 text-[10px] font-bold text-[#9fd4a8]">Terisi</span>
                        ) : (
                          <span className="rounded-full bg-[#f2a93b]/15 px-2 py-0.5 text-[10px] font-bold text-[#f2a93b]">Belum</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-[10px] font-bold text-[#f4ecdd]/70">{u.progress}/{stats?.totals.ucapan ?? 0}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex justify-end gap-1">
                          {u.sudahIsiData && (
                            <button onClick={() => resetUser(u)} title="Reset formulir (uji ulang alur)" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-[#f4ecdd]/60 transition hover:bg-white/15 hover:text-white">
                              <RotateCcw size={12} />
                            </button>
                          )}
                          {u.peran !== "admin" && (
                            <button onClick={() => setConfirmDel(u.id)} title="Hapus user" className="rounded-lg border border-[#c75146]/30 bg-[#c75146]/10 p-1.5 text-[#e08a84] transition hover:bg-[#c75146]/25">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="py-8 text-center text-xs text-[#f4ecdd]/45">Tidak ada user yang cocok.</p>}
            </div>
          </div>

          {/* kolom kanan */}
          <div className="space-y-4">
            {/* tambah user */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#f4ecdd]">
                <UserPlus size={14} className="text-[#9fd4a8]" /> Tambah User
              </div>
              <input value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} placeholder="Nama lengkap…" className="mt-3 w-full rounded-xl border border-white/15 bg-black/25 px-3.5 py-2.5 text-xs text-[#f4ecdd] placeholder:text-[#f4ecdd]/35 focus:border-[#f2cc8f]/60" />
              <div className="mt-2 flex gap-1.5">
                {["mahasiswa", "dosen"].map((p) => (
                  <button key={p} onClick={() => setPeranBaru(p)} className={clsx("flex-1 rounded-lg border px-2 py-2 text-[10px] font-bold capitalize transition", peranBaru === p ? "border-[#f2cc8f] bg-[#f2cc8f]/15 text-[#f2cc8f]" : "border-white/15 bg-white/5 text-[#f4ecdd]/60")}>
                    {p}
                  </button>
                ))}
                {["P", "L"].map((g) => (
                  <button key={g} onClick={() => setGenderBaru(g)} className={clsx("rounded-lg border px-3 py-2 text-[10px] font-bold transition", genderBaru === g ? "border-[#8ecae6] bg-[#8ecae6]/15 text-[#8ecae6]" : "border-white/15 bg-white/5 text-[#f4ecdd]/60")}>
                    {g}
                  </button>
                ))}
              </div>
              <button onClick={addUser} disabled={namaBaru.trim().length < 3 || !!busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#81b29a] to-[#5a8a6f] py-2.5 text-xs font-black text-white transition enabled:hover:scale-[1.02] disabled:opacity-40">
                <UserPlus size={13} /> TAMBAH
              </button>
              {/* export */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <button onClick={exportJson} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-[10px] font-bold text-[#f4ecdd]/75 transition hover:bg-white/10">
                  <Download size={11} /> JSON
                </button>
                <button onClick={exportCsv} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-[10px] font-bold text-[#f4ecdd]/75 transition hover:bg-white/10">
                  <Download size={11} /> CSV
                </button>
              </div>
            </div>

            {/* moderasi balasan */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#f4ecdd]">
                <ShieldCheck size={14} className="text-[#e5989b]" /> Moderasi Balasan
              </div>
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                {balasan.length === 0 && <p className="py-4 text-center text-[11px] text-[#f4ecdd]/45">Belum ada balasan.</p>}
                {balasan.map((b) => (
                  <div key={b.id} className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
                    <div>
                      <div className="text-[10px] font-bold text-[#f4ecdd]/80">
                        {b.dari} → <span className="text-[#f2cc8f]/85">“{b.ucapanJudul}”</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#f4ecdd]/90">{b.isi}</div>
                    </div>
                    <button onClick={() => deleteBalasan(b.id)} className="shrink-0 rounded-lg border border-[#c75146]/30 bg-[#c75146]/10 p-1.5 text-[#e08a84] transition hover:bg-[#c75146]/30">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* log admin */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#f4ecdd]">
                <ScrollText size={14} className="text-[#cdb4f5]" /> Jejak Admin
              </div>
              <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto">
                {(stats?.logs ?? []).length === 0 && <p className="py-3 text-center text-[11px] text-[#f4ecdd]/45">Belum ada aktivitas.</p>}
                {(stats?.logs ?? []).map((l) => (
                  <div key={l.id} className="flex items-start justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-2 text-[10px]">
                    <div>
                      <span className="font-bold text-[#cdb4f5]">{l.aksi}</span>
                      {l.target && <span className="text-[#f4ecdd]/70"> · {l.target}</span>}
                    </div>
                    <span className="shrink-0 text-[#f4ecdd]/40">{new Date(l.timestamp).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* toast notice */}
      <AnimatePresence>
        {notice && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-[#f2cc8f]/30 bg-[#1b1611]/95 px-5 py-3 text-xs font-bold text-[#f4ecdd] shadow-2xl backdrop-blur">
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* konfirmasi hapus */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDel(null)} />
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass relative w-full max-w-sm rounded-2xl p-6 text-center">
              <TriangleAlert size={26} className="mx-auto text-[#f2a93b]" />
              <h3 className="font-display mt-2 text-lg font-black text-[#f4ecdd]">Hapus user ini?</h3>
              <p className="mt-1 text-xs text-[#f4ecdd]/65">Semua ucapan, avatar, dan balasan mereka ikut terhapus. Tindakan ini tidak bisa dibatalkan.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-[#f4ecdd]/80 hover:bg-white/10">
                  Batal
                </button>
                <button onClick={() => { const u = stats?.users.find((x) => x.id === confirmDel); if (u) deleteUser(u); }} className="flex-1 rounded-xl bg-[#c75146] py-2.5 text-xs font-black text-white hover:brightness-110">
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* refresh button */}
      <button onClick={refresh} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/60 px-4 py-2.5 text-[11px] font-bold text-[#f4ecdd]/80 backdrop-blur transition hover:text-white">
        <RefreshCw size={13} className={busy ? "animate-spin" : ""} /> Segarkan
      </button>
    </main>
  );
}
