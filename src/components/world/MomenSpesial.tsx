"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles, FastForward, Landmark, BookOpen, Flag, Tent, GraduationCap, Mountain,
  Award, Compass, Mail, Camera, LogOut, Star,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { takeScreenshot } from "./ui";

const PHASE_DUR = [7000, 18000, 18000, 12000, 15000];

const POLAROIDS = [
  { icon: Landmark, cap: "Aula UKSW", g: "from-[#5f8ac7] to-[#31456b]" },
  { icon: BookOpen, cap: "Ruang E102", g: "from-[#81b29a] to-[#2c4a3a]" },
  { icon: Flag, cap: "Lapangan Bola", g: "from-[#e07a5f] to-[#7c3b2c]" },
  { icon: Tent, cap: "Api Unggun Yonif", g: "from-[#c75146] to-[#5a2220]" },
  { icon: GraduationCap, cap: "Sekolah PPL", g: "from-[#3d6fb4] to-[#22375a]" },
  { icon: Mountain, cap: "Bukit Salatiga", g: "from-[#9b6dd6] to-[#4a2f6b]" },
];

const SURAT_LINES = [
  "Hai, Guru Matematika Hebat…",
  "Kamu berhasil melewati Februari yang canggung… Maret yang penuh tugas… Juli yang deg-degan… dan Oktober yang membuatmu tidak ingin pergi.",
  "Tapi lihatlah dirimu sekarang. Kamu bukan lagi mahasiswa yang gugup di hari pertama.",
  "Kamu adalah guru. Guru matematika yang akan mengubah hidup ratusan siswa.",
];

function Embers({ n = 26, color = "rgba(247,222,172,0.9)" }: { n?: number; color?: string }) {
  const items = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        left: `${(i * 37 + 13) % 100}%`,
        size: 3 + ((i * 7) % 5),
        dur: 6 + ((i * 13) % 8),
        delay: -((i * 29) % 10),
        dx: `${((i * 41) % 120) - 60}px`,
      })),
    [n]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={
            {
              left: e.left,
              width: e.size,
              height: e.size,
              background: color,
              boxShadow: `0 0 ${e.size * 2}px ${color}`,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              "--dx": e.dx,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// ─── MOMEN SPESIAL ──────────────────────────────────────────────────────────
export default function MomenSpesial() {
  const overlay = useStore((s) => s.overlay);
  const setOverlay = useStore((s) => s.setOverlay);
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const [phase, setPhase] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    if (overlay !== "momen") {
      setPhase(0);
      return;
    }
    if (phase >= PHASE_DUR.length) {
      setOverlay("ending");
      return;
    }
    const t = window.setTimeout(() => setPhase((p) => p + 1), PHASE_DUR[phase]);
    return () => window.clearTimeout(t);
  }, [overlay, phase, setOverlay]);

  useEffect(() => {
    if (overlay !== "momen") return;
    const iv = window.setInterval(() => setQuoteIdx((i) => i + 1), 3400);
    return () => window.clearInterval(iv);
  }, [overlay]);

  const quotes = world?.quotes ?? [];
  const quote = quotes.length ? quotes[quoteIdx % quotes.length] : null;
  const starsPos = useMemo(
    () =>
      Array.from({ length: 29 }, (_, i) => {
        const a = (i / 29) * Math.PI * 2 - Math.PI / 2;
        return { x: Math.cos(a) * 38, y: Math.sin(a) * 36 };
      }),
    []
  );

  if (overlay !== "momen") return null;
  const panggilan = session?.namaPanggilan ?? "Guru Hebat";

  return (
    <motion.div className="fixed inset-0 z-[80] overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* latar per fase */}
      <AnimatePresence>
        <motion.div
          key={phase}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{
            background:
              phase === 0
                ? "radial-gradient(circle at 50% 40%, #fdf6e3, #efe3c8 60%, #dcc9a0)"
                : phase === 1
                  ? "linear-gradient(180deg, #f6cfd8 0%, #f2a86d 55%, #b06a4a 100%)"
                  : phase === 2
                    ? "radial-gradient(ellipse at 50% 30%, #2b2140 0%, #171126 70%)"
                    : phase === 3
                      ? "linear-gradient(180deg, #ffd9c0 0%, #f7a76c 50%, #8a4a5e 100%)"
                      : "linear-gradient(180deg, #ffe9c9 0%, #ffc477 45%, #f4902a 80%, #d96a35 100%)",
          }}
        />
      </AnimatePresence>
      <Embers />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {/* ── FASE 0: amplop ── */}
        {phase === 0 && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: -90, opacity: 0 }}
              transition={{ delay: 3, duration: 1.6 }}
              className="absolute left-1/2 top-1/2 z-20 h-40 w-60 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#fffdf4] p-4 shadow-2xl"
            >
              <p className="font-hand text-lg leading-snug text-[#8a5a2c]">Surat dari Kita, untuk Kita…</p>
            </motion.div>
            <div className="relative h-44 w-72 rounded-b-xl bg-[#e6d3ac] shadow-2xl">
              <div className="absolute inset-x-0 bottom-0 h-36 rounded-b-xl bg-[#dfca9d]" style={{ clipPath: "polygon(0 100%, 50% 25%, 100% 100%)" }} />
              <div className="absolute inset-y-0 left-0 h-full w-1/2 bg-[#e2cd9f]" style={{ clipPath: "polygon(0 0, 100% 60%, 100% 100%, 0 100%)" }} />
              <div className="absolute inset-y-0 right-0 h-full w-1/2 bg-[#e2cd9f]" style={{ clipPath: "polygon(100% 0, 0 60%, 0 100%, 100% 100%)" }} />
              <motion.div
                className="absolute inset-x-0 top-0 h-24 origin-top bg-[#d9c08e]"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", backfaceVisibility: "hidden" }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: 180 }}
                transition={{ delay: 1.7, duration: 1, ease: "easeInOut" }}
              />
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 0, opacity: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="absolute left-1/2 top-[34%] z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#a93b3b] shadow-lg"
              >
                <span className="text-[9px] font-black tracking-widest text-[#ffe9b0]">PPG<br />2026</span>
              </motion.div>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="font-display mt-8 text-sm tracking-[0.35em] text-[#8a5a2c]">
              ADA SURAT UNTUKMU
            </motion.p>
          </motion.div>
        )}

        {/* ── FASE 1: surat terbuka + polaroid ── */}
        {phase === 1 && (
          <div className="relative flex h-full w-full items-center justify-center">
            {POLAROIDS.map((p, i) => {
              const angle = (i / POLAROIDS.length) * Math.PI - Math.PI * 0.15;
              const pos = [
                "left-[6%] top-[12%]", "right-[8%] top-[10%]", "left-[4%] bottom-[18%]",
                "right-[5%] bottom-[15%]", "left-[16%] top-[58%]", "right-[16%] top-[56%]",
              ][i];
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.cap}
                  initial={{ y: 90, opacity: 0, rotate: (i % 2 ? 1 : -1) * 14 }}
                  animate={{ y: 0, opacity: 1, rotate: (i % 2 ? 1 : -1) * (4 + i) }}
                  transition={{ delay: 1.2 + i * 1.6, duration: 1, type: "spring", bounce: 0.4 }}
                  className={`absolute hidden w-28 sm:block md:w-32 ${pos}`}
                >
                  <div className="animate-floaty rounded-lg bg-white p-1.5 pb-5 shadow-2xl" style={{ animationDelay: `${i * 0.7}s` }}>
                    <div className={`flex aspect-square items-center justify-center rounded bg-gradient-to-br ${p.g}`}>
                      <Icon size={30} className="text-white/90" />
                    </div>
                    <p className="font-hand mt-1 text-center text-sm leading-none text-[#4a341d]">{p.cap}</p>
                  </div>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ rotateX: 80, opacity: 0, transformOrigin: "top center" }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-xl bg-[#fffaf0] p-6 shadow-2xl md:p-8"
            >
              <div className="mx-auto h-1 w-16 rounded-full bg-[#e07a5f]/40" />
              {SURAT_LINES.map((l, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + i * 3.4, duration: 1 }}
                  className={
                    i === 0
                      ? "font-display mt-3 text-xl font-bold text-[#a9542f]"
                      : "font-hand mt-3 text-2xl leading-relaxed text-[#5c4426]"
                  }
                >
                  {l}
                </motion.p>
              ))}
            </motion.div>
          </div>
        )}

        {/* ── FASE 2: 2026 + bintang + kutipan teman ── */}
        {phase === 2 && (
          <div className="relative flex h-full w-full flex-col items-center justify-center">
            {starsPos.map((s, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-[#f7deac]"
                style={{ left: "50%", top: "46%", boxShadow: "0 0 8px #f7deac" }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: `${s.x}vmin`, y: `${s.y}vmin`, opacity: [0, 1, 1] }}
                transition={{ delay: 0.15 + i * 0.09, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
            <motion.h2
              initial={{ scale: 7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-gold text-7xl font-black md:text-9xl"
            >
              2026
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-2 text-[10px] uppercase tracking-[0.4em] text-[#f4ecdd]/70">
              29 bintang, satu konstelasi
            </motion.p>
            <AnimatePresence mode="wait">
              {quote && (
                <motion.div
                  key={quoteIdx % Math.max(1, quotes.length)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.55, delay: quoteIdx === 0 ? 2.6 : 0 }}
                  className="mt-8 max-w-lg"
                >
                  <p className="font-hand text-3xl leading-snug text-[#f4ecdd]">“{quote.teks}”</p>
                  <p className="mt-2 text-xs font-bold tracking-[0.25em] text-[#f2cc8f]">— {quote.dari.toUpperCase()}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── FASE 3: pesan pribadi ── */}
        {phase === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.3 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff]/25 backdrop-blur">
              <Award size={38} className="text-[#7c3b2c]" />
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="font-hand mt-5 text-3xl text-[#7c3b2c]">
              Dan untukmu, {panggilan}…
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="font-display mt-2 text-4xl font-black text-[#5c2138] md:text-6xl">
              {session?.namaLengkap ?? panggilan}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }} className="font-hand mx-auto mt-5 max-w-md text-2xl leading-relaxed text-[#6b2c2c]">
              Terima kasih sudah menjadi bagian dari perjalanan ini. Setiap rumus yang kamu ajarkan, setiap “Aha!” dari siswa,
              adalah jejak langkah yang kamu tinggalkan untuk dunia.
            </motion.p>
          </motion.div>
        )}

        {/* ── FASE 4: sunrise penutup ── */}
        {phase === 4 && (
          <div className="relative flex h-full w-full flex-col items-center justify-center">
            <motion.div
              initial={{ y: "46vh", opacity: 0.4 }}
              animate={{ y: "-8vh", opacity: 1 }}
              transition={{ duration: 6, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 rounded-full"
              style={{ background: "radial-gradient(circle, #fff7e0 0%, #ffd166 55%, #f4902a 100%)", boxShadow: "0 0 120px 60px rgba(255,209,102,0.5)" }}
            />
            {/* siluet 29 orang bergandengan */}
            <div className="absolute bottom-[16%] left-1/2 flex -translate-x-1/2 items-end gap-[3px]">
              {Array.from({ length: 29 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[9px] rounded-t-full bg-[#4a1e33] md:w-[11px]"
                  style={{ height: 26 + ((i * 13) % 3) * 5, transformOrigin: "bottom" }}
                  animate={{ scaleY: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.11 }}
                />
              ))}
            </div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display z-10 text-4xl font-black leading-tight text-[#4a1e33] drop-shadow-[0_2px_16px_rgba(255,240,200,0.6)] md:text-7xl"
            >
              SELAMAT JALAN,
              <br />
              GURU-GURU HEBAT!
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.6 }} className="z-10 mt-4 max-w-lg text-xs font-bold uppercase tracking-[0.32em] text-[#6b3049]">
              Jejak Langkah Guru Matematika · PPG Prajabatan 2026 · UKSW
            </motion.p>
          </div>
        )}
      </div>

      <button
        onClick={() => setOverlay("ending")}
        className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-full border border-black/20 bg-black/10 px-4 py-2 text-xs font-bold tracking-wider text-[#3a2d18]/80 backdrop-blur transition hover:bg-black/20"
        style={{ color: phase >= 1 ? "#3a2d18cc" : "#f4ecdd" }}
      >
        <FastForward size={13} /> LEWATI
      </button>
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em]" style={{ color: phase >= 1 ? "#3a2d1899" : "#f4ecdd88" }}>
        <Star size={11} /> Surat dari Kita untuk Kita · {phase + 1}/5
      </div>
    </motion.div>
  );
}

// ─── ENDING SCREEN ──────────────────────────────────────────────────────────
export function EndingScreen() {
  const overlay = useStore((s) => s.overlay);
  const setOverlay = useStore((s) => s.setOverlay);
  const goScene = useStore((s) => s.goScene);
  const setListOpen = useStore((s) => s.setListOpen);
  const logout = useStore((s) => s.logout);
  const world = useStore((s) => s.world);
  const readSet = useStore((s) => s.readSet);
  const addToast = useStore((s) => s.addToast);
  const scene = useStore((s) => s.scene);

  useEffect(() => {
    if (overlay === "ending" && scene !== "bukit") goScene("bukit");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay]);

  return (
    <AnimatePresence>
      {overlay === "ending" && (
        <motion.div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(244,144,42,0.28), rgba(10,8,6,0.72) 60%)", backdropFilter: "blur(3px)" }}
        >
          <Embers n={18} color="rgba(255,209,102,0.8)" />
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 24, stiffness: 240, delay: 0.35 }}
            className="glass relative w-full max-w-lg rounded-3xl p-8 text-center"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring", bounce: 0.5 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f2cc8f] to-[#e9a84a] shadow-xl">
              <GraduationCap size={30} className="text-[#3a2d18]" />
            </motion.div>
            <h2 className="font-display mt-4 text-3xl font-black leading-tight text-[#f4ecdd]">
              Jejak Langkah
              <br />
              <span className="text-gold">Guru Matematika</span>
            </h2>
            <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-[#f2cc8f]/75">PPG Prajabatan 2026 · UKSW Salatiga</p>
            <p className="font-hand mt-4 text-2xl leading-relaxed text-[#f4ecdd]/90">
              “Dari angka dan rumus, kita menjadi guru yang mengubah dunia.”
            </p>

            <div className="mx-auto mt-4 flex w-fit items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] text-[#f4ecdd]/80">
              <span className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-[#f2cc8f]" /> {readSet.length}/{world?.totalUcapan ?? 0} ucapan
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="flex items-center gap-1.5">
                <Mail size={12} className="text-[#9fd4a8]" /> {world?.totalRepliesOnMine ?? 0} balasan untukmu
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setOverlay("none");
                  goScene("hub");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f2cc8f] to-[#e9a84a] px-4 py-3 text-xs font-black tracking-wide text-[#3a2d18] transition hover:scale-[1.03]"
              >
                <Compass size={15} /> JELAJAH LAGI
              </button>
              <button
                onClick={() => {
                  setOverlay("none");
                  setListOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#81b29a]/50 bg-[#81b29a]/15 px-4 py-3 text-xs font-black tracking-wide text-[#9fd4a8] transition hover:scale-[1.03]"
              >
                <Mail size={15} /> BALAS UCAPAN
              </button>
              <button
                onClick={() => {
                  takeScreenshot();
                  addToast("Foto tersimpan!", "Kenangan indah sudah terunduh.");
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#5f8ac7]/50 bg-[#5f8ac7]/15 px-4 py-3 text-xs font-black tracking-wide text-[#a9c8f0] transition hover:scale-[1.03]"
              >
                <Camera size={15} /> SCREENSHOT
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-xs font-black tracking-wide text-[#f4ecdd]/80 transition hover:scale-[1.03]"
              >
                <LogOut size={15} /> KELUAR
              </button>
            </div>
            <p className="font-hand mt-5 text-xl text-[#f2cc8f]/85">“Sampai jumpa di ruang kelas Indonesia. Jangan lupa bahagia!”</p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.3em] text-[#f4ecdd]/40">
              <Sparkles size={10} /> Februari – Oktober 2026 · Salatiga
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
