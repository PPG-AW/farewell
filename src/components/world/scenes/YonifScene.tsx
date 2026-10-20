"use client";

import { useMemo } from "react";
import { Sparkles, Stars } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import { Ground, Pine, GateArch, FlagPole, Campfire, GlowMarker, ZoneChip, PortalRing, Building, Mountain } from "../primitives";
import { NARASI } from "@/lib/constants";

export default function YonifScene() {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const setNarasi = useStore((s) => s.setNarasi);
  const goScene = useStore((s) => s.goScene);

  const tniUsers = useMemo(() => {
    const list = (world?.users ?? []).filter((u) => u.modeAvatar === "tni" && u.avatar);
    return list.map((u, i) => {
      const a = ((i / Math.max(1, list.length)) * Math.PI * 2 + Math.PI / 5) % (Math.PI * 2);
      return { u, pos: [Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2 - 2] as [number, number, number], ry: Math.atan2(-(Math.cos(a) * 3.2), -2 - (Math.sin(a) * 3.2 - 2)) + Math.PI };
    });
  }, [world?.users]);

  const pines = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + Math.sin(i) * 0.3;
        const r = 16 + (i % 4) * 3.5;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 1 + (i % 3) * 0.4 };
      }),
    []
  );

  return (
    <group>
      <Ground size={80} color="#3a4a33" />
      <Stars radius={110} depth={40} count={2000} factor={3.4} fade speed={0.5} />
      {/* kabut pagi buta */}
      <ZoneChip position={[0, 7, -8]} title="YONIF 411/RAIDER" sub="Bela Negara Bersama" color="#c75146" />

      <GateArch position={[0, 0, 14]} width={7} height={3.6} color="#4c5b43" label="YONIF 411 / RAIDER" sub="Bela Negara · Salatiga" />
      <FlagPole position={[0, 0, -9]} h={6.5} />
      <Mountain position={[-30, -2, -55]} s={1.4} color="#31383f" />
      <Mountain position={[26, -2.5, -58]} s={1.2} color="#2f3b34" />

      {/* barak */}
      <Building position={[-13, 0, -6]} size={[9, 3, 4]} color="#5c6650" roof="#3f4636" floors={1} />
      <Building position={[-13, 0, 2]} size={[9, 3, 4]} color="#5c6650" roof="#3f4636" floors={1} />
      {/* menara jaga */}
      <group position={[12, 0, 6]}>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[sx * 0.7, 1.6, sz * 0.7]}>
              <cylinderGeometry args={[0.09, 0.12, 3.2, 5]} />
              <meshStandardMaterial color="#4c3626" roughness={1} flatShading />
            </mesh>
          ))
        )}
        <mesh position={[0, 3.35, 0]}>
          <boxGeometry args={[2.2, 0.2, 2.2]} />
          <meshStandardMaterial color="#5c4033" roughness={1} flatShading />
        </mesh>
        <mesh position={[0, 3.9, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.7, 0.8, 4]} />
          <meshStandardMaterial color="#3f4636" roughness={1} flatShading />
        </mesh>
      </group>
      {/* rintangan latihan */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[9 + i * 2, 0.35, -6]}>
          <boxGeometry args={[1.4, 0.7, 0.14]} />
          <meshStandardMaterial color="#8a5a2c" roughness={1} flatShading />
        </mesh>
      ))}

      {/* api unggun pusat */}
      <Campfire position={[0, 0, -2]} />

      {/* narasi */}
      <GlowMarker
        position={[2.8, 1.4, 1.2]}
        color="#f4902a"
        label="Cerita Yonif"
        isLetter={false}
        onClick={() => setNarasi({ title: "Bela Negara Bersama", text: NARASI.yonif })}
      />

      {/* avatar TNI berkumpul */}
      {tniUsers.map(({ u, pos, ry }) => {
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
      {tniUsers.length === 0 && (
        <GlowMarker
          position={[0, 1.6, 2.5]}
          color="#c75146"
          isLetter={false}
          label="Belum ada pasukan Mode TNI"
          onClick={() => setNarasi({ title: "Api Unggun", text: "Api unggun ini menunggu para pejuang Mode TNI dari angkatan 2026. Mungkin kamu salah satunya?" })}
        />
      )}

      {pines.map((p, i) => (
        <Pine key={i} position={[p.x, 0, p.z]} s={p.s} tone={i % 2 ? "#2f4b34" : "#374f36"} />
      ))}
      <PortalRing position={[-6, 0, 13]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={30} scale={28} size={1.6} speed={0.4} position={[0, 3, 0]} color="#9db4ff" />
    </group>
  );
}
