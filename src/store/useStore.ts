"use client";

import { create } from "zustand";
import type { AvatarConfig, Hubs, SessionInfo } from "@/lib/constants";

export type BalasanItem = {
  id: string;
  isi: string;
  createdAt: string;
  dari: string;
  peran: string;
  milikku: boolean;
};

export type UcapanItem = {
  id: string;
  judul: string;
  isi: string;
  mood: string;
  zona: string;
  createdAt: string;
  penulis: { id: string; nama: string; panggilan: string; peran: string; sekolahPpl: string | null };
  balasan: BalasanItem[];
  sudahDibaca: boolean;
  milikku: boolean;
};

export type PublicUser = {
  id: string;
  panggilan: string;
  namaLengkap: string;
  peran: string;
  jenisKelamin: string;
  sekolahPpl: string | null;
  modeAvatar: string;
  avatar: AvatarConfig | null;
};

export type WorldStatus = {
  mahasiswa: { total: number; filled: number };
  dosen: { total: number; filled: number };
  lockMode: string;
  isOpen: boolean;
};

export type WorldData = {
  status: WorldStatus;
  users: PublicUser[];
  ucapan: UcapanItem[];
  myProgress: string[];
  progressCount: number;
  totalUcapan: number;
  unreadReplies: number;
  totalRepliesOnMine: number;
  quotes: { teks: string; dari: string }[];
  adminMessage: string;
};

export type Toast = { id: number; title: string; body?: string };
type Overlay = "none" | "finale" | "momen" | "ending";

type Store = {
  session: SessionInfo | null;
  sessionLoaded: boolean;
  world: WorldData | null;
  worldLoading: boolean;
  scene: Hubs;
  school: string | null;
  transition: { active: boolean; label: string; warna: string };
  activeUcapanId: string | null;
  narasi: { title: string; text: string } | null;
  view: { pos: [number, number, number]; look: [number, number, number] } | null;
  overlay: Overlay;
  audioOn: boolean;
  preview: boolean;
  hideUI: boolean;
  listOpen: boolean;
  readSet: string[];
  toasts: Toast[];

  loadSession: () => void;
  setSession: (s: SessionInfo | null) => void;
  logout: () => void;
  fetchWorld: () => Promise<void>;
  goScene: (scene: Hubs, opts?: { school?: string | null; label?: string; warna?: string }) => void;
  openUcapan: (id: string) => void;
  closeUcapan: () => void;
  setNarasi: (n: { title: string; text: string } | null) => void;
  setView: (v: Store["view"]) => void;
  setOverlay: (o: Overlay) => void;
  setAudioOn: (v: boolean) => void;
  setPreview: (v: boolean) => void;
  setHideUI: (v: boolean) => void;
  setListOpen: (v: boolean) => void;
  markReadLocal: (id: string) => void;
  addToast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
};

const LS_KEY = "jejak_session_v1";

export const useStore = create<Store>((set, get) => ({
  session: null,
  sessionLoaded: false,
  world: null,
  worldLoading: false,
  scene: "hub",
  school: null,
  transition: { active: false, label: "", warna: "#f2cc8f" },
  activeUcapanId: null,
  narasi: null,
  view: null,
  overlay: "none",
  audioOn: false,
  preview: false,
  hideUI: false,
  listOpen: false,
  readSet: [],
  toasts: [],

  loadSession: () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) set({ session: JSON.parse(raw), sessionLoaded: true });
      else set({ sessionLoaded: true });
    } catch {
      set({ sessionLoaded: true });
    }
  },
  setSession: (s) => {
    set({ session: s });
    try {
      if (s) localStorage.setItem(LS_KEY, JSON.stringify(s));
      else localStorage.removeItem(LS_KEY);
    } catch {
      /* noop */
    }
  },
  logout: () => {
    get().setSession(null);
    set({ world: null, scene: "hub", school: null, overlay: "none", readSet: [] });
    if (typeof window !== "undefined") window.location.href = "/";
  },
  fetchWorld: async () => {
    const token = get().session?.token;
    if (!token) return;
    set({ worldLoading: true });
    try {
      const res = await fetch("/api/world", { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        get().logout();
        return;
      }
      const data = (await res.json()) as WorldData;
      set({ world: data, worldLoading: false, readSet: data.myProgress });
    } catch {
      set({ worldLoading: false });
    }
  },
  goScene: (scene, opts = {}) => {
    const cur = get();
    if (cur.transition.active) return;
    const labels: Record<string, string> = {
      hub: "Kembali ke Hub Utama",
      uksw: "Kampus UKSW — Rumah Kedua Kita",
      ppl: "Area PPL — Panggilan Nyata",
      yonif: "Yonif 411/Raider — Bela Negara Bersama",
      bukit: "Bukit Salatiga — Ujung Perjalanan",
    };
    const warnaMap: Record<string, string> = { hub: "#f2cc8f", uksw: "#5f8ac7", ppl: "#81b29a", yonif: "#c75146", bukit: "#f2a93b" };
    const warna = opts.warna ?? warnaMap[scene] ?? "#f2cc8f";
    const label = opts.label ?? (opts.school ? `${opts.school}` : labels[scene] ?? scene);
    set({ transition: { active: true, label, warna } });
    window.setTimeout(() => {
      set({ scene, school: opts.school ?? null, activeUcapanId: null, view: null });
      window.setTimeout(() => set({ transition: { active: false, label, warna } }), 500);
    }, 900);
  },
  openUcapan: (id) => set({ activeUcapanId: id }),
  closeUcapan: () => set({ activeUcapanId: null }),
  setNarasi: (n) => set({ narasi: n }),
  setView: (v) => set({ view: v }),
  setOverlay: (o) => set({ overlay: o }),
  setAudioOn: (v) => set({ audioOn: v }),
  setPreview: (v) => set({ preview: v }),
  setHideUI: (v) => set({ hideUI: v }),
  setListOpen: (v) => set({ listOpen: v }),
  markReadLocal: (id) => {
    const cur = get().readSet;
    if (cur.includes(id)) return;
    set({ readSet: [...cur, id] });
  },
  addToast: (title, body) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, title, body }] }));
    window.setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function apiFetch(token: string | undefined, path: string, init?: RequestInit) {
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
