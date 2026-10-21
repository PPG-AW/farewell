"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LockOpen, Loader2, DoorOpen, Home } from "lucide-react";
import { useStore } from "@/store/useStore";
import { UIOverlayFallback } from "@/components/world/loaders";

const WorldCanvas = dynamic(() => import("@/components/world/WorldCanvas"), { ssr: false });
import { HUD, Toasts, TransitionOverlay, NarasiModal, UcapanListModal, MapMenu } from "@/components/world/ui";
import { Joystick, InteractPrompt, ControlHint, DPad } from "@/components/world/Controls";
import UcapanCard from "@/components/world/UcapanCard";
import Finale from "@/components/world/Finale";
import MomenSpesial, { EndingScreen } from "@/components/world/MomenSpesial";
import AudioEngine from "@/components/AudioEngine";

function WorldInner() {
  const router = useRouter();
  const params = useSearchParams();
  const session = useStore((s) => s.session);
  const sessionLoaded = useStore((s) => s.sessionLoaded);
  const loadSession = useStore((s) => s.loadSession);
  const world = useStore((s) => s.world);
  const worldLoading = useStore((s) => s.worldLoading);
  const fetchWorld = useStore((s) => s.fetchWorld);
  const preview = useStore((s) => s.preview);
  const setPreview = useStore((s) => s.setPreview);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!sessionLoaded) return;
    if (!session) {
      router.replace("/");
      return;
    }
    if (params.get("admin") === "1" && session.peran === "admin") setPreview(true);
    fetchWorld().then(() => setReady(true));
    const iv = window.setInterval(fetchWorld, 30000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, session?.token]);

  if (!sessionLoaded || !session) return null;

  const isOpen = world?.status.isOpen ?? false;
  const canEnter = isOpen || session.peran === "admin";
  const locked = ready && world && !canEnter;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#171310]">
      {ready && canEnter && (
        <Suspense fallback={<UIOverlayFallback label="Menyiapkan dunia 3D…" />}>
          <WorldCanvas />
        </Suspense>
      )}

      {/* layar memuat awal */}
      <AnimatePresence>
        {(!ready || (worldLoading && !world)) && !locked && (
          <motion.div className="absolute inset-0 z-[60]" exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            <UIOverlayFallback label="Memuat jejak langkah…" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* layar dunia terkunci */}
      <AnimatePresence>
        {locked && (
          <motion.div
            className="absolute inset-0 z-[60] flex items-center justify-center px-4"
            style={{ background: "linear-gradient(180deg, #171233 0%, #34204e 45%, #6b3a5e 75%, #241a2e 100%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="glass w-full max-w-md rounded-3xl p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2a93b]/15">
                <Lock size={26} className="text-[#f2a93b]" />
              </div>
              <h2 className="font-display mt-4 text-2xl font-black text-[#f4ecdd]">Data sudah tersimpan!</h2>
              <p className="mt-1.5 text-sm text-[#f4ecdd]/70">Dunia belum terbuka. Menunggu semua mahasiswa menitipkan jejaknya…</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-left">
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#f4ecdd]">
                  <span>MAHASISWA</span>
                  <span className="text-[#f2cc8f]">
                    {world?.status.mahasiswa.filled}/{world?.status.mahasiswa.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e9a84a] to-[#f2cc8f]"
                    style={{ width: `${((world?.status.mahasiswa.filled ?? 0) / Math.max(1, world?.status.mahasiswa.total ?? 29)) * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold tracking-wider text-[#f4ecdd]">
                  <span>DOSEN</span>
                  <span className="text-[#8ecae6]">
                    {world?.status.dosen.filled}/{world?.status.dosen.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#5f8ac7] to-[#8ecae6]" style={{ width: `${((world?.status.dosen.filled ?? 0) / Math.max(1, world?.status.dosen.total ?? 10)) * 100}%` }} />
                </div>
              </div>
              <p className="mt-3 text-[10px] text-[#f4ecdd]/50">Halaman ini memeriksa status setiap 30 detik secara otomatis.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => router.push("/form")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-2.5 text-xs font-bold text-[#f4ecdd]/85 transition hover:bg-white/10">
                  <DoorOpen size={13} /> Edit Formulirku
                </button>
                <button onClick={() => router.push("/")} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-2.5 text-xs font-bold text-[#f4ecdd]/85 transition hover:bg-white/10">
                  <Home size={13} /> Beranda
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {ready && canEnter && (
        <>
          <HUD />
          <MapMenu />
          <Joystick />
          <DPad />
          <InteractPrompt />
          <ControlHint />
          <UcapanCard />
          <NarasiModal />
          <UcapanListModal />
          <Toasts />
          <TransitionOverlay />
          <Finale />
          <MomenSpesial />
          <EndingScreen />
          <AudioEngine />
          {preview && (
            <div className="pointer-events-none fixed left-1/2 top-3 z-[45] -translate-x-1/2 rounded-full border border-[#9db4ff]/40 bg-[#131826]/80 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-[#9db4ff] backdrop-blur">
              <LockOpen size={10} className="mr-1 inline" /> Mode Jelajah — progres tidak tercatat
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function WorldPage() {
  return (
    <Suspense fallback={<UIOverlayFallback label="Memuat…" icon={<Loader2 className="animate-spin" size={26} />} />}>
      <WorldInner />
    </Suspense>
  );
}
