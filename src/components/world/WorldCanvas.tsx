"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import type { Hubs } from "@/lib/constants";
import HubScene from "./scenes/HubScene";
import UkswScene from "./scenes/UkswScene";
import { PplPlazaScene, SchoolScene } from "./scenes/PplScene";
import YonifScene from "./scenes/YonifScene";
import BukitScene from "./scenes/BukitScene";
import { PlayerRig, PlayerAvatar } from "./player";
import { EBuildingCorridor, ClassroomInterior, SeminarHall, LibraryGround, LibraryFloor7, Floor7Room } from "./scenes/UkswIndoor";

type Ctrl = { target: THREE.Vector3; update: () => void; enabled: boolean } | null;

const ATMO: Record<Hubs, {
  sky: boolean;
  sun: [number, number, number];
  rayleigh: number;
  bg: string;
  fog: [string, number, number];
  amb: number;
  dir: number;
  dirColor: string;
  hemi: [string, string, number];
  stars: boolean;
}> = {
  hub: {
    sky: true, sun: [-40, 14, -60], rayleigh: 2.2, bg: "#f0c79a",
    fog: ["#e8c9a0", 48, 130], amb: 0.95, dir: 1.7, dirColor: "#fff0d2",
    hemi: ["#ffe6c0", "#6b5a46", 1.0], stars: false,
  },
  uksw: {
    sky: true, sun: [60, 34, -60], rayleigh: 1.1, bg: "#cfe0d8",
    fog: ["#e3ead9", 62, 150], amb: 1.05, dir: 1.8, dirColor: "#fff6e2",
    hemi: ["#d8ecf8", "#8aab6a", 1.05], stars: false,
  },
  ppl: {
    sky: true, sun: [-85, 14, 35], rayleigh: 2.4, bg: "#f4c58a",
    fog: ["#f4cea0", 56, 140], amb: 0.95, dir: 1.85, dirColor: "#ffd9a0",
    hemi: ["#ffe3b8", "#93a964", 0.95], stars: false,
  },
  yonif: {
    sky: false, sun: [0, 10, 0], rayleigh: 1, bg: "#1b2636",
    fog: ["#223049", 30, 95], amb: 0.78, dir: 0.95, dirColor: "#b9c9ff",
    hemi: ["#5a6d93", "#28332a", 0.9], stars: true,
  },
  bukit: {
    sky: true, sun: [6, 1.6, -100], rayleigh: 3.2, bg: "#2f2544",
    fog: ["#5d4f78", 44, 120], amb: 0.85, dir: 1.3, dirColor: "#ffb183",
    hemi: ["#9c8ccb", "#3c4733", 0.9], stars: true,
  },
};

function Atmosphere({ scene, indoor }: { scene: Hubs; indoor?: boolean }) {
  const a = ATMO[scene];
  if (indoor)
    return (
      <>
        <color attach="background" args={["#1a1d22"]} />
        <ambientLight intensity={1.15} />
        <hemisphereLight args={["#fff4e0", "#4a453c", 0.9]} />
        <directionalLight position={[6, 12, 8]} intensity={0.75} color="#fff3dc" />
      </>
    );
  return (
    <>
      {!a.sky && <color attach="background" args={[a.bg]} />}
      {a.sky && <Sky distance={450000} sunPosition={a.sun} turbidity={scene === "ppl" ? 6 : 4} rayleigh={a.rayleigh} />}
      <fog attach="fog" args={[a.fog[0], a.fog[1], a.fog[2]]} />
      <ambientLight intensity={a.amb} />
      <hemisphereLight args={[a.hemi[0], a.hemi[1], a.hemi[2]]} />
      <directionalLight position={a.sky ? a.sun : [8, 14, 6]} intensity={a.dir} color={a.dirColor} />
      {a.stars && <Stars radius={120} depth={40} count={1400} factor={2.6} fade speed={0.4} />}
      {scene === "hub" && <directionalLight position={[-8, 10, 6]} intensity={0.5} color="#ffb98a" />}
      {scene === "yonif" && <directionalLight position={[-10, 6, 10]} intensity={0.3} color="#c75146" />}
    </>
  );
}

export default function WorldCanvas() {
  const scene = useStore((s) => s.scene);
  const school = useStore((s) => s.school);
  const controls = useRef<Ctrl>(null);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 8.5, 17], fov: 48, near: 0.1, far: 800 }}
      className="touch-none"
    >
      <Suspense fallback={null}>
        <Atmosphere scene={scene} indoor={!!school?.startsWith("uksw:")} />
        {scene === "hub" && <HubScene />}
        {scene === "uksw" && !school && <UkswScene />}
        {scene === "uksw" && school === "uksw:e-lorong" && <EBuildingCorridor />}
        {scene === "uksw" && /^uksw:e10[2578]$/.test(school ?? "") && <ClassroomInterior room={(school ?? "").slice(5)} />}
        {scene === "uksw" && school === "uksw:seminar" && <SeminarHall />}
        {scene === "uksw" && school === "uksw:perpus" && <LibraryGround />}
        {scene === "uksw" && school === "uksw:lt7" && <LibraryFloor7 />}
        {scene === "uksw" && /^uksw:lt7-r[123]$/.test(school ?? "") && <Floor7Room room={(school ?? "").slice(5)} />}
        {scene === "ppl" && !school && <PplPlazaScene />}
        {scene === "ppl" && school && <SchoolScene schoolId={school} />}
        {scene === "yonif" && <YonifScene />}
        {scene === "bukit" && <BukitScene />}
        <PlayerAvatar />
      </Suspense>
      <OrbitControls
        ref={controls as never}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2.8}
        maxDistance={school?.startsWith("uksw:") ? 22 : 20}
        maxPolarAngle={school?.startsWith("uksw:") ? Math.PI / 2 - 0.42 : Math.PI / 2 - 0.08}
        minPolarAngle={0.25}
        enablePan={false}
        rotateSpeed={0.75}
        zoomSpeed={0.8}
      />
      <PlayerRig controls={controls} />
    </Canvas>
  );
}
