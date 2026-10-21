"use client";

import { useMemo } from "react";
import { Html, Sparkles } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { Ground, PortalRing, LampPost, Tree, ZoneChip, Gazebo, Bench } from "../primitives";
import { Fountain, FlowerBed, Bush, PicnicTable, TrashBin, Banner, PathLight, Statue, Planter, hash01 } from "../props";
import { WalkerNPC } from "../player";
import Avatar3D from "@/components/avatar/Avatar3D";
import { randomAvatar } from "@/lib/constants";

export default function HubScene() {
  const goScene = useStore((s) => s.goScene);
  const world = useStore((s) => s.world);
  const readSet = useStore((s) => s.readSet);

  const total = world?.totalUcapan ?? 0;
  const read = readSet.length;
  const pct = total ? Math.round((read / total) * 100) : 0;

  const walkers = useMemo(
    () => [
      { cfg: randomAvatar("P"), path: [[-9, 6], [-4, 9], [4, 9], [9, 5]] as [number, number][], speed: 1.3, off: 0 },
      { cfg: randomAvatar("P"), path: [[8, -4], [3, -8], [-4, -8], [-9, -3]] as [number, number][], speed: 1.1, off: 4 },
      { cfg: randomAvatar("L"), path: [[12, 10], [12, -10], [-12, -10], [-12, 10]] as [number, number][], speed: 1.6, off: 9 },
      { cfg: randomAvatar("P"), path: [[-14, 2], [-6, 2], [-6, -6], [-14, -6]] as [number, number][], speed: 1.0, off: 14 },
    ],
    []
  );

  const duduk = useMemo(
    () => [
      { cfg: randomAvatar("P"), pos: [-6.6, 0, 15.6] as [number, number, number], ry: 0.3 },
      { cfg: randomAvatar("P"), pos: [-5.1, 0, 16] as [number, number, number], ry: -2.6 },
      { cfg: randomAvatar("L"), pos: [6.6, 0, 15.6] as [number, number, number], ry: 0.2 },
      { cfg: randomAvatar("P"), pos: [14.6, 0, 2] as [number, number, number], ry: -1.6 },
      { cfg: randomAvatar("P"), pos: [-15, 0, -1.5] as [number, number, number], ry: 1.5 },
    ],
    []
  );

  const lanterns = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = 9 + (i % 4) * 2.6;
        return { pos: [Math.cos(a) * r, 6.4 + (i % 3) * 0.9, Math.sin(a) * r] as [number, number, number], c: ["#f2cc8f", "#e5989b", "#8ecae6", "#81b29a", "#cdb4f5"][i % 5] };
      }),
    []
  );

  return (
    <group>
      <Ground size={90} color="#5e7246" />
      {/* plaza melingkar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[19, 48]} />
        <meshStandardMaterial color="#c9bda2" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[18.6, 19.6, 48]} />
        <meshStandardMaterial color="#f2cc8f" emissive="#f2cc8f" emissiveIntensity={0.22} />
      </mesh>
      {[6.5, 12].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]}>
          <ringGeometry args={[r, r + 0.18, 40]} />
          <meshStandardMaterial color="#b0a386" />
        </mesh>
      ))}

      <ZoneChip position={[0, 7.2, 0]} title="HUB UTAMA" sub="Jalan dengan WASD / joystick · dekati portal" color="#f2cc8f" />

      {/* air mancur tengah */}
      <Fountain position={[0, 0, 0]} />
      <Html position={[0, 3.2, 0]} center distanceFactor={14} zIndexRange={[12, 0]}>
        <div className="pointer-events-none select-none text-center">
          <div className="font-display text-[22px] font-black text-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">2026</div>
          <div className="text-[8px] uppercase tracking-[0.3em] text-[#f4ecdd]/75">PPG Matematika · UKSW</div>
        </div>
      </Html>

      {/* 4 portal */}
      <PortalRing position={[-10.5, 0, -10.5]} color="#5f8ac7" label="KAMPUS UKSW" sub="Rumah Kedua Kita" onClick={() => goScene("uksw")} />
      <PortalRing position={[10.5, 0, -10.5]} color="#81b29a" label="AREA PPL" sub="Panggilan Nyata" onClick={() => goScene("ppl")} />
      <PortalRing position={[-10.5, 0, 10.5]} color="#c75146" label="YONIF 411/RAIDER" sub="Bela Negara Bersama" onClick={() => goScene("yonif")} />
      <PortalRing position={[10.5, 0, 10.5]} color="#f2a93b" label="BUKIT SALATIGA" sub="Ujung Perjalanan" onClick={() => goScene("bukit")} />

      {/* papan progres */}
      <group position={[0, 0, -18]}>
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[7.6, 3.4, 0.3]} />
          <meshStandardMaterial color="#2b2119" roughness={1} flatShading />
        </mesh>
        {[-3.5, 3.5].map((x) => (
          <mesh key={x} position={[x, 1.2, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 2.4, 6]} />
            <meshStandardMaterial color="#3a2d22" roughness={1} flatShading />
          </mesh>
        ))}
        <Html position={[0, 2.1, 0.2]} center distanceFactor={12} zIndexRange={[15, 0]}>
          <div className="pointer-events-none w-[280px] select-none rounded-2xl border border-[#f2cc8f]/25 bg-[#1b1611]/90 p-3 text-center shadow-2xl backdrop-blur-sm">
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#f2cc8f]/80">Papan Progres</div>
            <div className="font-display text-[24px] font-bold text-[#f4ecdd]">
              {read}
              <span className="text-[15px] text-[#f2cc8f]/60">/{total} ucapan</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#e9a84a] to-[#f2cc8f] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-[#f4ecdd]/70">{pct >= 100 ? "★ Semua terbaca — Finale menunggu!" : `${pct}% perjalanan kenangan`}</div>
          </div>
        </Html>
      </group>

      {/* gazebo & tempat duduk */}
      <Gazebo position={[-7, 0, 16]} s={1.2} />
      <Gazebo position={[7, 0, 16]} s={1.1} />
      <Bench position={[-7, 0, 13.6]} ry={0.1} />
      <Bench position={[7, 0, 13.6]} ry={-0.1} />
      <Bench position={[-15, 0, 0]} ry={Math.PI / 2} />
      <Bench position={[15, 0, 0]} ry={-Math.PI / 2} />
      <PicnicTable position={[-13, 0, 7]} ry={0.5} />
      <PicnicTable position={[13, 0, -6]} ry={-0.7} />
      <Statue position={[0, 0, -12]} />
      <PicnicTable position={[-4.5, 0, 9.5]} ry={0.25} />
      <PicnicTable position={[4.5, 0, 9.5]} ry={-0.25} />
      <Planter position={[-2.6, 0, 12.5]} c="#4a7a8c" />
      <Planter position={[2.6, 0, 12.5]} c="#c25b4a" />
      <Banner position={[-16, 0, -8]} ry={0.7} title="SELAMAT DATANG" sub="Jejak Langkah 2026" color="#7a1f2b" />
      <Banner position={[16, 0, -8]} ry={-0.7} title="29 CERITA" sub="satu keluarga" color="#2f5244" />

      {/* vegetasi & detail */}
      {[
        [-8, 17, 1.2], [8, 17, 1], [-17, 11, 1.3], [17, 11, 1.1], [-19, -13, 1.2], [19, -13, 1.4], [-6, -19, 1], [6, -19, 1.1],
      ].map(([x, z, s], i) => (
        <Tree key={i} position={[x, 0, z]} s={s} tone={i % 2 ? "#4f772d" : "#3f6b35"} />
      ))}
      {[[-4, 5], [4, 5], [-4, -5], [4, -5]].map(([x, z]) => (
        <FlowerBed key={`${x}${z}`} position={[x, 0, z]} s={0.9} />
      ))}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + 0.3;
        return <Bush key={i} position={[Math.cos(a) * 16.5, 0, Math.sin(a) * 16.5]} s={0.9 + hash01(`b${i}`) * 0.5} />;
      })}
      {[[-7, 7], [7, 7], [-7, -7], [7, -7], [0, 16], [0, -15]].map(([x, z], i) => (
        <PathLight key={i} position={[x, 0, z]} />
      ))}
      {[[-12, 3], [12, 3], [-12, -3], [12, -3]].map(([x, z]) => (
        <LampPost key={`l${x}${z}`} position={[x, 0, z]} />
      ))}
      {[[-11.5, 12.5], [11.5, 12.5]].map(([x, z]) => (
        <TrashBin key={x} position={[x, 0, z]} />
      ))}
      {[[-17, 4], [17, 4]].map(([x, z]) => (
        <Planter key={x} position={[x, 0, z]} c={x < 0 ? "#c25b4a" : "#4a7a8c"} />
      ))}

      {/* orang-orang ramai */}
      {walkers.map((w, i) => (
        <WalkerNPC key={i} config={w.cfg} path={w.path} speed={w.speed} offset={w.off} />
      ))}
      {duduk.map((d, i) => (
        <Avatar3D key={i} config={d.cfg} position={d.pos} rotationY={d.ry} phase={i * 1.7} />
      ))}

      {lanterns.map((l, i) => (
        <mesh key={i} position={l.pos}>
          <icosahedronGeometry args={[0.17, 0]} />
          <meshStandardMaterial color={l.c} emissive={l.c} emissiveIntensity={1.2} />
        </mesh>
      ))}
      <Sparkles count={18} scale={16} size={1.4} speed={0.2} position={[0, 2.5, 0]} color="#ffd9a0" />
    </group>
  );
}
