"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, Home, Volume2, VolumeX, Mail, Search, LogOut, Sparkles, X,
  Landmark, GraduationCap, Tent, Mountain, Film, Camera, EyeOff, Eye, Star, ScrollText, Map, DoorOpen, ArrowUpDown,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { HUB_META, SEKOLAH_LIST, MOODS } from "@/lib/constants";
import clsx from "clsx";

const ZONA_ICON: Record<string, typeof Landmark> = { hub: Home, uksw: Landmark, ppl: GraduationCap, yonif: Tent, bukit: Mountain };

export function takeScreenshot() {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `jejak-langkah-${Date.now()}.png`;
  a.click();
}

// ─── Transisi portal ────────────────────────────────────────────────────────
export function TransitionOverlay() {
  const t = useStore((s) => s.transition);
  return (
    <AnimatePresence>
      {t.active && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{ background: "radial-gradient(circle at center, rgba(20,14,10,0.88), rgba(8,6,4,0.99))" }}
        >
          <motion.div
            initial={{ scale: 0.2, rotate: -160, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <div className="relative mx-auto h-28 w-28">
              <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-dashed" style={{ borderColor: t.warna, animationDuration: "2.2s" }} />
              <div className="absolute inset-3 animate-spin rounded-full border-2" style={{ borderColor: `${t.warna}66`, animationDirection: "reverse", animationDuration: "3s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={26} style={{ color: t.warna }} />
              </div>
            </div>
            <div className="font-display mt-5 text-lg font-bold tracking-widest text-[#f4ecdd]">{t.label}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.35em] text-[#f2cc8f]/70">Membuka portal…</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Toasts ─────────────────────────────────────────────────────────────────
export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[65] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 sm:bottom-8">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: 30, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -14, opacity: 0 }}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto w-full cursor-pointer rounded-2xl border border-[#f2cc8f]/30 bg-[#1b1611]/90 px-4 py-3 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#f2cc8f]">
              <Star size={13} /> {t.title}
            </div>
            {t.body && <div className="mt-0.5 text-xs text-[#f4ecdd]/80">{t.body}</div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Narasi modal ───────────────────────────────────────────────────────────
export function NarasiModal() {
  const narasi = useStore((s) => s.narasi);
  const setNarasi = useStore((s) => s.setNarasi);
  return (
    <AnimatePresence>
      {narasi && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setNarasi(null)} />
          <motion.div
            initial={{ y: 40, opacity: 0, rotateX: -12 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="relative w-full max-w-md rounded-2xl border border-[#d9c9a3]/50 bg-gradient-to-b from-[#efe3c8] to-[#e0cfa8] p-6 shadow-2xl"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[#8a5a2c]/40 bg-[#8a5a2c] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#f2e3c9]">
              Kenangan
            </div>
            <h3 className="font-display mt-2 text-center text-xl font-bold text-[#4a341d]">{narasi.title}</h3>
            <div className="mx-auto mt-2 h-px w-16 bg-[#8a5a2c]/50" />
            <p className="font-hand mt-4 text-2xl leading-relaxed text-[#5c4426]">{narasi.text}</p>
            <button
              onClick={() => setNarasi(null)}
              className="mt-5 w-full rounded-xl bg-[#4a341d] py-2.5 text-sm font-bold tracking-wider text-[#f2e3c9] transition hover:bg-[#5c4426]"
            >
              Simpan dalam hati
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Daftar semua ucapan ────────────────────────────────────────────────────
export function UcapanListModal() {
  const open = useStore((s) => s.listOpen);
  const setOpen = useStore((s) => s.setListOpen);
  const world = useStore((s) => s.world);
  const openUcapan = useStore((s) => s.openUcapan);
  const readSet = useStore((s) => s.readSet);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const all = world?.ucapan ?? [];
    if (!q.trim()) return all;
    const s = q.toLowerCase();
    return all.filter((u) => u.judul.toLowerCase().includes(s) || u.penulis.nama.toLowerCase().includes(s) || u.penulis.panggilan.toLowerCase().includes(s) || u.isi.toLowerCase().includes(s));
  }, [world?.ucapan, q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="glass relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]">
                  <ScrollText size={12} /> Kotak Surat
                </div>
                <h3 className="font-display mt-1 text-lg font-bold text-[#f4ecdd]">Semua ucapan ({world?.totalUcapan ?? 0})</h3>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/15 p-2 text-[#f4ecdd]/70 hover:bg-white/10" aria-label="Tutup">
                <X size={16} />
              </button>
            </div>
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <Search size={14} className="text-[#f4ecdd]/50" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama atau isi ucapan…"
                  className="w-full bg-transparent text-sm text-[#f4ecdd] placeholder:text-[#f4ecdd]/40"
                />
              </div>
            </div>
            <div className="grid flex-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2">
              {list.map((u) => {
                const read = readSet.includes(u.id);
                const mood = MOODS.find((m) => m.id === u.mood);
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setOpen(false);
                      openUcapan(u.id);
                    }}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-3.5 text-left transition hover:border-[#f2cc8f]/40 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-bold text-[#f4ecdd] group-hover:text-[#f2cc8f]">{u.judul}</div>
                      <span className={clsx("h-2 w-2 shrink-0 rounded-full", read ? "bg-[#81b29a]" : "bg-[#f2a93b] pulse-glow")} />
                    </div>
                    <div className="mt-1 truncate text-[11px] text-[#f4ecdd]/65">
                      {u.penulis.panggilan}
                      {u.penulis.peran === "dosen" ? " · Dosen" : u.penulis.peran === "admin" ? " · Admin" : ""} · {mood?.label ?? "—"}
                    </div>
                    <div className="font-hand mt-1.5 truncate text-lg leading-tight text-[#f4ecdd]/75">{u.isi}</div>
                  </button>
                );
              })}
              {list.length === 0 && <p className="col-span-2 py-8 text-center text-sm text-[#f4ecdd]/50">Tidak ada ucapan yang cocok.</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Menu Peta / pindah cepat ───────────────────────────────────────────────
const ZONA_LIST = [
  { id: "hub", label: "Hub Utama", icon: Home, warna: "#f2cc8f" },
  { id: "uksw", label: "Kampus UKSW", icon: Landmark, warna: "#8ecae6" },
  { id: "ppl", label: "Area PPL", icon: GraduationCap, warna: "#81b29a" },
  { id: "yonif", label: "Yonif 411", icon: Tent, warna: "#c75146" },
  { id: "bukit", label: "Bukit Salatiga", icon: Mountain, warna: "#f2a93b" },
] as const;

const UKSW_DALAM = [
  { sub: "uksw:e-lorong", label: "Lorong Gedung E" },
  { sub: "uksw:e102", label: "Ruang E102" },
  { sub: "uksw:e105", label: "Ruang E105" },
  { sub: "uksw:e107", label: "Ruang E107" },
  { sub: "uksw:e108", label: "Ruang E108" },
  { sub: "uksw:seminar", label: "Aula Seminar Lt.2" },
  { sub: "uksw:perpus", label: "Perpustakaan Lt.1" },
  { sub: "uksw:lt7", label: "Lorong Lantai 7" },
  { sub: "uksw:lt7-r1", label: "R-701 Diskusi Biru" },
  { sub: "uksw:lt7-r2", label: "R-702 Baca Panorama" },
  { sub: "uksw:lt7-r3", label: "R-703 Arsip Angkatan" },
];

export function MapMenu() {
  const [open, setOpen] = useState(false);
  const goScene = useStore((s) => s.goScene);
  const scene = useStore((s) => s.scene);
  const school = useStore((s) => s.school);
  const hideUI = useStore((s) => s.hideUI);
  if (hideUI) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "pointer-events-auto fixed left-3 top-[150px] z-[48] flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 backdrop-blur-md transition sm:left-5 sm:top-[176px]",
          open ? "border-[#f2cc8f] bg-[#f2cc8f]/20 text-[#f2cc8f]" : "border-white/15 bg-black/50 text-[#f4ecdd]/85 hover:text-white"
        )}
      >
        <Map size={14} />
        <span className="text-[11px] font-bold">Peta & Pindah</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="pointer-events-auto fixed left-3 top-[198px] z-[48] w-[232px] rounded-2xl border border-white/15 bg-[#17130f]/92 p-3 shadow-2xl backdrop-blur-md sm:left-5 sm:top-[224px]"
          >
            <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.28em] text-[#f2cc8f]/80">Zona Utama</div>
            <div className="grid grid-cols-1 gap-1">
              {ZONA_LIST.map((z) => {
                const Ic = z.icon;
                const aktif = scene === z.id && !school;
                return (
                  <button
                    key={z.id}
                    onClick={() => {
                      setOpen(false);
                      goScene(z.id as never);
                    }}
                    className={clsx(
                      "flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[11px] font-bold transition",
                      aktif ? "bg-white/15 text-white" : "text-[#f4ecdd]/80 hover:bg-white/10"
                    )}
                  >
                    <Ic size={13} style={{ color: z.warna }} /> {z.label}
                  </button>
                );
              })}
            </div>

            <div className="mb-1.5 mt-3 flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#8ecae6]/85">
              <DoorOpen size={11} /> Dalam Gedung UKSW
            </div>
            <div className="max-h-[32vh] space-y-1 overflow-y-auto pr-1">
              {UKSW_DALAM.map((r) => (
                <button
                  key={r.sub}
                  onClick={() => {
                    setOpen(false);
                    goScene("uksw", { school: r.sub, label: r.label, warna: "#8ecae6" });
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[10.5px] font-semibold transition",
                    school === r.sub ? "bg-[#8ecae6]/20 text-[#bfe3f5]" : "text-[#f4ecdd]/70 hover:bg-white/10"
                  )}
                >
                  <ArrowUpDown size={10} className="shrink-0 opacity-60" /> {r.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[9px] leading-snug text-[#f4ecdd]/40">
              Kamu tetap bisa jalan kaki & masuk pintu secara manual. Menu ini hanya jalan pintas.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── HUD utama ──────────────────────────────────────────────────────────────
export function HUD() {
  const scene = useStore((s) => s.scene);
  const school = useStore((s) => s.school);
  const world = useStore((s) => s.world);
  const readSet = useStore((s) => s.readSet);
  const goScene = useStore((s) => s.goScene);
  const setOverlay = useStore((s) => s.setOverlay);
  const audioOn = useStore((s) => s.audioOn);
  const setAudioOn = useStore((s) => s.setAudioOn);
  const setListOpen = useStore((s) => s.setListOpen);
  const openUcapan = useStore((s) => s.openUcapan);
  const setView = useStore((s) => s.setView);
  const logout = useStore((s) => s.logout);
  const preview = useStore((s) => s.preview);
  const hideUI = useStore((s) => s.hideUI);
  const setHideUI = useStore((s) => s.setHideUI);

  const total = world?.totalUcapan ?? 0;
  const read = readSet.length;
  const pct = total ? read / total : 0;
  const done = pct >= 1 && total > 0;
  const myUcapan = world?.ucapan.find((u) => u.milikku);
  const meta = HUB_META[scene];
  const ZoneIcon = ZONA_ICON[scene] ?? Home;
  const schoolMeta = school ? SEKOLAH_LIST.find((s) => s.id === school) : null;

  if (hideUI) {
    return (
      <button
        onClick={() => setHideUI(false)}
        className="fixed bottom-4 right-4 z-[60] rounded-full border border-white/20 bg-black/60 p-2.5 text-[#f4ecdd]/80 backdrop-blur transition hover:text-white"
        aria-label="Tampilkan UI"
      >
        <Eye size={16} />
      </button>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {/* ── kiri atas: progres + zona ── */}
      <div className="absolute left-3 top-3 flex flex-col gap-2 sm:left-5 sm:top-5">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/15 bg-black/50 px-4 py-2.5 backdrop-blur-md">
          <BookOpen size={15} className="text-[#f2cc8f]" />
          <div>
            <div className="text-[11px] font-bold leading-none text-[#f4ecdd]">
              Ucapan {read}/{total}
            </div>
            <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-[#e9a84a] to-[#f2cc8f] transition-all duration-500" style={{ width: `${pct * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-black/50 px-4 py-2 backdrop-blur-md">
          <ZoneIcon size={14} style={{ color: schoolMeta?.warna ?? meta.warna }} />
          <div className="leading-tight">
            <div className="text-[11px] font-bold text-[#f4ecdd]">{schoolMeta ? schoolMeta.id : meta.label}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#f4ecdd]/55">{schoolMeta ? "Sekolah PPL" : meta.subtitle}</div>
          </div>
        </div>
        {(scene !== "hub" || school) && (
          <button
            onClick={() => (school?.startsWith("uksw:") ? goScene("uksw") : school ? goScene("ppl") : goScene("hub"))}
            className="pointer-events-auto flex w-fit items-center gap-2 rounded-2xl border border-[#f2cc8f]/30 bg-[#f2cc8f]/10 px-4 py-2 text-[11px] font-bold text-[#f2cc8f] backdrop-blur-md transition hover:bg-[#f2cc8f]/25"
          >
            <Home size={13} /> {school?.startsWith("uksw:") ? "Keluar Gedung" : school ? "Ke Persimpangan" : "Ke Hub Utama"}
          </button>
        )}
      </div>

      {/* ── kanan atas: kontrol ── */}
      <div className="absolute right-3 top-3 flex gap-2 sm:right-5 sm:top-5">
        <button
          onClick={() => setAudioOn(!audioOn)}
          className={clsx(
            "pointer-events-auto rounded-2xl border p-2.5 backdrop-blur-md transition",
            audioOn ? "border-[#f2cc8f]/50 bg-[#f2cc8f]/20 text-[#f2cc8f]" : "border-white/15 bg-black/50 text-[#f4ecdd]/70 hover:text-white"
          )}
          aria-label="Audio"
          title="Audio suasana"
        >
          {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button
          onClick={() => setListOpen(true)}
          className="pointer-events-auto rounded-2xl border border-white/15 bg-black/50 p-2.5 text-[#f4ecdd]/70 backdrop-blur-md transition hover:text-white"
          aria-label="Kotak surat"
          title="Kotak surat"
        >
          <Search size={16} />
        </button>
        {myUcapan && (
          <button
            onClick={() => openUcapan(myUcapan.id)}
            className="pointer-events-auto relative rounded-2xl border border-white/15 bg-black/50 p-2.5 text-[#f4ecdd]/70 backdrop-blur-md transition hover:text-white"
            aria-label="Balasan untukmu"
            title="Suratmu & balasan"
          >
            <Mail size={16} />
            {(world?.unreadReplies ?? 0) > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#c75146] px-1 text-[9px] font-black text-white">
                {world!.unreadReplies}
              </span>
            )}
          </button>
        )}
        <button
          onClick={logout}
          className="pointer-events-auto rounded-2xl border border-white/15 bg-black/50 p-2.5 text-[#f4ecdd]/70 backdrop-blur-md transition hover:text-white"
          aria-label="Keluar"
          title="Keluar"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* ── tombol finale ── */}
      <AnimatePresence>
        {done && (
          <motion.button
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            onClick={() => setOverlay("finale")}
            className="pulse-glow pointer-events-auto fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#e9a84a] to-[#f2cc8f] px-5 py-3.5 text-sm font-black tracking-wide text-[#3a2d18] shadow-2xl transition hover:scale-105 sm:bottom-8 sm:right-6"
          >
            <Sparkles size={17} /> MULAI GRAND FINALE
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── panel mode jelajah admin ── */}
      {preview && (
        <div className="pointer-events-auto absolute bottom-16 left-3 w-60 rounded-2xl border border-[#9db4ff]/30 bg-[#131826]/85 p-3 backdrop-blur-md sm:bottom-6 sm:left-5">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#9db4ff]">
            <Eye size={11} /> Mode Jelajah Admin
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(["hub", "uksw", "ppl", "yonif", "bukit"] as const).map((h) => (
              <button key={h} onClick={() => goScene(h)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-[#dfe6ff] hover:bg-white/15">
                {HUB_META[h].label.replace("Kampus ", "").replace("Area ", "")}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {SEKOLAH_LIST.map((s) => (
              <button key={s.id} onClick={() => goScene("ppl", { school: s.id, label: s.id, warna: s.warna })} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-[#bfe3cf] hover:bg-white/15">
                {s.singkat}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5">
            <button onClick={() => setOverlay("finale")} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#9b6dd6]/30 px-2 py-1.5 text-[10px] font-bold text-[#cdb4f5] hover:bg-[#9b6dd6]/50">
              <Film size={11} /> Finale
            </button>
            <button onClick={takeScreenshot} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#5f8ac7]/30 px-2 py-1.5 text-[10px] font-bold text-[#a9c8f0] hover:bg-[#5f8ac7]/50">
              <Camera size={11} /> Foto
            </button>
            <button onClick={() => setHideUI(true)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/10 px-2 py-1.5 text-[10px] font-bold text-[#f4ecdd]/80 hover:bg-white/20">
              <EyeOff size={11} /> UI
            </button>
          </div>
          <p className="mt-1.5 text-[9px] leading-snug text-[#dfe6ff]/50">Progres tidak dicatat dalam mode ini.</p>
        </div>
      )}
    </div>
  );
}
