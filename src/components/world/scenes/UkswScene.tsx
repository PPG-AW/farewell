"use client";

import { useMemo } from "react";
import { Html, Sparkles } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import {
  Ground, Building, GateArch, FlagPole, Tree, LampPost, GlowMarker, ZoneChip,
  PortalRing, Mountain, Cloud, InteractiveGroup,
} from "../primitives";
import { NARASI, randomAvatar, type UkswZoneId } from "@/lib/constants";

const ZONE_POS: Record<UkswZoneId, [number, number, number]> = {
  parkir: [14, 0, 10],
  lapangan: [-18, 0, 12],
  e102: [-16, 0, -14.5],
  e105: [-9, 0, -14.5],
  e107: [-2, 0, -14.5],
  e108: [5, 0, -14.5],
  aula: [16, 0, -12],
  perpus: [0, 0, -30],
};

const KELAS_LABEL: [UkswZoneId, string][] = [
  ["e102", "E102"],
  ["e105", "E105"],
  ["e107", "E107"],
  ["e108", "E108"],
];

function Motor({ position, ry, warna }: { position: [number, number, number]; ry: number; warna: string }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.22, 0.26, 1]} />
        <meshStandardMaterial color={warna} roughness={0.6} flatShading />
      </mesh>
      {[-0.42, 0.45].map((z) => (
        <mesh key={z} position={[0, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.09, 10]} />
          <meshStandardMaterial color="#26232e" roughness={1} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.62, -0.42]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 5]} />
        <meshStandardMaterial color="#57504a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function ClassDoor({ label, x, onClick, glowing }: { label: string; x: number; onClick: () => void; glowing: boolean }) {
  return (
    <group>
      <mesh position={[x, 1.05, -15.42]}>
        <planeGeometry args={[1.15, 1.9]} />
        <meshStandardMaterial color={glowing ? "#7a4a2e" : "#5c4033"} emissive={glowing ? "#f2cc8f" : "#000000"} emissiveIntensity={glowing ? 0.18 : 0} />
      </mesh>
      <Html position={[x, 2.4, -15.3]} center distanceFactor={13} zIndexRange={[12, 0]}>
        <div className="pointer-events-none select-none rounded-md bg-[#2b2119]/90 px-2 py-0.5 text-[11px] font-bold tracking-[0.2em] text-[#f2cc8f] border border-[#f2cc8f]/30 shadow-lg">
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function UkswScene() {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const goScene = useStore((s) => s.goScene);

  const dosenUcapan = useMemo(
    () => (world?.ucapan ?? []).filter((u) => u.penulis.peran === "dosen"),
    [world?.ucapan]
  );
  const zoneWithUcapan = useMemo(() => new Set(dosenUcapan.map((u) => u.zona)), [dosenUcapan]);

  const dosenAvatars = useMemo(() => {
    const users = world?.users ?? [];
    return dosenUcapan
      .map((uc) => ({ uc, user: users.find((u) => u.id === uc.penulis.id) }))
      .filter((x) => x.user?.avatar);
  }, [dosenUcapan, world?.users]);

  const ambient = useMemo(
    () =>
      [
        { cfg: randomAvatar("P"), pos: [-6, 0, 2] as [number, number, number], ry: 0.9 },
        { cfg: randomAvatar("P"), pos: [-5, 0, 3.4] as [number, number, number], ry: -2.3 },
        { cfg: randomAvatar("L"), pos: [7, 0, -6] as [number, number, number], ry: 2.8 },
        { cfg: randomAvatar("P"), pos: [8.2, 0, -6.4] as [number, number, number], ry: -2.9 },
      ],
    []
  );

  const trees: [number, number, number][] = [
    [-26, 0, -4], [-24, 0, -26], [12, 0, 18], [23, 0, 6], [-30, 0, 24], [8, 0, 6], [26, 0, 22], [-8, 0, 22],
  ];

  return (
    <group>
      <Ground size={130} color="#7d9c62" />
      <ZoneChip position={[0, 9.5, -4]} title="KAMPUS UKSW" sub="Rumah Kedua Kita · Salatiga" color="#8ecae6" />

      {/* ── Sub-area 1: Gerbang & Parkir ── */}
      <GateArch position={[16, 0, 18]} width={7} height={3.4} color="#e8ddb5" label="UNIVERSITAS KRISTEN SATYA WACANA" sub="Salatiga" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.015, 10]}>
        <planeGeometry args={[9, 7]} />
        <meshStandardMaterial color="#57504a" roughness={1} />
      </mesh>
      <Motor position={[13.4, 0, 8]} ry={0.6} warna="#c75146" />
      <Motor position={[15.4, 0, 7.4]} ry={0.5} warna="#3d6fb4" />
      <Motor position={[17.4, 0, 8.1]} ry={0.55} warna="#f2a93b" />
      {/* pos satpam + narasi */}
      <Building position={[20.4, 0, 12.6]} size={[2.2, 2.2, 2]} color="#f4f1de" roof="#a3522f" />

      {/* ── Sub-area 2: Lapangan Bola ── */}
      <group position={[-18, 0, 14]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[22, 13]} />
          <meshStandardMaterial color="#6faf55" roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[1.9, 2.05, 24]} />
          <meshStandardMaterial color="#f4f1de" />
        </mesh>
        {[-10.4, 10.4].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-1.4, 1.4].map((z) => (
              <mesh key={z} position={[0, 0.7, z]}>
                <cylinderGeometry args={[0.045, 0.045, 1.4, 5]} />
                <meshStandardMaterial color="#f4f1de" />
              </mesh>
            ))}
            <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 2.85, 5]} />
              <meshStandardMaterial color="#f4f1de" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.14, 3.5]}>
          <icosahedronGeometry args={[0.16, 1]} />
          <meshStandardMaterial color="#f4f1de" roughness={0.5} />
        </mesh>
        {/* tribune */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.3 + i * 0.5, -8 - i * 0.7]}>
            <boxGeometry args={[12, 0.5, 1]} />
            <meshStandardMaterial color={i % 2 ? "#c7c2b4" : "#a79c86"} roughness={1} flatShading />
          </mesh>
        ))}
      </group>
      <FlagPole position={[-6, 0, 20]} h={6} />

      {/* ── Sub-area 3: Lorong kelas E102–E108 ── */}
      <Building position={[-6.5, 0, -18]} size={[28, 7, 5]} color="#efe6c8" roof="#a3522f" floors={2} />
      {KELAS_LABEL.map(([zid, lbl]) => {
        const x = ZONE_POS[zid][0];
        return (
          <InteractiveGroup key={zid} onClick={() => useStore.getState().setNarasi({ title: `Ruang ${lbl}`, text: NARASI[zid] })}>
            <ClassDoor label={lbl} x={x} glowing={zoneWithUcapan.has(zid)} onClick={() => {}} />
          </InteractiveGroup>
        );
      })}
      {/* papan rumus E102 */}
      <mesh position={[-16, 1.6, -15.4]}>
        <planeGeometry args={[2.2, 1.1]} />
        <meshStandardMaterial color="#2f4034" emissive="#81b29a" emissiveIntensity={0.12} />
      </mesh>
      <Html position={[-16, 1.6, -15.32]} center distanceFactor={15} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none font-hand text-[13px] leading-tight text-[#d9f2dc]/90 whitespace-pre text-left drop-shadow">
          {"∫ x² dx = x³/3 + C\nlim x→∞ (1+1/x)ˣ = e\nπ = 3,14159…"}
        </div>
      </Html>
      {/* podium & tripod E107 */}
      <mesh position={[-3.2, 0.35, -14.2]}>
        <boxGeometry args={[0.8, 0.7, 0.5]} />
        <meshStandardMaterial color="#8a5a2c" roughness={1} flatShading />
      </mesh>
      <group position={[-0.9, 0, -13.6]}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.24, 0.16, 0.2]} />
          <meshStandardMaterial color="#26232e" roughness={0.6} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.16, 0.4, Math.sin(a) * 0.16]} rotation={[Math.cos(a) * 0.3, 0, Math.sin(a) * -0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 0.9, 4]} />
              <meshStandardMaterial color="#57504a" />
            </mesh>
          );
        })}
      </group>
      {/* kursi tunggal + lampu E108 */}
      <group position={[5.9, 0, -14]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.45]} />
          <meshStandardMaterial color="#8a5a2c" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 0.55, -0.2]}>
          <boxGeometry args={[0.5, 0.6, 0.06]} />
          <meshStandardMaterial color="#8a5a2c" roughness={1} flatShading />
        </mesh>
        {[-0.2, 0.2].map((x) =>
          [-0.16, 0.16].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.1, z]}>
              <cylinderGeometry args={[0.025, 0.025, 0.24, 4]} />
              <meshStandardMaterial color="#5c4033" />
            </mesh>
          ))
        )}
      </group>
      <LampPost position={[6.8, 0, -13.9]} color="#ffd9a0" />

      {/* ── Sub-area 4: Aula seminar + tangga spiral ── */}
      <Building position={[18, 0, -16]} size={[10, 8, 7]} color="#e6d9b8" roof="#8a3b2a" floors={2} />
      <group position={[11.6, 0, -13]}>
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 4, 6]} />
          <meshStandardMaterial color="#5c4033" roughness={1} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = i * 0.5;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.75, 0.25 + i * 0.3, Math.sin(a) * 0.75]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.9, 0.09, 0.4]} />
              <meshStandardMaterial color="#a79c86" roughness={1} flatShading />
            </mesh>
          );
        })}
      </group>
      <Html position={[18, 5.4, -12.4]} center distanceFactor={15} zIndexRange={[10, 0]}>
        <div className="pointer-events-none select-none w-[300px] rounded-lg bg-[#7a1f2b]/95 px-3 py-2 text-center shadow-2xl border border-[#f2cc8f]/40">
          <div className="text-[11px] font-bold tracking-widest text-[#ffe9b0]">SEMINAR PROPOSAL PROYEK KEPEMIMPINAN</div>
          <div className="text-[9px] tracking-[0.2em] text-[#f4ecdd]/85">PPG Prajabatan 2026 · Prodi Matematika UKSW</div>
        </div>
      </Html>
      {/* poster boards */}
      {["#f2cc8f", "#e5989b", "#8ecae6"].map((c, i) => (
        <group key={c} position={[13.6 + i * 1.4, 0, -11.6]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.4, 4]} />
            <meshStandardMaterial color="#57504a" />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <planeGeometry args={[0.9, 1.2]} />
            <meshStandardMaterial color={c} />
          </mesh>
        </group>
      ))}
      <GlowMarker position={[13.2, 2, -11.2]} color="#8ecae6" label="Cerita Aula" isLetter={false} onClick={() => useStore.getState().setNarasi({ title: "Aula Seminar Lt.2", text: NARASI.aula })} />

      {/* ── Sub-area 5: Perpustakaan Lt.7 (Kelas Biru-Putih) ── */}
      <group position={[0, 0, -34]}>
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[7, 11, 5]} />
          <meshStandardMaterial color="#bcd4e6" roughness={0.9} flatShading />
        </mesh>
        {Array.from({ length: 5 }).map((_, fl) =>
          [-2, -1, 0, 1, 2].map((cx) => (
            <mesh key={`${fl}${cx}`} position={[cx * 1.25, 1.6 + fl * 1.9, 2.54]}>
              <planeGeometry args={[0.85, 1.2]} />
              <meshStandardMaterial color="#5f8ac7" emissive="#8ecae6" emissiveIntensity={0.35} />
            </mesh>
          ))
        )}
        <mesh position={[0, 11.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[4.6, 1.8, 4]} />
          <meshStandardMaterial color="#3d5a80" roughness={1} flatShading />
        </mesh>
        <Html position={[0, 12.8, 0]} center distanceFactor={16} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none rounded-xl bg-[#3d5a80]/90 px-3 py-1 text-[11px] font-bold tracking-widest text-[#e3f0ff] border border-white/25 shadow-xl">
            PERPUS LT.7 · KELAS BIRU-PUTIH
          </div>
        </Html>
        {/* lift */}
        <group position={[3.9, 0, 1]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[1.6, 3, 1.6]} />
            <meshStandardMaterial color="#5b6b7c" roughness={0.7} metalness={0.2} flatShading />
          </mesh>
          {[-0.4, 0.4].map((x) => (
            <mesh key={x} position={[x, 1.1, 0.81]}>
              <planeGeometry args={[0.74, 2]} />
              <meshStandardMaterial color="#8fa3b8" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
          <InteractiveGroup onClick={() => useStore.getState().setNarasi({ title: "Lift Menuju Lantai 7", text: NARASI.perpus })}>
            <mesh position={[0, 1.1, 0.82]}>
              <boxGeometry args={[1.6, 2.1, 0.04]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </InteractiveGroup>
        </group>
      </group>

      {/* narasi markers */}
      <GlowMarker position={[20.5, 1.6, 9]} color="#8ecae6" label="Cerita Parkir" isLetter={false} onClick={() => useStore.getState().setNarasi({ title: "Parkir & Gerbang", text: NARASI.parkir })} />
      <GlowMarker position={[-18, 1.8, 17.8]} color="#8ecae6" label="Cerita Lapangan" isLetter={false} onClick={() => useStore.getState().setNarasi({ title: "Lapangan Bola", text: NARASI.lapangan })} />

      {/* ── Dosen NPC + ucapan mereka ── */}
      {dosenAvatars.map(({ uc, user }) => {
        const zp = ZONE_POS[uc.zona as UkswZoneId] ?? [0, 0, 0];
        const isSelf = uc.penulis.id === session?.id;
        return (
          <group key={uc.id}>
            <Avatar3D
              config={user!.avatar!}
              position={[zp[0] + 1.4, 0, zp[2] + 1.2]}
              rotationY={Math.PI * 0.85}
              nameTag={user!.panggilan}
              role="dosen"
              isSelf={isSelf}
              onClick={() => openUcapan(uc.id)}
            />
            <GlowMarker position={[zp[0] + 0.4, 1.7, zp[2] + 1.8]} color="#f2cc8f" label={`Surat ${user!.panggilan}`} onClick={() => openUcapan(uc.id)} read={!uc || undefined} />
          </group>
        );
      })}

      {/* ambient mahasiswa */}
      {ambient.map((a, i) => (
        <Avatar3D key={i} config={a.cfg} position={a.pos} rotationY={a.ry} scale={0.98} />
      ))}

      {/* kontras alam */}
      {trees.map((t, i) => (
        <Tree key={i} position={t} s={1 + (i % 3) * 0.35} tone={i % 2 ? "#5a7a3f" : "#4f772d"} />
      ))}
      {[[-12, 4], [4, 10], [-24, 4], [12, -4]].map(([x, z]) => (
        <LampPost key={`${x}${z}`} position={[x, 0, z]} />
      ))}
      <Mountain position={[-52, -2, -64]} s={1.6} color="#5b5e7c" snow smoke />
      <Mountain position={[46, -2, -70]} s={1.4} color="#45604e" />
      <Cloud position={[-20, 13, -30]} s={1.8} />
      <Cloud position={[18, 15, -22]} s={1.4} speed={0.07} />
      <Cloud position={[0, 14, 26]} s={1.6} speed={0.04} />

      <PortalRing position={[26, 0, 20]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={36} scale={34} size={1.7} speed={0.22} position={[0, 4, 0]} color="#fff2cc" />
    </group>
  );
}
