"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Lock, LockOpen, LogIn, Sparkles, TriangleAlert, UserRound } from "lucide-react";
import { useStore } from "@/store/useStore";

type Status = {
  mahasiswa: { total: number; filled: number };
  dosen: { total: number; filled: number };
  isOpen: boolean;
};

function Bar({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${total ? (filled / total) * 100 : 0}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const session = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);
  const loadSession = useStore((s) => s.loadSession);
  const [nama, setNama] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    loadSession();
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/world-status");
        if (res.ok) setStatus(await res.json());
      } catch {
        /* ignore */
      }
    };
    fetchStatus();
    const iv = window.setInterval(fetchStatus, 10000);
    return () => window.clearInterval(iv);
  }, [loadSession]);

  const embers = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: `${(i * 41 + 7) % 100}%`,
        size: 2 + ((i * 5) % 4),
        dur: 7 + ((i * 11) % 9),
        delay: -((i * 23) % 12),
        dx: `${((i * 37) % 140) - 70}px`,
      })),
    []
  );

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Terjadi kesalahan.");
        setShake((s) => s + 1);
      } else {
        setSession({ ...data.user, token: data.token });
        router.push(data.next);
      }
    } catch {
      setErr("Koneksi bermasalah. Coba lagi ya.");
      setShake((s) => s + 1);
    }
    setLoading(false);
  };

  const lanjut = () => {
    if (!session) return;
    const next = session.peran === "admin" ? "/dashboard" : session.sudahIsiData ? "/world" : "/form";
    router.push(next);
  };

  const pct = status ? Math.round((status.mahasiswa.filled / Math.max(1, status.mahasiswa.total)) * 100) : 0;

  return (
    <main className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* langit fajar */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #171233 0%, #34204e 34%, #6b3a5e 55%, #b5593f 74%, #e8873f 88%, #3a2a33 100%)" }} />
      <motion.div
        className="absolute left-1/2 top-[52%] h-[46vmin] w-[46vmin] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,214,150,0.85) 0%, rgba(255,170,90,0.35) 42%, transparent 70%)" }}
        initial={{ y: "22vmin", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />
      {/* siluet Merapi & Merbabu */}
      <svg viewBox="0 0 1440 340" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-[34vh] w-full" aria-hidden>
        <path d="M0 340 L0 250 Q180 210 330 240 L470 90 Q500 60 530 95 L700 260 Q800 230 900 250 L1080 130 Q1110 105 1145 135 L1290 250 Q1370 235 1440 250 L1440 340 Z" fill="#241a2e" opacity="0.92" />
        <path d="M0 340 L0 290 Q240 260 420 285 Q640 250 860 285 Q1100 255 1300 282 L1440 270 L1440 340 Z" fill="#17111f" />
      </svg>
      {/* ember */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {embers.map((e, i) => (
          <span
            key={i}
            className="ember"
            style={
              {
                left: e.left,
                width: e.size,
                height: e.size,
                background: "rgba(255,206,130,0.85)",
                boxShadow: "0 0 8px rgba(255,206,130,0.9)",
                animationDuration: `${e.dur}s`,
                animationDelay: `${e.delay}s`,
                "--dx": e.dx,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="rise-fade relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-full border border-[#f2cc8f]/30 bg-black/25 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#ffe9b0] backdrop-blur">
          <GraduationCap size={13} /> PPG Prajabatan 2026 · Prodi Matematika
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="font-display mt-5 text-5xl font-black leading-[0.95] tracking-tight text-[#f7ead0] drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] sm:text-7xl">
          Jejak Langkah
          <br />
          <span className="text-gold italic">Guru Matematika</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#f4ecdd]/75">
          Universitas Kristen Satya Wacana · Salatiga
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }} className="font-hand mt-4 max-w-md text-2xl leading-snug text-[#ffe9c9]">
          “Dari angka dan rumus, kita menjadi guru yang mengubah dunia.”
        </motion.p>

        {/* status dunia */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass mt-7 w-full max-w-md rounded-3xl p-5 text-left">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#f4ecdd]">
            <span>MAHASISWA · {status ? `${status.mahasiswa.filled}/${status.mahasiswa.total}` : "…"}</span>
            <span className="text-[#f2cc8f]">{status ? `${pct}%` : ""}</span>
          </div>
          <div className="mt-1.5">
            <Bar filled={status?.mahasiswa.filled ?? 0} total={status?.mahasiswa.total ?? 29} color="#f2cc8f" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold tracking-wider text-[#f4ecdd]">
            <span>DOSEN · {status ? `${status.dosen.filled}/${status.dosen.total}` : "…"}</span>
          </div>
          <div className="mt-1.5">
            <Bar filled={status?.dosen.filled ?? 0} total={status?.dosen.total ?? 10} color="#8ecae6" />
          </div>
          <div className="mt-3.5 flex items-center gap-2 text-[11px] text-[#f4ecdd]/75">
            {status?.isOpen ? (
              <>
                <LockOpen size={13} className="text-[#9fd4a8]" />
                <span><b className="text-[#9fd4a8]">Dunia 3D terbuka!</b> Semua jejak sudah tertitipkan.</span>
              </>
            ) : (
              <>
                <Lock size={13} className="text-[#f2a93b]" />
                <span>Dunia terbuka saat {status?.mahasiswa.total ?? 29}/29 mahasiswa selesai mengisi.</span>
              </>
            )}
          </div>
        </motion.div>

        {/* login */}
        <motion.div key={shake} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className={`glass mt-4 w-full max-w-md rounded-3xl p-5 ${shake ? "shake-x" : ""}`}>
          {session ? (
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#f2cc8f]/25 bg-[#f2cc8f]/8 px-4 py-2.5">
              <span className="flex items-center gap-2 text-xs text-[#f4ecdd]/85">
                <UserRound size={13} className="text-[#f2cc8f]" /> Halo, <b>{session.namaPanggilan ?? session.namaLengkap.split(",")[0]}</b>
              </span>
              <button onClick={lanjut} className="rounded-full bg-[#f2cc8f] px-3.5 py-1.5 text-[11px] font-black text-[#3a2d18] transition hover:scale-105">
                Lanjutkan →
              </button>
            </div>
          ) : null}
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Ketik nama lengkapmu…"
              autoComplete="off"
              className="flex-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-[#f4ecdd] placeholder:text-[#f4ecdd]/40 focus:border-[#f2cc8f]/60"
            />
            <button
              type="submit"
              disabled={loading || nama.trim().length < 3}
              className="pulse-glow flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f2cc8f] to-[#e9a84a] px-6 py-3 text-sm font-black tracking-wide text-[#3a2d18] transition enabled:hover:scale-[1.04] disabled:opacity-40 disabled:animation-none"
            >
              <LogIn size={15} /> {loading ? "MEMERIKSA…" : "MASUK"}
            </button>
          </form>
          <AnimatePresence>
            {err && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-1.5 text-xs text-[#f4a392]">
                <TriangleAlert size={13} /> {err}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="mt-3 text-[10px] leading-relaxed text-[#f4ecdd]/45">Nama harus terdaftar oleh admin. Case-insensitive, tanpa perlu kata sandi.</p>
        </motion.div>
      </div>

      <div className="absolute bottom-4 z-10 flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#f4ecdd]/50">
        <Sparkles size={10} className="text-[#f2cc8f]/60" /> Februari – Oktober 2026 · Dibuat dengan cinta di Salatiga
      </div>
    </main>
  );
}
