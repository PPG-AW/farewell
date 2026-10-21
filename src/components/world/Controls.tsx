"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, BookOpen, DoorOpen, UserRound, Hand, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { joy, input, triggerNearest } from "./player";

const KIND_ICON = { surat: Mail, narasi: BookOpen, portal: DoorOpen, orang: UserRound } as const;

/** Joystick virtual untuk layar sentuh */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const touchId = useRef<number | null>(null);

  useEffect(() => {
    const el = base.current;
    if (!el) return;
    const R = 46;

    const place = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      let dx = cx - (r.left + r.width / 2);
      let dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > R) {
        dx = (dx / d) * R;
        dy = (dy / d) * R;
      }
      setKnob({ x: dx, y: dy });
      joy.x = dx / R;
      joy.y = dy / R;
      joy.active = true;
    };
    const reset = () => {
      setKnob({ x: 0, y: 0 });
      setActive(false);
      joy.x = 0;
      joy.y = 0;
      joy.active = false;
      touchId.current = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      touchId.current = t.identifier;
      setActive(true);
      place(t.clientX, t.clientY);
      e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchId.current === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.identifier === touchId.current) {
          place(t.clientX, t.clientY);
          e.preventDefault();
          return;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId.current) reset();
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      setActive(true);
      place(e.clientX, e.clientY);
      const mm = (ev: MouseEvent) => place(ev.clientX, ev.clientY);
      const mu = () => {
        reset();
        window.removeEventListener("mousemove", mm);
        window.removeEventListener("mouseup", mu);
      };
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseup", mu);
      e.preventDefault();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("mousedown", onMouseDown);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      joy.active = false;
    };
  }, []);

  return (
    <div
      ref={base}
      className="pointer-events-auto fixed bottom-6 left-5 z-[46] h-[118px] w-[118px] touch-none select-none rounded-full border-2 border-white/20 bg-black/35 backdrop-blur-md transition-opacity"
      style={{ opacity: active ? 1 : 0.65 }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
        gerak
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-[#f2cc8f]/60 bg-[#f2cc8f]/80 shadow-xl transition-transform"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}

/** Tombol interaksi + label objek terdekat */
export function InteractPrompt() {
  const nearby = useStore((s) => s.nearby);
  const blocked = useStore((s) => !!s.activeUcapanId || !!s.narasi || s.overlay !== "none" || s.listOpen);
  const show = !!nearby && !blocked;
  const Icon = nearby ? KIND_ICON[(nearby.kind as keyof typeof KIND_ICON) ?? "surat"] ?? Mail : Mail;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          className="pointer-events-none fixed bottom-7 left-1/2 z-[47] -translate-x-1/2"
        >
          <button
            onClick={() => triggerNearest()}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#f2cc8f]/50 bg-[#1b1611]/90 py-3 pl-4 pr-3 shadow-2xl backdrop-blur-md transition hover:scale-[1.03] active:scale-95"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2cc8f] text-[#3a2d18]">
              <Icon size={17} />
            </span>
            <span className="text-left">
              <span className="block max-w-[46vw] truncate text-[13px] font-bold leading-tight text-[#f4ecdd]">{nearby!.label}</span>
              <span className="block text-[9px] uppercase tracking-[0.22em] text-[#f2cc8f]/80">Tekan E atau ketuk</span>
            </span>
            <span className="ml-1 hidden h-7 w-7 items-center justify-center rounded-lg border border-white/25 text-[11px] font-black text-[#f4ecdd]/80 sm:flex">E</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Petunjuk kontrol, tampil beberapa detik saat masuk zona baru */
export function ControlHint() {
  const scene = useStore((s) => s.scene);
  const school = useStore((s) => s.school);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 5200);
    return () => window.clearTimeout(t);
  }, [scene, school]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="pointer-events-none fixed left-1/2 top-20 z-[44] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/55 px-4 py-2.5 text-center backdrop-blur-md sm:top-5"
        >
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#f4ecdd]">
            <Hand size={13} className="text-[#f2cc8f]" />
            <span className="hidden sm:inline">
              <b className="text-[#f2cc8f]">WASD</b> jalan · <b className="text-[#f2cc8f]">Shift</b> lari · seret layar = putar kamera · <b className="text-[#f2cc8f]">E</b> berinteraksi
            </span>
            <span className="sm:hidden">
              Pakai <b className="text-[#f2cc8f]">joystick</b> untuk jalan · geser layar = kamera
            </span>
          </div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-[#f4ecdd]/55">Dekati teman & amplop untuk membaca</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/** D-pad cadangan: bisa ditekan-tahan dengan mouse maupun jari */
export function DPad() {
  const hold = (f: number, r: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      input.f = f;
      input.r = r;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    onPointerUp: () => {
      input.f = 0;
      input.r = 0;
    },
    onPointerLeave: () => {
      input.f = 0;
      input.r = 0;
    },
    onPointerCancel: () => {
      input.f = 0;
      input.r = 0;
    },
  });
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-black/45 text-[#f4ecdd] backdrop-blur-md transition active:scale-95 active:bg-[#f2cc8f] active:text-[#3a2d18] select-none touch-none";
  return (
    <div className="pointer-events-auto fixed bottom-6 right-5 z-[46] hidden select-none flex-col items-center gap-1.5 sm:flex">
      <button className={btn} aria-label="Maju" {...hold(1, 0)}>
        <ChevronUp size={19} />
      </button>
      <div className="flex gap-1.5">
        <button className={btn} aria-label="Kiri" {...hold(0, -1)}>
          <ChevronLeft size={19} />
        </button>
        <button className={btn} aria-label="Mundur" {...hold(-1, 0)}>
          <ChevronDown size={19} />
        </button>
        <button className={btn} aria-label="Kanan" {...hold(0, 1)}>
          <ChevronRight size={19} />
        </button>
      </div>
      <div className="mt-0.5 rounded-full bg-black/40 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-[#f4ecdd]/55 backdrop-blur">
        atau WASD
      </div>
    </div>
  );
}
