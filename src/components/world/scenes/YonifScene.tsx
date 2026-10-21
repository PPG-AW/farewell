"use client";

import { useMemo } from "react";
import { Sparkles, Stars } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import Avatar3D from "@/components/avatar/Avatar3D";
import { Ground, Pine, GateArch, FlagPole, Campfire, GlowMarker, ZoneChip, PortalRing, Building, Mountain, Bench } from "../primitives";
import { Fence, Bush, TrashBin, Banner, Steps, PathLight, scatterSpots, hash01, M } from "../props";
import { WalkerNPC } from "../player";
import { NARASI, randomAvatar } from "@/lib/constants";

// titik tersebar di seluruh kompleks (api unggun, barak, menara, lapangan latihan)
const SPOTS: [number, number, number][] = [
  [-2.6, 0, -3.4], [2.8, 0, -3.2], [-3.4, 0, 0.6], [3.6, 0, 0.4], [0, 0, -6.2],
  [-12, 0, -8], [-13.5, 0, 3], [-11, 0, 9], [12, 0, -9], [13.5, 0, 2],
  [11, 0, 10], [-6, 0, -14], [6, 0, -15], [0, 0, 11], [-18, 0, -2],
  [18, 0, -3], [-7, 0, 7], [7.5, 0, 6], [-16, 0, 13], [16, 0, 12],
];

export default function YonifScene() {
  const world = useStore((s) => s.world);
  const session = useStore((s) => s.session);
  const openUcapan = useStore((s) => s.openUcapan);
  const setNarasi = useStore((s) => s.setNarasi);
  const goScene = useStore((s) => s.goScene);

  const tni = useMemo(() => {
    const list = (world?.users ?? []).filter((u) => u.modeAvatar === "tni" && u.avatar);
    return scatterSpots(list, SPOTS);
  }, [world?.users]);

  const patroli = useMemo(
    () => [
      { cfg: randomAvatar("L", "tni"), path: [[-16, 14], [16, 14], [16, -12], [-16, -12]] as [number, number][], speed: 1.9, off: 0 },
      { cfg: randomAvatar("P", "tni"), path: [[-9, 12], [9, 12], [9, 4], [-9, 4]] as [number, number][], speed: 1.5, off: 7 },
      { cfg: randomAvatar("L", "tni"), path: [[8, -14], [-8, -14], [-8, -7], [8, -7]] as [number, number][], speed: 1.7, off: 12 },
    ],
    []
  );

  const pines = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const a = (i / 34) * Math.PI * 2 + hash01(`a${i}`) * 0.3;
        const r = 21 + hash01(`r${i}`) * 7;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.9 + hash01(`s${i}`) * 1.1 };
      }),
    []
  );

  return (
    <group>
      <Ground size={110} color="#394a31" />
      <Stars radius={120} depth={45} count={2400} factor={3.2} fade speed={0.4} />
      <ZoneChip position={[0, 7.5, -10]} title="YONIF 411/RAIDER" sub="Bela Negara Bersama · pagi berkabut" color="#c75146" />

      {/* lapangan upacara berpasir */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1]}>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#6b6349" roughness={1} />
      </mesh>
      {[-8, 0, 8].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, -1]}>
          <planeGeometry args={[0.16, 18]} />
          <meshStandardMaterial color="#cfc6b0" />
        </mesh>
      ))}

      <GateArch position={[0, 0, 19]} width={8} height={3.8} color="#4c5b43" label="YONIF 411 / RAIDER" sub="Kostrad · Salatiga" />
      <Fence from={[-20, 19]} to={[-6, 19]} color="#5b6b4c" h={1.6} />
      <Fence from={[6, 19]} to={[20, 19]} color="#5b6b4c" h={1.6} />
      <Fence from={[-20, 19]} to={[-20, -16]} color="#5b6b4c" h={1.6} />
      <Fence from={[20, 19]} to={[20, -16]} color="#5b6b4c" h={1.6} />
      <FlagPole position={[0, 0, -12]} h={7.5} />
      <Banner position={[-6, 0, 16]} ry={0.3} title="DISIPLIN · LOYALITAS" sub="Bela Negara" color="#3f5131" />
      <Banner position={[6, 0, 16]} ry={-0.3} title="PPG × YONIF 411" sub="Angkatan 2026" color="#6b2d26" />

      {/* barak kiri & kanan */}
      {[-15, 15].map((x, i) => (
        <group key={x} position={[x, 0, i === 0 ? -5 : -6]}>
          <Building position={[0, 0, 0]} size={[8, 3.2, 5]} color="#5c6650" roof="#3f4636" floors={1} flat />
          <Steps position={[0, 0, 3]} w={3} />
          <Bench position={[0, 0, 4.4]} ry={Math.PI} />
          {/* tempat tidur susun terlihat dari samping */}
          {[-2, 0, 2].map((bz) => (
            <group key={bz} position={[i === 0 ? 3.2 : -3.2, 0, bz]}>
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[1.6, 0.14, 0.8]} />
                {M("#8a7a62")}
              </mesh>
              <mesh position={[0, 1.4, 0]}>
                <boxGeometry args={[1.6, 0.14, 0.8]} />
                {M("#8a7a62")}
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <Building position={[-14, 0, 8]} size={[6, 3, 4]} color="#59634d" roof="#3a4433" flat />
      <Building position={[15, 0, 9]} size={[5, 2.8, 4]} color="#59634d" roof="#3a4433" flat />

      {/* menara jaga */}
      {[[-19, 14], [19, 14]].map(([x, z], k) => (
        <group key={k} position={[x, 0, z]}>
          {[-1, 1].map((sx) =>
            [-1, 1].map((sz) => (
              <mesh key={`${sx}${sz}`} position={[sx * 0.75, 1.8, sz * 0.75]}>
                <cylinderGeometry args={[0.1, 0.13, 3.6, 5]} />
                {M("#4c3626")}
              </mesh>
            ))
          )}
          <mesh position={[0, 3.75, 0]}>
            <boxGeometry args={[2.4, 0.22, 2.4]} />
            {M("#5c4033")}
          </mesh>
          <mesh position={[0, 4.4, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.9, 0.9, 4]} />
            {M("#3f4636")}
          </mesh>
          <mesh position={[0, 4.6, 0]}>
            <pointLight color="#ffd9a0" intensity={4} distance={14} />
          </mesh>
        </group>
      ))}

      {/* area latihan: rintangan, ban, tali */}
      <group position={[11, 0, -12]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[i * 2.2, 0.45, 0]}>
            <boxGeometry args={[1.6, 0.9, 0.16]} />
            {M("#8a5a2c")}
          </mesh>
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={`t${i}`} position={[(i % 3) * 1.1 - 2, 0.16, 2.6 + Math.floor(i / 3) * 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.46, 0.15, 6, 12]} />
            {M("#26232e")}
          </mesh>
        ))}
      </group>
      <group position={[-11, 0, -13]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 2.6, 1.5, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 3, 6]} />
            {M("#6b5a45")}
          </mesh>
        ))}
        <mesh position={[0, 2.9, 0]}>
          <boxGeometry args={[5.4, 0.16, 0.16]} />
          {M("#6b5a45")}
        </mesh>
        {[-1.6, 0, 1.6].map((x) => (
          <mesh key={x} position={[x, 1.9, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2, 4]} />
            {M("#c9b89a")}
          </mesh>
        ))}
      </group>

      {/* api unggun utama + beberapa api kecil */}
      <Campfire position={[0, 0, -2]} />
      <Campfire position={[-13, 0, 13]} />
      <Campfire position={[13, 0, 14]} />
      {[[-4.6, -1.6], [4.6, -1.8], [-1.6, 1.8], [1.8, 2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <boxGeometry args={[0.9, 0.4, 0.5]} />
          {M("#6b5a45")}
        </mesh>
      ))}

      <GlowMarker
        id="yonif-narasi"
        position={[0, 1.5, 3.4]}
        color="#f4902a"
        label="Cerita Yonif 411"
        isLetter={false}
        onClick={() => setNarasi({ title: "Bela Negara Bersama", text: NARASI.yonif })}
      />

      {/* pasukan (mode TNI) tersebar */}
      {tni.map(({ item, pos, ry }) => {
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
      {patroli.map((w, i) => (
        <WalkerNPC key={i} config={w.cfg} path={w.path} speed={w.speed} offset={w.off} />
      ))}

      <Mountain position={[-34, -2, -62]} s={1.5} color="#31383f" />
      <Mountain position={[30, -2.5, -66]} s={1.3} color="#2f3b34" />
      {pines.map((p, i) => (
        <Pine key={i} position={[p.x, 0, p.z]} s={p.s} tone={i % 3 ? "#2b4530" : "#334d35"} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <Bush key={i} position={[(hash01(`ybx${i}`) - 0.5) * 40, 0, (hash01(`ybz${i}`) - 0.5) * 40]} s={0.8} c="#36542f" />
      ))}
      {[[-18, 6], [18, 5], [-6, 18], [6, 18]].map(([x, z], i) => (
        <PathLight key={i} position={[x, 0, z]} c="#ffb570" />
      ))}
      {[[-17, -10], [17, -10]].map(([x, z], i) => (
        <TrashBin key={i} position={[x, 0, z]} />
      ))}

      <PortalRing position={[-8, 0, 19]} color="#f2cc8f" label="HUB UTAMA" sub="Kembali" onClick={() => goScene("hub")} />
      <Sparkles count={16} scale={16} size={1.3} speed={0.3} position={[0, 2.5, 0]} color="#9db4ff" />
    </group>
  );
}
