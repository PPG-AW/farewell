"use client";

import { useMemo } from "react";
import { Html, Sparkles } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import {
  Ground, Building, GateArch, FlagPole, Tree, LampPost, GlowMarker, ZoneChip,
  PortalRing, Mountain, Cloud, Gazebo, Bench, Pine,
} from "../primitives";
import {
  Motorbike, Bike, FoodStall, Canopy, BasketCourt, VolleyNet, FlowerBed, Bush, Hedge, Fence,
  PicnicTable, TrashBin, Banner, BuntingLine, ClassDesks, Whiteboard, Steps, PathLight,
  Planter, Pond, Scoreboard, Statue, scatterSpots, hash01, M,
} from "../props";
import { WalkerNPC } from "../player";
import { SEKOLAH_LIST, randomAvatar } from "@/lib/constants";

type SchoolMeta = (typeof SEKOLAH_LIST)[number];

// ═══════════════ PERSIMPANGAN ═══════════════
function Signboard({ s, pos, ry, onClick }: { s: SchoolMeta; pos: [number, number, number]; ry: number; onClick: () => void }) {
  return (
    <group position={pos} rotation={[0, ry, 0]}>
      {[-1.7, 1.7].map((x) => (
        <mesh key={x} position={[x, 1.3, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 2.6, 5]} />
          {M("#5c4033")}
        </mesh>
      ))}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[4.2, 1.5, 0.2]} />
        <meshStandardMaterial color={s.warna} emissive={s.warna} emissiveIntensity={0.25} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 3.35, 0]}>
        <boxGeometry args={[4.5, 0.18, 0.34]} />
        {M(s.secondary)}
      </mesh>
      <Html position={[0, 2.4, 0.14]} center distanceFactor={13} zIndexRange={[18, 0]}>
        <div className="pointer-events-none select-none text-center">
          <div className="text-[16px] font-black tracking-wider" style={{ color: s.secondary, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {s.singkat}
          </div>
          <div className="mt-0.5 whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-white/90">{s.ciri.split(",")[0]}</div>
        </div>
      </Html>
      <GlowMarker id={`sign-${s.id}`} position={[0, 1, 1.4]} color={s.secondary} label={`Masuk ${s.singkat}`} isLetter={false} onClick={onClick} />
    </group>
  );
}

export function PplPlazaScene() {
  const goScene = useStore((s) => s.goScene);
  const world = useStore((s) => s.world);

  const signPos = useMemo(
    () =>
      SEKOLAH_LIST.map((s, i) => {
        const a = ((i - 2) / 5.4) * Math.PI;
        return { s, pos: [Math.sin(a) * 16, 0, -Math.cos(a) * 16 - 1] as [number, number, number], ry: -a };
      }),
    []
  );

  const jumlahPerSekolah = useMemo(() => {
    const m = new Map<string, number>();
    (world?.users ?? []).forEach((u) => {
      if (u.sekolahPpl) m.set(u.sekolahPpl, (m.get(u.sekolahPpl) ?? 0) + 1);
    });
    return m;
  }, [world?.users]);

  const walkers = useMemo(
    () => [
      { cfg: randomAvatar("P"), path: [[-12, 8], [0, 6], [12, 8]] as [number, number][], speed: 1.4, off: 0 },
      { cfg: randomAvatar("L"), path: [[10, 14], [-10, 14], [-10, 4], [10, 4]] as [number, number][], speed: 1.7, off: 6 },
      { cfg: randomAvatar("P"), path: [[0, 16], [0, 2]] as [number, number][], speed: 1.2, off: 11 },
    ],
    []
  );

  return (
    <group>
      <Ground size={120} color="#8aa05a" />
      <ZoneChip position={[0, 9, -4]} title="AREA PPL" sub="Persimpangan Salatiga · pilih sekolahmu" color="#81b29a" />

      {/* jalan silang beraspal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[5.5, 40]} />
        <meshStandardMaterial color="#86807a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 6]}>
        <planeGeometry args={[36, 5.5]} />
        <meshStandardMaterial color="#86807a" roughness={1} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 18 - i * 4]}>
          <planeGeometry args={[0.28, 1.6]} />
          <meshStandardMaterial color="#efe8d8" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, -2]}>
        <circleGeometry args={[4.2, 30]} />
        <meshStandardMaterial color="#a79c86" roughness={1} />
      </mesh>

      {/* tugu bundaran */}
      <group position={[0, 0, -2]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[1.5, 1.7, 0.7, 10]} />
          {M("#cfc6b0")}
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.32, 0.5, 2.1, 8]} />
          {M("#efe6c8")}
        </mesh>
        <mesh position={[0, 3, 0]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#81b29a" emissive="#81b29a" emissiveIntensity={0.6} flatShading />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <FlowerBed key={i} position={[Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6]} s={0.5} />;
        })}
      </group>

      {signPos.map(({ s, pos, ry }) => (
        <group key={s.id}>
          <Signboard s={s} pos={pos} ry={ry} onClick={() => goScene("ppl", { school: s.id, label: `${s.id} — Sekolah PPL`, warna: s.warna })} />
          {/* gedung sekolah di kejauhan + papan jumlah teman */}
          <Building
            position={[pos[0] * 1.5, 0, pos[2] * 1.5 - 4]}
            size={[8, 4 + (SEKOLAH_LIST.indexOf(s) % 3) * 1.6, 5]}
            color={s.secondary}
            roof={s.warna}
            floors={2}
          />
          <Html position={[pos[0] * 1.5, 7.2, pos[2] * 1.5 - 4]} center distanceFactor={16} zIndexRange={[8, 0]}>
            <div className="pointer-events-none select-none whitespace-nowrap rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-bold text-[#f4ecdd] backdrop-blur-sm">
              {jumlahPerSekolah.get(s.id) ?? 0} teman di sini
            </div>
          </Html>
        </group>
      ))}

      {/* suasana jalan: warung, halte, kendaraan */}
      <FoodStall position={[-9, 0, 9]} ry={0.6} label="Warung Bu Yati" color="#e9a84a" />
      <FoodStall position={[9, 0, 10]} ry={-0.6} label="Bakso Pak Slamet" color="#c25b4a" />
      <Canopy position={[-5.5, 0, 14]} size={[4, 2.6]} color="#3d6fb4" ry={0} />
      <Bench position={[-5.5, 0, 14]} ry={Math.PI} />
      <Bench position={[5.5, 0, 14]} ry={Math.PI} />
      {[0, 1, 2, 3].map((i) => (
        <Motorbike key={i} position={[-3.6 - (i % 2) * 1.4, 0, 11 + Math.floor(i / 2) * 2]} ry={1.5} warna={["#c75146", "#3d6fb4", "#f2a93b", "#4f772d"][i]} />
      ))}
      {[0, 1, 2].map((i) => (
        <Bike key={i} position={[4 + i * 1.3, 0, 12]} ry={1.5} c={["#e07a5f", "#81b29a", "#8ecae6"][i]} />
      ))}
      <Banner position={[-13, 0, 14]} ry={0.5} title="SELAMAT DATANG DI SALATIGA" sub="Kota Toleransi" color="#2f5244" />
      <Banner position={[13, 0, 15]} ry={-0.5} title="HATI-HATI DI JALAN" sub="Semangat PPL!" color="#7a1f2b" />

      {/* alam */}
      {Array.from({ length: 22 }).map((_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const r = 26 + hash01(`pr${i}`) * 8;
        return <Tree key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} s={1 + hash01(`ps${i}`) * 0.7} tone={i % 2 ? "#6a994e" : "#4f772d"} />;
      })}
      {Array.from({ length: 18 }).map((_, i) => (
        <Bush key={i} position={[(hash01(`pbx${i}`) - 0.5) * 44, 0, (hash01(`pbz${i}`) - 0.5) * 42]} s={0.8 + hash01(`pbs${i}`) * 0.5} />
      ))}
      {[[-3.4, 8], [3.4, 8], [-3.4, 16], [3.4, 16]].map(([x, z], i) => (
        <LampPost key={i} position={[x, 0, z]} color="#ffd9a0" />
      ))}
      {[[-6, 6], [6, 6]].map(([x, z], i) => (
        <TrashBin key={i} position={[x, 0, z]} />
      ))}
      {walkers.map((w, i) => (
        <WalkerNPC key={i} config={w.cfg} path={w.path} speed={w.speed} offset={w.off} />
      ))}

      <Mountain position={[-44, -2, -60]} s={1.6} color="#5b5e7c" snow smoke />
      <Mountain position={[40, -2.4, -64]} s={1.4} color="#45604e" />
      <Cloud position={[-20, 13, -32]} s={2} opacity={0.5} />
      <Cloud position={[18, 14.5, -28]} s={1.6} opacity={0.45} speed={0.06} />
      <PortalRing position={[0, 0, 17]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={18} scale={18} size={1.4} speed={0.25} position={[0, 2.5, -4]} color="#ffdda1" />
    </group>
  );
}

// ═══════════════ SCENE PER SEKOLAH ═══════════════
const SPOTS: [number, number, number][] = [
  [-7, 0, 6], [6.5, 0, 7], [-12, 0, 1], [12, 0, 2], [-4, 0, -4], [4.5, 0, -3],
  [-15, 0, 9], [15, 0, 10], [0, 0, 10], [-9, 0, -8], [9, 0, -9], [-18, 0, -2],
  [18, 0, -1], [2, 0, 14], [-6, 0, 15], [13, 0, -7], [-13, 0, -6], [7, 0, -13],
];

export function SchoolScene({ schoolId }: { schoolId: string }) {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const setNarasi = useStore((s) => s.setNarasi);
  const goScene = useStore((s) => s.goScene);
  const meta = SEKOLAH_LIST.find((s) => s.id === schoolId) ?? SEKOLAH_LIST[0];
  const ci = SEKOLAH_LIST.indexOf(meta);

  const students = useMemo(() => {
    const list = (world?.users ?? []).filter((u) => u.peran !== "dosen" && u.sekolahPpl === schoolId && u.avatar);
    return scatterSpots(list, SPOTS);
  }, [world?.users, schoolId]);

  // murid-murid sekolah (NPC) agar tiap sekolah ramai
  const murid = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        cfg: randomAvatar(i % 4 === 0 ? "L" : "P"),
        pos: [(hash01(`${schoolId}mx${i}`) - 0.5) * 30, 0, (hash01(`${schoolId}mz${i}`) - 0.5) * 26 + 3] as [number, number, number],
        ry: hash01(`${schoolId}mr${i}`) * 6.28,
      })),
    [schoolId]
  );
  const walkers = useMemo(
    () => [
      { cfg: randomAvatar("P"), path: [[-10, 12], [0, 10], [10, 12]] as [number, number][], speed: 1.4, off: hash01(schoolId) * 10 },
      { cfg: randomAvatar("L"), path: [[8, -6], [-8, -6], [-8, 4], [8, 4]] as [number, number][], speed: 1.6, off: 5 },
      { cfg: randomAvatar("P"), path: [[-14, 2], [-14, 14], [-4, 14]] as [number, number][], speed: 1.2, off: 9 },
    ],
    [schoolId]
  );

  return (
    <group>
      <Ground size={100} color={["#8aa35c", "#86a062", "#7f9d58", "#8da45e", "#92a06a"][ci]} />
      <ZoneChip position={[0, 9, -8]} title={meta.id.toUpperCase()} sub={meta.ciri} color={meta.warna} />
      <GateArch position={[0, 0, 20]} width={7} height={3.4} color={meta.secondary} label={meta.id.toUpperCase()} sub="Sekolah PPL" />
      <Fence from={[-20, 20]} to={[-5, 20]} color={meta.secondary} />
      <Fence from={[5, 20]} to={[20, 20]} color={meta.secondary} />
      <Fence from={[-20, 20]} to={[-20, -14]} color={meta.secondary} />
      <Fence from={[20, 20]} to={[20, -14]} color={meta.secondary} />

      {/* halaman upacara + tiang bendera */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 5]}>
        <planeGeometry args={[22, 14]} />
        <meshStandardMaterial color="#b9ad8e" roughness={1} />
      </mesh>
      <FlagPole position={[0, 0, 1]} h={6.5} />
      <BuntingLine from={[-11, 12]} to={[11, 12]} h={3.6} />

      {/* gedung utama + teras & kelas terlihat */}
      <Building position={[0, 0, -11]} size={[22, 5 + (ci % 3) * 2, 7]} color={meta.secondary} roof={meta.warna} floors={2} />
      <Steps position={[0, 0, -7]} w={7} />
      <mesh position={[0, 0.12, -6.2]}>
        <boxGeometry args={[22, 0.25, 3.2]} />
        {M("#d9d0b8")}
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-9 + i * 3, 1.6, -5]}>
          <cylinderGeometry args={[0.16, 0.18, 3.2, 7]} />
          {M(meta.secondary)}
        </mesh>
      ))}
      {[-7, 0, 7].map((x, i) => (
        <group key={x}>
          <mesh position={[x, 1.1, -7.6]}>
            <planeGeometry args={[1.3, 2.2]} />
            {M("#6b4a2f")}
          </mesh>
          <Html position={[x, 2.6, -7.55]} center distanceFactor={13} zIndexRange={[10, 0]}>
            <div className="pointer-events-none select-none rounded border border-white/25 bg-[#2b2119]/85 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#f2cc8f]">
              KELAS {["X", "XI", "XII"][i]}
            </div>
          </Html>
        </group>
      ))}
      <ClassDesks position={[-7, 0, -13]} rows={2} cols={3} />
      <Whiteboard position={[-7, 0, -16]} lines={["Fungsi Kuadrat", "y = ax² + bx + c"]} hijau />
      <ClassDesks position={[7, 0, -13]} rows={2} cols={3} />
      <Whiteboard position={[7, 0, -16]} lines={["Selamat tinggal, Bu/Pak Guru!", "Terima kasih ♥"]} />

      <GlowMarker
        id={`sch-${schoolId}`}
        position={[0, 1.6, -4.5]}
        color={meta.warna}
        label={`Kenangan di ${meta.singkat}`}
        isLetter={false}
        onClick={() =>
          setNarasi({
            title: meta.id,
            text: `Di sinilah kamu pertama kali dipanggil "Bu Guru" atau "Pak Guru". ${meta.ciri}. Setiap pagi di gerbang ini, ada 30-an anak yang menunggu seseorang yang percaya pada mereka — dan orang itu adalah kamu.`,
          })
        }
      />

      {/* ─── ciri khas tiap sekolah (benar-benar beda) ─── */}
      {ci === 0 && ( // SMPN 2 — beringin tua, lapangan upacara, taman baca
        <>
          <group position={[-13, 0, 4]}>
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.7, 1.1, 4, 8]} />
              {M("#5c4033")}
            </mesh>
            {[
              [0, 4.6, 0, 2.6],
              [1.8, 4, 0.6, 1.7],
              [-1.9, 4.2, -0.5, 1.8],
              [0.4, 5.6, -1.4, 1.5],
            ].map(([x, y, z, r], i) => (
              <mesh key={i} position={[x, y, z]}>
                <icosahedronGeometry args={[r, 0]} />
                {M(i % 2 ? "#2f5e2a" : "#3d7033")}
              </mesh>
            ))}
            {[0.5, -0.6].map((x, i) => (
              <mesh key={i} position={[x, 3.3, 0.3]}>
                <cylinderGeometry args={[0.05, 0.05, 1.6, 4]} />
                {M("#6b4a2f")}
              </mesh>
            ))}
          </group>
          <Bench position={[-13, 0, 7.5]} ry={0} />
          <Bench position={[-16, 0, 5]} ry={1.4} />
          <VolleyNet position={[11, 0, 7]} ry={0.1} />
          <Scoreboard position={[16, 0, 2]} ry={-1.2} text="SMPN 2" sub="Juara Umum 2026" />
          <Pond position={[14, 0, 13]} r={2.2} />
        </>
      )}
      {ci === 1 && ( // SMAN 1 — megah, taman bunga, gazebo, air mancur kecil
        <>
          <Gazebo position={[-12, 0, 8]} s={1.3} />
          <Gazebo position={[12, 0, 9]} s={1} />
          {Array.from({ length: 10 }).map((_, i) => (
            <FlowerBed key={i} position={[-14 + (i % 5) * 7, 0, i < 5 ? 14 : -2]} s={0.95} />
          ))}
          <Hedge from={[-16, 11]} to={[16, 11]} />
          <Statue position={[0, 0, 15]} color="#e8e0cc" />
          <Banner position={[-17, 0, 2]} ry={1.2} title="SEKOLAH ADIWIYATA" sub="Hijau & Berprestasi" color="#b23a48" />
          {[[-18, 16], [18, 16]].map(([x, z], i) => (
            <Planter key={i} position={[x, 0, z]} c="#b23a48" />
          ))}
        </>
      )}
      {ci === 2 && ( // SMAN 2 — asri, pohon rindang, musholla
        <>
          <group position={[-13, 0, -2]}>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[5, 3, 5]} />
              {M("#e9edc9")}
            </mesh>
            <mesh position={[0, 3.6, 0]} scale={[1, 0.85, 1]}>
              <sphereGeometry args={[2.3, 10, 7]} />
              {M("#4f772d")}
            </mesh>
            <mesh position={[0, 5.1, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1, 4]} />
              {M("#f2cc8f")}
            </mesh>
            <mesh position={[3.4, 2.4, 0]}>
              <cylinderGeometry args={[0.35, 0.4, 4.8, 7]} />
              {M("#e9edc9")}
            </mesh>
            <Steps position={[0, 0, 3]} w={3} />
            <Html position={[0, 5.9, 0]} center distanceFactor={14} zIndexRange={[8, 0]}>
              <div className="pointer-events-none select-none rounded bg-[#2f5244]/85 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#e9edc9]">
                MUSHOLLA AL-IKHLAS
              </div>
            </Html>
          </group>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return <Tree key={i} position={[Math.cos(a) * 15, 0, Math.sin(a) * 13 + 3]} s={1.5 + hash01(`s2t${i}`) * 0.7} tone="#2f5e2a" />;
          })}
          <Pond position={[12, 0, 6]} r={3} />
          <Bench position={[12, 0, 10.5]} ry={Math.PI} />
          <PicnicTable position={[15, 0, -4]} ry={0.5} />
        </>
      )}
      {ci === 3 && ( // SMAN 3 — olahraga & kantin ramai
        <>
          <BasketCourt position={[12, 0, 4]} ry={0.05} />
          <VolleyNet position={[-12, 0, 9]} ry={0.2} />
          <Scoreboard position={[12, 0, 13]} text="SMAN 3" sub="Pekan Olahraga" />
          <group position={[-13, 0, -2]}>
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[6, 2.8, 4]} />
              {M("#f4ead8")}
            </mesh>
            <mesh position={[0, 3, 0.8]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[6.6, 0.14, 4.4]} />
              {M("#c75146")}
            </mesh>
            <Html position={[0, 3.6, 2]} center distanceFactor={13} zIndexRange={[8, 0]}>
              <div className="pointer-events-none select-none rounded bg-[#2b2119]/85 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#f2cc8f]">
                KANTIN SEKOLAH
              </div>
            </Html>
          </group>
          {[0, 1, 2, 3].map((i) => (
            <PicnicTable key={i} position={[-16 + (i % 2) * 4, 0, 2 + Math.floor(i / 2) * 3]} ry={0.2} />
          ))}
          <FoodStall position={[-8, 0, 3]} ry={-0.6} label="Es Campur" color="#5f8ac7" />
        </>
      )}
      {ci === 4 && ( // SMKN 1 — bengkel, lab, area vokasi
        <>
          <group position={[-13, 0, 1]}>
            <Building position={[0, 0, 0]} size={[9, 4, 6]} color="#d9d3c7" roof="#5b6b7c" flat />
            <Html position={[0, 4.8, 0]} center distanceFactor={14} zIndexRange={[8, 0]}>
              <div className="pointer-events-none select-none rounded bg-[#5b6b7c]/90 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#eaf1f7]">
                BENGKEL TEKNIK
              </div>
            </Html>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[-3 + i * 3, 0.6, 3.6]}>
                <boxGeometry args={[1.8, 1.2, 1.4]} />
                {M(["#c75146", "#3d6fb4", "#e9a84a"][i])}
              </mesh>
            ))}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={`tool${i}`} position={[-3.4 + i * 2.2, 1.1, 5.2]}>
                <boxGeometry args={[1.4, 2, 0.3]} />
                {M("#8a8076")}
              </mesh>
            ))}
          </group>
          <group position={[13, 0, 2]}>
            <Building position={[0, 0, 0]} size={[8, 3.6, 5]} color="#e6edf2" roof="#4a7a8c" flat />
            <Html position={[0, 4.4, 0]} center distanceFactor={14} zIndexRange={[8, 0]}>
              <div className="pointer-events-none select-none rounded bg-[#4a7a8c]/90 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#eaf1f7]">
                LAB KOMPUTER
              </div>
            </Html>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <group key={i} position={[-2.4 + (i % 3) * 2.4, 0, 3.4 + Math.floor(i / 3) * 1.8]}>
                <mesh position={[0, 0.6, 0]}>
                  <boxGeometry args={[1.4, 0.08, 0.8]} />
                  {M("#c9bda6")}
                </mesh>
                <mesh position={[0, 0.85, -0.2]}>
                  <boxGeometry args={[0.7, 0.45, 0.06]} />
                  <meshStandardMaterial color="#2b3a4a" emissive="#5f8ac7" emissiveIntensity={0.5} />
                </mesh>
              </group>
            ))}
          </group>
          <Canopy position={[0, 0, 12]} size={[7, 4]} color="#8a6fb0" />
          <Banner position={[-6, 0, 16]} ry={0.3} title="SMK BISA!" sub="Hebat · Kompeten" color="#8a6fb0" />
        </>
      )}

      {/* elemen umum tiap sekolah */}
      <FoodStall position={[8, 0, 15]} ry={-0.4} label="Jajanan Sekolah" color={meta.warna} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Bike key={i} position={[-17 + i * 1.4, 0, 16]} ry={1.5} c={["#e07a5f", "#81b29a", "#8ecae6", "#f2cc8f", "#cdb4f5"][i]} />
      ))}
      {[0, 1, 2].map((i) => (
        <Motorbike key={i} position={[16, 0, 16 - i * 2.2]} ry={1.5} warna={["#c75146", "#3d6fb4", "#4f772d"][i]} />
      ))}
      {[[-9, 18], [9, 18], [-3, 8], [3, 8]].map(([x, z], i) => (
        <PathLight key={i} position={[x, 0, z]} />
      ))}
      {[[-18, 12], [18, 12]].map(([x, z], i) => (
        <LampPost key={i} position={[x, 0, z]} />
      ))}
      {[[-5, 17], [5, 17]].map(([x, z], i) => (
        <TrashBin key={i} position={[x, 0, z]} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <Bush key={i} position={[(hash01(`${schoolId}bx${i}`) - 0.5) * 40, 0, (hash01(`${schoolId}bz${i}`) - 0.5) * 36 + 2]} s={0.8 + hash01(`${schoolId}bs${i}`) * 0.5} />
      ))}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 24 + hash01(`${schoolId}tr${i}`) * 6;
        return ci === 2 ? (
          <Pine key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} s={1 + hash01(`${schoolId}ts${i}`) * 0.6} />
        ) : (
          <Tree key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} s={1 + hash01(`${schoolId}ts${i}`) * 0.7} tone={i % 2 ? "#4f772d" : "#5a8a3f"} />
        );
      })}

      {/* murid-murid NPC */}
      {murid.map((m, i) => (
        <Avatar3D key={i} config={m.cfg} position={m.pos} rotationY={m.ry} phase={i * 1.9} />
      ))}
      {walkers.map((w, i) => (
        <WalkerNPC key={`w${i}`} config={w.cfg} path={w.path} speed={w.speed} offset={w.off} />
      ))}

      {/* teman-teman PPL di sekolah ini (tersebar) */}
      {students.map(({ item, pos, ry }) => {
        const uc = world?.ucapan.find((x) => x.penulis.id === item.id);
        return (
          <group key={item.id}>
            <Avatar3D
              config={item.avatar!}
              position={pos}
              rotationY={ry}
              nameTag={item.panggilan}
              role={item.peran}
              isSelf={item.id === session?.id}
              phase={hash01(item.id) * 9}
              onClick={uc ? () => openUcapan(uc.id) : undefined}
            />
            {uc && (
              <GlowMarker
                id={`su-${uc.id}`}
                position={[pos[0] + 0.9, 1.7, pos[2] + 0.5]}
                color={meta.warna}
                label={`Surat ${item.panggilan}`}
                onClick={() => openUcapan(uc.id)}
              />
            )}
          </group>
        );
      })}
      {students.length === 0 && (
        <GlowMarker
          id="sch-empty"
          position={[0, 1.6, 4]}
          color={meta.warna}
          isLetter={false}
          label="Sekolah ini sepi…"
          onClick={() => setNarasi({ title: meta.id, text: "Belum ada mahasiswa angkatanmu yang PPL di sekolah ini. Tapi kenangan tetap bisa dititipkan di sini." })}
        />
      )}

      <Mountain position={[-38, -2, -52]} s={1.5} color="#5b5e7c" snow smoke />
      <Mountain position={[34, -2.4, -56]} s={1.3} color="#45604e" />
      <Cloud position={[-14, 12, -30]} s={1.8} opacity={0.5} />
      <Cloud position={[16, 13.5, -26]} s={1.5} opacity={0.42} speed={0.06} />
      <PortalRing position={[-7, 0, 20]} color={meta.warna} label="PERSIMPANGAN" sub="Kembali ke 5 sekolah" onClick={() => goScene("ppl")} />
      <Sparkles count={16} scale={16} size={1.3} speed={0.25} position={[0, 2.5, 0]} color="#fff1c9" />
    </group>
  );
}
