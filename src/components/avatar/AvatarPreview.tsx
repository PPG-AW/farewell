"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import Avatar3D from "./Avatar3D";
import type { AvatarConfig } from "@/lib/constants";

export default function AvatarPreview({ config, spin = true }: { config: AvatarConfig; spin?: boolean }) {
  return (
    <div className="relative h-full w-full">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.25, 2.6], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.75} />
          <hemisphereLight args={["#ffe9c9", "#3a2d22", 0.8]} />
          <directionalLight position={[3, 4, 4]} intensity={1.4} color="#fff1d0" />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#8ecae6" />
          {/* pedestal */}
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.75, 0.9, 0.12, 24]} />
            <meshStandardMaterial color="#3a2d22" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.78, 0.84, 32]} />
            <meshStandardMaterial color="#f2cc8f" emissive="#f2cc8f" emissiveIntensity={0.5} />
          </mesh>
          <Avatar3D config={config} showShadow={false} />
          <Sparkles count={20} scale={2.4} size={2} speed={0.4} position={[0, 0.9, 0]} color="#ffe9b0" />
        </Suspense>
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          autoRotate={spin}
          autoRotateSpeed={1.6}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.9}
          target={[0, 0.82, 0]}
        />
      </Canvas>
    </div>
  );
}
