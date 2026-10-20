"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FastForward, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";

function Typewriter({ text, cps = 28, className }: { text: string; cps?: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const iv = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(iv);
          return v;
        }
        return v + 1;
      });
    }, 1000 / cps);
    return () => window.clearInterval(iv);
  }, [text, cps]);
  return (
    <span className={className}>
      {text.slice(0, n)}
      <span className="animate-pulse">▍</span>
    </span>
  );
}

function Fireworks({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; r: number };
    const parts: P[] = [];
    const COLORS = ["#ffd166", "#ef476f", "#06d6a0", "#8ecae6", "#f78c6b", "#cdb4f5"];
    const burst = () => {
      const cx = cv.width * (0.15 + Math.random() * 0.7);
      const cy = cv.height * (0.15 + Math.random() * 0.4);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 5;
        parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 50 + Math.random() * 40, color, r: 1.2 + Math.random() * 2 });
      }
    };
    const iv = window.setInterval(burst, 650);
    burst();
    const tick = () => {
      ctx.fillStyle = "rgba(5,4,10,0.22)";
      ctx.fillRect(0, 0, cv.width, cv.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.055;
        p.vx *= 0.985;
        p.life++;
        const a = 1 - p.life / p.max;
        if (a <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      window.removeEventListener("resize", resize);
    };
  }, [active]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" style={{ display: active ? "block" : "none" }} />;
}

const AulaSilhouette = (
  <svg viewBox="0 0 400 160" className="mx-auto w-72 opacity-70" aria-hidden>
    <rect x="120" y="60" width="160" height="100" fill="#14100d" />
    <polygon points="120,60 200,20 280,60" fill="#14100d" />
    <rect x="60" y="90" width="60" height="70" fill="#171310" />
    <rect x="280" y="90" width="60" height="70" fill="#171310" />
    <rect x="185" y="100" width="30" height="60" fill="#0c0906" />
  </svg>
);
const SchoolSilhouettes = (
  <svg viewBox="0 0 500 140" className="mx-auto w-80 opacity-70" aria-hidden>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={20 + i * 95} y={60 + (i % 2) * 14} width="72" height="80" fill="#14100d" />
        <polygon points={`${20 + i * 95},${60 + (i % 2) * 14} ${56 + i * 95},${34 + (i % 2) * 14} ${92 + i * 95},${60 + (i % 2) * 14}`} fill="#171310" />
      </g>
    ))}
  </svg>
);
const CampfireSilhouette = (
  <svg viewBox="0 0 200 140" className="mx-auto w-40 opacity-85" aria-hidden>
    <path d="M100 20 C120 55 140 70 128 105 C118 128 82 128 72 105 C60 70 82 55 100 20Z" fill="#f4902a" opacity="0.9" />
    <path d="M20 130 L60 108 M180 130 L 140 108" stroke="#4c3626" strokeWidth="10" strokeLinecap="round" />
  </svg>
);
const MountainSilhouette = (
  <svg viewBox="0 0 500 180" className="mx-auto w-full max-w-md opacity-80" aria-hidden>
    <polygon points="40,180 150,40 260,180" fill="#141017" />
    <polygon points="230,180 350,70 470,180" fill="#17131b" />
    <polygon points="138,58 150,40 162,58 155,66 145,66" fill="#e9edf5" opacity="0.85" />
  </svg>
);

const STEPS = [
  { dur: 3000, kind: "silence" },
  { dur: 4500, kind: "light" },
  { dur: 14000, kind: "text", text: "Februari... kita datang sebagai orang asing. Dua puluh sembilan nama, dua puluh sembilan cerita, satu kelas yang masih sunyi.", deco: "none" },
  { dur: 14000, kind: "text", text: "Maret hingga Juni... kita ditempa. Tugas yang menumpuk, teori yang dalam, dan kopi yang tak pernah habis.", deco: "aula" },
  { dur: 14000, kind: "text", text: "Juli hingga September... kita berdiri di depan kelas. Tangan gemetar memegang spidol — lalu tiga puluh pasang mata percaya pada kita.", deco: "schools" },
  { dur: 12000, kind: "text", text: "Di Yonif, kita belajar bahwa kebersamaan adalah bentuk bela negara yang paling sederhana: tidak meninggalkan siapa pun.", deco: "fire" },
  { dur: 14000, kind: "text", text: "Oktober... kita bukan lagi orang asing. Kita adalah keluarga yang dibentuk oleh Salatiga.", deco: "mountain" },
  { dur: 12000, kind: "text", text: "Terima kasih untuk setiap tawa di sela presentasi, setiap peluk setelah gagal, setiap 'semangat!' di pagi yang berat.", deco: "night" },
  { dur: 15000, kind: "text", text: "PPG bukan sekadar sertifikat. Ia adalah bukti bahwa kita pernah berjuang — dan menang — bersama.", deco: "fireworks" },
  { dur: 17000, kind: "names" },
  { dur: 10000, kind: "thanks" },
  { dur: 12000, kind: "admin" },
];

export default function Finale() {
  const overlay = useStore((s) => s.overlay);
  const setOverlay = useStore((s) => s.setOverlay);
  const world = useStore((s) => s.world);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (overlay !== "finale") {
      setStep(0);
      return;
    }
    if (step >= STEPS.length) {
      setOverlay("momen");
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), STEPS[step].dur);
    return () => window.clearTimeout(t);
  }, [overlay, step, setOverlay]);

  const mhsNames = useMemo(() => (world?.users ?? []).filter((u) => u.peran !== "dosen").map((u) => u.panggilan), [world?.users]);
  const dosenNames = useMemo(() => (world?.users ?? []).filter((u) => u.peran === "dosen").map((u) => u.namaLengkap.split(",")[0]), [world?.users]);
  const cur = overlay === "finale" && step < STEPS.length ? STEPS[step] : null;

  return (
    <AnimatePresence>
      {cur && (
        <motion.div className="fixed inset-0 z-[80] overflow-hidden bg-[#05040a]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          {/* latar berubah per fase */}
          <div
            className="absolute inset-0 transition-all duration-[3000ms]"
            style={{
              background:
                cur.deco === "mountain"
                  ? "linear-gradient(180deg, #1f1633 0%, #54355e 55%, #c2724a 100%)"
                  : cur.deco === "night"
                    ? "radial-gradient(ellipse at 50% 120%, #2a2140 0%, #05040a 65%)"
                    : "transparent",
            }}
          />
          {cur.deco === "fireworks" && <Fireworks active />}
          {cur.kind === "light" && (
            <motion.div
              className="absolute left-1/2 top-1/2 h-[30vmax] w-[30vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.6, opacity: 0.9 }}
              transition={{ duration: 4, ease: "easeOut" }}
              style={{ background: "radial-gradient(circle, rgba(247,222,172,0.5) 0%, rgba(247,222,172,0.12) 40%, transparent 70%)" }}
            />
          )}

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <AnimatePresence mode="wait">
              {cur.kind === "text" && (
                <motion.div key={step} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.9 }} className="max-w-3xl">
                  {cur.deco === "aula" && AulaSilhouette}
                  {cur.deco === "schools" && SchoolSilhouettes}
                  {cur.deco === "fire" && CampfireSilhouette}
                  {cur.deco === "mountain" && MountainSilhouette}
                  <p className="font-display mt-5 text-2xl font-medium leading-relaxed text-[#f4ecdd] md:text-4xl md:leading-snug">
                    <Typewriter text={cur.text ?? ""} />
                  </p>
                </motion.div>
              )}

              {cur.kind === "names" && (
                <motion.div key="names" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-4xl">
                  <p className="font-display mb-6 text-xl text-[#f2cc8f] md:text-3xl">Selamat jalan, guru-guru hebat…</p>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    {mhsNames.map((n, i) => (
                      <motion.span
                        key={n + i}
                        initial={{ opacity: 0, y: 16, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.22, duration: 0.5 }}
                        className="font-hand text-2xl text-[#f4ecdd] md:text-3xl"
                      >
                        {n}
                      </motion.span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                    {dosenNames.map((n, i) => (
                      <motion.span key={n + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 + i * 0.35 }} className="text-xs tracking-widest text-[#f2d38a] md:text-sm">
                        {n}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {cur.kind === "thanks" && (
                <motion.div key="thanks" className="text-center">
                  <motion.h2
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-4xl font-black leading-tight md:text-7xl"
                  >
                    <span className="text-gold">TERIMA KASIH,</span>
                    <br />
                    <span className="text-[#f4ecdd]">PPG SALATIGA</span>
                  </motion.h2>
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 1 }} className="mx-auto mt-6 h-px w-52 bg-gradient-to-r from-transparent via-[#f2cc8f] to-transparent" />
                </motion.div>
              )}

              {cur.kind === "admin" && (
                <motion.div key="admin" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-lg rounded-3xl border border-[#f2cc8f]/25 bg-[#171310]/80 p-8 backdrop-blur">
                  <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#f2cc8f]/80">Pesan Penutup Admin</div>
                  <p className="font-hand mt-4 text-2xl leading-relaxed text-[#f4ecdd] md:text-3xl">{world?.adminMessage || "Terima kasih untuk semuanya. Sampai jumpa di ruang kelas Indonesia!"}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setOverlay("momen")}
            className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold tracking-wider text-[#f4ecdd]/70 backdrop-blur transition hover:text-white"
          >
            <FastForward size={13} /> LEWATI
          </button>
          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#f4ecdd]/40">
            <Sparkles size={11} /> Grand Finale · {step + 1}/{STEPS.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
