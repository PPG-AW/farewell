"use client";

import { useMemo } from "react";
import { Html, Sparkles } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import {
  Ground, Building, GateArch, FlagPole, Tree, LampPost, GlowMarker, ZoneChip,
  PortalRing, Mountain, Cloud, Bench, Gazebo,
} from "../primitives";
import {
  Motorbike, Bike, FoodStall, Canopy, BasketCourt, VolleyNet, FlowerBed, Bush, Hedge, Fence,
  PicnicTable, TrashBin, Banner, BuntingLine, Steps, PathLight,
  Planter, Pond, Statue, Scoreboard, scatterSpots, hash01, M,
} from "../props";
import { WalkerNPC, useInteractable } from "../player";
import { NARASI, randomAvatar } from "@/lib/constants";

/**
 * DENAH KAMPUS (sesuai permintaan):
 *   • Parkiran  : pojok KIRI-BAWAH   (x ≈ -30, z ≈ +28)
 *   • Jalan     : dari parkir ke KIRI-ATAS menuju Gedung E
 *   • Gedung E  : kiri-atas          (x ≈ -24, z ≈ -22)  → bisa DIMASUKI
 *   • Lapangan  : luas di DEPAN gedung E (x ≈ -6, z ≈ 0)
 *   • Perpus    : di seberang lapangan (x ≈ 22, z ≈ -14) → lift ke Lt.7
 */

/** Pintu masuk gedung (luar) */
function EntranceDoor({
  id,
  position,
  ry = 0,
  label,
  plate,
  onEnter,
  color = "#7a512f",
}: {
  id: string;
  position: [number, number, number];
  ry?: number;
  label: string;
  plate: string;
  onEnter: () => void;
  color?: string;
}) {
  useInteractable(id, position, label, onEnter, "portal");
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, 1.4, 0]} onClick={(e) => { e.stopPropagation(); onEnter(); }}>
        <boxGeometry args={[3.2, 2.8, 0.3]} />
        {M("#8e7f68")}
      </mesh>
      <mesh position={[0, 1.3, 0.18]}>
        <boxGeometry args={[2.7, 2.5, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.3, 0.25]}>
        <boxGeometry args={[0.12, 2.4, 0.06]} />
        {M("#e9c46a")}
      </mesh>
      <Html position={[0, 3.2, 0.2]} center distanceFactor={14} zIndexRange={[14, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-lg border border-[#f2cc8f]/40 bg-[#2b2119]/90 px-3 py-1 text-[12px] font-black tracking-[0.2em] text-[#f2cc8f] shadow-xl">
          {plate}
        </div>
      </Html>
    </group>
  );
}

const SPOTS: [number, number, number][] = [
  // tersebar luas & tersembunyi di balik properti
  [-38, 0, 30], [-33, 0, 14], [-40, 0, -6], [-36, 0, -30], [-16, 0, -34],
  [-4, 0, -36], [10, 0, -32], [26, 0, -30], [36, 0, -20], [40, 0, 2],
  [34, 0, 18], [24, 0, 30], [8, 0, 33], [-8, 0, 30], [18, 0, 10],
  [-20, 0, 22], [-28, 0, -16], [6, 0, -18], [30, 0, -4], [-12, 0, 14],
];

export default function UkswScene() {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const setNarasi = useStore((s) => s.setNarasi);
  const goScene = useStore((s) => s.goScene);

  const masuk = (sub: string, label: string) => goScene("uksw", { school: sub, label, warna: "#8ecae6" });

  // hanya sebagian orang di luar — sisanya tersembunyi di dalam gedung
  const diLuar = useMemo(() => {
    const list = (world?.users ?? []).filter((u) => u.avatar && hash01(u.id, 61) > 0.55).slice(0, 12);
    return scatterSpots(list, SPOTS);
  }, [world?.users]);

  const walkers = useMemo(
    () => [
      { cfg: randomAvatar("P"), path: [[-28, 26], [-26, 10], [-24, -6], [-22, -16]] as [number, number][], speed: 1.5, off: 0 },
      { cfg: randomAvatar("P"), path: [[-18, -18], [-6, -14], [8, -12], [18, -14]] as [number, number][], speed: 1.4, off: 5 },
      { cfg: randomAvatar("L"), path: [[-30, 30], [-10, 28], [10, 26], [28, 24]] as [number, number][], speed: 1.8, off: 9 },
      { cfg: randomAvatar("P"), path: [[16, 6], [4, 4], [-8, 6], [-16, 10]] as [number, number][], speed: 1.2, off: 14 },
      { cfg: randomAvatar("L"), path: [[22, -8], [22, 6], [12, 14], [2, 12]] as [number, number][], speed: 1.6, off: 3 },
      { cfg: randomAvatar("P"), path: [[-34, 20], [-34, 6], [-30, -4]] as [number, number][], speed: 1.1, off: 17 },
    ],
    []
  );

  return (
    <group>
      <Ground size={170} color="#769a5b" />
      <ZoneChip position={[-10, 13, -12]} title="KAMPUS UKSW" sub="Parkir → Gedung E → Lapangan → Perpustakaan" color="#8ecae6" />

      {/* ══════════ JALAN KAMPUS ══════════ */}
      {/* jalan dari gerbang/parkir (kiri-bawah) naik ke atas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.015, 4]}>
        <planeGeometry args={[7, 52]} />
        <meshStandardMaterial color="#86807a" roughness={1} />
      </mesh>
      {/* jalan melintang di depan gedung E menuju perpustakaan */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -14]}>
        <planeGeometry args={[60, 7]} />
        <meshStandardMaterial color="#86807a" roughness={1} />
      </mesh>
      {/* jalan tepi lapangan menuju perpus */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[21, 0.015, 2]}>
        <planeGeometry args={[7, 36]} />
        <meshStandardMaterial color="#86807a" roughness={1} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.025, 26 - i * 4]}>
          <planeGeometry args={[0.3, 1.8]} />
          <meshStandardMaterial color="#efe8d8" />
        </mesh>
      ))}
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-26 + i * 4.4, 0.025, -14]}>
          <planeGeometry args={[1.8, 0.3]} />
          <meshStandardMaterial color="#efe8d8" />
        </mesh>
      ))}

      {/* ══════════ 1. PARKIRAN — POJOK KIRI BAWAH ══════════ */}
      <group position={[-32, 0, 28]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
          <planeGeometry args={[18, 16]} />
          <meshStandardMaterial color="#5b5651" roughness={1} />
        </mesh>
        {/* garis parkir */}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-7.5 + i * 2.5, 0.028, -3]}>
            <planeGeometry args={[0.14, 5]} />
            <meshStandardMaterial color="#e8e2d0" />
          </mesh>
        ))}
        <Canopy position={[0, 0, -3]} size={[17, 6]} color="#3d6fb4" />
        {Array.from({ length: 12 }).map((_, i) => (
          <Motorbike
            key={i}
            position={[-6.4 + (i % 6) * 2.5, 0, i < 6 ? -4.4 : -1.4]}
            ry={0}
            warna={["#c75146", "#3d6fb4", "#f2a93b", "#4f772d", "#8a6fb0", "#2a9d8f"][i % 6]}
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <Bike key={i} position={[-7 + i * 1.5, 0, 4.2]} ry={0} c={["#e07a5f", "#81b29a", "#8ecae6", "#f2cc8f", "#cdb4f5"][i]} />
        ))}
        <Html position={[0, 4.2, -3]} center distanceFactor={18} zIndexRange={[8, 0]}>
          <div className="pointer-events-none select-none rounded-lg bg-[#2b2119]/85 px-3 py-1 text-[11px] font-black tracking-[0.3em] text-[#f2cc8f]">
            PARKIRAN KAMPUS
          </div>
        </Html>
      </group>
      {/* gerbang di bawah parkiran */}
      <GateArch position={[-26, 0, 34]} width={8} height={3.8} color="#efe6c8" label="UNIVERSITAS KRISTEN SATYA WACANA" sub="Salatiga" />
      <Fence from={[-44, 34]} to={[-32, 34]} />
      <Fence from={[-20, 34]} to={[10, 34]} />
      <Fence from={[-44, 34]} to={[-44, -40]} />
      <group position={[-20, 0, 31]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[2.6, 2.4, 2.4]} />
          {M("#f4f1de")}
        </mesh>
        <mesh position={[0, 2.6, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2.2, 0.8, 4]} />
          {M("#a3522f")}
        </mesh>
        <mesh position={[0, 1.4, 1.22]}>
          <planeGeometry args={[1.6, 1]} />
          <meshStandardMaterial color="#9fd0e8" emissive="#cfe9f7" emissiveIntensity={0.3} />
        </mesh>
      </group>
      <Avatar3D config={useMemo(() => randomAvatar("L"), [])} position={[-21.6, 0, 29.4]} rotationY={-1} phase={2} />
      <GlowMarker id="u-parkir" position={[-24, 1.6, 26]} color="#8ecae6" label="Cerita Parkir" isLetter={false} onClick={() => setNarasi({ title: "Parkir & Gerbang", text: NARASI.parkir })} />
      <FoodStall position={[-40, 0, 24]} ry={1.1} label="Warung Pojok" color="#e9a84a" />
      <PicnicTable position={[-40, 0, 19]} ry={0.3} />
      <PicnicTable position={[-40, 0, 15]} ry={-0.2} />

      {/* ══════════ 2. GEDUNG E — KIRI ATAS (bisa dimasuki) ══════════ */}
      <group position={[-24, 0, -24]}>
        <Building position={[0, 0, 0]} size={[30, 9.5, 11]} color="#f2e9cd" roof="#a3522f" floors={2} />
        {/* teras bertiang */}
        <mesh position={[0, 0.14, 7]}>
          <boxGeometry args={[30, 0.28, 4]} />
          {M("#d9d0b8")}
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-13 + i * 3.7, 1.9, 8.6]}>
            <cylinderGeometry args={[0.2, 0.22, 3.8, 7]} />
            {M("#efe6c8")}
          </mesh>
        ))}
        <mesh position={[0, 3.95, 8.6]}>
          <boxGeometry args={[30, 0.4, 0.8]} />
          {M("#d9cfae")}
        </mesh>
        <Steps position={[0, 0, 9.6]} w={9} />
        <BuntingLine from={[-13, 9.2]} to={[13, 9.2]} h={4.3} />
        {/* jendela lantai 2 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`w${i}`} position={[-12.5 + i * 3.6, 6.6, 5.56]}>
            <planeGeometry args={[1.8, 1.6]} />
            <meshStandardMaterial color="#9fd0e8" emissive="#dff1ff" emissiveIntensity={0.3} />
          </mesh>
        ))}
        <Html position={[0, 10.4, 4]} center distanceFactor={20} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none rounded-xl border border-[#f2cc8f]/35 bg-[#7a4a2a]/90 px-4 py-1.5 text-[13px] font-black tracking-[0.3em] text-[#ffe9b0] shadow-2xl">
            GEDUNG E
          </div>
        </Html>
        {/* PINTU MASUK */}
        <EntranceDoor
          id="masuk-gedung-e"
          position={[0, 0, 5.8]}
          label="Masuk Gedung E (E102–E108 & Aula)"
          plate="MASUK ▸ GEDUNG E"
          onEnter={() => masuk("uksw:e-lorong", "Lorong Gedung E")}
        />
      </group>
      <Banner position={[-14, 0, -14.5]} ry={-0.5} title="PPG PRAJABATAN 2026" sub="Prodi Matematika" color="#2f4b7a" />
      <Hedge from={[-39, -14.5]} to={[-30, -14.5]} />
      {[[-38, -18], [-10, -18]].map(([x, z], i) => (
        <Planter key={i} position={[x, 0, z]} c={i ? "#c25b4a" : "#4a7a8c"} />
      ))}

      {/* ══════════ 3. LAPANGAN LUAS DI DEPAN GEDUNG E ══════════ */}
      <group position={[-4, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[34, 22]} />
          <meshStandardMaterial color="#6faf55" roughness={1} />
        </mesh>
        {/* garis lapangan */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[3, 3.2, 28]} />
          <meshStandardMaterial color="#f4f1de" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry args={[0.2, 22]} />
          <meshStandardMaterial color="#f4f1de" />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * 16.9, 0.03, 0]}>
            <planeGeometry args={[0.2, 22]} />
            <meshStandardMaterial color="#f4f1de" />
          </mesh>
        ))}
        {/* gawang */}
        {[-16, 16].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-2.2, 2.2].map((z) => (
              <mesh key={z} position={[0, 1.1, z]}>
                <cylinderGeometry args={[0.07, 0.07, 2.2, 6]} />
                {M("#f4f1de")}
              </mesh>
            ))}
            <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 4.45, 6]} />
              {M("#f4f1de")}
            </mesh>
          </group>
        ))}
        <mesh position={[3, 0.18, 4]}>
          <icosahedronGeometry args={[0.2, 1]} />
          {M("#f4f1de", 0.5)}
        </mesh>
        {/* tribun menghadap lapangan */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.32 + i * 0.6, 12.6 + i * 0.9]}>
            <boxGeometry args={[22, 0.6, 0.9]} />
            {M(i % 2 ? "#c7c2b4" : "#a79c86")}
          </mesh>
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <Avatar3D
            key={i}
            config={randomAvatar(i % 3 === 0 ? "L" : "P")}
            position={[-8 + i * 2.1, 0.9 + (i % 3) * 0.6, 13 + (i % 3) * 0.9]}
            rotationY={Math.PI}
            phase={i * 2.1}
          />
        ))}
      </group>
      <Scoreboard position={[-22, 0, 8]} ry={1.2} text="PPG 29 — 0 LELAH" sub="Pertandingan persahabatan" />
      <FlagPole position={[-20, 0, -8]} h={7} />
      <GlowMarker id="u-lapangan" position={[-6, 1.7, -11]} color="#8ecae6" label="Cerita Lapangan" isLetter={false} onClick={() => setNarasi({ title: "Lapangan Bola", text: NARASI.lapangan })} />

      {/* ══════════ 4. PERPUSTAKAAN — SEBERANG LAPANGAN (lift ke Lt.7) ══════════ */}
      <group position={[24, 0, -16]}>
        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[14, 16, 11]} />
          {M("#bcd4e6")}
        </mesh>
        {/* jendela 7 lantai */}
        {Array.from({ length: 7 }).map((_, fl) =>
          [-4.2, -1.4, 1.4, 4.2].map((cx) => (
            <mesh key={`${fl}${cx}`} position={[cx, 2.4 + fl * 2.1, 5.56]}>
              <planeGeometry args={[1.9, 1.3]} />
              <meshStandardMaterial
                color={fl === 6 ? "#cfe9f7" : "#5f8ac7"}
                emissive={fl === 6 ? "#ffffff" : "#8ecae6"}
                emissiveIntensity={fl === 6 ? 0.75 : 0.35}
              />
            </mesh>
          ))
        )}
        <mesh position={[0, 16.6, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[9, 2.4, 4]} />
          {M("#3d5a80")}
        </mesh>
        <Html position={[0, 18.8, 0]} center distanceFactor={24} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none rounded-xl border border-white/25 bg-[#3d5a80]/90 px-4 py-1.5 text-[12px] font-black tracking-[0.25em] text-[#e3f0ff] shadow-2xl">
            PERPUSTAKAAN · 7 LANTAI
          </div>
        </Html>
        {/* teras & pintu masuk */}
        <mesh position={[0, 0.14, 7]}>
          <boxGeometry args={[14, 0.28, 4]} />
          {M("#cfd8e2")}
        </mesh>
        <Steps position={[0, 0, 9.4]} w={7} />
        {[-5, 5].map((x) => (
          <mesh key={x} position={[x, 2, 8.4]}>
            <cylinderGeometry args={[0.24, 0.26, 4, 8]} />
            {M("#dce7f0")}
          </mesh>
        ))}
        <EntranceDoor
          id="masuk-perpus"
          position={[0, 0, 5.8]}
          label="Masuk Perpustakaan (ada lift ke Lt.7)"
          plate="MASUK ▸ PERPUSTAKAAN"
          color="#2f4b7a"
          onEnter={() => masuk("uksw:perpus", "Perpustakaan Lantai 1")}
        />
      </group>
      <Banner position={[16, 0, -7]} ry={0.6} title="LANTAI 7 ADA PANORAMA" sub="naik lift dari dalam" color="#2f4b7a" />
      <Pond position={[32, 0, -2]} r={3.2} />
      <Gazebo position={[34, 0, 8]} s={1.1} />

      {/* ══════════ fasilitas penunjang (biar ramai) ══════════ */}
      <BasketCourt position={[14, 0, 20]} />
      <VolleyNet position={[-10, 0, 24]} ry={0.15} />
      <FoodStall position={[4, 0, 12]} ry={-0.5} label="Kantin Mbak Sri" color="#81b29a" />
      <FoodStall position={[10, 0, 12]} ry={-0.5} label="Es Teh & Gorengan" color="#c25b4a" />
      {[[2, 16], [7, 16], [12, 16]].map(([x, z], i) => (
        <PicnicTable key={i} position={[x, 0, z]} ry={i * 0.3} />
      ))}
      <Statue position={[-26, 0, 18]} />
      <Gazebo position={[-36, 0, 2]} s={1.15} />
      <Fountain />
      {[[-30, 10], [-30, -2], [12, -10], [30, 12], [-14, 28], [6, 28]].map(([x, z], i) => (
        <FlowerBed key={i} position={[x, 0, z]} s={0.9} />
      ))}
      {[[-22, 20], [-22, 2], [-22, -10], [-12, -16], [4, -16], [16, -16], [21, 8], [21, 18], [-26, 14], [-26, 0]].map(([x, z], i) => (
        <PathLight key={i} position={[x, 0, z]} />
      ))}
      {[[-30, 24], [-30, -12], [0, -18], [18, -18], [26, 14], [-16, 32]].map(([x, z], i) => (
        <LampPost key={i} position={[x, 0, z]} />
      ))}
      {[[-23, 24], [-23, 6], [-23, -12], [18, 14], [8, -16]].map(([x, z], i) => (
        <Bench key={i} position={[x, 0, z]} ry={i % 2 ? 1.6 : -1.6} />
      ))}
      {[[-28, 20], [-28, -8], [2, -17], [20, 4], [12, 18]].map(([x, z], i) => (
        <TrashBin key={i} position={[x, 0, z]} />
      ))}
      {Array.from({ length: 30 }).map((_, i) => {
        const a = (i / 30) * Math.PI * 2;
        const r = 44 + hash01(`ur${i}`) * 14;
        return <Tree key={i} position={[Math.cos(a) * r - 4, 0, Math.sin(a) * r - 4]} s={1.1 + hash01(`us${i}`) * 0.9} tone={i % 3 ? "#4f772d" : "#3f6b35"} />;
      })}
      {Array.from({ length: 16 }).map((_, i) => (
        <Tree key={`t2${i}`} position={[(hash01(`ux${i}`) - 0.5) * 70 - 4, 0, (hash01(`uz${i}`) - 0.5) * 66 - 4]} s={0.9 + hash01(`uy${i}`) * 0.8} tone="#5a8a3f" />
      ))}
      {Array.from({ length: 34 }).map((_, i) => (
        <Bush key={i} position={[(hash01(`ubx${i}`) - 0.5) * 78, 0, (hash01(`ubz${i}`) - 0.5) * 74]} s={0.8 + hash01(`ubs${i}`) * 0.6} />
      ))}

      {/* ══════════ orang-orang ══════════ */}
      {diLuar.map(({ item, pos, ry }) => {
        const uc = world?.ucapan.find((x) => x.penulis.id === item.id);
        return (
          <OutdoorPerson key={item.id} item={item} pos={pos} ry={ry} ucId={uc?.id} isSelf={item.id === session?.id} onOpen={openUcapan} />
        );
      })}
      {walkers.map((w, i) => (
        <WalkerNPC key={i} config={w.cfg} path={w.path} speed={w.speed} offset={w.off} />
      ))}

      <Mountain position={[-66, -2, -82]} s={1.8} color="#5b5e7c" snow smoke />
      <Mountain position={[58, -2, -88]} s={1.6} color="#45604e" />
      <Cloud position={[-26, 17, -40]} s={2} />
      <Cloud position={[24, 19, -30]} s={1.6} speed={0.07} />
      <Cloud position={[0, 18, 34]} s={1.8} speed={0.04} />
      <PortalRing position={[-26, 0, 36]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={18} scale={20} size={1.3} speed={0.2} position={[-6, 2.5, 0]} color="#fff2cc" />
    </group>
  );
}

function Fountain() {
  return (
    <group position={[21, 0, -4]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[2, 2.2, 0.5, 14]} />
        {M("#b8b0a0")}
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.75, 1.75, 0.2, 14]} />
        <meshStandardMaterial color="#5fa8c7" roughness={0.25} metalness={0.15} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 1.2, 8]} />
        {M("#cfc6b0")}
      </mesh>
    </group>
  );
}

function OutdoorPerson({
  item,
  pos,
  ry,
  ucId,
  isSelf,
  onOpen,
}: {
  item: { id: string; panggilan: string; peran: string; avatar: unknown };
  pos: [number, number, number];
  ry: number;
  ucId?: string;
  isSelf: boolean;
  onOpen: (id: string) => void;
}) {
  useInteractable(`op-${item.id}`, [pos[0], pos[1] + 1, pos[2]], `Surat ${item.panggilan}`, () => ucId && onOpen(ucId), "orang", !!ucId);
  return (
    <Avatar3D
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config={item.avatar as any}
      position={pos}
      rotationY={ry}
      nameTag={item.panggilan}
      role={item.peran}
      isSelf={isSelf}
      phase={hash01(item.id) * 9}
      onClick={ucId ? () => onOpen(ucId) : undefined}
    />
  );
}
