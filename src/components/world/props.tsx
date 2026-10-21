"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const R = 0.95;
export const M = (c: string, rough = R) => <meshStandardMaterial color={c} roughness={rough} flatShading />;

// ─── penyebaran posisi deterministik dari string (id user) ──────────────────
export function hash01(str: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Sebar orang ke titik-titik unik dari daftar spot (tanpa berjejer). */
export function scatterSpots<T extends { id: string }>(
  items: T[],
  spots: [number, number, number][]
): { item: T; pos: [number, number, number]; ry: number }[] {
  const used = new Set<number>();
  return items.map((item, i) => {
    let idx = Math.floor(hash01(item.id, 7) * spots.length);
    let guard = 0;
    while (used.has(idx) && guard < spots.length * 2) {
      idx = (idx + 1) % spots.length;
      guard++;
    }
    used.add(idx);
    const s = spots[idx] ?? [0, 0, i * 2];
    const jx = (hash01(item.id, 11) - 0.5) * 1.5;
    const jz = (hash01(item.id, 23) - 0.5) * 1.5;
    return {
      item,
      pos: [s[0] + jx, s[1], s[2] + jz] as [number, number, number],
      ry: hash01(item.id, 31) * Math.PI * 2,
    };
  });
}

// ─── vegetasi ───────────────────────────────────────────────────────────────
export function Bush({ position, s = 1, c = "#3f6b35" }: { position: [number, number, number]; s?: number; c?: string }) {
  return (
    <group position={position} scale={s}>
      {[
        [0, 0.26, 0, 0.33],
        [0.26, 0.19, 0.08, 0.24],
        [-0.22, 0.2, -0.06, 0.26],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          {M(i === 1 ? c : i === 2 ? "#4b7a3d" : c)}
        </mesh>
      ))}
    </group>
  );
}

export function FlowerBed({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.75, 0.82, 0.15, 8]} />
        {M("#8a5a2c")}
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.06, 8]} />
        {M("#4a6b35")}
      </mesh>
      {[
        [0.3, 0.1, "#e5989b"],
        [-0.26, 0.2, "#f2cc8f"],
        [0.05, -0.3, "#cdb4f5"],
        [-0.3, -0.18, "#f08a5d"],
        [0.3, -0.32, "#fff1c9"],
      ].map(([x, z, col], i) => (
        <group key={i} position={[x as number, 0.2, z as number]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 4]} />
            {M("#4f772d")}
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <icosahedronGeometry args={[0.07, 0]} />
            {M(col as string)}
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Hedge({ from, to, h = 0.7 }: { from: [number, number]; to: [number, number]; h?: number }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  return (
    <group position={[(from[0] + to[0]) / 2, 0, (from[1] + to[1]) / 2]} rotation={[0, Math.atan2(dx, dz), 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.55, h, len]} />
        {M("#3f6b35")}
      </mesh>
    </group>
  );
}

export function Fence({ from, to, color = "#d8cfbb", h = 1.2 }: { from: [number, number]; to: [number, number]; color?: string; h?: number }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const n = Math.max(2, Math.round(len / 1.6));
  return (
    <group position={[from[0], 0, from[1]]} rotation={[0, Math.atan2(dx, dz), 0]}>
      {Array.from({ length: n + 1 }).map((_, i) => (
        <mesh key={i} position={[0, h / 2, (i * len) / n]}>
          <boxGeometry args={[0.1, h, 0.1]} />
          {M(color)}
        </mesh>
      ))}
      {[0.35, 0.78].map((p) => (
        <mesh key={p} position={[0, h * p, len / 2]}>
          <boxGeometry args={[0.06, 0.08, len]} />
          {M(color)}
        </mesh>
      ))}
    </group>
  );
}

export function Planter({ position, c = "#c25b4a" }: { position: [number, number, number]; c?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.3, 0.22, 0.44, 7]} />
        {M(c)}
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <icosahedronGeometry args={[0.36, 0]} />
        {M("#4b7a3d")}
      </mesh>
    </group>
  );
}

// ─── perabot & objek kampus/sekolah ─────────────────────────────────────────
export function PicnicTable({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.7, 0.08, 0.9]} />
        {M("#a9763f")}
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]}>
          <boxGeometry args={[0.1, 0.72, 0.8]} />
          {M("#7b5430")}
        </mesh>
      ))}
      {[-0.72, 0.72].map((z) => (
        <mesh key={z} position={[0, 0.42, z]}>
          <boxGeometry args={[1.7, 0.07, 0.3]} />
          {M("#a9763f")}
        </mesh>
      ))}
    </group>
  );
}

export function TrashBin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.21, 0.17, 0.64, 8]} />
        {M("#3f6b55")}
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.06, 8]} />
        {M("#2d4a3c")}
      </mesh>
    </group>
  );
}

export function Bike({ position, ry = 0, c = "#3d6fb4" }: { position: [number, number, number]; ry?: number; c?: string }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {[-0.42, 0.42].map((z) => (
        <mesh key={z} position={[0, 0.3, z]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.28, 0.045, 5, 12]} />
          {M("#26232e")}
        </mesh>
      ))}
      <mesh position={[0, 0.48, 0]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.8]} />
        {M(c)}
      </mesh>
      <mesh position={[0, 0.66, -0.3]}>
        <boxGeometry args={[0.07, 0.3, 0.06]} />
        {M(c)}
      </mesh>
      <mesh position={[0, 0.78, 0.38]}>
        <boxGeometry args={[0.42, 0.05, 0.05]} />
        {M("#57504a")}
      </mesh>
      <mesh position={[0, 0.64, -0.32]}>
        <boxGeometry args={[0.22, 0.07, 0.16]} />
        {M("#2b2119")}
      </mesh>
    </group>
  );
}

export function Motorbike({ position, ry = 0, warna = "#c75146" }: { position: [number, number, number]; ry?: number; warna?: string }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {[-0.45, 0.48].map((z) => (
        <mesh key={z} position={[0, 0.26, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.1, 10]} />
          {M("#1f1d22")}
        </mesh>
      ))}
      <mesh position={[0, 0.46, 0.05]}>
        <boxGeometry args={[0.26, 0.26, 0.95]} />
        {M(warna)}
      </mesh>
      <mesh position={[0, 0.62, -0.18]}>
        <boxGeometry args={[0.3, 0.12, 0.42]} />
        {M("#201d22")}
      </mesh>
      <mesh position={[0, 0.72, 0.42]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.46, 0.06, 0.06]} />
        {M("#55504c")}
      </mesh>
      <mesh position={[0, 0.66, 0.54]}>
        <boxGeometry args={[0.2, 0.16, 0.1]} />
        {M("#f7e3a1")}
      </mesh>
    </group>
  );
}

export function Canopy({ position, size = [4, 3], color = "#c75146", ry = 0 }: { position: [number, number, number]; size?: [number, number]; color?: string; ry?: number }) {
  const [w, d] = size;
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {[
        [-w / 2 + 0.2, -d / 2 + 0.2],
        [w / 2 - 0.2, -d / 2 + 0.2],
        [-w / 2 + 0.2, d / 2 - 0.2],
        [w / 2 - 0.2, d / 2 - 0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.1, z]}>
          <cylinderGeometry args={[0.055, 0.055, 2.2, 5]} />
          {M("#9a9387")}
        </mesh>
      ))}
      <mesh position={[0, 2.3, 0]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[w, 0.1, d]} />
        {M(color)}
      </mesh>
      {Array.from({ length: Math.round(w / 0.5) }).map((_, i) => (
        <mesh key={i} position={[-w / 2 + 0.25 + i * 0.5, 2.37, 0]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.12, 0.04, d]} />
          {M(i % 2 ? "#f4f1de" : color)}
        </mesh>
      ))}
    </group>
  );
}

/** Warung / kantin kecil dengan etalase */
export function FoodStall({ position, ry = 0, color = "#e9a84a", label }: { position: [number, number, number]; ry?: number; color?: string; label?: string }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.6, 1, 1.2]} />
        {M("#b8894f")}
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[2.8, 0.12, 1.4]} />
        {M("#e5dcc5")}
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.1, 5]} />
          {M("#8a8076")}
        </mesh>
      ))}
      <mesh position={[0, 2.22, 0]} rotation={[0.16, 0, 0]}>
        <boxGeometry args={[3, 0.1, 1.7]} />
        {M(color)}
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.9 + i * 0.6, 1.26, 0.2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.3, 7]} />
          {M(["#f4f1de", "#c75146", "#81b29a", "#f2cc8f"][i])}
        </mesh>
      ))}
      {label && (
        <Html position={[0, 2.55, 0]} center distanceFactor={13} zIndexRange={[8, 0]}>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-md bg-[#2b2119]/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#f2cc8f] border border-[#f2cc8f]/25">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export function BasketCourt({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[9, 14]} />
        <meshStandardMaterial color="#a4603f" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.6, 1.74, 24]} />
        <meshStandardMaterial color="#f4f1de" />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * 6.6]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 3.2, 6]} />
            {M("#5b6b7c")}
          </mesh>
          <mesh position={[0, 3.1, -s * 0.35]}>
            <boxGeometry args={[1.3, 0.85, 0.08]} />
            {M("#f4f1de")}
          </mesh>
          <mesh position={[0, 2.82, -s * 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.035, 5, 12]} />
            {M("#e07a5f")}
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Scoreboard({ position, ry = 0, text = "SMA", sub }: { position: [number, number, number]; ry?: number; text?: string; sub?: string }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.1, 1, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 2, 5]} />
          {M("#6b5a45")}
        </mesh>
      ))}
      <mesh position={[0, 2.3, 0]}>
        <boxGeometry args={[2.8, 1.3, 0.14]} />
        {M("#2f3b44")}
      </mesh>
      <Html position={[0, 2.3, 0.09]} center distanceFactor={12} zIndexRange={[8, 0]}>
        <div className="pointer-events-none select-none text-center">
          <div className="text-[13px] font-black tracking-wider text-[#ffe9b0]">{text}</div>
          {sub && <div className="text-[8px] uppercase tracking-[0.2em] text-[#f4ecdd]/80">{sub}</div>}
        </div>
      </Html>
    </group>
  );
}

export function Statue({ position, color = "#cfc6b0" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.6, 1.5]} />
        {M("#9a9081")}
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.9, 0.5, 0.9]} />
        {M("#b3a992")}
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.42, 1, 0.3]} />
        {M(color)}
      </mesh>
      <mesh position={[0, 2.28, 0]}>
        <boxGeometry args={[0.3, 0.36, 0.3]} />
        {M(color)}
      </mesh>
      <mesh position={[0.34, 1.9, 0.12]} rotation={[0, 0, -0.9]}>
        <boxGeometry args={[0.14, 0.7, 0.14]} />
        {M(color)}
      </mesh>
      <mesh position={[0.6, 2.3, 0.12]} rotation={[0.3, 0, 0.3]}>
        <boxGeometry args={[0.3, 0.05, 0.22]} />
        {M("#e5dcc5")}
      </mesh>
    </group>
  );
}

export function Fountain({ position }: { position: [number, number, number] }) {
  const w = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (w.current) w.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[2.1, 2.3, 0.5, 14]} />
        {M("#b8b0a0")}
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.85, 1.85, 0.2, 14]} />
        <meshStandardMaterial color="#5fa8c7" roughness={0.25} metalness={0.15} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.42, 1, 8]} />
        {M("#cfc6b0")}
      </mesh>
      <group ref={w} position={[0, 1.5, 0]}>
        <mesh>
          <coneGeometry args={[0.42, 0.9, 8]} />
          <meshStandardMaterial color="#9fd8ef" transparent opacity={0.6} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/** Papan mading / banner berdiri */
export function Banner({ position, ry = 0, color = "#7a1f2b", title, sub }: { position: [number, number, number]; ry?: number; color?: string; title: string; sub?: string }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 2.2, 5]} />
          {M("#4c4a45")}
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[1.9, 1.25, 0.06]} />
        {M(color)}
      </mesh>
      <Html position={[0, 1.55, 0.05]} center distanceFactor={11} zIndexRange={[8, 0]}>
        <div className="pointer-events-none w-[150px] select-none text-center">
          <div className="text-[11px] font-black leading-tight text-[#ffe9b0]">{title}</div>
          {sub && <div className="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-[#f4ecdd]/85">{sub}</div>}
        </div>
      </Html>
    </group>
  );
}

/** Bendera-bendera kecil penghias (umbul-umbul) */
export function BuntingLine({ from, to, h = 3.4 }: { from: [number, number]; to: [number, number]; h?: number }) {
  const n = 12;
  const colors = ["#e07a5f", "#f2cc8f", "#81b29a", "#8ecae6", "#cdb4f5"];
  return (
    <group>
      {Array.from({ length: n }).map((_, i) => {
        const t = i / (n - 1);
        const x = THREE.MathUtils.lerp(from[0], to[0], t);
        const z = THREE.MathUtils.lerp(from[1], to[1], t);
        const sag = Math.sin(t * Math.PI) * 0.5;
        return (
          <mesh key={i} position={[x, h - sag, z]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.12, 0.3, 3]} />
            {M(colors[i % colors.length])}
          </mesh>
        );
      })}
    </group>
  );
}

/** Deretan meja-kursi kelas (terlihat dari luar/teras) */
export function ClassDesks({ position, ry = 0, rows = 3, cols = 3 }: { position: [number, number, number]; ry?: number; rows?: number; cols?: number }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <group key={`${r}${c}`} position={[(c - (cols - 1) / 2) * 1.2, 0, r * 1.15]}>
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[0.85, 0.07, 0.5]} />
              {M("#c99a5b")}
            </mesh>
            {[-0.34, 0.34].map((x) => (
              <mesh key={x} position={[x, 0.27, 0]}>
                <boxGeometry args={[0.06, 0.55, 0.42]} />
                {M("#8a7a68")}
              </mesh>
            ))}
            <mesh position={[0, 0.3, 0.52]}>
              <boxGeometry args={[0.45, 0.06, 0.4]} />
              {M("#9a6b3f")}
            </mesh>
            <mesh position={[0, 0.56, 0.7]}>
              <boxGeometry args={[0.45, 0.46, 0.06]} />
              {M("#9a6b3f")}
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

export function Whiteboard({ position, ry = 0, lines = ["y = mx + c"], hijau }: { position: [number, number, number]; ry?: number; lines?: string[]; hijau?: boolean }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.8, 1.5, 0.1]} />
        {M(hijau ? "#2f5244" : "#f6f3e8")}
      </mesh>
      <mesh position={[0, 0.72, 0.02]}>
        <boxGeometry args={[2.9, 0.1, 0.18]} />
        {M("#a9763f")}
      </mesh>
      <Html position={[0, 1.55, 0.06]} center distanceFactor={9} zIndexRange={[8, 0]}>
        <div className={`pointer-events-none select-none whitespace-pre text-left font-hand text-[14px] leading-tight ${hijau ? "text-[#dff3e4]" : "text-[#3d405b]"}`}>
          {lines.join("\n")}
        </div>
      </Html>
    </group>
  );
}

/** Tiang basket/voli sederhana + net voli */
export function VolleyNet({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 2.4, 6]} />
          {M("#9a9387")}
        </mesh>
      ))}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[6.8, 0.7, 0.04]} />
        <meshStandardMaterial color="#f4f1de" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/** Kolam ikan kecil */
export function Pond({ position, r = 2.4 }: { position: [number, number, number]; r?: number }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[r, 18]} />
        <meshStandardMaterial color="#3f7f94" roughness={0.2} metalness={0.2} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.1, Math.sin(a) * r]}>
            <dodecahedronGeometry args={[0.26, 0]} />
            {M("#8d8577")}
          </mesh>
        );
      })}
      {[
        [0.6, 0.5],
        [-0.8, -0.4],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.07, z]} rotation={[-Math.PI / 2, 0, i]}>
          <circleGeometry args={[0.42, 7]} />
          {M("#4b7a3d")}
        </mesh>
      ))}
    </group>
  );
}

/** Tangga/undakan teras gedung */
export function Steps({ position, ry = 0, w = 4 }: { position: [number, number, number]; ry?: number; w?: number }) {
  return (
    <group position={position} rotation={[0, ry, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.09 + i * 0.18, i * 0.4]}>
          <boxGeometry args={[w, 0.18, 0.44]} />
          {M("#cfc6b0")}
        </mesh>
      ))}
    </group>
  );
}

/** Lampu taman kecil (hias jalan) */
export function PathLight({ position, c = "#ffd9a0" }: { position: [number, number, number]; c?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 5]} />
        {M("#45413c")}
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <icosahedronGeometry args={[0.11, 0]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.1} />
      </mesh>
    </group>
  );
}
