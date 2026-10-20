"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Send, Heart, Flame, Laugh, CloudRain, HandHeart, Sparkles, BookOpen, MessageCircle } from "lucide-react";
import { apiFetch, useStore } from "@/store/useStore";
import { paginateText, MOODS, SEKOLAH_LIST, UKSW_ZONES } from "@/lib/constants";
import clsx from "clsx";

const MOOD_ICON: Record<string, typeof Heart> = {
  haru: CloudRain,
  lucu: Laugh,
  syukur: HandHeart,
  semangat: Flame,
  kasih: Heart,
  inspiratif: Sparkles,
};

const ROLE_STYLE: Record<string, string> = {
  mahasiswa: "text-[#9fd4a8] border-[#81b29a]/40 bg-[#81b29a]/10",
  dosen: "text-[#f2d38a] border-[#f2cc8f]/40 bg-[#f2cc8f]/10",
  admin: "text-[#cdb4f5] border-[#9b6dd6]/40 bg-[#9b6dd6]/10",
};
const ROLE_LABEL: Record<string, string> = { mahasiswa: "", dosen: " · Dosen", admin: " · Admin" };

function zonaLabel(zona: string) {
  const s = SEKOLAH_LIST.find((x) => x.id === zona);
  if (s) return s.singkat;
  const z = UKSW_ZONES.find((x) => x.id === zona);
  if (z) return z.label;
  return zona;
}

export default function UcapanCard() {
  const activeId = useStore((s) => s.activeUcapanId);
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const preview = useStore((s) => s.preview);
  const closeUcapan = useStore((s) => s.closeUcapan);
  const markReadLocal = useStore((s) => s.markReadLocal);
  const fetchWorld = useStore((s) => s.fetchWorld);
  const addToast = useStore((s) => s.addToast);

  const uc = world?.ucapan.find((u) => u.id === activeId) ?? null;
  const [page, setPage] = useState(0);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const pages = useMemo(() => (uc ? paginateText(uc.isi) : []), [uc]);
  const lastPage = pages.length - 1;
  const mood = MOODS.find((m) => m.id === uc?.mood) ?? MOODS[2];
  const MoodIcon = MOOD_ICON[mood.id] ?? Heart;

  // tandai terbaca + progress
  useEffect(() => {
    if (!uc || preview) return;
    setPage(0);
    setReply("");
    setErr("");
    const firstTime = !useStore.getState().readSet.includes(uc.id);
    if (firstTime && session?.token) {
      markReadLocal(uc.id);
      apiFetch(session.token, "/api/progress", { method: "POST", body: JSON.stringify({ ucapanId: uc.id }) }).then(() => {
        const count = useStore.getState().readSet.length;
        const total = useStore.getState().world?.totalUcapan ?? 0;
        if (count >= total && total > 0) {
          addToast("Perjalanan sempurna!", "Semua ucapan sudah kau baca. Grand Finale telah terbuka ★");
        } else if ([5, 10, 20, 28, Math.floor(total / 2)].includes(count)) {
          addToast(`${count} ucapan terbaca!`, `Terus jelajahi — ${total - count} lagi menunggumu.`);
        }
      });
    }
    if (uc.milikku && session?.token) {
      apiFetch(session.token, "/api/balasan", { method: "POST", body: JSON.stringify({ action: "markRead", ucapanId: uc.id }) }).then(() => {
        window.setTimeout(() => fetchWorld(), 600);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uc?.id]);

  const myReply = uc?.balasan.find((b) => b.milikku);
  const canReply = !!uc && !uc.milikku && !myReply && !preview;

  const sendReply = async () => {
    if (!session?.token || !uc || reply.trim().length === 0) return;
    setSending(true);
    setErr("");
    const res = await apiFetch(session.token, "/api/balasan", { method: "POST", body: JSON.stringify({ ucapanId: uc.id, isi: reply.trim() }) });
    if (res.ok) {
      setReply("");
      await fetchWorld();
      addToast("Balasan terkirim!", "Temanmu akan melihatnya di suratnya. ♥");
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? "Gagal mengirim balasan.");
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      {uc && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeUcapan} />
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="glass relative w-full max-w-lg overflow-hidden rounded-3xl"
          >
            {/* header */}
            <div className="relative border-b border-white/10 bg-gradient-to-r from-[#f2cc8f]/15 to-transparent p-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#f2cc8f]">
                    <BookOpen size={12} /> {uc.milikku ? "Surat dari kamu" : "Surat untukmu"}
                  </div>
                  <h3 className="font-display mt-1.5 text-xl font-bold leading-snug text-[#f4ecdd]">{uc.judul}</h3>
                  <div className="mt-1 text-xs text-[#f4ecdd]/70">
                    {uc.penulis.nama}
                    {uc.penulis.peran === "dosen" && <span className="text-[#f2d38a]"> · Dosen</span>}
                    {uc.penulis.peran === "admin" && <span className="text-[#cdb4f5]"> · Admin</span>}
                  </div>
                </div>
                <button onClick={closeUcapan} className="rounded-full border border-white/15 p-2 text-[#f4ecdd]/70 transition hover:bg-white/10 hover:text-white" aria-label="Tutup">
                  <X size={16} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                <span className="flex items-center gap-1 rounded-full border px-2.5 py-1" style={{ color: mood.warna, borderColor: `${mood.warna}55`, background: `${mood.warna}14` }}>
                  <MoodIcon size={11} /> {mood.label}
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[#f4ecdd]/75">{zonaLabel(uc.zona)}</span>
                {uc.balasan.length > 0 && (
                  <span className="flex items-center gap-1 rounded-full border border-[#81b29a]/40 bg-[#81b29a]/10 px-2.5 py-1 text-[#9fd4a8]">
                    <MessageCircle size={11} /> {uc.milikku ? `${uc.balasan.length} teman membalas` : `${uc.balasan.length} balasan`}
                  </span>
                )}
              </div>
            </div>

            {/* isi */}
            <div className="min-h-[190px] p-6 pb-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={page}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="font-hand text-[1.45rem] leading-relaxed text-[#f4ecdd] whitespace-pre-wrap"
                >
                  {pages[page]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* pager */}
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-2.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-full p-1.5 text-[#f4ecdd]/70 transition enabled:hover:bg-white/10 disabled:opacity-25"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1.5">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={clsx("h-1.5 rounded-full transition-all", i === page ? "w-5 bg-[#f2cc8f]" : "w-1.5 bg-white/25 hover:bg-white/40")}
                    aria-label={`Halaman ${i + 1}`}
                  />
                ))}
              </div>
              <button
                disabled={page === lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                className="rounded-full p-1.5 text-[#f4ecdd]/70 transition enabled:hover:bg-white/10 disabled:opacity-25"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* balasan di halaman terakhir */}
            {page === lastPage && (
              <div className="max-h-56 overflow-y-auto border-t border-white/10 bg-black/20 p-5 pt-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/85">
                  <MessageCircle size={12} />
                  {uc.milikku ? "Balasan masuk untukmu" : `Balasan · ${uc.balasan.length}`}
                </div>
                {uc.balasan.length === 0 && (
                  <p className="text-xs text-[#f4ecdd]/55 italic">{uc.milikku ? "Belum ada balasan. Teman-temanmu sedang menjelajah…" : "Belum ada balasan. Jadilah yang pertama!"}</p>
                )}
                <div className="space-y-2">
                  {uc.balasan.map((b) => (
                    <div key={b.id} className={clsx("rounded-xl border px-3 py-2", ROLE_STYLE[b.peran] ?? ROLE_STYLE.mahasiswa)}>
                      <div className="text-[10px] font-bold">
                        {b.dari}
                        <span className="opacity-70">{ROLE_LABEL[b.peran] ?? ""}</span>
                        {b.milikku && <span className="opacity-70"> · Kamu</span>}
                      </div>
                      <div className="mt-0.5 text-xs text-[#f4ecdd]">{b.isi}</div>
                    </div>
                  ))}
                </div>
                {canReply && (
                  <div className="mt-3">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value.slice(0, 150))}
                        placeholder="Tulis balasanmu…"
                        rows={2}
                        className="flex-1 resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#f4ecdd] placeholder:text-[#f4ecdd]/40 focus:border-[#f2cc8f]/50"
                      />
                      <button
                        onClick={sendReply}
                        disabled={sending || reply.trim().length === 0}
                        className="pulse-glow flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2cc8f] text-[#3a2d18] transition enabled:hover:scale-105 disabled:opacity-40"
                        aria-label="Kirim balasan"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-[#f4ecdd]/45">
                      <span>1 orang = 1 balasan · maks 150 karakter</span>
                      <span>{reply.length}/150</span>
                    </div>
                    {err && <p className="mt-1 text-[11px] text-[#f4a392]">{err}</p>}
                  </div>
                )}
                {!canReply && myReply && !uc.milikku && (
                  <p className="mt-2 text-[10px] italic text-[#f4ecdd]/50">Kamu sudah membalas surat ini. ♥</p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
