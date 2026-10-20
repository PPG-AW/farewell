"use client";

import { useMemo } from "react";
import { Html, Sparkles } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import {
  Ground, Building, GateArch, FlagPole, Tree, LampPost, GlowMarker, ZoneChip,
  PortalRing, Mountain, Cloud, Gazebo, Bench, InteractiveGroup,
} from "../primitives";
import { SEKOLAH_LIST } from "@/lib/constants";

type SchoolMeta = (typeof SEKOLAH_LIST)[number];

function Signboard({ s, pos, ry, onClick }: { s: SchoolMeta; pos: [number, number, number]; ry: number; onClick: () => void }) {
  return (
    <InteractiveGroup onClick={onClick}>
      <group position={pos} rotation={[0, ry, 0]}>
        {[-1.6, 1.6].map((x) => (
          <mesh key={x} position={[x, 1.15, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 2.3, 5]} />
            <meshStandardMaterial color="#5c4033" roughness={1} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[4, 1.35, 0.18]} />
          <meshStandardMaterial color={s.warna} emissive={s.warna} emissiveIntensity={0.22} roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.95, 0]}>
          <boxGeometry args={[4.35, 0.16, 0.3]} />
          <meshStandardMaterial color={s.secondary} />
        </mesh>
        <Html position={[0, 2.1, 0.12]} center distanceFactor={13} zIndexRange={[18, 0]}>
          <div className="pointer-events-none select-none text-center">
            <div className="rounded-lg px-3 py-1 text-[15px] font-black tracking-wider" style={{ color: s.secondary, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              {s.singkat}
            </div>
            <div className="mt-0.5 whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-white/85">{s.ciri.split(",")[0]}</div>
          </div>
        </Html>
      </group>
    </InteractiveGroup>
  );
}

export function PplPlazaScene() {
  const goScene = useStore((s) => s.goScene);
  const signPos = useMemo(
    () =>
      SEKOLAH_LIST.map((s, i) => {
        const a = ((i - 2) / 5.2) * Math.PI; // fan arrangement
        return { s, pos: [Math.sin(a) * 13, 0, -Math.cos(a) * 13 - 1] as [number, number, number], ry: -a };
      }),
    []
  );

  return (
    <group>
      <Ground size={110} color="#8aa05a" />
      <ZoneChip position={[0, 8, -4]} title="AREA PPL" sub="Panggilan Nyata · Pilih sekolahmu" color="#81b29a" />
      {/* jalan persimpangan */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[4.2, 30]} />
        <meshStandardMaterial color="#8d8577" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 4]}>
        <planeGeometry args={[26, 4.2]} />
        <meshStandardMaterial color="#8d8577" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -2]}>
        <circleGeometry args={[3.4, 28]} />
        <meshStandardMaterial color="#a79c86" roughness={1} />
      </mesh>
      {/* tugu penunjuk */}
      <mesh position={[0, 1.1, -2]}>
        <cylinderGeometry args={[0.35, 0.5, 2.2, 8]} />
        <meshStandardMaterial color="#e8ddb5" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 2.4, -2]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#81b29a" emissive="#81b29a" emissiveIntensity={0.6} flatShading />
      </mesh>

      {signPos.map(({ s, pos, ry }) => (
        <Signboard
          key={s.id}
          s={s}
          pos={pos}
          ry={ry}
          onClick={() => goScene("ppl", { school: s.id, label: `${s.id} — Sekolah PPL`, warna: s.warna })}
        />
      ))}

      {/* mini gedung tiap sekolah di belakang signboard */}
      {signPos.map(({ s, pos, ry }) => (
        <Building
          key={`b${s.id}`}
          position={[pos[0] + Math.sin(ry) * 0 + (pos[0] / 13) * 5.5, 0, pos[2] - 5.5]}
          size={[6, 4 + (SEKOLAH_LIST.indexOf(s) % 3), 4]}
          color={s.secondary}
          roof={s.warna}
        />
      ))}

      {[
        [-8, 8, 1.3], [8, 9, 1], [-15, 2, 0.9], [15, 3, 1.2], [-5, -16, 1], [5, -16, 1.1],
      ].map(([x, z, sc], i) => (
        <Tree key={i} position={[x, 0, z]} s={sc} tone={i % 2 ? "#5a7a3f" : "#6a994e"} />
      ))}
      {[[-3.2, 4], [3.2, 4]].map(([x, z]) => (
        <LampPost key={`${x}`} position={[x, 0, z]} color="#ffd9a0" />
      ))}
      <Mountain position={[-40, -2, -56]} s={1.5} color="#5b5e7c" snow smoke />
      <Mountain position={[36, -2.4, -60]} s={1.3} color="#45604e" />
      <Cloud position={[-18, 12, -30]} s={1.9} opacity={0.5} />
      <Cloud position={[16, 13.5, -26]} s={1.5} opacity={0.45} speed={0.06} />
      <PortalRing position={[0, 0, 12]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={40} scale={30} size={1.9} speed={0.3} position={[0, 4, -4]} color="#ffdda1" />
    </group>
  );
}

// ─── Scene per sekolah ──────────────────────────────────────────────────────
export function SchoolScene({ schoolId }: { schoolId: string }) {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const goScene = useStore((s) => s.goScene);
  const meta = SEKOLAH_LIST.find((s) => s.id === schoolId) ?? SEKOLAH_LIST[0];

  const students = useMemo(() => {
    const list = (world?.users ?? []).filter((u) => u.peran !== "dosen" && u.sekolahPpl === schoolId && u.avatar);
    return list.map((u, i) => {
      const a = ((i / Math.max(1, list.length)) * Math.PI - Math.PI) * 0.78 + Math.PI / 2;
      const r = 5;
      return {
        u,
        pos: [Math.cos(a) * r, 0, 4 + Math.sin(a) * r] as [number, number, number],
        ry: Math.atan2(-Math.cos(a), -Math.sin(a)) + Math.PI,
      };
    });
  }, [world?.users, schoolId]);

  const ci = SEKOLAH_LIST.indexOf(meta);

  return (
    <group>
      <Ground size={90} color="#87a35c" />
      <ZoneChip position={[0, 8.5, -6]} title={meta.id.toUpperCase()} sub={meta.ciri} color={meta.warna} />
      <GateArch position={[0, 0, 16]} width={6.4} height={3.2} color={meta.secondary} label={meta.id.toUpperCase()} sub="Sekolah PPL" />

      {/* gedung utama */}
      <Building position={[0, 0, -9]} size={[13, 5 + (ci % 2) * 2.5, 6]} color={meta.secondary} roof={meta.warna} floors={2} />
      {/* ruang kelas detail: meja+whiteboard di depan gedung */}
      <group position={[-3.2, 0, -4.6]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[i * 1.1, 0.4, 0]}>
            <boxGeometry args={[0.9, 0.5, 0.55]} />
            <meshStandardMaterial color="#b08968" roughness={1} flatShading />
          </mesh>
        ))}
        <group position={[1.1, 0, -1.3]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 1.4, 0]}>
            <planeGeometry args={[2.6, 1.3]} />
            <meshStandardMaterial color="#f4f1de" emissive="#ffffff" emissiveIntensity={0.15} />
          </mesh>
          <Html position={[0, 1.4, 0.06]} center distanceFactor={9} zIndexRange={[8, 0]}>
            <div className="pointer-events-none select-none whitespace-pre text-left font-hand text-[13px] leading-tight text-[#3d405b]">
              {"y = mx + c\nΔ = b² − 4ac\nKelas hari ini ♥"}
            </div>
          </Html>
        </group>
      </group>
      <FlagPole position={[4.5, 0, -4]} h={5.5} />

      {/* ciri khas per sekolah */}
      {ci === 0 && (
        <>
          <Tree position={[-7, 0, -2]} s={2.1} tone="#3d5a2f" />
          <Tree position={[-8.4, 0, -5]} s={1.6} tone="#4a6b38" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.018, 3]}>
            <planeGeometry args={[9, 8]} />
            <meshStandardMaterial color="#d8c98a" roughness={1} />
          </mesh>
        </>
      )}
      {ci === 1 && (
        <>
          <Gazebo position={[-7.5, 0, 2]} s={1.2} />
          {[
            [-5.5, 4.5], [-4, 5.5], [5.5, 4.5], [6.8, 3.4], [0, 7.5],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              {["#e5989b", "#f2cc8f", "#e07a5f"].map((c, k) => (
                <mesh key={k} position={[k * 0.22 - 0.22, 0.16, 0]}>
                  <icosahedronGeometry args={[0.12, 0]} />
                  <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.25} flatShading />
                </mesh>
              ))}
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.5, 0.55, 0.12, 7]} />
                <meshStandardMaterial color="#4f772d" roughness={1} flatShading />
              </mesh>
            </group>
          ))}
        </>
      )}
      {ci === 2 && (
        <>
          {[[-8, 0, 1.7], [8, -1, 1.4], [-6, -7, 1.2], [7, -8, 1.5]].map(([x, z, sc], i) => (
            <Tree key={i} position={[x, 0, z]} s={sc} tone="#3d6b34" />
          ))}
          {/* musholla */}
          <group position={[-8, 0, -8]}>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[3, 2.4, 3]} />
              <meshStandardMaterial color="#e9edc9" roughness={1} flatShading />
            </mesh>
            <mesh position={[0, 2.9, 0]} scale={[1, 0.85, 1]}>
              <sphereGeometry args={[1.7, 8, 6]} />
              <meshStandardMaterial color="#4f772d" roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, 3.9, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 4]} />
              <meshStandardMaterial color="#f2cc8f" />
            </mesh>
          </group>
        </>
      )}
      {ci === 3 && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.018, 4]}>
            <planeGeometry args={[10, 7]} />
            <meshStandardMaterial color="#6faf55" roughness={1} />
          </mesh>
          {[-3.5, 3.5].map((x) => (
            <group key={x} position={[5 + (x > 0 ? 4.6 : -4.6), 0, 4]}>
              {[-1.1, 1.1].map((z) => (
                <mesh key={z} position={[0, 0.6, z]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.2, 5]} />
                  <meshStandardMaterial color="#f4f1de" />
                </mesh>
              ))}
              <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 2.24, 5]} />
                <meshStandardMaterial color="#f4f1de" />
              </mesh>
            </group>
          ))}
          {/* kantin */}
          <group position={[-8, 0, 3]}>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[3.4, 2.6, 2.6]} />
              <meshStandardMaterial color="#f4ead8" roughness={1} flatShading />
            </mesh>
            <mesh position={[0, 2.75, 0.4]} rotation={[0.22, 0, 0]}>
              <boxGeometry args={[3.8, 0.12, 3]} />
              <meshStandardMaterial color="#c75146" roughness={1} flatShading />
            </mesh>
            <Bench position={[0, 0, 2.2]} />
          </group>
        </>
      )}
      {ci === 4 && (
        <>
          {/* bengkel */}
          <Building position={[-8, 0, -4]} size={[6, 3.4, 5]} color="#d9d3c7" roof="#5b6b7c" flat />
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-9.6 + i * 1.7, 0.5, -0.9]}>
              <boxGeometry args={[1.2, 1, 0.9]} />
              <meshStandardMaterial color={["#c75146", "#5f8ac7", "#e9a84a"][i]} roughness={0.8} flatShading />
            </mesh>
          ))}
          <mesh position={[-8, 1.8, 0.2]}>
            <boxGeometry args={[2.6, 2, 0.2]} />
            <meshStandardMaterial color="#5b6b7c" roughness={0.8} flatShading />
          </mesh>
        </>
      )}

      {/* avatar para murid PPL di sekolah ini */}
      {students.map(({ u, pos, ry }) => {
        const uc = world?.ucapan.find((x) => x.penulis.id === u.id);
        const isSelf = u.id === session?.id;
        return (
          <group key={u.id}>
            <Avatar3D
              config={u.avatar!}
              position={pos}
              rotationY={ry}
              nameTag={u.panggilan}
              role={u.peran}
              isSelf={isSelf}
              onClick={uc ? () => openUcapan(uc.id) : undefined}
            />
          </group>
        );
      })}
      {students.length === 0 && (
        <GlowMarker
          position={[0, 1.6, 3]}
          color={meta.warna}
          isLetter={false}
          label="Sekolah ini sepi…"
          onClick={() => useStore.getState().setNarasi({ title: meta.id, text: "Belum ada mahasiswa angkatanmu yang PPL di sekolah ini. Tapi kenangan tetap bisa dititipkan di sini." })}
        />
      )}

      <Mountain position={[-34, -2, -46]} s={1.4} color="#5b5e7c" snow smoke />
      <Mountain position={[30, -2.4, -50]} s={1.25} color="#45604e" />
      <Cloud position={[-12, 11, -26]} s={1.7} opacity={0.5} />
      <Cloud position={[14, 12.5, -22]} s={1.4} opacity={0.42} speed={0.06} />
      {[[-12, 9], [12, 9]].map(([x, z]) => (
        <LampPost key={`${x}`} position={[x, 0, z]} />
      ))}
      <PortalRing position={[-5.5, 0, 16]} color={meta.warna} label="PERSIMPANGAN" sub="Kembali ke 5 sekolah" onClick={() => goScene("ppl")} />
      <Sparkles count={32} scale={26} size={1.8} speed={0.3} position={[0, 3.5, 0]} color="#fff1c9" />
    </group>
  );
}
