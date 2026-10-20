"use client";

import { useMemo } from "react";
import { Sparkles, Stars } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { Ground, Mountain, Gazebo, Bench, LampPost, Pine, GlowMarker, StonePath, ZoneChip, PortalRing, Cloud } from "../primitives";

const LANTERNS = [
  { pos: [-4.5, 1.5, 5] as [number, number, number], title: "Lentera 1 — Langkah Pertama", text: "Masih ingat hari pertama menginjakkan kaki di UKSW? Gugup, canggung, tidak tahu harus duduk di mana. Sekarang lihat: kita berdiri di puncak bukit ini bersama." },
  { pos: [4.5, 1.6, 4] as [number, number, number], title: "Lentera 2 — Rumus Pertama", text: "Setiap rumus yang kita tulis di papan tulis adalah huruf-huruf doa. Semoga setiap 'a² + b²' yang kau ajarkan berbuah rasa ingin tahu di hati murid-muridmu." },
  { pos: [-6, 1.7, -2] as [number, number, number], title: "Lentera 3 — Merapi di Kiri", text: "Merapi tak pernah berhenti tersenyum pada Salatiga. Begitu juga kami — meski nanti berjauhan, doa kami tak pernah berhenti menyertaimu." },
  { pos: [6, 1.8, -3] as [number, number, number], title: "Lentera 4 — Merbabu di Kanan", text: "Merbabu tenang dan sabar, seperti guru yang baik. Jadilah seperti Merbabu: tidak berisik, tapi menguatkan semua yang mendekat." },
  { pos: [0, 1.9, -7] as [number, number, number], title: "Lentera 5 — Jejak Langkah", text: "Dari bukit ini semua terlihat kecil — kampus, sekolah, barak. Tapi jejak langkah kita tergores besar selamanya. Sampai jumpa, guru-guru hebat. Jangan lupa bahagia." },
];

export default function BukitScene() {
  const setNarasi = useStore((s) => s.setNarasi);
  const goScene = useStore((s) => s.goScene);

  const city = useMemo(
    () =>
      Array.from({ length: 46 }, () => ({
        x: (Math.random() - 0.5) * 40,
        z: -34 - Math.random() * 14,
        s: 0.3 + Math.random() * 0.7,
        c: ["#ffd9a0", "#f2cc8f", "#fff4d6", "#f7b267"][Math.floor(Math.random() * 4)],
      })),
    []
  );
  const rocks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        x: Math.cos(i * 1.9) * (7 + (i % 4)),
        z: Math.sin(i * 1.9) * (7 + (i % 3)),
        s: 0.3 + (i % 3) * 0.2,
      })),
    []
  );

  return (
    <group>
      <Ground size={46} color="#51683f" />
      <Stars radius={90} depth={30} count={1600} factor={3} fade speed={0.5} />
      <ZoneChip position={[0, 6.5, -6]} title="BUKIT SALATIGA" sub="Ujung Perjalanan" color="#f2a93b" />
      <StonePath points={[[0, 12], [0.6, 10], [-0.4, 8], [0.4, 6], [-0.2, 4], [0.3, 2], [0, 0], [-0.3, -2], [0.2, -4], [0, -5.6]]} />

      {/* panorama */}
      <Mountain position={[-26, -3, -46]} s={1.55} color="#3d3a55" snow smoke />
      <Mountain position={[22, -3.5, -50]} s={1.35} color="#2f4438" />
      {/* kota salatiga di lembah */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -38]}>
        <planeGeometry args={[70, 26]} />
        <meshStandardMaterial color="#232c3d" roughness={1} />
      </mesh>
      {city.map((c, i) => (
        <mesh key={i} position={[c.x, -2.2, c.z]}>
          <boxGeometry args={[c.s, c.s * 0.7, c.s]} />
          <meshStandardMaterial color={c.c} emissive={c.c} emissiveIntensity={0.9} />
        </mesh>
      ))}
      <Cloud position={[-14, 9, -40]} s={1.6} opacity={0.35} />
      <Cloud position={[12, 11, -44]} s={2} opacity={0.3} speed={0.03} />

      {/* tugu */}
      <group position={[0, 0, -9]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.6, 0.8, 1.6]} />
          <meshStandardMaterial color="#8a8478" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.28, 0.42, 2.4, 6]} />
          <meshStandardMaterial color="#a79c86" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 3.2, 0]}>
          <coneGeometry args={[0.34, 0.7, 6]} />
          <meshStandardMaterial color="#f2cc8f" emissive="#f2cc8f" emissiveIntensity={0.5} flatShading />
        </mesh>
      </group>

      <Gazebo position={[-4, 0, -5]} s={1.1} />
      <Bench position={[3.4, 0, -6]} ry={-0.4} />
      <Bench position={[5.2, 0, -4.6]} ry={0.3} />
      <LampPost position={[-2, 0, 2]} color="#ffd9a0" />
      <LampPost position={[2.4, 0, 7]} color="#ffd9a0" />
      {[
        [-10, 6, 1.1],
        [10, 7, 0.9],
        [-11, -4, 1],
        [11, -7, 1.2],
        [-8, -10, 0.8],
      ].map(([x, z, s], i) => (
        <Pine key={i} position={[x, 0, z]} s={s} />
      ))}
      {rocks.map((r, i) => (
        <mesh key={`rock${i}`} position={[r.x, 0.1, r.z]}>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color="#7a7468" roughness={1} flatShading />
        </mesh>
      ))}

      {/* 5 lentera narasi */}
      {LANTERNS.map((l, i) => (
        <GlowMarker key={i} position={l.pos} color="#f2a93b" label={l.title} isLetter={false} onClick={() => setNarasi({ title: l.title, text: l.text })} />
      ))}

      <PortalRing position={[0, 0, 13]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={50} scale={30} size={2} speed={0.3} position={[0, 3, 0]} color="#ffd9a0" />
    </group>
  );
}
