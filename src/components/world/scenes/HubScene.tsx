"use client";

import { useMemo } from "react";
import { Html, Sparkles } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { Ground, PortalRing, LampPost, Tree, ZoneChip, Gazebo } from "../primitives";

export default function HubScene() {
  const goScene = useStore((s) => s.goScene);
  const world = useStore((s) => s.world);
  const readSet = useStore((s) => s.readSet);

  const total = world?.totalUcapan ?? 0;
  const read = readSet.length;
  const pct = total ? Math.round((read / total) * 100) : 0;

  const lanterns = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 10 + (i % 3) * 2.4;
        return { pos: [Math.cos(a) * r, 4.6 + (i % 4) * 0.7, Math.sin(a) * r] as [number, number, number], c: ["#f2cc8f", "#e5989b", "#8ecae6", "#81b29a"][i % 4] };
      }),
    []
  );

  return (
    <group>
      <Ground size={70} color="#4c3b2e" />
      {/* lantai rotunda */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[13.5, 40]} />
        <meshStandardMaterial color="#6b563e" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[13.5, 14.4, 40]} />
        <meshStandardMaterial color="#f2cc8f" emissive="#f2cc8f" emissiveIntensity={0.25} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[2.6, 3, 32]} />
        <meshStandardMaterial color="#f2cc8f" emissive="#f2cc8f" emissiveIntensity={0.2} />
      </mesh>

      <ZoneChip position={[0, 6.4, 0]} title="HUB UTAMA" sub="Pilih portal untuk menjelajah" color="#f2cc8f" />

      {/* pedestal tengah */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[1.6, 1.9, 0.7, 8]} />
        <meshStandardMaterial color="#3a2d22" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <icosahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color="#f2cc8f" emissive="#e9a84a" emissiveIntensity={0.7} metalness={0.5} roughness={0.3} flatShading />
      </mesh>
      <Html position={[0, 2.35, 0]} center distanceFactor={13} zIndexRange={[15, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap text-center">
          <div className="font-display text-[26px] font-black text-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">2026</div>
          <div className="text-[9px] uppercase tracking-[0.35em] text-[#f4ecdd]/80">PPG Prajabatan · Matematika</div>
        </div>
      </Html>

      {/* 4 portal */}
      <PortalRing position={[-7.5, 0, -7.5]} color="#5f8ac7" label="KAMPUS UKSW" sub="Rumah Kedua Kita" onClick={() => goScene("uksw")} />
      <PortalRing position={[7.5, 0, -7.5]} color="#81b29a" label="AREA PPL" sub="Panggilan Nyata" onClick={() => goScene("ppl")} />
      <PortalRing position={[-7.5, 0, 7.5]} color="#c75146" label="YONIF 411/RAIDER" sub="Bela Negara Bersama" onClick={() => goScene("yonif")} />
      <PortalRing position={[7.5, 0, 7.5]} color="#f2a93b" label="BUKIT SALATIGA" sub="Ujung Perjalanan" onClick={() => goScene("bukit")} />

      {/* papan progress */}
      <group position={[0, 0, -13.5]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[7.4, 3.4, 0.3]} />
          <meshStandardMaterial color="#2b2119" roughness={1} flatShading />
        </mesh>
        {[-3.4, 3.4].map((x) => (
          <mesh key={x} position={[x, 1.2, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 2.4, 6]} />
            <meshStandardMaterial color="#3a2d22" roughness={1} flatShading />
          </mesh>
        ))}
        <Html position={[0, 2, 0.2]} center distanceFactor={11} zIndexRange={[15, 0]}>
          <div className="pointer-events-none select-none w-[280px] rounded-2xl border border-[#f2cc8f]/25 bg-[#1b1611]/90 p-3 text-center shadow-2xl backdrop-blur-sm">
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#f2cc8f]/80">Papan Progres</div>
            <div className="font-display text-[24px] font-bold text-[#f4ecdd]">
              {read}<span className="text-[#f2cc8f]/60 text-[15px]">/{total} ucapan</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#e9a84a] to-[#f2cc8f] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-[#f4ecdd]/70">
              {pct >= 100 ? "★ Semua terbaca — Finale menunggumu!" : `${pct}% perjalanan kenangan`}
            </div>
          </div>
        </Html>
      </group>

      <Gazebo position={[0, 0, 14]} s={1.15} />
      {lanterns.map((l, i) => (
        <group key={i} position={l.pos}>
          <mesh>
            <sphereGeometry args={[0.16, 6, 5]} />
            <meshStandardMaterial color={l.c} emissive={l.c} emissiveIntensity={1.1} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.45, 3]} />
            <meshBasicMaterial color="#f4ecdd66" />
          </mesh>
        </group>
      ))}
      {[[-12, -2], [12, -2], [-12, 4], [12, 4]].map(([x, z]) => (
        <LampPost key={`${x}${z}`} position={[x, 0, z]} />
      ))}
      {[
        [-16, -10, 1.2],
        [16, -11, 1],
        [-15, 12, 0.9],
        [17, 11, 1.3],
      ].map(([x, z, s], i) => (
        <Tree key={i} position={[x, 0, z]} s={s} tone={i % 2 ? "#5a7a3f" : "#4f772d"} />
      ))}
      <Sparkles count={40} scale={26} size={1.8} speed={0.25} position={[0, 4, 0]} color="#ffd9a0" />
    </group>
  );
}
