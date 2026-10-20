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

type Ctrl = { target: THREE.Vector3; update: () => void } | null;

const DEFAULT_VIEWS: Record<string, { pos: [number, number, number]; look: [number, number, number] }> = {
  hub: { pos: [0, 8.5, 17], look: [0, 1.6, -2] },
  uksw: { pos: [28, 15, 36], look: [0, 2, -12] },
  ppl: { pos: [0, 11, 20], look: [0, 1.8, -5] },
  "ppl-school": { pos: [0, 9.5, 21], look: [0, 1.5, -4] },
  yonif: { pos: [11, 8.5, 15], look: [0, 1.2, -2] },
  bukit: { pos: [0, 7.5, 15], look: [0, 2.2, -6] },
};

function CameraRig({ controls }: { controls: React.MutableRefObject<Ctrl> }) {
  const view = useStore((s) => s.view);
  const scene = useStore((s) => s.scene);
  const school = useStore((s) => s.school);
  const { camera } = useThree();

  useEffect(() => {
    const key = scene === "ppl" && school ? "ppl-school" : scene;
    const dv = DEFAULT_VIEWS[key] ?? DEFAULT_VIEWS.hub;
    camera.position.set(dv.pos[0], dv.pos[1], dv.pos[2]);
    if (controls.current) {
      controls.current.target.set(dv.look[0], dv.look[1], dv.look[2]);
      controls.current.update();
    }
  }, [scene, school, camera, controls]);

  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();
  useFrame((_, delta) => {
    if (!view || !controls.current) return;
    tmpPos.set(...view.pos);
    tmpLook.set(...view.look);
    const k = 1 - Math.pow(0.008, delta);
    camera.position.lerp(tmpPos, k);
    controls.current.target.lerp(tmpLook, k);
    controls.current.update();
    if (camera.position.distanceTo(tmpPos) < 0.12) useStore.getState().setView(null);
  });
  return null;
}

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
    sky: false, sun: [0, 10, 0], rayleigh: 1, bg: "#221812",
    fog: ["#221812", 22, 62], amb: 0.55, dir: 1.1, dirColor: "#ffd9a0",
    hemi: ["#ffdfb0", "#3a2d22", 0.7], stars: false,
  },
  uksw: {
    sky: true, sun: [60, 30, -60], rayleigh: 1.1, bg: "#cfe0d8",
    fog: ["#dfe7d5", 42, 115], amb: 0.7, dir: 1.5, dirColor: "#fff1d0",
    hemi: ["#cfe4f0", "#7d9c62", 0.75], stars: false,
  },
  ppl: {
    sky: true, sun: [-85, 10, 35], rayleigh: 2.6, bg: "#f4c58a",
    fog: ["#f2c58e", 40, 110], amb: 0.6, dir: 1.6, dirColor: "#ffc477",
    hemi: ["#ffd9a0", "#8aa05a", 0.65], stars: false,
  },
  yonif: {
    sky: false, sun: [0, 10, 0], rayleigh: 1, bg: "#141c28",
    fog: ["#18222f", 14, 58], amb: 0.42, dir: 0.5, dirColor: "#9db4ff",
    hemi: ["#3c4b66", "#151d18", 0.6], stars: true,
  },
  bukit: {
    sky: true, sun: [4, 2.2, -100], rayleigh: 3.4, bg: "#2f2544",
    fog: ["#453a5e", 26, 88], amb: 0.5, dir: 0.9, dirColor: "#ff9d6c",
    hemi: ["#7a6ba8", "#2c3527", 0.6], stars: true,
  },
};

function Atmosphere({ scene }: { scene: Hubs }) {
  const a = ATMO[scene];
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
        <Atmosphere scene={scene} />
        {scene === "hub" && <HubScene />}
        {scene === "uksw" && <UkswScene />}
        {scene === "ppl" && !school && <PplPlazaScene />}
        {scene === "ppl" && school && <SchoolScene schoolId={school} />}
        {scene === "yonif" && <YonifScene />}
        {scene === "bukit" && <BukitScene />}
      </Suspense>
      <OrbitControls
        ref={controls as never}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minDistance={3.5}
        maxDistance={46}
        maxPolarAngle={Math.PI / 2 - 0.06}
        minPolarAngle={0.12}
        enablePan
        panSpeed={0.7}
        rotateSpeed={0.65}
        onStart={() => useStore.getState().setView(null)}
      />
      <CameraRig controls={controls} />
    </Canvas>
  );
}
