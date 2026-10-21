"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ChevronLeft, GraduationCap, Heart, Flame, Laugh, CloudRain,
  HandHeart, Sparkles, Shirt, Tent, Lock, Rocket, PartyPopper, TriangleAlert, Save, Shuffle,
} from "lucide-react";
import { apiFetch, useStore } from "@/store/useStore";
import {
  KULIT_OPTIONS, TUBUH_OPTIONS, RAMBUT_P, RAMBUT_L, RAMBUT_WARNA, WAJAH_OPTIONS,
  ATASAN_OPTIONS, BAWAHAN_OPTIONS, SEPATU_OPTIONS, TOPI_OPTIONS, TOPI_TNI, HIJAB_OPTIONS,
  ITEM_TANGAN_OPTIONS, ITEM_TANGAN_TNI, VIBE_COLORS, MOODS, SEKOLAH_LIST, ADMIN_AVATAR,
  randomAvatar, type AvatarConfig,
} from "@/lib/constants";
import clsx from "clsx";
import { HairIcon, HijabIcon, TopIcon, BottomIcon, ShoeIcon, HatIcon, ItemIcon, FaceIcon, BodyIcon, GlassesIcon } from "@/components/avatar/OptionIcons";

const AvatarPreview = dynamic(() => import("@/components/avatar/AvatarPreview"), { ssr: false });

const MOOD_ICON: Record<string, typeof Heart> = { haru: CloudRain, lucu: Laugh, syukur: HandHeart, semangat: Flame, kasih: Heart, inspiratif: Sparkles };
const TUBUH_LABEL: Record<string, string> = { langsing: "Langsing", sedang: "Sedang", tegap: "Tegap" };

function Swatch({ c, active, onClick }: { c: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "h-9 w-9 rounded-xl border-2 transition",
        active ? "scale-110 border-[#f2cc8f] ring-2 ring-[#f2cc8f]/40" : "border-white/20 hover:scale-105"
      )}
      style={{ background: c }}
      aria-label={`Warna ${c}`}
    />
  );
}

/** Tombol pilihan dengan GAMBAR preview + nama */
function IconChoice({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-[72px] flex-col items-center gap-1 rounded-xl border p-1.5 transition",
        active
          ? "border-[#f2cc8f] bg-[#f2cc8f]/15 shadow-[0_0_20px_-8px_rgba(242,204,143,0.8)]"
          : "border-white/12 bg-white/5 hover:bg-white/10"
      )}
    >
      <span className={clsx("flex h-11 w-11 items-center justify-center rounded-lg transition", active ? "bg-[#1b1611]/70" : "bg-black/25")}>{icon}</span>
      <span className={clsx("w-full truncate text-center text-[9px] font-bold capitalize leading-tight", active ? "text-[#f2cc8f]" : "text-[#f4ecdd]/70")}>
        {label.replace(/-/g, " ")}
      </span>
    </button>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border-t border-white/8 pt-3 first:mt-0 first:border-0 first:pt-0">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/85">{title}</span>
        {hint && <span className="text-[9px] text-[#f4ecdd]/40">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

// ─── Avatar customizer ──────────────────────────────────────────────────────
function Customizer({ config, setConfig, gender, mode, locked }: { config: AvatarConfig; setConfig: (c: AvatarConfig) => void; gender: "L" | "P"; mode: string; locked: boolean }) {
  const tni = mode === "tni";
  const set = (patch: Partial<AvatarConfig>) => setConfig({ ...config, ...patch });
  const rambutList = gender === "P" ? RAMBUT_P : RAMBUT_L;
  const bawahanList = gender === "P" ? BAWAHAN_OPTIONS : BAWAHAN_OPTIONS.filter((b) => !b.startsWith("rok") && b !== "kulot");
  const itemList = tni ? ITEM_TANGAN_TNI : ITEM_TANGAN_OPTIONS;
  const topiList = tni ? TOPI_TNI : TOPI_OPTIONS;

  if (locked) {
    return (
      <div className="rounded-2xl border border-[#f2cc8f]/25 bg-[#f2cc8f]/5 p-4 text-sm leading-relaxed text-[#f4ecdd]/80">
        <div className="flex items-center gap-2 font-bold text-[#f2cc8f]">
          <Lock size={14} /> Avatar Admin Terkunci
        </div>
        <p className="mt-2 text-xs">
          Penampilanmu sudah ditetapkan: <b>kemeja mustard</b>, <b>celana cream</b>, <b>sepatu hijau</b>, dan <b>rambut pendek</b>.
          Ikonik dan mudah dikenali semua teman. ✦
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[48vh] overflow-y-auto pr-1 lg:max-h-[58vh]">
      <Section title="Warna Kulit">
        {KULIT_OPTIONS.map((c) => (
          <Swatch key={c} c={c} active={config.kulit === c} onClick={() => set({ kulit: c })} />
        ))}
      </Section>

      <Section title="Bentuk Tubuh">
        {TUBUH_OPTIONS.map((t) => (
          <IconChoice key={t} icon={<BodyIcon model={t} />} label={TUBUH_LABEL[t]} active={config.tubuh === t} onClick={() => set({ tubuh: t })} />
        ))}
      </Section>

      <Section title="Bentuk Wajah">
        {WAJAH_OPTIONS.map((wj) => (
          <IconChoice key={wj} icon={<FaceIcon model={wj} skin={config.kulit} />} label={wj} active={config.wajah === wj} onClick={() => set({ wajah: wj })} />
        ))}
        <IconChoice icon={<GlassesIcon on={config.kacamata} />} label={config.kacamata ? "pakai kacamata" : "tanpa kacamata"} active={config.kacamata} onClick={() => set({ kacamata: !config.kacamata })} />
      </Section>

      {gender === "P" && (
        <Section title="Hijab" hint="pilih 'none' untuk tampil berambut">
          {HIJAB_OPTIONS.map((h) => (
            <IconChoice
              key={h}
              icon={<HijabIcon style={h} color={config.hijabWarna} skin={config.kulit} />}
              label={h === "none" ? "tanpa hijab" : h}
              active={config.hijab === h}
              onClick={() => set({ hijab: h })}
            />
          ))}
        </Section>
      )}
      {config.hijab !== "none" && gender === "P" && (
        <Section title="Warna Hijab">
          {VIBE_COLORS.map((c) => (
            <Swatch key={c} c={c} active={config.hijabWarna === c} onClick={() => set({ hijabWarna: c })} />
          ))}
        </Section>
      )}

      {config.hijab === "none" && (
        <>
          <Section title="Model Rambut">
            {rambutList.map((r) => (
              <IconChoice
                key={r}
                icon={<HairIcon model={r} color={config.rambutWarna} skin={config.kulit} />}
                label={r}
                active={config.rambutModel === r}
                onClick={() => set({ rambutModel: r })}
              />
            ))}
          </Section>
          <Section title="Warna Rambut">
            {RAMBUT_WARNA.map((c) => (
              <Swatch key={c} c={c} active={config.rambutWarna === c} onClick={() => set({ rambutWarna: c })} />
            ))}
          </Section>
        </>
      )}

      {tni ? (
        <Section title="Seragam" hint="terkunci — standar Yonif 411">
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-[11px] text-[#f4ecdd]/75">
            <Lock size={12} className="text-[#f2cc8f]" /> Loreng TNI lengkap + boots hitam
          </div>
        </Section>
      ) : (
        <>
          <Section title="Baju Atasan">
            {ATASAN_OPTIONS.map((a) => (
              <IconChoice key={a} icon={<TopIcon model={a} color={config.atasanWarna} />} label={a} active={config.atasan === a} onClick={() => set({ atasan: a })} />
            ))}
          </Section>
          <Section title="Warna Atasan">
            {VIBE_COLORS.map((c) => (
              <Swatch key={c} c={c} active={config.atasanWarna === c} onClick={() => set({ atasanWarna: c })} />
            ))}
          </Section>

          <Section title="Bawahan">
            {bawahanList.map((b) => (
              <IconChoice key={b} icon={<BottomIcon model={b} color={config.bawahanWarna} />} label={b} active={config.bawahan === b} onClick={() => set({ bawahan: b })} />
            ))}
          </Section>
          <Section title="Warna Bawahan">
            {VIBE_COLORS.map((c) => (
              <Swatch key={c} c={c} active={config.bawahanWarna === c} onClick={() => set({ bawahanWarna: c })} />
            ))}
          </Section>

          <Section title="Sepatu">
            {SEPATU_OPTIONS.map((s) => (
              <IconChoice key={s} icon={<ShoeIcon model={s} color={config.sepatuWarna} />} label={s} active={config.sepatu === s} onClick={() => set({ sepatu: s })} />
            ))}
          </Section>
          <Section title="Warna Sepatu">
            {["#17130f", "#f4f1de", "#8a5a2c", "#3d405b", "#c75146", "#81b29a"].map((c) => (
              <Swatch key={c} c={c} active={config.sepatuWarna === c} onClick={() => set({ sepatuWarna: c })} />
            ))}
          </Section>
        </>
      )}

      <Section title={tni ? "Baret" : "Topi"}>
        {topiList.map((t) => (
          <IconChoice key={t} icon={<HatIcon model={t} skin={config.kulit} />} label={t === "none" ? "tanpa topi" : t} active={config.topi === t} onClick={() => set({ topi: t })} />
        ))}
      </Section>

      <Section title="Benda di Tangan">
        {itemList.map((i) => (
          <IconChoice key={i} icon={<ItemIcon model={i} />} label={i === "none" ? "tangan kosong" : i} active={config.itemTangan === i} onClick={() => set({ itemTangan: i })} />
        ))}
      </Section>
    </div>
  );
}

// ─── Halaman form ───────────────────────────────────────────────────────────
const STEP_LABELS = ["Identitas", "Mode Avatar", "Kustomisasi", "Data PPL", "Ucapan"];

export default function FormPage() {
  const router = useRouter();
  const session = useStore((s) => s.session);
  const sessionLoaded = useStore((s) => s.sessionLoaded);
  const loadSession = useStore((s) => s.loadSession);

  const [step, setStep] = useState(1);
  const [panggilan, setPanggilan] = useState("");
  const [mode, setMode] = useState<"biasa" | "tni">("biasa");
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);
  const [sekolah, setSekolah] = useState("");
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [mood, setMood] = useState("syukur");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [worldOpen, setWorldOpen] = useState<boolean | null>(null);
  const draftKey = useRef("");

  const isDosen = session?.peran === "dosen";
  const isAdmin = session?.peran === "admin" || session?.isAdminAvatar === true;
  const gender = (session?.jenisKelamin ?? "P") as "L" | "P";

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!sessionLoaded) return;
    if (!session) {
      router.replace("/");
      return;
    }
    draftKey.current = `jejak_draft_${session.id}`;
    // restore draft
    try {
      const raw = localStorage.getItem(draftKey.current);
      if (raw) {
        const d = JSON.parse(raw);
        setPanggilan(d.panggilan ?? session.namaPanggilan ?? "");
        setMode(d.mode ?? (session.modeAvatar as "biasa" | "tni") ?? "biasa");
        setAvatar(d.avatar ?? (isAdmin ? ADMIN_AVATAR : randomAvatar(gender, d.mode === "tni" ? "tni" : "biasa")));
        setSekolah(d.sekolah ?? session.sekolahPpl ?? "");
        setJudul(d.judul ?? "");
        setIsi(d.isi ?? "");
        setMood(d.mood ?? "syukur");
        setStep(d.step ?? 1);
      } else {
        setPanggilan(session.namaPanggilan ?? "");
        setAvatar(isAdmin ? ADMIN_AVATAR : randomAvatar(gender, "biasa"));
        setSekolah(session.sekolahPpl ?? "");
      }
    } catch {
      setAvatar(isAdmin ? ADMIN_AVATAR : randomAvatar(gender, "biasa"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoaded, session?.id]);

  // autosave draft tiap 10 dtk
  useEffect(() => {
    if (!session || done) return;
    const iv = window.setInterval(() => {
      try {
        localStorage.setItem(draftKey.current, JSON.stringify({ panggilan, mode, avatar, sekolah, judul, isi, mood, step }));
      } catch {
        /* noop */
      }
    }, 10000);
    return () => window.clearInterval(iv);
  }, [session, done, panggilan, mode, avatar, sekolah, judul, isi, mood, step]);

  const validateStep = (s: number): string => {
    if (isDosen) return "";
    if (s === 1 && (panggilan.trim().length < 2 || panggilan.trim().length > 20)) return "Nama panggilan wajib 2–20 karakter.";
    if (s === 4 && !sekolah) return "Pilih sekolah PPL kamu dulu ya.";
    if (s === 5) {
      if (isi.trim().length < 10) return "Isi ucapan minimal 10 karakter.";
    }
    return "";
  };

  const next = () => {
    const v = validateStep(step);
    setErr(v);
    if (!v) setStep((s) => Math.min(5, s + 1));
  };
  const back = () => {
    setErr("");
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = async () => {
    if (!session || saving) return;
    const v = validateStep(5);
    if (v) {
      setErr(v);
      return;
    }
    setSaving(true);
    setErr("");
    const body = isDosen
      ? { ucapan: { judul, isi, mood } }
      : { namaPanggilan: panggilan.trim(), modeAvatar: mode, sekolahPpl: sekolah, avatarConfig: avatar, ucapan: { judul, isi, mood } };
    const res = await apiFetch(session.token, "/api/submit", { method: "POST", body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error ?? "Gagal menyimpan. Coba lagi ya.");
      setSaving(false);
      return;
    }
    try {
      localStorage.removeItem(draftKey.current);
    } catch {
      /* noop */
    }
    useStore.getState().setSession({ ...session, namaPanggilan: panggilan.trim() || session.namaPanggilan, sekolahPpl: sekolah || session.sekolahPpl, sudahIsiData: true });
    setDone(true);
    setSaving(false);
    const ws = await fetch("/api/world-status").then((r) => r.json()).catch(() => null);
    setWorldOpen(ws?.isOpen ?? false);
  };

  const halaman = Math.max(1, Math.ceil(isi.trim().length / 200) || 1);
  const avatarShown = avatar ?? ADMIN_AVATAR;

  if (!sessionLoaded || !session) return null;

  return (
    <main className="grain relative min-h-screen overflow-hidden px-3 py-6 sm:px-6" style={{ background: "linear-gradient(170deg, #1a1424 0%, #2b1e33 45%, #4a2c3a 100%)" }}>
      <div className="mx-auto max-w-5xl">
        {/* header */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-[#f4ecdd]/80 transition hover:bg-white/10">
            <ChevronLeft size={14} /> Beranda
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#f2cc8f]/80">
            <GraduationCap size={13} /> Formulir Jejak Langkah
          </div>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto mt-10 max-w-lg rounded-3xl p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#81b29a]/20">
                {worldOpen ? <PartyPopper size={28} className="text-[#9fd4a8]" /> : <Check size={28} className="text-[#9fd4a8]" />}
              </motion.div>
              <h2 className="font-display mt-4 text-2xl font-black text-[#f4ecdd]">Jejakmu sudah tertitip!</h2>
              {worldOpen === null ? (
                <p className="mt-2 text-sm text-[#f4ecdd]/60">Memeriksa status dunia…</p>
              ) : worldOpen ? (
                <>
                  <p className="mt-2 text-sm text-[#f4ecdd]/75">Semua 29 mahasiswa sudah mengisi. Dunia kenangan sudah terbuka untukmu.</p>
                  <button onClick={() => router.push("/world")} className="pulse-glow mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f2cc8f] to-[#e9a84a] py-3.5 text-sm font-black tracking-wide text-[#3a2d18] transition hover:scale-[1.02]">
                    <Rocket size={16} /> MASUK DUNIA 3D
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-[#f4ecdd]/75">Dunia akan terbuka saat semua 29 mahasiswa selesai mengisi. Kamu bisa kembali lagi nanti.</p>
                  <button onClick={() => router.push("/world")} className="mt-6 w-full rounded-2xl border border-[#f2cc8f]/40 bg-[#f2cc8f]/10 py-3 text-sm font-black tracking-wide text-[#f2cc8f] transition hover:bg-[#f2cc8f]/20">
                    LIHAT RUANG TUNGGU
                  </button>
                </>
              )}
              {isAdmin && (
                <button onClick={() => router.push("/dashboard")} className="mt-2.5 w-full rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-bold text-[#f4ecdd]/80 transition hover:bg-white/10">
                  Ke Dashboard Admin
                </button>
              )}
            </motion.div>
          ) : isDosen ? (
            /* ─── FORM DOSEN: satu halaman ─── */
            <motion.div key="dosen" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto mt-8 max-w-xl rounded-3xl p-6 sm:p-8">
              <h1 className="font-display text-2xl font-black text-[#f4ecdd]">Surat untuk Anak Didikmu</h1>
              <div className="mt-4 space-y-1.5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#f4ecdd]/85">
                <div className="flex items-center gap-2"><Check size={13} className="text-[#9fd4a8]" /> Nama: <b>{session.namaLengkap}</b></div>
                <div className="flex items-center gap-2"><Check size={13} className="text-[#9fd4a8]" /> Gender: <b>{gender === "L" ? "Laki-laki" : "Perempuan"}</b></div>
                <div className="flex items-center gap-2"><Check size={13} className="text-[#9fd4a8]" /> Avatar: <b>otomatis formal</b> <span className="text-[10px] text-[#f4ecdd]/50">({gender === "L" ? "jas + kacamata" : "blazer elegan"})</span></div>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/80">Judul Surat</label>
                  <input value={judul} onChange={(e) => setJudul(e.target.value.slice(0, 50))} placeholder="cth: Pesan dari Bu Dosen" className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 text-sm text-[#f4ecdd] placeholder:text-[#f4ecdd]/35 focus:border-[#f2cc8f]/60" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/80">Isi Ucapan</label>
                  <textarea value={isi} onChange={(e) => setIsi(e.target.value)} rows={5} placeholder="Tulis pesanmu untuk 29 calon guru matematika…" className="font-hand w-full resize-none rounded-xl border border-white/15 bg-black/25 p-4 text-2xl leading-relaxed text-[#f4ecdd] placeholder:text-[#f4ecdd]/30 focus:border-[#f2cc8f]/60" />
                  <p className="mt-1 text-[10px] text-[#f4ecdd]/45">{isi.length} karakter · akan otomatis dibagi menjadi {halaman} halaman cantik</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/80">Suasana</label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((m) => {
                      const Ic = MOOD_ICON[m.id] ?? Heart;
                      return (
                        <button key={m.id} onClick={() => setMood(m.id)} className={clsx("flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition", mood === m.id ? "border-[#f2cc8f] bg-[#f2cc8f]/15 text-[#f2cc8f]" : "border-white/15 bg-white/5 text-[#f4ecdd]/75 hover:bg-white/10")}>
                          <Ic size={13} /> {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {err && <p className="flex items-center gap-1.5 text-xs text-[#f4a392]"><TriangleAlert size={13} /> {err}</p>}
                <button onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f2cc8f] to-[#e9a84a] py-3.5 text-sm font-black tracking-wide text-[#3a2d18] transition enabled:hover:scale-[1.02] disabled:opacity-40">
                  <Save size={15} /> {saving ? "MENYIMPAN…" : "SIMPAN & TITIPKAN"}
                </button>
                <p className="text-center text-[10px] text-[#f4ecdd]/45">Setelah tersimpan, kamu bisa masuk dunia 3D untuk menjelajah & membalas ucapan mahasiswa.</p>
              </div>
            </motion.div>
          ) : (
            /* ─── FORM MAHASISWA: 5 langkah ─── */
            <motion.div key="mhs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
              {/* stepper */}
              <div className="mx-auto flex max-w-2xl items-center gap-1.5 sm:gap-2">
                {STEP_LABELS.map((l, i) => {
                  const n = i + 1;
                  const state = n < step ? "done" : n === step ? "now" : "next";
                  return (
                    <div key={l} className="flex flex-1 flex-col items-center gap-1">
                      <div className={clsx("flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-black transition sm:h-8 sm:w-8", state === "done" ? "border-[#81b29a] bg-[#81b29a]/25 text-[#9fd4a8]" : state === "now" ? "border-[#f2cc8f] bg-[#f2cc8f]/20 text-[#f2cc8f]" : "border-white/15 bg-white/5 text-[#f4ecdd]/40")}>
                        {state === "done" ? <Check size={13} /> : n}
                      </div>
                      <div className={clsx("hidden text-[9px] font-semibold uppercase tracking-wider sm:block", state === "now" ? "text-[#f2cc8f]" : "text-[#f4ecdd]/45")}>{l}</div>
                    </div>
                  );
                })}
              </div>

              <div className={clsx("glass mt-5 grid gap-6 rounded-3xl p-5 sm:p-7", step === 3 ? "lg:grid-cols-2" : "mx-auto max-w-xl")}>
                <div className={step === 3 ? "order-2" : ""}>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                        <h2 className="font-display text-xl font-black text-[#f4ecdd]">Halo, calon guru! ✦</h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#f4ecdd]/60">Namamu sudah tercatat oleh admin. Tinggal satu lagi: bagaimana teman-temanmu memanggilmu?</p>
                        <div className="mt-5 space-y-3">
                          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                            <div className="text-[9px] uppercase tracking-[0.25em] text-[#f4ecdd]/45">Nama Lengkap</div>
                            <div className="mt-0.5 text-sm font-bold text-[#f4ecdd]">{session.namaLengkap}</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex items-center justify-between">
                            <div>
                              <div className="text-[9px] uppercase tracking-[0.25em] text-[#f4ecdd]/45">Jenis Kelamin</div>
                              <div className="mt-0.5 text-sm font-bold text-[#f4ecdd]">{gender === "L" ? "Laki-laki" : "Perempuan"}</div>
                            </div>
                            <Lock size={13} className="text-[#f4ecdd]/35" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/80">Nama Panggilan</label>
                            <input value={panggilan} onChange={(e) => setPanggilan(e.target.value.slice(0, 20))} placeholder="cth: Fauzi" className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-bold text-[#f4ecdd] placeholder:text-[#f4ecdd]/35 focus:border-[#f2cc8f]/60" />
                            <p className="mt-1 text-[10px] text-[#f4ecdd]/45">2–20 karakter · akan tampil di name tag avatarmu</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                        <h2 className="font-display text-xl font-black text-[#f4ecdd]">Pilih peranmu di dunia</h2>
                        <p className="mt-1 text-xs text-[#f4ecdd]/60">Ini menentukan di mana avatarmu berdiri. Suratmu tetap di sekolah PPL-mu.</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {([
                            { id: "biasa" as const, icon: Shirt, title: "Civitas Biasa", desc: "Baju bebas penuh gaya. Avatarmu berdiri di sekolah PPL-mu, siap menyambut teman-teman.", c: "#5f8ac7" },
                            { id: "tni" as const, icon: Tent, title: "Mode TNI", desc: "Seragam loreng + baret kebanggaan. Avatarmu berkumpul di api unggun Yonif 411/Raider.", c: "#c75146" },
                          ]).map((m) => {
                            const Ic = m.icon;
                            const disabled = m.id === "tni" && isAdmin;
                            return (
                              <button
                                key={m.id}
                                disabled={disabled}
                                onClick={() => {
                                  setMode(m.id);
                                  if (!isAdmin) setAvatar(randomAvatar(gender, m.id));
                                }}
                                className={clsx(
                                  "rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-35",
                                  mode === m.id ? "border-[#f2cc8f] bg-[#f2cc8f]/10 shadow-[0_0_30px_-10px_rgba(242,204,143,0.5)]" : "border-white/15 bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <Ic size={22} style={{ color: m.c }} />
                                  {mode === m.id && <Check size={15} className="text-[#f2cc8f]" />}
                                </div>
                                <div className="mt-2 text-sm font-black text-[#f4ecdd]">{m.title}</div>
                                <p className="mt-1 text-[11px] leading-relaxed text-[#f4ecdd]/65">{m.desc}</p>
                                {disabled && <p className="mt-1 text-[10px] text-[#f2a93b]">Khusus admin: tampil dengan kemeja mustard ikonik.</p>}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                        <h2 className="font-display text-xl font-black text-[#f4ecdd]">Rancang avatarmu</h2>
                        <p className="mt-1 text-xs text-[#f4ecdd]/60">Seret untuk memutar 360°. Kombinasikan sesukamu!</p>
                        <div className="mt-3">
                          <Customizer config={avatarShown} setConfig={setAvatar} gender={gender} mode={mode} locked={isAdmin} />
                        </div>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                        <h2 className="font-display text-xl font-black text-[#f4ecdd]">Di mana kamu PPL?</h2>
                        <p className="mt-1 text-xs text-[#f4ecdd]/60">Surat perpisahanmu akan berdiri di sekolah ini, di dunia 3D.</p>
                        <div className="mt-5 grid gap-2">
                          {SEKOLAH_LIST.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSekolah(s.id)}
                              className={clsx("flex items-center justify-between rounded-2xl border p-3.5 text-left transition", sekolah === s.id ? "border-[#f2cc8f] bg-[#f2cc8f]/10" : "border-white/15 bg-white/5 hover:bg-white/10")}
                            >
                              <div className="flex items-center gap-3">
                                <span className="h-8 w-8 rounded-xl" style={{ background: s.warna }} />
                                <div>
                                  <div className="text-sm font-black text-[#f4ecdd]">{s.id}</div>
                                  <div className="text-[10px] text-[#f4ecdd]/55">{s.ciri}</div>
                                </div>
                              </div>
                              {sekolah === s.id && <Check size={15} className="text-[#f2cc8f]" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === 5 && (
                      <motion.div key="s5" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                        <h2 className="font-display text-xl font-black text-[#f4ecdd]">Tulis suratmu</h2>
                        <p className="mt-1 text-xs text-[#f4ecdd]/60">Ini akan dibaca semua teman & dosen, lalu bisa mereka balas.</p>
                        <div className="mt-5 space-y-4">
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/80">Judul (maks 50)</label>
                            <input value={judul} onChange={(e) => setJudul(e.target.value.slice(0, 50))} placeholder="cth: Untuk Keluarga Baruku" className="w-full rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 text-sm text-[#f4ecdd] placeholder:text-[#f4ecdd]/35 focus:border-[#f2cc8f]/60" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/80">Isi Surat</label>
                            <textarea value={isi} onChange={(e) => setIsi(e.target.value)} rows={6} placeholder="Menulislah dari hati. Ceritakan yang tak sempat terucap…" className="font-hand w-full resize-none rounded-xl border border-white/15 bg-black/25 p-4 text-2xl leading-relaxed text-[#f4ecdd] placeholder:text-[#f4ecdd]/30 focus:border-[#f2cc8f]/60" />
                            <p className="mt-1 text-[10px] text-[#f4ecdd]/45">{isi.length} karakter · dibagi otomatis {halaman} halaman · draft tersimpan tiap 10 detik</p>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/80">Suasana Surat</label>
                            <div className="flex flex-wrap gap-1.5">
                              {MOODS.map((m) => {
                                const Ic = MOOD_ICON[m.id] ?? Heart;
                                return (
                                  <button key={m.id} onClick={() => setMood(m.id)} className={clsx("flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition", mood === m.id ? "text-[#3a2d18]" : "border-white/15 bg-white/5 text-[#f4ecdd]/75 hover:bg-white/10")} style={mood === m.id ? { background: m.warna, borderColor: m.warna } : {}}>
                                    <Ic size={13} /> {m.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {err && (
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-[#f4a392]">
                      <TriangleAlert size={13} /> {err}
                    </p>
                  )}
                  <div className="mt-6 flex items-center justify-between">
                    <button onClick={back} disabled={step === 1} className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-[#f4ecdd]/80 transition enabled:hover:bg-white/10 disabled:opacity-30">
                      <ArrowLeft size={13} /> Kembali
                    </button>
                    {step < 5 ? (
                      <button onClick={next} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f2cc8f] to-[#e9a84a] px-5 py-2.5 text-xs font-black tracking-wide text-[#3a2d18] transition hover:scale-[1.03]">
                        LANJUT <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button onClick={submit} disabled={saving} className="pulse-glow flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#81b29a] to-[#5a8a6f] px-5 py-2.5 text-xs font-black tracking-wide text-white transition enabled:hover:scale-[1.03] disabled:opacity-40">
                        <Check size={14} /> {saving ? "MENYIMPAN…" : "SIMPAN & TITIPKAN"}
                      </button>
                    )}
                  </div>
                </div>

                {step === 3 && (
                  <div className="order-1 h-[42vh] min-h-[320px] lg:sticky lg:top-6 lg:h-[62vh]">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#f2cc8f]/20" style={{ background: "radial-gradient(circle at 50% 28%, #3a2c3a, #1d1620 80%)" }}>
                      <AvatarPreview config={avatarShown} />
                      <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-[#f2cc8f]/90 backdrop-blur">
                        Seret untuk memutar · cubit/scroll untuk zoom
                      </div>
                      {!isAdmin && (
                        <button
                          onClick={() => setAvatar(randomAvatar(gender, mode))}
                          className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-[10px] font-bold text-[#f4ecdd]/85 backdrop-blur transition hover:bg-black/70 hover:text-white"
                        >
                          <Shuffle size={12} /> Acak
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none fixed bottom-3 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-[#f4ecdd]/35">PPG Prajabatan 2026 · UKSW</div>
    </main>
  );
}
