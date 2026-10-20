"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Sparkles, useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { AvatarConfig } from "@/lib/constants";

const BARET_COLORS: Record<string, string> = {
  "baret-hijau": "#3d4f31",
  "baret-ungu": "#5b4b8a",
  "baret-hitam": "#1c1c20",
  "baret-coklat": "#6b4a2f",
};

type Props = {
  config: AvatarConfig;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  nameTag?: string;
  role?: string;
  isSelf?: boolean;
  ghost?: boolean;
  onClick?: () => void;
  showShadow?: boolean;
};

export default function Avatar3D({
  config: c,
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  nameTag,
  role,
  isSelf,
  ghost,
  onClick,
  showShadow = true,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover && !!onClick);

  const seed = useMemo(() => Math.random() * 10, []);
  const bodyW = c.tubuh === "langsing" ? 0.88 : c.tubuh === "tegap" ? 1.14 : 1;
  const isRok = c.bawahan === "rok-panjang" || c.bawahan === "rok-selutut";
  const hasHijab = c.hijab !== "none";
  const isTni = c.atasan === "seragam-tni";
  const op = ghost ? 0.4 : 1;
  const transparent = ghost === true;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + seed;
    if (bodyRef.current) {
      const breathe = 1 + Math.sin(t * 2.1) * 0.012;
      bodyRef.current.scale.set(1, breathe, 1);
      bodyRef.current.rotation.y = Math.sin(t * 0.45) * 0.06;
      bodyRef.current.position.y = Math.sin(t * 2.1) * 0.008;
    }
    if (eyesRef.current) {
      const blink = t % 3.9 < 0.12 ? 0.12 : 1;
      eyesRef.current.scale.y = blink;
    }
    if (isSelf && root.current) {
      root.current.rotation.y = rotationY + Math.sin(t * 0.8) * 0.1;
    }
  });

  const faceW = c.wajah === "bulat" ? 1.08 : c.wajah === "tirus" ? 0.92 : 1;
  const faceH = c.wajah === "kotak" ? 0.94 : c.wajah === "tirus" ? 1.06 : 1;

  const M = (color: string, extra: Record<string, unknown> = {}) => (
    <meshStandardMaterial
      color={color}
      roughness={0.85}
      metalness={0.02}
      flatShading
      transparent={transparent}
      opacity={op}
      {...extra}
    />
  );

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      ref={root}
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      {showShadow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <circleGeometry args={[0.36, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={ghost ? 0.1 : 0.25} />
        </mesh>
      )}
      {isSelf && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.42, 0.5, 24]} />
            <meshBasicMaterial color="#f2cc8f" transparent opacity={0.85} />
          </mesh>
          <Sparkles count={18} scale={1.4} size={3} speed={0.5} position={[0, 0.9, 0]} color="#ffe9b0" />
        </>
      )}

      <group ref={bodyRef}>
        {/* ───── Sepatu ───── */}
        {[-1, 1].map((s) => (
          <mesh key={`shoe${s}`} position={[s * 0.11 * bodyW, 0.05, 0.03]}>
            <boxGeometry args={[0.15, 0.1, 0.24]} />
            {M(c.sepatuWarna)}
          </mesh>
        ))}

        {/* ───── Kaki / Rok ───── */}
        {isRok ? (
          <mesh position={[0, c.bawahan === "rok-panjang" ? 0.3 : 0.33, 0]}>
            <cylinderGeometry args={[0.19 * bodyW, 0.3 * bodyW, c.bawahan === "rok-panjang" ? 0.5 : 0.44, 8]} />
            {M(c.bawahanWarna)}
          </mesh>
        ) : (
          [-1, 1].map((s) => (
            <mesh key={`leg${s}`} position={[s * 0.11 * bodyW, 0.26, 0]}>
              <boxGeometry args={[0.14, 0.34, 0.16]} />
              {M(c.bawahanWarna)}
            </mesh>
          ))
        )}
        {isTni &&
          [-1, 1].map((s) => (
            <mesh key={`knee${s}`} position={[s * 0.11 * bodyW, 0.3, 0.06]}>
              <boxGeometry args={[0.15, 0.1, 0.08]} />
              {M("#31402a")}
            </mesh>
          ))}

        {/* ───── Badan ───── */}
        <mesh position={[0, 0.64, 0]}>
          <cylinderGeometry args={[0.2 * bodyW, 0.26 * bodyW, 0.46, 8]} />
          {M(c.atasanWarna)}
        </mesh>
        {(c.atasan === "kemeja" || isTni) && (
          <mesh position={[0, 0.74, 0.2 * bodyW - 0.02]}>
            <boxGeometry args={[0.05, 0.24, 0.02]} />
            {M(isTni ? "#3d4f31" : "#ffffff44")}
          </mesh>
        )}
        {isTni && (
          <>
            {[-1, 1].map((s) => (
              <mesh key={`pocket${s}`} position={[s * 0.09, 0.72, 0.2 * bodyW - 0.02]}>
                <boxGeometry args={[0.08, 0.06, 0.025]} />
                {M("#3d4f31")}
              </mesh>
            ))}
            <mesh position={[0, 0.44, 0]}>
              <cylinderGeometry args={[0.27 * bodyW, 0.27 * bodyW, 0.06, 8]} />
              {M("#1c1c20")}
            </mesh>
          </>
        )}
        {c.atasan === "hoodie" && (
          <mesh position={[0, 0.85, -0.12]}>
            <sphereGeometry args={[0.16 * bodyW, 6, 5]} />
            {M(c.atasanWarna)}
          </mesh>
        )}

        {/* ───── Tangan kirim item via config tangan kanan ───── */}
        {[-1, 1].map((s) => (
          <group key={`arm${s}`} position={[s * 0.26 * bodyW, 0.8, 0]} rotation={[0, 0, s * -0.22]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.05, 0.055, 0.32, 6]} />
              {M(c.atasanWarna)}
            </mesh>
            <mesh position={[0, -0.35, 0]}>
              <sphereGeometry args={[0.06, 6, 5]} />
              {M(c.kulit)}
            </mesh>
          </group>
        ))}

        {/* ───── Item di tangan kanan ───── */}
        {c.itemTangan === "buku" && (
          <group position={[0.34 * bodyW, 0.42, 0.1]} rotation={[0.3, 0.3, 0]}>
            <mesh>
              <boxGeometry args={[0.2, 0.045, 0.15]} />
              {M("#f4f1de")}
            </mesh>
            <mesh position={[0, 0.026, 0]}>
              <boxGeometry args={[0.21, 0.012, 0.16]} />
              {M("#c75146")}
            </mesh>
          </group>
        )}
        {c.itemTangan === "bunga" && (
          <group position={[0.34 * bodyW, 0.44, 0.1]}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.2, 5]} />
              {M("#4f772d")}
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <icosahedronGeometry args={[0.06, 0]} />
              {M("#e5989b")}
            </mesh>
          </group>
        )}
        {(c.itemTangan === "pointer" || c.itemTangan === "tongkat") && (
          <mesh position={[0.36 * bodyW, 0.55, 0.08]} rotation={[0.4, 0, 0.15]}>
            <cylinderGeometry args={[0.012, 0.012, c.itemTangan === "tongkat" ? 0.9 : 0.5, 5]} />
            {M("#8a5a2c")}
          </mesh>
        )}
        {c.itemTangan === "trofi" && (
          <group position={[0.34 * bodyW, 0.5, 0.1]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.02, 0.12, 6]} />
              {M("#e9a84a", { metalness: 0.6, roughness: 0.3 })}
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[0.1, 0.04, 0.1]} />
              {M("#6b4a2f")}
            </mesh>
          </group>
        )}
        {c.itemTangan === "tas" && (
          <mesh position={[-0.34 * bodyW, 0.5, 0]}>
            <boxGeometry args={[0.16, 0.2, 0.08]} />
            {M("#6b4a2f")}
          </mesh>
        )}
        {c.itemTangan === "bendera" && (
          <group position={[0.36 * bodyW, 0.6, 0.06]}>
            <mesh>
              <cylinderGeometry args={[0.012, 0.012, 0.7, 5]} />
              {M("#8a5a2c")}
            </mesh>
            <mesh position={[0.08, 0.24, 0]}>
              <planeGeometry args={[0.16, 0.1]} />
              <meshBasicMaterial color="#c75146" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.08, 0.14, 0]}>
              <planeGeometry args={[0.16, 0.1]} />
              <meshBasicMaterial color="#f4f1de" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* ───── Kepala ───── */}
        <group position={[0, 1.12, 0]} scale={[faceW, faceH, 1]}>
          <mesh>
            <sphereGeometry args={[0.23, 10, 8]} />
            {M(ghost ? "#33394e" : c.kulit)}
          </mesh>
          {/* mata + mulut */}
          <group ref={eyesRef}>
            {[-1, 1].map((s) => (
              <mesh key={`eye${s}`} position={[s * 0.08, 0.03, 0.2]}>
                <sphereGeometry args={[0.026, 6, 5]} />
                <meshBasicMaterial color={ghost ? "#9db4ff" : "#17130f"} />
              </mesh>
            ))}
          </group>
          <mesh position={[0, -0.075, 0.21]}>
            <boxGeometry args={[0.07, 0.016, 0.02]} />
            <meshBasicMaterial color={ghost ? "#9db4ff" : "#8a4a3a"} />
          </mesh>
          {/* pipi */}
          {[-1, 1].map((s) => (
            <mesh key={`cheek${s}`} position={[s * 0.12, -0.04, 0.18]}>
              <sphereGeometry args={[0.03, 6, 5]} />
              <meshBasicMaterial color="#e5989b" transparent opacity={ghost ? 0.1 : 0.5} />
            </mesh>
          ))}
          {/* kacamata */}
          {c.kacamata && !ghost && (
            <group position={[0, 0.03, 0.19]}>
              {[-1, 1].map((s) => (
                <mesh key={`glass${s}`} position={[s * 0.08, 0, 0.02]}>
                  <torusGeometry args={[0.055, 0.008, 5, 12]} />
                  <meshBasicMaterial color="#26232e" />
                </mesh>
              ))}
              <mesh position={[0, 0, 0.02]}>
                <boxGeometry args={[0.06, 0.012, 0.012]} />
                <meshBasicMaterial color="#26232e" />
              </mesh>
            </group>
          )}

          {/* ───── Rambut ───── */}
          {!hasHijab && !ghost && <Hair model={c.rambutModel} color={c.rambutWarna} />}
          {ghost && (
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.24, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
              {M("#1c2130")}
            </mesh>
          )}

          {/* ───── Hijab ───── */}
          {hasHijab && !ghost && (
            <group>
              <mesh position={[0, 0.045, -0.03]}>
                <sphereGeometry args={[0.265, 10, 8]} />
                {M(c.hijabWarna)}
              </mesh>
              {/* buka wajah */}
              <mesh position={[0, 0.01, 0.09]}>
                <sphereGeometry args={[0.235, 10, 8]} />
                {M(c.kulit)}
              </mesh>
              <mesh position={[0, -0.3, -0.03]}>
                <cylinderGeometry args={[0.24, 0.3, c.hijab === "instan" || c.hijab === "bergo" ? 0.35 : 0.22, 8]} />
                {M(c.hijabWarna)}
              </mesh>
              {c.hijab === "segi-empat" && (
                <mesh position={[0, -0.42, 0.06]} rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[0.3, 0.3, 0.02]} />
                  {M(c.hijabWarna)}
                </mesh>
              )}
              {c.hijab === "pashmina" &&
                [-1, 1].map((s) => (
                  <mesh key={`pash${s}`} position={[s * 0.22, -0.32, 0]}>
                    <boxGeometry args={[0.1, 0.4, 0.14]} />
                    {M(c.hijabWarna)}
                  </mesh>
                ))}
            </group>
          )}

          {/* ───── Topi / Baret ───── */}
          {c.topi !== "none" && !hasHijab && (
            <group position={[0, 0.19, 0]}>
              {c.topi.startsWith("baret") ? (
                <mesh rotation={[0.1, 0, 0.3]}>
                  <cylinderGeometry args={[0.14, 0.17, 0.07, 8]} />
                  {M(BARET_COLORS[c.topi] ?? "#3d4f31")}
                </mesh>
              ) : c.topi === "bucket" ? (
                <mesh>
                  <cylinderGeometry args={[0.16, 0.24, 0.16, 8]} />
                  {M("#f2cc8f")}
                </mesh>
              ) : (
                <group>
                  <mesh>
                    <sphereGeometry args={[0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    {M("#c75146")}
                  </mesh>
                  <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2.4, 0, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.02, 8]} />
                    {M("#c75146")}
                  </mesh>
                </group>
              )}
            </group>
          )}
        </group>
      </group>

      {/* ───── Name tag ───── */}
      {nameTag && (
        <Html position={[0, 1.62, 0]} center distanceFactor={7} zIndexRange={[20, 0]}>
          <div
            className={`pointer-events-none select-none whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide shadow-lg transition-transform ${
              hover ? "scale-110" : ""
            } ${isSelf ? "bg-[#f2cc8f] text-[#3a2d18]" : "bg-black/55 text-[#f4ecdd]"} border border-white/15 backdrop-blur-sm`}
          >
            {isSelf ? `★ ${nameTag} · INI KAMU` : nameTag}
            {role === "dosen" ? " · Dosen" : role === "admin" ? " · Admin" : ""}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Rambut varian ──────────────────────────────────────────────────────────
function Hair({ model, color }: { model: string; color: string }) {
  const hairMat = <meshStandardMaterial color={color} roughness={0.9} flatShading />;
  const scalp = (
    <mesh position={[0, 0.06, -0.02]} scale={[1.06, 0.92, 1.06]}>
      <sphereGeometry args={[0.225, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.4]} />
      {hairMat}
    </mesh>
  );
  switch (model) {
    case "panjang-lurus":
      return (
        <group>
          {scalp}
          <mesh position={[0, -0.18, -0.16]}>
            <boxGeometry args={[0.4, 0.52, 0.12]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "panjang-bergelombang":
      return (
        <group>
          {scalp}
          <mesh position={[0, -0.16, -0.16]}>
            <boxGeometry args={[0.42, 0.5, 0.12]} />
            {hairMat}
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.2, -0.3, -0.1]}>
              <sphereGeometry args={[0.07, 6, 5]} />
              {hairMat}
            </mesh>
          ))}
        </group>
      );
    case "ponytail":
      return (
        <group>
          {scalp}
          <mesh position={[0, 0.08, -0.24]}>
            <sphereGeometry args={[0.08, 6, 5]} />
            {hairMat}
          </mesh>
          <mesh position={[0, -0.12, -0.26]}>
            <boxGeometry args={[0.1, 0.38, 0.08]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "twin-tails":
      return (
        <group>
          {scalp}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.26, -0.16, -0.06]}>
              <boxGeometry args={[0.09, 0.36, 0.09]} />
              {hairMat}
            </mesh>
          ))}
        </group>
      );
    case "bob":
      return (
        <mesh position={[0, 0.045, -0.02]} scale={[1.14, 1, 1.1]}>
          <sphereGeometry args={[0.23, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.25]} />
          {hairMat}
        </mesh>
      );
    case "cepol":
      return (
        <group>
          {scalp}
          <mesh position={[0, 0.26, -0.05]}>
            <sphereGeometry args={[0.09, 6, 5]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "layer":
      return (
        <group>
          {scalp}
          <mesh position={[0, -0.1, -0.14]}>
            <boxGeometry args={[0.38, 0.34, 0.1]} />
            {hairMat}
          </mesh>
          <mesh position={[0, 0.02, 0.18]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.3, 0.12, 0.06]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "keriting":
      return (
        <group>
          {scalp}
          {[
            [0.16, 0.14, 0],
            [-0.16, 0.14, 0],
            [0, 0.24, -0.06],
            [0.1, 0.2, 0.12],
            [-0.1, 0.2, 0.12],
          ].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <sphereGeometry args={[0.07, 6, 5]} />
              {hairMat}
            </mesh>
          ))}
        </group>
      );
    case "lob":
      return (
        <group>
          {scalp}
          <mesh position={[0, -0.08, -0.15]}>
            <boxGeometry args={[0.38, 0.28, 0.1]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "wolf-cut":
      return (
        <group>
          {scalp}
          <mesh position={[0, -0.06, -0.15]}>
            <boxGeometry args={[0.36, 0.24, 0.1]} />
            {hairMat}
          </mesh>
          <mesh position={[0, 0.16, 0.06]}>
            <sphereGeometry args={[0.1, 6, 5]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "undercut":
      return (
        <mesh position={[0, 0.09, 0]} scale={[0.95, 0.75, 1]}>
          <sphereGeometry args={[0.21, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
          {hairMat}
        </mesh>
      );
    case "comma":
    case "curtain":
      return (
        <group>
          {scalp}
          <mesh position={[model === "comma" ? 0.06 : -0.06, 0.1, 0.17]} rotation={[0.4, 0, model === "comma" ? -0.3 : 0.3]}>
            <boxGeometry args={[0.14, 0.1, 0.05]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "mohawk-tipis":
      return (
        <mesh position={[0, 0.16, 0]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.34]} />
          {hairMat}
        </mesh>
      );
    case "side-part":
      return (
        <group>
          {scalp}
          <mesh position={[0.08, 0.12, 0.14]} rotation={[0.3, 0, -0.2]}>
            <boxGeometry args={[0.18, 0.08, 0.06]} />
            {hairMat}
          </mesh>
        </group>
      );
    case "pendek":
    default:
      return scalp;
  }
}
