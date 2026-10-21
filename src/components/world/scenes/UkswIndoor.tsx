"use client";

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import { GlowMarker } from "../primitives";
import { ClassDesks, Whiteboard, M, hash01, TrashBin, Planter } from "../props";
import { useInteractable } from "../player";
import { NARASI, randomAvatar, type UkswZoneId } from "@/lib/constants";

// ─── bahan bangunan dasar ───────────────────────────────────────────────────
function Room({
  w,
  d,
  h = 2.9,
  floor = "#d8cfbb",
  wall = "#efe7d4",
  openFront = true,
}: {
  w: number;
  d: number;
  h?: number;
  floor?: string;
  wall?: string;
  openFront?: boolean;
}) {
  return (
    <group>
      {/* lantai + pola ubin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={floor} roughness={0.85} />
      </mesh>
      {Array.from({ length: Math.floor(w / 2) }).map((_, i) => (
        <mesh key={`vx${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-w / 2 + (i + 1) * 2, 0.012, 0]}>
          <planeGeometry args={[0.04, d]} />
          <meshStandardMaterial color="#b9ae96" />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(d / 2) }).map((_, i) => (
        <mesh key={`vz${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -d / 2 + (i + 1) * 2]}>
          <planeGeometry args={[w, 0.04]} />
          <meshStandardMaterial color="#b9ae96" />
        </mesh>
      ))}
      {/* lampu gantung (plafon sengaja dibuka agar ruangan terlihat dari atas) */}
      {Array.from({ length: Math.max(1, Math.floor(w / 4)) }).map((_, i) => (
        <group key={i} position={[-w / 2 + (i + 0.5) * (w / Math.max(1, Math.floor(w / 4))), h - 0.08, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 0.08, 0.35]} />
            <meshStandardMaterial color="#fffdf2" emissive="#fff6d8" emissiveIntensity={1.4} />
          </mesh>
          <pointLight position={[0, -0.7, 0]} intensity={9} distance={13} color="#fff1d4" />
        </group>
      ))}
      {/* dinding belakang & samping */}
      <mesh position={[0, h / 2, -d / 2]}>
        <boxGeometry args={[w, h, 0.2]} />
        <meshStandardMaterial color={wall} roughness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * w) / 2, h / 2, 0]}>
          <boxGeometry args={[0.2, h, d]} />
          <meshStandardMaterial color={wall} roughness={1} />
        </mesh>
      ))}
      {!openFront && (
        <mesh position={[0, h / 2, d / 2]}>
          <boxGeometry args={[w, h, 0.2]} />
          <meshStandardMaterial color={wall} roughness={1} />
        </mesh>
      )}
      {/* lis dinding */}
      <mesh position={[0, 0.12, -d / 2 + 0.12]}>
        <boxGeometry args={[w, 0.24, 0.06]} />
        <meshStandardMaterial color="#b9ae96" />
      </mesh>
    </group>
  );
}

function Window({ position, ry = 0, w = 1.8, h = 1.5 }: { position: [number, number, number]; ry?: number; w?: number; h?: number }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh>
        <boxGeometry args={[w + 0.16, h + 0.16, 0.08]} />
        {M("#9a8f78")}
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#bfe0f2" emissive="#dff1ff" emissiveIntensity={0.55} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.05, h, 0.02]} />
        {M("#9a8f78")}
      </mesh>
    </group>
  );
}

/** Pintu yang bisa dimasuki — mendaftar sebagai objek interaktif */
function Door({
  id,
  position,
  ry = 0,
  label,
  onEnter,
  color = "#7a512f",
  plate,
}: {
  id: string;
  position: [number, number, number];
  ry?: number;
  label: string;
  onEnter: () => void;
  color?: string;
  plate?: string;
}) {
  useInteractable(id, position, label, onEnter, "portal");
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[1.35, 2.25, 0.16]} />
        {M("#8e7f68")}
      </mesh>
      <mesh
        position={[0, 1.05, 0.1]}
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
      >
        <boxGeometry args={[1.12, 2.1, 0.08]} />
        {M(color)}
      </mesh>
      <mesh position={[0.42, 1.02, 0.17]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial color="#e9c46a" metalness={0.7} roughness={0.3} />
      </mesh>
      {plate && (
        <Html position={[0, 2.5, 0.12]} center distanceFactor={11} zIndexRange={[12, 0]}>
          <div className="pointer-events-none select-none rounded border border-[#f2cc8f]/40 bg-[#2b2119]/90 px-2.5 py-1 text-[11px] font-black tracking-[0.2em] text-[#f2cc8f] shadow-lg">
            {plate}
          </div>
        </Html>
      )}
    </group>
  );
}

/** Tangga naik (interaktif) */
function Stairs({ id, position, ry = 0, label, onUse }: { id: string; position: [number, number, number]; ry?: number; label: string; onUse: () => void }) {
  useInteractable(id, position, label, onUse, "portal");
  return (
    <group position={position} rotation={[0, ry, 0]} onClick={(e) => { e.stopPropagation(); onUse(); }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, 0.14 + i * 0.26, -i * 0.42]}>
          <boxGeometry args={[2.6, 0.26, 0.44]} />
          {M(i % 2 ? "#cfc6b0" : "#c4baa2")}
        </mesh>
      ))}
      <mesh position={[1.4, 1.4, -1.7]}>
        <boxGeometry args={[0.08, 0.08, 4.4]} />
        {M("#8a5a2c")}
      </mesh>
      <mesh position={[-1.4, 1.4, -1.7]}>
        <boxGeometry args={[0.08, 0.08, 4.4]} />
        {M("#8a5a2c")}
      </mesh>
      <Html position={[0, 2.6, -1.6]} center distanceFactor={12} zIndexRange={[10, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-md border border-white/20 bg-[#2b2119]/85 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#f2cc8f]">
          ↑ {label}
        </div>
      </Html>
    </group>
  );
}

function BackBtn({ id, position, label, onBack }: { id: string; position: [number, number, number]; label: string; onBack: () => void }) {
  useInteractable(id, position, label, onBack, "portal");
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onBack(); }}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.5, 2.3, 0.12]} />
        {M("#6b4a2f")}
      </mesh>
      <Html position={[0, 2.6, 0.1]} center distanceFactor={11} zIndexRange={[10, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-md border border-[#81b29a]/40 bg-[#1e2a22]/90 px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#9fd4a8]">
          ← {label}
        </div>
      </Html>
    </group>
  );
}

// ─── penempatan orang di dalam ruangan ──────────────────────────────────────
function useIndoorPeople(key: string, spots: [number, number, number][], max = 6) {
  const world = useStore((s) => s.world);
  return useMemo(() => {
    const pool = (world?.users ?? []).filter((u) => u.avatar);
    const picked = pool.filter((u) => Math.floor(hash01(u.id, 97) * 9) === Math.abs(key.length * 3) % 9).slice(0, max);
    const fallback = picked.length ? picked : pool.filter((u) => hash01(u.id, key.length + 41) > 0.84).slice(0, max);
    return fallback.map((u, i) => ({ u, pos: spots[i % spots.length], ry: hash01(u.id, 13) * 6.28 }));
  }, [world?.users, key, spots, max]);
}

function PersonWithLetter({ u, pos, ry }: { u: { id: string; panggilan: string; peran: string; avatar: unknown }; pos: [number, number, number]; ry: number }) {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const uc = world?.ucapan.find((x) => x.penulis.id === u.id);
  useInteractable(`p-${u.id}`, [pos[0], pos[1] + 1, pos[2]], `Surat ${u.panggilan}`, () => uc && openUcapan(uc.id), "orang", !!uc);
  return (
    <Avatar3D
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config={u.avatar as any}
      position={pos}
      rotationY={ry}
      nameTag={u.panggilan}
      role={u.peran}
      isSelf={u.id === session?.id}
      phase={hash01(u.id) * 9}
      onClick={uc ? () => openUcapan(uc.id) : undefined}
    />
  );
}

// ═══════════════ LORONG GEDUNG E ═══════════════
export function EBuildingCorridor() {
  const goScene = useStore((s) => s.goScene);
  const setNarasi = useStore((s) => s.setNarasi);
  const go = (sub: string, label: string) => goScene("uksw", { school: sub, label, warna: "#8ecae6" });
  const people = useIndoorPeople("lorong", [
    [-12, 0, 1.6], [-5, 0, -1.4], [3.5, 0, 1.8], [11, 0, -1.2], [15, 0, 1.4], [-17, 0, -1],
  ]);

  return (
    <group>
      <Room w={42} d={8} h={3.6} floor="#ded5c0" wall="#f3ecda" />
      {/* jendela sepanjang sisi kanan */}
      {[-16, -11, -6, -1, 4, 9, 14].map((x) => (
        <Window key={x} position={[x, 1.75, 3.88]} w={2.6} h={1.7} />
      ))}
      {/* 4 pintu ruang kelas di sisi kiri */}
      {([
        ["e102", "E102", -15],
        ["e105", "E105", -6],
        ["e107", "E107", 3],
        ["e108", "E108", 12],
      ] as [UkswZoneId, string, number][]).map(([id, lbl, x]) => (
        <Door
          key={id}
          id={`door-${id}`}
          position={[x, 0, -3.9]}
          label={`Masuk Ruang ${lbl}`}
          plate={lbl}
          onEnter={() => go(`uksw:${id}`, `Ruang ${lbl}`)}
        />
      ))}
      {/* narasi tiap ruang */}
      {([
        ["e102", -15], ["e105", -6], ["e107", 3], ["e108", 12],
      ] as [UkswZoneId, number][]).map(([id, x]) => (
        <GlowMarker
          key={`n${id}`}
          id={`nr-${id}`}
          position={[x + 2.6, 1.5, -2.6]}
          color="#8ecae6"
          isLetter={false}
          label={`Kenangan ${id.toUpperCase()}`}
          onClick={() => setNarasi({ title: `Ruang ${id.toUpperCase()}`, text: NARASI[id] })}
        />
      ))}
      {/* tangga ke aula seminar di ujung kanan */}
      <Stairs id="stairs-seminar" position={[18.4, 0, -1]} ry={-Math.PI / 2} label="Naik ke Aula Seminar Lt.2" onUse={() => go("uksw:seminar", "Aula Seminar Lt.2")} />
      {/* keluar */}
      <BackBtn id="back-e" position={[-18.6, 0, 2]} label="Keluar ke Halaman" onBack={() => goScene("uksw", { label: "Kampus UKSW" })} />

      {/* detail lorong */}
      {[-18, -9, 0, 9, 17].map((x) => (
        <group key={`b${x}`} position={[x, 0, 3.1]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.8, 0.1, 0.45]} />
            {M("#a9763f")}
          </mesh>
          {[-0.7, 0.7].map((o) => (
            <mesh key={o} position={[o, 0.22, 0]}>
              <boxGeometry args={[0.1, 0.44, 0.4]} />
              {M("#6b5a45")}
            </mesh>
          ))}
        </group>
      ))}
      {[-13, 7].map((x) => (
        <TrashBin key={x} position={[x, 0, 2.9]} />
      ))}
      {[-19, 16].map((x) => (
        <Planter key={x} position={[x, 0, 2.6]} c="#4a7a8c" />
      ))}
      {/* mading */}
      {[-10, 1, 10].map((x, i) => (
        <group key={x} position={[x, 2, -3.95]}>
          <mesh>
            <boxGeometry args={[2.4, 1.5, 0.08]} />
            {M(["#2f5244", "#7a1f2b", "#2f4b7a"][i])}
          </mesh>
          <Html position={[0, 0, 0.06]} center distanceFactor={11} zIndexRange={[8, 0]}>
            <div className="pointer-events-none w-[120px] select-none text-center text-[9px] font-bold leading-tight text-[#ffe9b0]">
              {["JADWAL MICROTEACHING", "PENGUMUMAN PPG 2026", "GALERI ANGKATAN"][i]}
            </div>
          </Html>
        </group>
      ))}
      <Html position={[0, 3.1, -3.8]} center distanceFactor={16} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none rounded-lg bg-[#2b2119]/80 px-3 py-1 text-[11px] font-black tracking-[0.3em] text-[#f2cc8f]">
          GEDUNG E · LANTAI 1
        </div>
      </Html>

      {people.map((p) => (
        <PersonWithLetter key={p.u.id} u={p.u} pos={p.pos} ry={p.ry} />
      ))}
    </group>
  );
}

// ═══════════════ RUANG KELAS ═══════════════
const KELAS_CFG: Record<string, { judul: string; papan: string[]; layout: "berjejer" | "melingkar" | "podium" | "kosong" }> = {
  e102: { judul: "E102", papan: ["∫ x² dx = x³/3 + C", "lim (1+1/x)ˣ = e", "π = 3,14159…"], layout: "berjejer" },
  e105: { judul: "E105", papan: ["Diskusi Kelompok", "Modul 3 · Asesmen"], layout: "melingkar" },
  e107: { judul: "E107", papan: ["Microteaching", "Hari ini: Trigonometri"], layout: "podium" },
  e108: { judul: "E108", papan: ["E108", "— ruang yang kini sunyi —"], layout: "kosong" },
};

export function ClassroomInterior({ room }: { room: string }) {
  const goScene = useStore((s) => s.goScene);
  const setNarasi = useStore((s) => s.setNarasi);
  const cfg = KELAS_CFG[room] ?? KELAS_CFG.e102;
  const people = useIndoorPeople(room, [
    [-3.6, 0, 1.4], [3.4, 0, 0.6], [-1.6, 0, -2.6], [4.4, 0, 4], [-4.6, 0, 4.4],
  ], cfg.layout === "kosong" ? 1 : 4);

  return (
    <group>
      <Room w={13} d={14} h={3.5} floor="#d9d0ba" wall={cfg.layout === "kosong" ? "#e6dcc6" : "#f3ecda"} />
      <Whiteboard position={[0, 0, -6.3]} lines={cfg.papan} hijau={cfg.layout !== "melingkar"} />
      {[-4.5, 0, 4.5].map((x) => (
        <Window key={x} position={[6.38, 1.8, x]} ry={-Math.PI / 2} w={2.6} h={1.7} />
      ))}

      {/* meja guru */}
      <group position={[-4, 0, -4.8]}>
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[1.9, 0.1, 0.9]} />
          {M("#a9763f")}
        </mesh>
        {[-0.85, 0.85].map((x) => (
          <mesh key={x} position={[x, 0.36, 0]}>
            <boxGeometry args={[0.12, 0.72, 0.8]} />
            {M("#7b5430")}
          </mesh>
        ))}
        <mesh position={[0.5, 0.82, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.4]} />
          {M("#f4f1de")}
        </mesh>
      </group>

      {/* tata letak bangku sesuai ruangan */}
      {cfg.layout === "berjejer" && <ClassDesks position={[0, 0, -1.6]} rows={3} cols={4} />}
      {cfg.layout === "melingkar" &&
        Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * 3, 0, Math.sin(a) * 3 + 1]} rotation={[0, -a + Math.PI / 2, 0]}>
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[1, 0.08, 0.55]} />
                {M("#c99a5b")}
              </mesh>
              <mesh position={[0, 0.3, 0.5]}>
                <boxGeometry args={[0.5, 0.06, 0.45]} />
                {M("#9a6b3f")}
              </mesh>
              <mesh position={[0, 0.58, 0.72]}>
                <boxGeometry args={[0.5, 0.5, 0.06]} />
                {M("#9a6b3f")}
              </mesh>
            </group>
          );
        })}
      {cfg.layout === "podium" && (
        <>
          <ClassDesks position={[0, 0, 0.6]} rows={2} cols={4} />
          <group position={[3.4, 0, -4.6]}>
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[0.9, 1.1, 0.6]} />
              {M("#8a5a2c")}
            </mesh>
            <mesh position={[0, 1.14, 0.08]} rotation={[-0.35, 0, 0]}>
              <boxGeometry args={[0.95, 0.07, 0.5]} />
              {M("#a9763f")}
            </mesh>
          </group>
          {/* tripod kamera */}
          <group position={[1, 0, 3.4]}>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[0.3, 0.2, 0.26]} />
              {M("#26232e")}
            </mesh>
            {[0, 1, 2].map((i) => {
              const a = (i / 3) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.22, 0.6, Math.sin(a) * 0.22]} rotation={[Math.cos(a) * 0.25, 0, Math.sin(a) * -0.25]}>
                  <cylinderGeometry args={[0.025, 0.025, 1.25, 4]} />
                  {M("#57504a")}
                </mesh>
              );
            })}
          </group>
        </>
      )}
      {cfg.layout === "kosong" && (
        <>
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.48, 0]}>
              <boxGeometry args={[0.6, 0.08, 0.55]} />
              {M("#9a6b3f")}
            </mesh>
            <mesh position={[0, 0.8, -0.26]}>
              <boxGeometry args={[0.6, 0.62, 0.08]} />
              {M("#9a6b3f")}
            </mesh>
            {[-0.24, 0.24].map((x) =>
              [-0.2, 0.2].map((z) => (
                <mesh key={`${x}${z}`} position={[x, 0.22, z]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.44, 4]} />
                  {M("#6b4a2f")}
                </mesh>
              ))
            )}
          </group>
          <GlowMarker
            id="kelas-sunyi"
            position={[0, 1.6, 2.2]}
            color="#f2cc8f"
            isLetter={false}
            label="Duduk sejenak di sini"
            onClick={() => setNarasi({ title: "Ruang E108", text: NARASI.e108 })}
          />
        </>
      )}

      <GlowMarker
        id={`nar-${room}`}
        position={[-4.6, 1.6, -2.4]}
        color="#8ecae6"
        isLetter={false}
        label={`Kenangan ${cfg.judul}`}
        onClick={() => setNarasi({ title: `Ruang ${cfg.judul}`, text: NARASI[room] ?? "" })}
      />
      <BackBtn id="back-kelas" position={[0, 0, 6.9]} label="Kembali ke Lorong" onBack={() => goScene("uksw", { school: "uksw:e-lorong", label: "Lorong Gedung E" })} />
      <Html position={[0, 3.1, -6.2]} center distanceFactor={15} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none rounded-lg bg-[#2b2119]/80 px-3 py-1 text-[11px] font-black tracking-[0.3em] text-[#f2cc8f]">
          RUANG {cfg.judul}
        </div>
      </Html>
      {people.map((p) => (
        <PersonWithLetter key={p.u.id} u={p.u} pos={p.pos} ry={p.ry} />
      ))}
    </group>
  );
}

// ═══════════════ AULA SEMINAR (Lt.2) ═══════════════
export function SeminarHall() {
  const goScene = useStore((s) => s.goScene);
  const setNarasi = useStore((s) => s.setNarasi);
  const people = useIndoorPeople("seminar", [
    [-6, 0, 2], [5.5, 0, 1], [-2.5, 0, 6], [7, 0, 6.5], [-7.5, 0, 7], [1.5, 0, -3],
  ], 6);

  return (
    <group>
      <Room w={23} d={24} h={5.2} floor="#cdc3ad" wall="#efe3c8" />
      {/* panggung */}
      <group position={[0, 0, -8.5]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[14, 0.6, 5]} />
          {M("#8a5a2c")}
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[14.2, 0.06, 5.2]} />
          {M("#a9763f")}
        </mesh>
        {/* podium */}
        <group position={[-4, 0.6, 1.2]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1, 1.1, 0.65]} />
            {M("#7b5430")}
          </mesh>
          <mesh position={[0, 1.16, 0.08]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[1.05, 0.07, 0.55]} />
            {M("#a9763f")}
          </mesh>
        </group>
        {/* layar proyektor */}
        <mesh position={[2, 2.6, -2.3]}>
          <boxGeometry args={[7, 3.6, 0.12]} />
          <meshStandardMaterial color="#f8f6ee" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
        <Html position={[2, 2.6, -2.2]} center distanceFactor={18} zIndexRange={[8, 0]}>
          <div className="pointer-events-none w-[280px] select-none text-center">
            <div className="text-[13px] font-black leading-tight text-[#7a1f2b]">SEMINAR PROPOSAL</div>
            <div className="text-[11px] font-bold text-[#7a1f2b]/80">PROYEK KEPEMIMPINAN</div>
            <div className="mt-1 text-[8px] tracking-[0.2em] text-[#3d405b]">PPG PRAJABATAN 2026 · MATEMATIKA UKSW</div>
          </div>
        </Html>
      </group>
      {/* banner dinding */}
      <mesh position={[0, 4.3, -11.8]}>
        <boxGeometry args={[18, 1.2, 0.08]} />
        {M("#7a1f2b")}
      </mesh>
      <Html position={[0, 4.3, -11.7]} center distanceFactor={20} zIndexRange={[8, 0]}>
        <div className="pointer-events-none w-[340px] select-none text-center text-[11px] font-black tracking-widest text-[#ffe9b0]">
          SEMINAR PROPOSAL PROYEK KEPEMIMPINAN — PPG PRAJABATAN 2026
        </div>
      </Html>
      {/* kursi penonton berbaris */}
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) => (
          <group key={`${r}${c}`} position={[-8.1 + c * 1.8, 0, -3.5 + r * 2.1]}>
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.72, 0.08, 0.62]} />
              {M("#9b3b45")}
            </mesh>
            <mesh position={[0, 0.76, -0.3]}>
              <boxGeometry args={[0.72, 0.6, 0.08]} />
              {M("#b2444f")}
            </mesh>
            {[-0.28, 0.28].map((x) => (
              <mesh key={x} position={[x, 0.2, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.4, 5]} />
                {M("#4c4a45")}
              </mesh>
            ))}
          </group>
        ))
      )}
      {[-7, 0, 7].map((x) => (
        <Window key={x} position={[x, 2.6, 11.88]} w={3} h={2.2} />
      ))}
      <GlowMarker id="nar-aula" position={[-8.5, 1.6, -5]} color="#f2cc8f" isLetter={false} label="Kenangan Aula" onClick={() => setNarasi({ title: "Aula Seminar Lt.2", text: NARASI.aula })} />
      <BackBtn id="back-seminar" position={[9.5, 0, 11.4]} label="Turun ke Lorong" onBack={() => goScene("uksw", { school: "uksw:e-lorong", label: "Lorong Gedung E" })} />
      {people.map((p) => (
        <PersonWithLetter key={p.u.id} u={p.u} pos={p.pos} ry={p.ry} />
      ))}
    </group>
  );
}

// ═══════════════ PERPUSTAKAAN LANTAI DASAR + LIFT ═══════════════
export function LibraryGround() {
  const goScene = useStore((s) => s.goScene);
  const addToast = useStore((s) => s.addToast);
  const people = useIndoorPeople("perpus", [[-6, 0, 2], [6, 0, 3], [-3, 0, -4], [7.5, 0, -3]], 4);

  const naikLift = () => {
    addToast("Lift bergerak…", "Lantai 1 → 7 · ding!");
    window.setTimeout(() => goScene("uksw", { school: "uksw:lt7", label: "Perpustakaan Lantai 7", warna: "#8ecae6" }), 700);
  };
  useInteractable("lift-up", [8.5, 1, -7], "Naik Lift ke Lantai 7", naikLift, "portal");

  return (
    <group>
      <Room w={23} d={21} h={4.2} floor="#d6cdb8" wall="#e9f0f6" />
      {/* rak buku */}
      {[-8, -4, 0, 4].map((x) => (
        <group key={x} position={[x, 0, -3]}>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[1, 2.2, 5]} />
            {M("#8a5a2c")}
          </mesh>
          {[0.5, 1.1, 1.7].map((y) =>
            Array.from({ length: 9 }).map((_, i) => (
              <mesh key={`${y}${i}`} position={[0.52, y, -2.1 + i * 0.52]}>
                <boxGeometry args={[0.1, 0.42, 0.4]} />
                {M(["#c75146", "#3d6fb4", "#4f772d", "#e9a84a", "#8a6fb0"][i % 5])}
              </mesh>
            ))
          )}
        </group>
      ))}
      {/* meja baca */}
      {[[-6, 5], [2, 5.5], [8, 4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.74, 0]}>
            <boxGeometry args={[3.2, 0.1, 1.5]} />
            {M("#b98a4f")}
          </mesh>
          {[-1.4, 1.4].map((o) => (
            <mesh key={o} position={[o, 0.37, 0]}>
              <boxGeometry args={[0.12, 0.74, 1.3]} />
              {M("#7b5430")}
            </mesh>
          ))}
          <mesh position={[0.7, 0.84, 0.2]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.32, 0.06, 0.42]} />
            {M("#f4f1de")}
          </mesh>
        </group>
      ))}
      {/* meja sirkulasi */}
      <group position={[-8.5, 0, 7]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[4.4, 1.1, 1]} />
          {M("#6b4a2f")}
        </mesh>
        <Html position={[0, 1.5, 0]} center distanceFactor={13} zIndexRange={[8, 0]}>
          <div className="pointer-events-none select-none rounded bg-[#2b2119]/85 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#f2cc8f]">
            SIRKULASI
          </div>
        </Html>
      </group>
      {[-6, 0, 6].map((x) => (
        <Window key={x} position={[x, 2.1, 10.38]} w={3} h={2.1} />
      ))}

      {/* ── LIFT ── */}
      <group position={[8.5, 0, -9.3]}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[3.4, 3.2, 0.4]} />
          {M("#8fa3b8")}
        </mesh>
        {[-0.78, 0.78].map((x) => (
          <mesh key={x} position={[x, 1.3, 0.24]}>
            <boxGeometry args={[1.45, 2.5, 0.08]} />
            <meshStandardMaterial color="#cfe0ee" metalness={0.65} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 3.35, 0.2]}>
          <boxGeometry args={[1.4, 0.4, 0.1]} />
          {M("#1d2730")}
        </mesh>
        <Html position={[0, 3.35, 0.27]} center distanceFactor={12} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none rounded bg-black/70 px-2 py-0.5 text-[11px] font-black tracking-[0.3em] text-[#7ee08a]">
            ▲ 1
          </div>
        </Html>
        {/* panel tombol */}
        <mesh position={[1.95, 1.3, 0.24]} onClick={(e) => { e.stopPropagation(); naikLift(); }}>
          <boxGeometry args={[0.5, 0.9, 0.1]} />
          {M("#3c4a56")}
        </mesh>
        <mesh position={[1.95, 1.5, 0.31]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 10]} />
          <meshStandardMaterial color="#f2cc8f" emissive="#f2cc8f" emissiveIntensity={1} />
        </mesh>
      </group>
      <GlowMarker id="lift-mk" position={[8.5, 1.7, -7.2]} color="#8ecae6" isLetter={false} label="Tekan tombol lift ▲" onClick={naikLift} />

      <BackBtn id="back-perpus" position={[-9.5, 0, 10.4]} label="Keluar Perpustakaan" onBack={() => goScene("uksw", { label: "Kampus UKSW" })} />
      <Html position={[0, 3.6, -10.3]} center distanceFactor={17} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none rounded-lg bg-[#2f4b7a]/85 px-3 py-1 text-[11px] font-black tracking-[0.3em] text-[#e3f0ff]">
          PERPUSTAKAAN UKSW · LANTAI 1
        </div>
      </Html>
      {people.map((p) => (
        <PersonWithLetter key={p.u.id} u={p.u} pos={p.pos} ry={p.ry} />
      ))}
    </group>
  );
}

// ═══════════════ LANTAI 7: LORONG KECIL + RUANGAN ═══════════════
const LT7_ROOMS = [
  { id: "lt7-r1", nama: "R-701", judul: "Ruang Diskusi Biru", warna: "#5f8ac7" },
  { id: "lt7-r2", nama: "R-702", judul: "Ruang Baca Panorama", warna: "#4a7a8c" },
  { id: "lt7-r3", nama: "R-703", judul: "Ruang Arsip Angkatan", warna: "#6b7f9b" },
];

export function LibraryFloor7() {
  const goScene = useStore((s) => s.goScene);
  const setNarasi = useStore((s) => s.setNarasi);
  const addToast = useStore((s) => s.addToast);
  const people = useIndoorPeople("lt7", [[-9, 0, 1.4], [-2, 0, -1.2], [6, 0, 1.5], [12, 0, -1]], 4);

  const turun = () => {
    addToast("Lift turun…", "Lantai 7 → 1");
    window.setTimeout(() => goScene("uksw", { school: "uksw:perpus", label: "Perpustakaan Lantai 1", warna: "#8ecae6" }), 700);
  };
  useInteractable("lift-down", [-14, 1, 0], "Turun ke Lantai 1", turun, "portal");

  return (
    <group>
      <Room w={32} d={7} h={3.2} floor="#e4ecf2" wall="#dbe8f3" />
      {/* jendela panorama sepanjang lorong */}
      {[-11, -6, -1, 4, 9, 13].map((x) => (
        <Window key={x} position={[x, 1.7, 3.38]} w={3} h={1.9} />
      ))}
      <Html position={[0, 2.75, 3.2]} center distanceFactor={15} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none rounded bg-[#2f4b7a]/75 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.25em] text-[#dff1ff]">
          PANORAMA MERAPI – MERBABU
        </div>
      </Html>

      {/* 3 pintu ruangan kecil */}
      {LT7_ROOMS.map((r, i) => (
        <Door
          key={r.id}
          id={`door-${r.id}`}
          position={[-9 + i * 9, 0, -3.4]}
          label={`Masuk ${r.judul}`}
          plate={r.nama}
          color="#2f4b7a"
          onEnter={() => goScene("uksw", { school: `uksw:${r.id}`, label: r.judul, warna: r.warna })}
        />
      ))}

      {/* lift */}
      <group position={[-15.3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[3.2, 3, 0.3]} />
          {M("#8fa3b8")}
        </mesh>
        {[-0.75, 0.75].map((x) => (
          <mesh key={x} position={[x, 1.25, 0.2]}>
            <boxGeometry args={[1.4, 2.4, 0.06]} />
            <meshStandardMaterial color="#cfe0ee" metalness={0.6} roughness={0.25} />
          </mesh>
        ))}
        <Html position={[0, 3.05, 0.2]} center distanceFactor={12} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none rounded bg-black/70 px-2 py-0.5 text-[11px] font-black tracking-[0.3em] text-[#7ee08a]">
            ▼ 7
          </div>
        </Html>
      </group>
      <GlowMarker id="lt7-turun" position={[-13.4, 1.6, 1.4]} color="#8ecae6" isLetter={false} label="Tekan tombol lift ▼" onClick={turun} />
      <GlowMarker
        id="lt7-nar"
        position={[2, 1.6, 1.8]}
        color="#8ecae6"
        isLetter={false}
        label="Kenangan Lantai 7"
        onClick={() => setNarasi({ title: "Perpustakaan Lantai 7", text: NARASI.perpus })}
      />
      {/* detail lorong */}
      {[-12, -4, 5, 12].map((x) => (
        <Planter key={x} position={[x, 0, 2.3]} c="#4a7a8c" />
      ))}
      {[-7, 8].map((x) => (
        <group key={x} position={[x, 0, 2.5]}>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[1.6, 0.09, 0.45]} />
            {M("#9fb4c6")}
          </mesh>
          {[-0.6, 0.6].map((o) => (
            <mesh key={o} position={[o, 0.21, 0]}>
              <boxGeometry args={[0.09, 0.42, 0.4]} />
              {M("#6d7f8e")}
            </mesh>
          ))}
        </group>
      ))}
      <Html position={[0, 2.9, -3.3]} center distanceFactor={15} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none rounded-lg bg-[#2f4b7a]/85 px-3 py-1 text-[11px] font-black tracking-[0.3em] text-[#e3f0ff]">
          LANTAI 7 · LORONG BIRU-PUTIH
        </div>
      </Html>
      {people.map((p) => (
        <PersonWithLetter key={p.u.id} u={p.u} pos={p.pos} ry={p.ry} />
      ))}
    </group>
  );
}

// ═══════════════ RUANGAN KECIL LANTAI 7 ═══════════════
export function Floor7Room({ room }: { room: string }) {
  const goScene = useStore((s) => s.goScene);
  const meta = LT7_ROOMS.find((r) => r.id === room) ?? LT7_ROOMS[0];
  const people = useIndoorPeople(room, [[-2.2, 0, 0.5], [2.4, 0, -0.5], [0, 0, -2.4]], 3);

  return (
    <group>
      <Room w={9} d={9} h={3} floor="#eef3f8" wall="#d4e6f5" />
      {/* jendela besar menghadap gunung */}
      <Window position={[0, 1.65, -4.38]} w={5} h={2} />
      <Html position={[0, 2.85, -4.2]} center distanceFactor={13} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none rounded bg-[#2f4b7a]/80 px-2.5 py-0.5 text-[10px] font-black tracking-[0.25em] text-[#e3f0ff]">
          {meta.nama} · {meta.judul.toUpperCase()}
        </div>
      </Html>
      {/* meja bundar + kursi */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.1, 16]} />
        {M("#b98a4f")}
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.22, 0.42, 0.72, 8]} />
        {M("#7b5430")}
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.55, 0.08, 0.5]} />
              {M(meta.warna)}
            </mesh>
            <mesh position={[0, 0.74, -0.24]}>
              <boxGeometry args={[0.55, 0.56, 0.07]} />
              {M(meta.warna)}
            </mesh>
          </group>
        );
      })}
      {/* rak + papan inspiratif */}
      <mesh position={[-4.1, 1, 1.5]}>
        <boxGeometry args={[0.6, 2, 3]} />
        {M("#8a5a2c")}
      </mesh>
      {[0.55, 1.15, 1.75].map((y) =>
        Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`${y}${i}`} position={[-3.78, y, 0.4 + i * 0.5]}>
            <boxGeometry args={[0.1, 0.4, 0.38]} />
            {M(["#c75146", "#3d6fb4", "#4f772d", "#e9a84a", "#8a6fb0"][i % 5])}
          </mesh>
        ))
      )}
      <mesh position={[4.38, 1.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[3.2, 1.9, 0.08]} />
        {M("#f6f1e4")}
      </mesh>
      <Html position={[4.3, 1.8, 0]} center distanceFactor={13} zIndexRange={[8, 0]}>
        <div className="pointer-events-none w-[150px] select-none text-center">
          <div className="font-hand text-[15px] leading-tight text-[#2f4b7a]">
            “Matematika adalah bahasa dengan mana Tuhan menulis alam semesta.”
          </div>
          <div className="mt-1 text-[8px] font-bold tracking-[0.2em] text-[#2f4b7a]/70">— GALILEO GALILEI</div>
        </div>
      </Html>
      <BackBtn id="back-lt7" position={[0, 0, 4.4]} label="Kembali ke Lorong Lt.7" onBack={() => goScene("uksw", { school: "uksw:lt7", label: "Lorong Lantai 7" })} />
      {people.map((p) => (
        <PersonWithLetter key={p.u.id} u={p.u} pos={p.pos} ry={p.ry} />
      ))}
    </group>
  );
}
