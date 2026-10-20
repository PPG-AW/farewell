"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Sparkles, useCursor } from "@react-three/drei";
import * as THREE from "three";

export function Ground({ size = 80, color = "#6d8a4f", y = -0.01 }: { size?: number; color?: string; y?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

export function Tree({ position, s = 1, tone = "#4f772d" }: { position: [number, number, number]; s?: number; tone?: string }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.13, 1, 6]} />
        <meshStandardMaterial color="#6b4a2f" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <icosahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color={tone} roughness={1} flatShading />
      </mesh>
      <mesh position={[0.2, 1.9, 0.1]}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={tone} roughness={1} flatShading />
      </mesh>
    </group>
  );
}

export function Pine({ position, s = 1, tone = "#2f4b34" }: { position: [number, number, number]; s?: number; tone?: string }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.07, 0.11, 0.8, 5]} />
        <meshStandardMaterial color="#4c3626" roughness={1} flatShading />
      </mesh>
      {[0.9, 1.5, 2.05].map((y, i) => (
        <mesh key={y} position={[0, y, 0]}>
          <coneGeometry args={[0.75 - i * 0.2, 1.1, 7]} />
          <meshStandardMaterial color={tone} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function Mountain({
  position,
  s = 1,
  color = "#4a4e69",
  snow,
  smoke,
}: {
  position: [number, number, number];
  s?: number;
  color?: string;
  snow?: boolean;
  smoke?: boolean;
}) {
  const puff = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (puff.current) {
      const t = clock.getElapsedTime();
      puff.current.position.y = Math.sin(t * 0.4) * 0.5;
      puff.current.rotation.y = t * 0.05;
    }
  });
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[6, 11, 6]} />
        <meshStandardMaterial color={color} roughness={1} flatShading />
      </mesh>
      {snow && (
        <mesh position={[0, 2.9, 0]} scale={[0.45, 0.4, 0.45]}>
          <coneGeometry args={[6, 11 * 0.4, 6]} />
          <meshStandardMaterial color="#e9edf5" roughness={1} flatShading />
        </mesh>
      )}
      {smoke && (
        <group position={[0, 6.2, 0]} ref={puff}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[i * 0.8 - 0.5, i * 0.7, 0]}>
              <icosahedronGeometry args={[0.5 + i * 0.2, 0]} />
              <meshStandardMaterial color="#cfd6e4" transparent opacity={0.45 - i * 0.1} flatShading />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export function Building({
  position = [0, 0, 0],
  size = [6, 4, 5],
  color = "#e8ddb5",
  roof = "#a3522f",
  floors = 1,
  flat = false,
}: {
  position?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  roof?: string;
  floors?: number;
  flat?: boolean;
}) {
  const [w, h, d] = size;
  const winRows = Math.max(1, floors);
  const winCols = Math.max(2, Math.floor(w / 1.6));
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
      {flat ? (
        <mesh position={[0, h + 0.15, 0]}>
          <boxGeometry args={[w + 0.4, 0.3, d + 0.4]} />
          <meshStandardMaterial color={roof} roughness={1} flatShading />
        </mesh>
      ) : (
        <mesh position={[0, h, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 1]}>
          <coneGeometry args={[Math.max(w, d) * 0.75, Math.min(w, 3.5) * 0.42, 4]} />
          <meshStandardMaterial color={roof} roughness={1} flatShading />
        </mesh>
      )}
      {Array.from({ length: winRows }).map((_, r) =>
        Array.from({ length: winCols }).map((_, cc) => (
          <mesh
            key={`${r}-${cc}`}
            position={[
              -w / 2 + (cc + 0.5) * (w / winCols),
              0.9 + r * ((h - 1.6) / Math.max(1, winRows - 1 || 1)),
              d / 2 + 0.02,
            ]}
          >
            <planeGeometry args={[0.75, 0.85]} />
            <meshStandardMaterial color="#8fb8d9" emissive="#f7deac" emissiveIntensity={0.25} />
          </mesh>
        ))
      )}
      {/* pintu */}
      <mesh position={[0, 0.7, d / 2 + 0.03]}>
        <planeGeometry args={[0.9, 1.4]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
    </group>
  );
}

export function LampPost({ position, color = "#ffd9a0" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 2.2, 5]} />
        <meshStandardMaterial color="#33302c" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.14, 6, 5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

export function GateArch({
  position = [0, 0, 0],
  width = 5,
  height = 3.2,
  color = "#e8ddb5",
  label,
  sub,
}: {
  position?: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  sub?: string;
}) {
  return (
    <group position={position}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * width) / 2, height / 2, 0]}>
          <boxGeometry args={[0.5, height, 0.5]} />
          <meshStandardMaterial color={color} roughness={1} flatShading />
        </mesh>
      ))}
      <mesh position={[0, height + 0.3, 0]}>
        <boxGeometry args={[width + 1.1, 0.6, 0.7]} />
        <meshStandardMaterial color={color} roughness={1} flatShading />
      </mesh>
      <mesh position={[0, height + 0.75, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[width * 0.28, 0.6, 4]} />
        <meshStandardMaterial color="#a3522f" roughness={1} flatShading />
      </mesh>
      {label && (
        <Html position={[0, height + 0.3, 0.45]} center distanceFactor={14} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none whitespace-nowrap text-center">
            <div className="rounded-lg bg-[#2b2119]/85 px-3 py-1 text-[13px] font-bold tracking-widest text-[#f2cc8f] shadow-xl border border-[#f2cc8f]/25 backdrop-blur-sm">
              {label}
            </div>
            {sub && <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.25em] text-[#f4ecdd]/80">{sub}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Marker interaktif untuk ucapan/narasi ──────────────────────────────────
export function GlowMarker({
  position,
  color = "#f2cc8f",
  label,
  onClick,
  read,
  isLetter = true,
}: {
  position: [number, number, number];
  color?: string;
  label: string;
  onClick: () => void;
  read?: boolean;
  isLetter?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.12;
    ref.current.rotation.y = t * 0.9;
    const target = hover ? 1.28 : 1;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, target, 0.15));
  });
  const c = read ? "#8d8577" : color;
  return (
    <group>
      <group
        ref={ref}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        {isLetter ? (
          <group>
            <mesh>
              <boxGeometry args={[0.42, 0.3, 0.05]} />
              <meshStandardMaterial color="#f4ecdd" emissive={c} emissiveIntensity={read ? 0.12 : 0.55} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.06, 0.028]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.26, 0.03, 0.012]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, -0.06, 0.028]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.26, 0.03, 0.012]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} />
            </mesh>
          </group>
        ) : (
          <mesh>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={read ? 0.25 : 0.9} roughness={0.4} />
          </mesh>
        )}
        <Html position={[0, -0.42, 0]} center distanceFactor={9} zIndexRange={[30, 0]}>
          <div
            className={`pointer-events-none select-none whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-lg border backdrop-blur-sm transition-all ${
              hover ? "scale-110 bg-[#f2cc8f] border-[#f2cc8f] text-[#3a2d18]" : "border-white/15 bg-black/55 text-[#f4ecdd]"
            }`}
          >
            {label}
          </div>
        </Html>
      </group>
      {!read && <Sparkles count={6} scale={1.1} size={2.4} speed={0.35} position={[position[0], position[1], position[2]]} color={c} />}
    </group>
  );
}

// ─── Portal ─────────────────────────────────────────────────────────────────
export function PortalRing({
  position,
  color,
  label,
  sub,
  onClick,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring.current) ring.current.rotation.z = t * 0.5;
    if (inner.current) {
      const m = inner.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.65 + Math.sin(t * 2.4) * 0.25 + (hover ? 0.5 : 0);
    }
  });
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh ref={ring} position={[0, 1.7, 0]}>
        <torusGeometry args={[1.15, 0.09, 10, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.35} />
      </mesh>
      <mesh ref={inner} position={[0, 1.7, 0]}>
        <circleGeometry args={[1.02, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {[0.4, -0.4].map((x) => (
        <mesh key={x} position={[x * 2.4, 0.5, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 1, 6]} />
          <meshStandardMaterial color="#3a2d22" roughness={1} flatShading />
        </mesh>
      ))}
      <Sparkles count={14} scale={3} size={2.5} speed={0.5} position={[0, 1.7, 0]} color={color} />
      <Html position={[0, 3.35, 0]} center distanceFactor={12} zIndexRange={[25, 0]}>
        <div
          className={`pointer-events-none select-none whitespace-nowrap text-center transition-transform ${hover ? "scale-110" : ""}`}
        >
          <div className="rounded-xl px-4 py-1.5 text-[13px] font-bold tracking-widest shadow-2xl border backdrop-blur-sm" style={{ color, borderColor: `${color}66`, background: "rgba(20,15,10,0.7)" }}>
            {label}
          </div>
          <div className="mt-1 text-[10px] font-medium text-[#f4ecdd]/85">{sub}</div>
        </div>
      </Html>
    </group>
  );
}

export function Campfire({ position }: { position: [number, number, number] }) {
  const flame = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flame.current) {
      flame.current.scale.y = 1 + Math.sin(t * 9) * 0.14 + Math.sin(t * 23) * 0.06;
      flame.current.rotation.y = t * 1.4;
    }
  });
  return (
    <group position={position}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        const x = Math.cos(a) * 0.55;
        const z = Math.sin(a) * 0.55;
        return (
          <mesh key={i} position={[x, 0.09, z]}>
            <dodecahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#57504a" roughness={1} flatShading />
          </mesh>
        );
      })}
      {[0, 0.9, 1.8].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.16, 0.12, Math.sin(a) * 0.16]} rotation={[Math.PI / 2.4, a, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.7, 5]} />
          <meshStandardMaterial color="#4c3626" roughness={1} flatShading />
        </mesh>
      ))}
      <group ref={flame} position={[0, 0.3, 0]}>
        <mesh>
          <coneGeometry args={[0.3, 0.75, 6]} />
          <meshStandardMaterial color="#f4902a" emissive="#f4722a" emissiveIntensity={1.6} flatShading />
        </mesh>
        <mesh position={[0, 0.18, 0]} scale={0.6}>
          <coneGeometry args={[0.3, 0.7, 6]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={2} flatShading />
        </mesh>
      </group>
      <pointLight position={[0, 1, 0]} color="#ff9d4d" intensity={6} distance={9} />
      <Sparkles count={26} scale={[1.2, 2.4, 1.2]} size={3} speed={1.6} position={[0, 1.1, 0]} color="#ffb25e" />
    </group>
  );
}

export function FlagPole({ position, h = 5, waving = true }: { position: [number, number, number]; h?: number; waving?: boolean }) {
  const flag = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (flag.current && waving) flag.current.rotation.y = Math.sin(clock.getElapsedTime() * 2) * 0.22;
  });
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, h, 6]} />
        <meshStandardMaterial color="#d9d3c7" roughness={0.6} metalness={0.3} />
      </mesh>
      <group ref={flag} position={[0.02, h - 0.45, 0]}>
        <mesh position={[0.55, 0.13, 0]}>
          <planeGeometry args={[1.1, 0.26]} />
          <meshStandardMaterial color="#c1352e" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.55, -0.13, 0]}>
          <planeGeometry args={[1.1, 0.26]} />
          <meshStandardMaterial color="#f4f1de" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export function Gazebo({ position, s = 1, color = "#8a5a2c" }: { position: [number, number, number]; s?: number; color?: string }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.4, 1.5, 0.24, 6]} />
        <meshStandardMaterial color="#b8a67c" roughness={1} flatShading />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.15, 1.15, Math.sin(a) * 1.15]}>
            <cylinderGeometry args={[0.07, 0.07, 2, 5]} />
            <meshStandardMaterial color={color} roughness={1} flatShading />
          </mesh>
        );
      })}
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[1.9, 1.1, 6]} />
        <meshStandardMaterial color="#a3522f" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

export function Bench({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.4]} />
        <meshStandardMaterial color="#8a5a2c" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.72, -0.18]}>
        <boxGeometry args={[1.5, 0.5, 0.07]} />
        <meshStandardMaterial color="#8a5a2c" roughness={1} flatShading />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]}>
          <boxGeometry args={[0.08, 0.4, 0.36]} />
          <meshStandardMaterial color="#57504a" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function StonePath({ points, color = "#a79c86" }: { points: [number, number][]; color?: string }) {
  return (
    <group>
      {points.map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, (i * 1.7) % 1]} position={[x, 0.02, z]}>
          <circleGeometry args={[0.42, 7]} />
          <meshStandardMaterial color={color} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function ZoneChip({ position, title, sub, color }: { position: [number, number, number]; title: string; sub?: string; color: string }) {
  return (
    <Html position={position} center distanceFactor={16} zIndexRange={[5, 0]}>
      <div className="pointer-events-none select-none whitespace-nowrap text-center">
        <div className="text-[15px] font-bold tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" style={{ color }}>
          {title}
        </div>
        {sub && <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.3em] text-[#f4ecdd]/75">{sub}</div>}
      </div>
    </Html>
  );
}

export function Cloud({ position, s = 1, opacity = 0.55, speed = 0.05 }: { position: [number, number, number]; s?: number; opacity?: number; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * speed + position[2]) * 3;
  });
  return (
    <group ref={ref} position={position} scale={s}>
      {[
        [0, 0, 0, 1],
        [0.9, -0.06, 0.1, 0.75],
        [-0.85, -0.04, -0.05, 0.7],
        [0.3, 0.25, -0.1, 0.6],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={opacity} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function InteractiveGroup({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      {children}
    </group>
  );
}
