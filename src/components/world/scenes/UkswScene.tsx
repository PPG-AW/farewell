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
  PicnicTable, TrashBin, Banner, BuntingLine, ClassDesks, Whiteboard, Steps, PathLight,
  Planter, Pond, Statue, scatterSpots, hash01, M,
} from "../props";
import { WalkerNPC } from "../player";
import { NARASI, randomAvatar, type UkswZoneId } from "@/lib/constants";

const ZONE_POS: Record<UkswZoneId, [number, number, number]> = {
  parkir: [20, 0, 16],
  lapangan: [-21, 0, 12],
  e102: [-17, 0, -12],
  e105: [-8, 0, -12],
  e107: [1, 0, -12],
  e108: [10, 0, -12],
  aula: [22, 0, -10],
  perpus: [-2, 0, -27],
};

// titik tersebar untuk mahasiswa yang nongkrong di kampus
const SPOTS: [number, number, number][] = [
  [-6, 0, 6], [5, 0, 7], [-13, 0, 3], [12, 0, 4], [-19, 0, 18], [17, 0, 20],
  [-3, 0, 16], [7, 0, 14], [-22, 0, -2], [23, 0, 2], [-10, 0, -6], [9, 0, -5],
  [0, 0, 21], [-16, 0, 8], [15, 0, 9], [2, 0, -20], [-8, 0, -22], [11, 0, -21],
  [-26, 0, 6], [26, 0, -16], [-12, 0, 24], [13, 0, 25],
];

export default function UkswScene() {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const setNarasi = useStore((s) => s.setNarasi);
  const goScene = useStore((s) => s.goScene);

  const dosenUcapan = useMemo(() => (world?.ucapan ?? []).filter((u) => u.penulis.peran === "dosen"), [world?.ucapan]);
  const dosenAvatars = useMemo(() => {
    const users = world?.users ?? [];
    return dosenUcapan.map((uc) => ({ uc, user: users.find((u) => u.id === uc.penulis.id) })).filter((x) => x.user?.avatar);
  }, [dosenUcapan, world?.users]);

  // mahasiswa yang "mampir" ke kampus → tersebar acak
  const mahasiswaKampus = useMemo(() => {
    const list = (world?.users ?? []).filter((u) => u.peran !== "dosen" && u.avatar && hash01(u.id, 5) > 0.5).slice(0, 14);
    return scatterSpots(list, SPOTS);
  }, [world?.users]);

  const walkers = useMemo(
    () => [
      { cfg: randomAvatar("P"), path: [[16, 14], [6, 10], [-4, 8], [-14, 6]] as [number, number][], speed: 1.3, off: 0 },
      { cfg: randomAvatar("P"), path: [[-14, -8], [-4, -8], [6, -8], [14, -8]] as [number, number][], speed: 1.5, off: 5 },
      { cfg: randomAvatar("L"), path: [[0, 22], [0, 6], [0, -8]] as [number, number][], speed: 1.7, off: 9 },
      { cfg: randomAvatar("P"), path: [[-20, 20], [-8, 20], [-8, 12], [-20, 12]] as [number, number][], speed: 1.1, off: 14 },
      { cfg: randomAvatar("P"), path: [[22, -4], [22, 8], [12, 8], [12, -4]] as [number, number][], speed: 1.2, off: 3 },
      { cfg: randomAvatar("L"), path: [[-24, -14], [-12, -16], [4, -16], [16, -14]] as [number, number][], speed: 1.6, off: 17 },
    ],
    []
  );

  return (
    <group>
      <Ground size={150} color="#769a5b" />
      <ZoneChip position={[0, 11, -4]} title="KAMPUS UKSW" sub="Rumah Kedua Kita · jelajahi tiap sudut" color="#8ecae6" />

      {/* ══ jalan utama & trotoar ══ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 6]}>
        <planeGeometry args={[6, 40]} />
        <meshStandardMaterial color="#86807a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -8]}>
        <planeGeometry args={[46, 6]} />
        <meshStandardMaterial color="#86807a" roughness={1} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 24 - i * 4]}>
          <planeGeometry args={[0.3, 1.6]} />
          <meshStandardMaterial color="#efe8d8" />
        </mesh>
      ))}

      {/* ══ 1. GERBANG & PARKIR ══ */}
      <GateArch position={[20, 0, 24]} width={8} height={3.6} color="#efe6c8" label="UNIVERSITAS KRISTEN SATYA WACANA" sub="Salatiga" />
      <Fence from={[26, 24]} to={[34, 24]} />
      <Fence from={[14, 24]} to={[8, 24]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0.018, 15]}>
        <planeGeometry args={[14, 11]} />
        <meshStandardMaterial color="#5b5651" roughness={1} />
      </mesh>
      <Canopy position={[20, 0, 15]} size={[12, 8]} color="#3d6fb4" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Motorbike
          key={i}
          position={[15.2 + (i % 5) * 2.4, 0, 12.4 + Math.floor(i / 5) * 4]}
          ry={Math.PI / 2}
          warna={["#c75146", "#3d6fb4", "#f2a93b", "#4f772d", "#8a6fb0"][i % 5]}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Bike key={i} position={[26.5, 0, 11 + i * 1.5]} ry={Math.PI / 2} c={["#e07a5f", "#81b29a", "#8ecae6", "#f2cc8f"][i]} />
      ))}
      {/* pos satpam */}
      <group position={[25, 0, 22]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[2.4, 2.4, 2.2]} />
          {M("#f4f1de")}
        </mesh>
        <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[2, 0.7, 4]} />
          {M("#a3522f")}
        </mesh>
        <mesh position={[0, 1.4, 1.12]}>
          <planeGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#9fd0e8" emissive="#cfe9f7" emissiveIntensity={0.25} />
        </mesh>
      </group>
      <Avatar3D config={useMemo(() => randomAvatar("L"), [])} position={[23.4, 0, 21]} rotationY={-1.2} phase={2} />
      <FoodStall position={[29, 0, 14]} ry={-0.5} label="Kantin Gerbang" color="#e9a84a" />
      <PicnicTable position={[29, 0, 18]} ry={0.3} />
      <GlowMarker id="u-parkir" position={[24, 1.6, 17]} color="#8ecae6" label="Cerita Parkir" isLetter={false} onClick={() => setNarasi({ title: "Parkir & Gerbang", text: NARASI.parkir })} />

      {/* ══ 2. LAPANGAN OLAHRAGA ══ */}
      <group position={[-21, 0, 14]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[24, 16]} />
          <meshStandardMaterial color="#6faf55" roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[2.3, 2.45, 24]} />
          <meshStandardMaterial color="#f4f1de" />
        </mesh>
        {[-11.2, 11.2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-1.6, 1.6].map((z) => (
              <mesh key={z} position={[0, 0.8, z]}>
                <cylinderGeometry args={[0.05, 0.05, 1.6, 5]} />
                {M("#f4f1de")}
              </mesh>
            ))}
            <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 3.25, 5]} />
              {M("#f4f1de")}
            </mesh>
          </group>
        ))}
        <mesh position={[2, 0.16, 3]}>
          <icosahedronGeometry args={[0.18, 1]} />
          {M("#f4f1de", 0.5)}
        </mesh>
        {/* tribun bertingkat */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.3 + i * 0.55, -9.5 - i * 0.8]}>
            <boxGeometry args={[16, 0.55, 0.8]} />
            {M(i % 2 ? "#c7c2b4" : "#a79c86")}
          </mesh>
        ))}
        {/* penonton duduk di tribun */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Avatar3D
            key={i}
            config={randomAvatar(i % 3 === 0 ? "L" : "P")}
            position={[-6 + i * 2.1, 0.85 + (i % 3) * 0.55, -9.9 - (i % 3) * 0.8]}
            rotationY={0}
            phase={i * 2.3}
          />
        ))}
      </group>
      <BasketCourt position={[-24, 0, -4]} />
      <VolleyNet position={[-8, 0, 20]} ry={0.2} />
      <FlagPole position={[-6, 0, 22]} h={6.5} />
      <Scorebox />
      <GlowMarker id="u-lapangan" position={[-14, 1.7, 15]} color="#8ecae6" label="Cerita Lapangan" isLetter={false} onClick={() => setNarasi({ title: "Lapangan Bola", text: NARASI.lapangan })} />

      {/* ══ 3. GEDUNG KELAS E102–E108 (terbuka, terlihat isinya) ══ */}
      <group position={[-3.5, 0, -16]}>
        <Building position={[0, 0, -2]} size={[34, 8, 7]} color="#f2e9cd" roof="#a3522f" floors={2} />
        <Steps position={[0, 0, 2.4]} w={8} />
        {/* teras panjang + tiang */}
        <mesh position={[0, 0.12, 3.6]}>
          <boxGeometry args={[34, 0.25, 4]} />
          {M("#d9d0b8")}
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-15 + i * 3.8, 1.7, 5.3]}>
            <cylinderGeometry args={[0.18, 0.2, 3.4, 7]} />
            {M("#efe6c8")}
          </mesh>
        ))}
        <mesh position={[0, 3.5, 5.3]}>
          <boxGeometry args={[34, 0.35, 0.7]} />
          {M("#d9cfae")}
        </mesh>
        <BuntingLine from={[-15, 5.6]} to={[15, 5.6]} h={3.9} />
      </group>
      {/* pintu + papan nama tiap ruang + isi kelas */}
      {([
        ["e102", "E102", -17],
        ["e105", "E105", -8],
        ["e107", "E107", 1],
        ["e108", "E108", 10],
      ] as [UkswZoneId, string, number][]).map(([zid, lbl, x]) => (
        <group key={zid}>
          <mesh position={[x, 1.15, -14.3]}>
            <planeGeometry args={[1.4, 2.3]} />
            <meshStandardMaterial color="#6b4a2f" />
          </mesh>
          <Html position={[x, 2.75, -14.25]} center distanceFactor={13} zIndexRange={[12, 0]}>
            <div className="pointer-events-none select-none rounded-md border border-[#f2cc8f]/30 bg-[#2b2119]/90 px-2 py-0.5 text-[11px] font-bold tracking-[0.2em] text-[#f2cc8f] shadow-lg">
              {lbl}
            </div>
          </Html>
          <GlowMarker
            id={`u-${zid}`}
            position={[x, 1.5, -12.6]}
            color="#8ecae6"
            label={`Kenangan ${lbl}`}
            isLetter={false}
            onClick={() => setNarasi({ title: `Ruang ${lbl}`, text: NARASI[zid] })}
          />
        </group>
      ))}
      {/* interior terlihat: meja + papan tulis di sisi teras */}
      <ClassDesks position={[-17, 0, -20]} rows={2} cols={3} />
      <Whiteboard position={[-17, 0, -23]} lines={["∫ x² dx = x³/3 + C", "lim (1+1/x)ˣ = e"]} hijau />
      <ClassDesks position={[-8, 0, -20]} rows={2} cols={3} />
      <Whiteboard position={[-8, 0, -23]} lines={["Diskusi Kelompok", "Modul 3 · Asesmen"]} />
      <ClassDesks position={[1, 0, -20]} rows={2} cols={3} />
      <Whiteboard position={[1, 0, -23]} lines={["Microteaching", "Hari ini: Trigonometri"]} hijau />
      <Whiteboard position={[10, 0, -23]} lines={["E108", "— ruang yang kini sunyi —"]} />
      {/* kursi tunggal E108 */}
      <group position={[10, 0, -20]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.55]} />
          {M("#9a6b3f")}
        </mesh>
        <mesh position={[0, 0.78, -0.26]}>
          <boxGeometry args={[0.6, 0.6, 0.08]} />
          {M("#9a6b3f")}
        </mesh>
      </group>

      {/* ══ 4. AULA SEMINAR ══ */}
      <group position={[24, 0, -14]}>
        <Building position={[0, 0, 0]} size={[12, 9, 9]} color="#ead9b4" roof="#8a3b2a" floors={2} />
        <Steps position={[0, 0, 5]} w={6} />
        {/* tangga spiral luar */}
        <group position={[-7.6, 0, 3]}>
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 4.4, 6]} />
            {M("#5c4033")}
          </mesh>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = i * 0.48;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.85, 0.3 + i * 0.3, Math.sin(a) * 0.85]} rotation={[0, -a, 0]}>
                <boxGeometry args={[1.05, 0.1, 0.46]} />
                {M("#b6ab90")}
              </mesh>
            );
          })}
        </group>
        <Html position={[0, 6.2, 4.6]} center distanceFactor={15} zIndexRange={[10, 0]}>
          <div className="pointer-events-none w-[300px] select-none rounded-lg border border-[#f2cc8f]/40 bg-[#7a1f2b]/95 px-3 py-2 text-center shadow-2xl">
            <div className="text-[11px] font-bold tracking-widest text-[#ffe9b0]">SEMINAR PROPOSAL PROYEK KEPEMIMPINAN</div>
            <div className="text-[9px] tracking-[0.2em] text-[#f4ecdd]/85">PPG Prajabatan 2026 · Prodi Matematika UKSW</div>
          </div>
        </Html>
        {["#f2cc8f", "#e5989b", "#8ecae6", "#81b29a"].map((c, i) => (
          <group key={c} position={[-4.5 + i * 3, 0, 6.5]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 1.6, 4]} />
              {M("#57504a")}
            </mesh>
            <mesh position={[0, 1.75, 0]}>
              <planeGeometry args={[1, 1.35]} />
              <meshStandardMaterial color={c} roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
      <GlowMarker id="u-aula" position={[18, 1.8, -8]} color="#8ecae6" label="Cerita Aula" isLetter={false} onClick={() => setNarasi({ title: "Aula Seminar Lt.2", text: NARASI.aula })} />

      {/* ══ 5. PERPUSTAKAAN LT.7 ══ */}
      <group position={[-2, 0, -30]}>
        <mesh position={[0, 6.5, 0]}>
          <boxGeometry args={[9, 13, 7]} />
          {M("#bcd4e6")}
        </mesh>
        {Array.from({ length: 6 }).map((_, fl) =>
          [-3, -1.5, 0, 1.5, 3].map((cx) => (
            <mesh key={`${fl}${cx}`} position={[cx * 1.3, 1.8 + fl * 2, 3.54]}>
              <planeGeometry args={[1, 1.4]} />
              <meshStandardMaterial color="#5f8ac7" emissive="#8ecae6" emissiveIntensity={0.4} />
            </mesh>
          ))
        )}
        <mesh position={[0, 13.4, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[6, 2, 4]} />
          {M("#3d5a80")}
        </mesh>
        <Html position={[0, 15.2, 0]} center distanceFactor={17} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none rounded-xl border border-white/25 bg-[#3d5a80]/90 px-3 py-1 text-[11px] font-bold tracking-widest text-[#e3f0ff] shadow-xl">
            PERPUS LT.7 · KELAS BIRU-PUTIH
          </div>
        </Html>
        <Steps position={[0, 0, 4]} w={5} />
        {/* lift kaca */}
        <group position={[5.3, 0, 2]}>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[1.9, 4, 1.9]} />
            <meshStandardMaterial color="#8fa3b8" metalness={0.45} roughness={0.35} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 1.3, 0.98]}>
            <planeGeometry args={[1.5, 2.4]} />
            <meshStandardMaterial color="#cfe4f2" metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      </group>
      <GlowMarker id="u-perpus" position={[2.5, 1.7, -25.5]} color="#8ecae6" label="Naik Lift ke Lt.7" isLetter={false} onClick={() => setNarasi({ title: "Lift Menuju Lantai 7", text: NARASI.perpus })} />

      {/* ══ taman tengah & fasilitas ══ */}
      <Pond position={[8, 0, 8]} r={3} />
      <Gazebo position={[-10, 0, 6]} s={1.1} />
      <Statue position={[0, 0, 14]} />
      <FoodStall position={[-16, 0, -2]} ry={0.9} label="Kantin Mbak Sri" color="#81b29a" />
      <FoodStall position={[12, 0, -2]} ry={-0.8} label="Es Teh & Gorengan" color="#c25b4a" />
      {[[-13, -4], [-13, 0], [14, -5], [14, 1]].map(([x, z], i) => (
        <PicnicTable key={i} position={[x, 0, z]} ry={i * 0.4} />
      ))}
      <Banner position={[-4, 0, 20]} ry={0.4} title="PPG PRAJABATAN 2026" sub="Prodi Matematika" color="#2f4b7a" />
      <Banner position={[5, 0, 20]} ry={-0.4} title="SELAMAT BERJUANG!" sub="29 calon guru" color="#7a1f2b" />
      <Hedge from={[-6, 11]} to={[6, 11]} />
      <Hedge from={[-6, 2]} to={[6, 2]} />
      {[[-5, 5], [5, 5], [-5, 9], [5, 9]].map(([x, z], i) => (
        <FlowerBed key={i} position={[x, 0, z]} s={0.85} />
      ))}
      {[[-19, 22], [19, 8], [-27, -8], [27, -22], [-20, -22]].map(([x, z], i) => (
        <Planter key={i} position={[x, 0, z]} c={["#c25b4a", "#4a7a8c", "#7a6b4a", "#8a6fb0", "#4f772d"][i]} />
      ))}
      {[[-7, 13], [7, 13], [-7, 0], [7, 0], [-7, -6], [7, -6]].map(([x, z], i) => (
        <PathLight key={i} position={[x, 0, z]} />
      ))}
      {[[-10, 18], [10, 18], [-16, -8], [16, -8], [0, 26]].map(([x, z], i) => (
        <LampPost key={i} position={[x, 0, z]} />
      ))}
      {[[-4, 12], [4, 12], [-12, 2], [12, 2]].map(([x, z], i) => (
        <TrashBin key={i} position={[x, 0, z]} />
      ))}
      {[[-9, 16, 0.3], [9, 16, -0.3], [-18, 5, 1], [18, 6, -1], [-22, -12, 1.5], [22, -20, -1.5]].map(([x, z, ry], i) => (
        <Bench key={i} position={[x, 0, z]} ry={ry} />
      ))}

      {/* pepohonan & semak lebat */}
      {Array.from({ length: 26 }).map((_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const r = 30 + hash01(`ur${i}`) * 12;
        return <Tree key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r - 4]} s={1 + hash01(`us${i}`) * 0.8} tone={i % 3 ? "#4f772d" : "#3f6b35"} />;
      })}
      {Array.from({ length: 12 }).map((_, i) => (
        <Tree key={`t2${i}`} position={[(hash01(`ux${i}`) - 0.5) * 46, 0, (hash01(`uz${i}`) - 0.5) * 40 + 4]} s={0.9 + hash01(`uy${i}`) * 0.7} tone="#5a8a3f" />
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <Bush key={i} position={[(hash01(`ubx${i}`) - 0.5) * 52, 0, (hash01(`ubz${i}`) - 0.5) * 50]} s={0.8 + hash01(`ubs${i}`) * 0.5} />
      ))}

      {/* ══ dosen NPC + suratnya ══ */}
      {dosenAvatars.map(({ uc, user }) => {
        const zp = ZONE_POS[uc.zona as UkswZoneId] ?? [0, 0, 0];
        return (
          <group key={uc.id}>
            <Avatar3D
              config={user!.avatar!}
              position={[zp[0] + 1.6, 0, zp[2] + 2.4]}
              rotationY={Math.PI * 0.9}
              nameTag={user!.panggilan}
              role="dosen"
              isSelf={uc.penulis.id === session?.id}
              phase={hash01(uc.id) * 8}
              onClick={() => openUcapan(uc.id)}
            />
            <GlowMarker
              id={`uc-${uc.id}`}
              position={[zp[0] + 0.2, 1.6, zp[2] + 2.8]}
              color="#f2cc8f"
              label={`Surat ${user!.panggilan}`}
              onClick={() => openUcapan(uc.id)}
            />
          </group>
        );
      })}

      {/* ══ mahasiswa tersebar ══ */}
      {mahasiswaKampus.map(({ item, pos, ry }) => {
        const uc = world?.ucapan.find((x) => x.penulis.id === item.id);
        return (
          <Avatar3D
            key={item.id}
            config={item.avatar!}
            position={pos}
            rotationY={ry}
            nameTag={item.panggilan}
            role={item.peran}
            isSelf={item.id === session?.id}
            phase={hash01(item.id) * 9}
            onClick={uc ? () => openUcapan(uc.id) : undefined}
          />
        );
      })}
      {walkers.map((w, i) => (
        <WalkerNPC key={i} config={w.cfg} path={w.path} speed={w.speed} offset={w.off} />
      ))}

      <Mountain position={[-58, -2, -74]} s={1.7} color="#5b5e7c" snow smoke />
      <Mountain position={[52, -2, -80]} s={1.5} color="#45604e" />
      <Cloud position={[-22, 15, -34]} s={1.9} />
      <Cloud position={[20, 17, -26]} s={1.5} speed={0.07} />
      <Cloud position={[0, 16, 30]} s={1.7} speed={0.04} />

      <PortalRing position={[32, 0, 24]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={18} scale={18} size={1.3} speed={0.2} position={[0, 2.5, 0]} color="#fff2cc" />
    </group>
  );
}

function Scorebox() {
  return (
    <group position={[-33, 0, 14]} rotation={[0, Math.PI / 2, 0]}>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 2.2, 5]} />
          {M("#6b5a45")}
        </mesh>
      ))}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3, 1.4, 0.16]} />
        {M("#2f3b44")}
      </mesh>
      <Html position={[0, 2.5, 0.1]} center distanceFactor={13} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none text-center">
          <div className="text-[13px] font-black tracking-wider text-[#ffe9b0]">PPG 29 — 0 LELAH</div>
          <div className="text-[8px] uppercase tracking-[0.2em] text-[#f4ecdd]/80">Pertandingan persahabatan</div>
        </div>
      </Html>
    </group>
  );
}
