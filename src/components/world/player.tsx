"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Avatar3D from "@/components/avatar/Avatar3D";
import { useStore } from "@/store/useStore";
import { randomAvatar, type AvatarConfig, type Hubs } from "@/lib/constants";

// ─── state pemain (di luar React agar tidak memicu render tiap frame) ───────
export const player = {
  pos: new THREE.Vector3(0, 0, 12),
  yaw: 0,
  walk: 0,
};
export const input = { f: 0, r: 0, run: false };

// joystick (diisi oleh UI mobile)
export const joy = { x: 0, y: 0, active: false };

// ─── registry objek interaktif terdekat ─────────────────────────────────────
export type Interactable = { id: string; pos: THREE.Vector3; label: string; action: () => void; kind: "surat" | "narasi" | "portal" | "orang" };
const registry = new Map<string, Interactable>();

export function useInteractable(
  id: string,
  pos: [number, number, number],
  label: string,
  action: () => void,
  kind: Interactable["kind"] = "surat",
  enabled = true
) {
  const actionRef = useRef(action);
  actionRef.current = action;
  useEffect(() => {
    if (!enabled) return;
    const v = new THREE.Vector3(pos[0], pos[1], pos[2]);
    registry.set(id, { id, pos: v, label, action: () => actionRef.current(), kind });
    return () => {
      registry.delete(id);
    };
  }, [id, label, kind, enabled, pos[0], pos[1], pos[2]]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function triggerNearest() {
  const n = useStore.getState().nearby;
  if (!n) return;
  registry.get(n.id)?.action();
}

// ─── pengaturan tiap zona ───────────────────────────────────────────────────
export const SCENE_CFG: Record<string, { spawn: [number, number]; radius: number; camDist: number }> = {
  hub: { spawn: [0, 11], radius: 25, camDist: 8 },
  uksw: { spawn: [10, 24], radius: 46, camDist: 9 },
  ppl: { spawn: [0, 16], radius: 34, camDist: 9 },
  "ppl-school": { spawn: [0, 14], radius: 30, camDist: 9 },
  yonif: { spawn: [0, 17], radius: 32, camDist: 9 },
  bukit: { spawn: [0, 15], radius: 26, camDist: 8.5 },
};

type Ctrl = { target: THREE.Vector3; update: () => void; enabled: boolean } | null;

// ─── rig: input → gerak → kamera ────────────────────────────────────────────
export function PlayerRig({ controls }: { controls: React.MutableRefObject<Ctrl> }) {
  const { camera } = useThree();
  const scene = useStore((s) => s.scene);
  const school = useStore((s) => s.school);
  const activeUcapan = useStore((s) => s.activeUcapanId);
  const narasi = useStore((s) => s.narasi);
  const overlay = useStore((s) => s.overlay);
  const listOpen = useStore((s) => s.listOpen);
  const prevTarget = useRef(new THREE.Vector3());
  const lastNearby = useRef<string | null>(null);

  const key = scene === "ppl" && school ? "ppl-school" : scene;
  const cfg = SCENE_CFG[key] ?? SCENE_CFG.hub;
  const blocked = !!activeUcapan || !!narasi || overlay !== "none" || listOpen;

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "arrowup"].includes(k)) input.f = 1;
      if (["s", "arrowdown"].includes(k)) input.f = -1;
      if (["a", "arrowleft"].includes(k)) input.r = -1;
      if (["d", "arrowright"].includes(k)) input.r = 1;
      if (k === "shift") input.run = true;
      if (k === "e") triggerNearest();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["w", "arrowup"].includes(k) && input.f === 1) input.f = 0;
      if (["s", "arrowdown"].includes(k) && input.f === -1) input.f = 0;
      if (["a", "arrowleft"].includes(k) && input.r === -1) input.r = 0;
      if (["d", "arrowright"].includes(k) && input.r === 1) input.r = 0;
      if (k === "shift") input.run = false;
    };
    const blur = () => {
      input.f = 0;
      input.r = 0;
      input.run = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // reset posisi saat pindah zona
  useEffect(() => {
    player.pos.set(cfg.spawn[0], 0, cfg.spawn[1]);
    player.yaw = Math.PI;
    player.walk = 0;
    input.f = 0;
    input.r = 0;
    const tgt = new THREE.Vector3(player.pos.x, 1.2, player.pos.z);
    prevTarget.current.copy(tgt);
    camera.position.set(tgt.x, tgt.y + cfg.camDist * 0.55, tgt.z + cfg.camDist);
    if (controls.current) {
      controls.current.target.copy(tgt);
      controls.current.update();
    }
    useStore.getState().setNearby(null);
  }, [key, camera, controls, cfg.spawn, cfg.camDist]);

  const dir = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const target = new THREE.Vector3();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const ctrl = controls.current;

    // input gabungan keyboard + joystick
    let f = input.f;
    let r = input.r;
    if (joy.active) {
      f = -joy.y;
      r = joy.x;
    }
    if (blocked) {
      f = 0;
      r = 0;
    }

    // arah relatif kamera
    dir.subVectors(player.pos, camera.position);
    dir.y = 0;
    if (dir.lengthSq() < 0.0001) dir.set(0, 0, -1);
    dir.normalize();
    right.crossVectors(dir, up).normalize().negate();

    move.set(0, 0, 0).addScaledVector(dir, f).addScaledVector(right, r);
    const mag = Math.min(1, move.length());

    if (mag > 0.02) {
      move.normalize();
      const speed = (input.run ? 7.6 : 4.4) * mag;
      player.pos.addScaledVector(move, speed * dt);
      // batas area
      const d = Math.hypot(player.pos.x, player.pos.z);
      if (d > cfg.radius) {
        player.pos.x = (player.pos.x / d) * cfg.radius;
        player.pos.z = (player.pos.z / d) * cfg.radius;
      }
      const wantYaw = Math.atan2(move.x, move.z);
      let diff = wantYaw - player.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      player.yaw += diff * Math.min(1, dt * 12);
      player.walk = THREE.MathUtils.lerp(player.walk, input.run ? 1 : 0.78, dt * 9);
    } else {
      player.walk = THREE.MathUtils.lerp(player.walk, 0, dt * 10);
    }

    // kamera mengikuti: geser kamera sebesar perpindahan target
    target.set(player.pos.x, 1.25, player.pos.z);
    if (ctrl) {
      const delta = target.clone().sub(prevTarget.current);
      camera.position.add(delta);
      ctrl.target.copy(target);
      prevTarget.current.copy(target);
    }

    // cari objek interaktif terdekat
    let best: Interactable | null = null;
    let bestD = 4.2;
    registry.forEach((it) => {
      const d = Math.hypot(it.pos.x - player.pos.x, it.pos.z - player.pos.z);
      if (d < bestD) {
        bestD = d;
        best = it;
      }
    });
    const bestItem = best as Interactable | null;
    const id = bestItem?.id ?? null;
    if (id !== lastNearby.current) {
      lastNearby.current = id;
      useStore.getState().setNearby(bestItem ? { id: bestItem.id, label: bestItem.label, kind: bestItem.kind } : null);
    }
  });

  return null;
}

// ─── avatar pemain yang bergerak ────────────────────────────────────────────
export function PlayerAvatar() {
  const session = useStore((s) => s.session);
  const world = useStore((s) => s.world);
  const preview = useStore((s) => s.preview);
  const ref = useRef<THREE.Group>(null);
  const [cfg, setCfg] = useState<AvatarConfig | null>(null);

  useEffect(() => {
    const mine = world?.users.find((u) => u.id === session?.id)?.avatar;
    setCfg(mine ?? randomAvatar((session?.jenisKelamin as "L" | "P") ?? "P", "biasa"));
  }, [world?.users, session?.id, session?.jenisKelamin]);

  const walkRef = useRef(0);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.set(player.pos.x, player.pos.y, player.pos.z);
    ref.current.rotation.y = player.yaw;
    walkRef.current = player.walk;
  });

  if (!cfg) return null;
  return (
    <group ref={ref}>
      <WalkingAvatar config={cfg} nameTag={preview ? "Mode Jelajah" : session?.namaPanggilan ?? "Kamu"} isSelf />
    </group>
  );
}

function WalkingAvatar({ config, nameTag, isSelf }: { config: AvatarConfig; nameTag: string; isSelf?: boolean }) {
  const [walk, setWalk] = useState(0);
  useFrame(() => {
    const w = player.walk;
    setWalk((prev) => (Math.abs(prev - w) > 0.12 ? w : prev));
  });
  return <Avatar3D config={config} walk={walk} nameTag={nameTag} isSelf={isSelf} phase={0} />;
}

// ─── NPC yang berjalan santai di jalur tertentu ─────────────────────────────
export function WalkerNPC({
  config,
  path,
  speed = 1.1,
  offset = 0,
  nameTag,
}: {
  config: AvatarConfig;
  path: [number, number][];
  speed?: number;
  offset?: number;
  nameTag?: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const total = useRef(0);
  const segs = useRef<{ a: THREE.Vector2; b: THREE.Vector2; len: number }[]>([]);

  if (segs.current.length === 0 && path.length > 1) {
    let sum = 0;
    for (let i = 0; i < path.length; i++) {
      const a = new THREE.Vector2(path[i][0], path[i][1]);
      const b = new THREE.Vector2(path[(i + 1) % path.length][0], path[(i + 1) % path.length][1]);
      const len = a.distanceTo(b);
      segs.current.push({ a, b, len });
      sum += len;
    }
    total.current = sum;
  }

  useFrame(({ clock }) => {
    if (!ref.current || segs.current.length === 0) return;
    let d = ((clock.getElapsedTime() * speed + offset) % total.current + total.current) % total.current;
    for (const s of segs.current) {
      if (d <= s.len) {
        const t = d / s.len;
        const x = THREE.MathUtils.lerp(s.a.x, s.b.x, t);
        const z = THREE.MathUtils.lerp(s.a.y, s.b.y, t);
        ref.current.position.set(x, 0, z);
        ref.current.rotation.y = Math.atan2(s.b.x - s.a.x, s.b.y - s.a.y);
        return;
      }
      d -= s.len;
    }
  });

  return (
    <group ref={ref}>
      <Avatar3D config={config} walk={0.8} nameTag={nameTag} phase={offset} />
    </group>
  );
}
