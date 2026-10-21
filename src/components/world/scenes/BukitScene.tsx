"use client";

import { useMemo } from "react";
import { Sparkles, Stars } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import {
  Ground, Mountain, Gazebo, Bench, LampPost, Pine, Tree, GlowMarker, StonePath, ZoneChip, PortalRing, Cloud, Campfire,
} from "../primitives";
import { Bush, PicnicTable, TrashBin, FoodStall, PathLight, Pond, Banner, hash01, scatterSpots, M } from "../props";
import { WalkerNPC } from "../player";
import { randomAvatar } from "@/lib/constants";

const LANTERNS: { pos: [number, number, number]; title: string; text: string }[] = [
  { pos: [-7.5, 1.4, 6], title: "Lentera 1 — Langkah Pertama", text: "Masih ingat hari pertama menginjakkan kaki di UKSW? Gugup, canggung, tidak tahu harus duduk di mana. Sekarang lihat: kita berdiri di puncak bukit ini bersama." },
  { pos: [8, 1.5, 3.5], title: "Lentera 2 — Rumus Pertama", text: "Setiap rumus yang kita tulis di papan tulis adalah huruf-huruf doa. Semoga setiap 'a² + b²' yang kau ajarkan berbuah rasa ingin tahu di hati murid-muridmu." },
  { pos: [-11, 1.6, -5], title: "Lentera 3 — Merapi di Kiri", text: "Merapi tak pernah berhenti tersenyum pada Salatiga. Begitu juga kami — meski nanti berjauhan, doa kami tak pernah berhenti menyertaimu." },
  { pos: [12, 1.7, -7], title: "Lentera 4 — Merbabu di Kanan", text: "Merbabu tenang dan sabar, seperti guru yang baik. Jadilah seperti Merbabu: tidak berisik, tapi menguatkan semua yang mendekat." },
  { pos: [0, 1.8, -13], title: "Lentera 5 — Jejak Langkah", text: "Dari bukit ini semua terlihat kecil — kampus, sekolah, barak. Tapi jejak langkah kita tergores besar selamanya. Sampai jumpa, guru-guru hebat. Jangan lupa bahagia." },
];

// titik berkumpul yang tersebar di seluruh bukit
const SPOTS: [number, number, number][] = [
  [-5.5, 0, 9], [5, 0, 10], [-13, 0, 2], [13.5, 0, 1], [-9, 0, -9], [9.5, 0, -10],
  [-3, 0, -16], [4, 0, -17], [-17, 0, -3], [17, 0, -4], [0, 0, 5], [-7, 0, 15],
  [7.5, 0, 15], [-15, 0, 10], [15, 0, 9], [2, 0, -8], [-2.5, 0, 0.5], [11, 0, 6],
];

export default function BukitScene() {
  const setNarasi = useStore((s) => s.setNarasi);
  const goScene = useStore((s) => s.goScene);
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);

  // beberapa teman "mendaki" di bukit (yang namanya berakhir pola tertentu) agar tiap zona tak kosong
  const pendaki = useMemo(() => {
    const list = (world?.users ?? []).filter((u) => u.avatar && hash01(u.id, 3) > 0.62).slice(0, 10);
    return scatterSpots(list, SPOTS);
  }, [world?.users]);

  const walkers = useMemo(
    () => [
      { cfg: randomAvatar("P"), path: [[-4, 14], [0, 8], [4, 2], [0, -4], [-4, 4]] as [number, number][], speed: 1.1, off: 0 },
      { cfg: randomAvatar("L"), path: [[14, 12], [6, 14], [-6, 13], [-14, 11]] as [number, number][], speed: 1.4, off: 6 },
    ],
    []
  );

  const city = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: (hash01(`cx${i}`) - 0.5) * 54,
        z: -40 - hash01(`cz${i}`) * 18,
        s: 0.3 + hash01(`cs${i}`) * 0.8,
        c: ["#ffd9a0", "#f2cc8f", "#fff4d6", "#f7b267", "#ffe9b0"][i % 5],
      })),
    []
  );

  return (
    <group>
      <Ground size={80} color="#48603a" />
      <Stars radius={110} depth={40} count={2200} factor={3.4} fade speed={0.5} />
      <ZoneChip position={[0, 7.5, -10]} title="BUKIT SALATIGA" sub="Ujung Perjalanan · 5 lentera kenangan" color="#f2a93b" />

      {/* jalur setapak panjang */}
      <StonePath
        points={[[0, 22], [0.8, 19], [-0.6, 16], [0.5, 13], [-0.4, 10], [0.6, 7], [0, 4], [-0.7, 1], [0.5, -2], [-0.3, -5], [0.4, -8], [0, -11], [-0.5, -14]]}
      />
      {/* undakan tanah berlapis */}
      {[
        { r: 23, y: -0.15, c: "#3f5533" },
        { r: 15, y: 0.0, c: "#4b6b3b" },
        { r: 8.5, y: 0.12, c: "#56763f" },
      ].map((t, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, t.y + 0.02, -2]}>
          <circleGeometry args={[t.r, 28]} />
          <meshStandardMaterial color={t.c} roughness={1} />
        </mesh>
      ))}

      {/* panorama gunung & kota */}
      <Mountain position={[-30, -3, -54]} s={1.7} color="#3d3a55" snow smoke />
      <Mountain position={[26, -3.5, -58]} s={1.45} color="#2f4438" />
      <Mountain position={[-2, -4, -66]} s={1.2} color="#35344d" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, -44]}>
        <planeGeometry args={[86, 30]} />
        <meshStandardMaterial color="#1f2736" roughness={1} />
      </mesh>
      {city.map((c, i) => (
        <mesh key={i} position={[c.x, -2.4, c.z]}>
          <boxGeometry args={[c.s, c.s * 0.8, c.s]} />
          <meshStandardMaterial color={c.c} emissive={c.c} emissiveIntensity={0.9} />
        </mesh>
      ))}
      <Cloud position={[-16, 10, -40]} s={1.7} opacity={0.32} />
      <Cloud position={[14, 12, -46]} s={2.1} opacity={0.28} speed={0.03} />

      {/* tugu puncak */}
      <group position={[0, 0, -16]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[2, 0.8, 2]} />
          {M("#8a8478")}
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.3, 0.46, 2.6, 6]} />
          {M("#a79c86")}
        </mesh>
        <mesh position={[0, 3.4, 0]}>
          <coneGeometry args={[0.38, 0.8, 6]} />
          <meshStandardMaterial color="#f2cc8f" emissive="#f2cc8f" emissiveIntensity={0.55} flatShading />
        </mesh>
      </group>

      {/* spot nongkrong */}
      <Gazebo position={[-7, 0, -3]} s={1.2} />
      <Gazebo position={[9, 0, 8]} s={0.95} />
      <Campfire position={[3.5, 0, -6]} />
      <FoodStall position={[-13, 0, 12]} ry={0.6} label="Wedang Jahe" color="#c25b4a" />
      <FoodStall position={[14, 0, 13]} ry={-0.5} label="Jagung Bakar" color="#e9a84a" />
      <Pond position={[-16, 0, -11]} r={2.8} />
      <Banner position={[0, 0, 19]} title="PUNCAK SALATIGA" sub="1.200 mdpl · selamat mendaki" color="#2f4b34" />

      {[
        [-4, 4, 0.2], [4.5, 3, -0.3], [-10, 6, 0.5], [10.5, 5, -0.5], [-6, -11, 0.9], [6.5, -12, -0.9], [-18, 3, 1.4], [18, 2, -1.4],
      ].map(([x, z, ry], i) => (
        <Bench key={i} position={[x, 0, z]} ry={ry} />
      ))}
      <PicnicTable position={[-11, 0, 6]} ry={0.4} />
      <PicnicTable position={[11.5, 0, -2]} ry={-0.6} />
      {[[-5, 11], [5.5, 11], [-14, -6], [14, -8]].map(([x, z], i) => (
        <TrashBin key={i} position={[x, 0, z]} />
      ))}

      {/* vegetasi lebat */}
      {Array.from({ length: 26 }).map((_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const r = 19 + hash01(`pr${i}`) * 5;
        return <Pine key={i} position={[Math.cos(a) * r, -0.2, Math.sin(a) * r]} s={0.9 + hash01(`ps${i}`) * 0.9} tone={i % 3 ? "#2f4b34" : "#38573a"} />;
      })}
      {Array.from({ length: 10 }).map((_, i) => (
        <Tree key={i} position={[(hash01(`tx${i}`) - 0.5) * 34, 0, (hash01(`tz${i}`) - 0.5) * 34]} s={0.9 + hash01(`ts${i}`) * 0.6} tone="#466b33" />
      ))}
      {Array.from({ length: 22 }).map((_, i) => (
        <Bush key={i} position={[(hash01(`bx${i}`) - 0.5) * 38, 0, (hash01(`bz${i}`) - 0.5) * 38]} s={0.8 + hash01(`bs${i}`) * 0.6} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => {
        const t = i / 15;
        return <PathLight key={i} position={[Math.sin(i * 1.9) * 1.6, 0, 20 - t * 34]} />;
      })}
      {[[-9, 2], [9, 1]].map(([x, z], i) => (
        <LampPost key={i} position={[x, 0, z]} color="#ffd9a0" />
      ))}
      {/* batu-batu */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[(hash01(`rx${i}`) - 0.5) * 36, 0.14, (hash01(`rz${i}`) - 0.5) * 36]}>
          <dodecahedronGeometry args={[0.24 + hash01(`rs${i}`) * 0.42, 0]} />
          {M("#7a7468")}
        </mesh>
      ))}

      {/* 5 lentera narasi */}
      {LANTERNS.map((l, i) => (
        <GlowMarker key={i} id={`bukit-${i}`} position={l.pos} color="#f2a93b" label={l.title} isLetter={false} onClick={() => setNarasi({ title: l.title, text: l.text })} />
      ))}

      {/* teman-teman yang ikut mendaki */}
      {pendaki.map(({ item, pos, ry }) => {
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

      <PortalRing position={[0, 0, 21]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={22} scale={18} size={1.5} speed={0.25} position={[0, 2.5, 0]} color="#ffd9a0" />
    </group>
  );
}
