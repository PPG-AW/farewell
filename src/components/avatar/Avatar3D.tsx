"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
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
  onClick?: () => void;
  showShadow?: boolean;
  /** 0 = diam, 1 = berjalan penuh (menggerakkan kaki & tangan) */
  walk?: number;
  /** variasi fase animasi agar NPC tidak serempak */
  phase?: number;
  highlight?: boolean;
};

/**
 * Avatar low-poly dengan proporsi manusia yang benar.
 * Tinggi total ±1.75 unit. Titik (0,0,0) = telapak kaki.
 *   kaki   0.00 – 0.78
 *   badan  0.78 – 1.32
 *   leher  1.32 – 1.38
 *   kepala 1.38 – 1.75
 */
export default function Avatar3D({
  config: c,
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  nameTag,
  role,
  isSelf,
  onClick,
  showShadow = true,
  walk = 0,
  phase,
  highlight,
}: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useCursor(hover && !!onClick);

  const seed = useMemo(() => phase ?? Math.random() * 10, [phase]);

  // ─── proporsi ───
  const w = c.tubuh === "langsing" ? 0.9 : c.tubuh === "tegap" ? 1.12 : 1; // lebar relatif
  const isRok = c.bawahan === "rok-panjang" || c.bawahan === "rok-selutut" || c.bawahan === "kulot";
  const rokPanjang = c.bawahan === "rok-panjang";
  const isTni = c.atasan === "seragam-tni";
  const hijab = c.hijab && c.hijab !== "none";
  const lenganPanjang = isTni || ["kemeja", "cardigan", "hoodie", "batik"].includes(c.atasan);

  const SHOULDER_Y = 1.24;
  const HIP_Y = 0.78;
  const ARM_LEN = 0.46;
  const LEG_LEN = 0.74;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + seed;
    const sw = Math.sin(t * (walk > 0.05 ? 9 : 1.6));

    if (body.current) {
      // nafas + bobbing saat jalan
      body.current.position.y = walk > 0.05 ? Math.abs(Math.sin(t * 9)) * 0.045 : Math.sin(t * 1.6) * 0.012;
      body.current.rotation.z = walk > 0.05 ? sw * 0.03 : 0;
      body.current.rotation.y = walk > 0.05 ? 0 : Math.sin(t * 0.5) * 0.07;
    }
    // ayunan kaki & tangan
    const amp = 0.08 + walk * 0.72;
    if (legL.current) legL.current.rotation.x = sw * amp * (walk > 0.05 ? 1 : 0.12);
    if (legR.current) legR.current.rotation.x = -sw * amp * (walk > 0.05 ? 1 : 0.12);
    if (armL.current) armL.current.rotation.x = -sw * amp * 0.85 + (walk > 0.05 ? 0 : 0.04);
    if (armR.current) armR.current.rotation.x = sw * amp * 0.85 + (walk > 0.05 ? 0 : 0.04);

    if (eyes.current) eyes.current.scale.y = t % 4.2 < 0.13 ? 0.1 : 1;
    if (root.current && isSelf) root.current.position.y = position[1];
  });

  const M = (color: string, rough = 0.88) => <meshStandardMaterial color={color} roughness={rough} flatShading />;

  // lengan: warna baju kalau lengan panjang, warna kulit kalau pendek
  const sleeveColor = lenganPanjang ? c.atasanWarna : c.kulit;
  const topColor = isTni ? "#4a5d3a" : c.atasanWarna;

  return (
    <group
      ref={root}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
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
          <circleGeometry args={[0.33, 14]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.26} />
        </mesh>
      )}
      {(isSelf || highlight) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.4, 0.5, 22]} />
          <meshBasicMaterial color={isSelf ? "#f2cc8f" : "#8ecae6"} transparent opacity={0.8} />
        </mesh>
      )}

      <group ref={body}>
        {/* ══ KAKI ══ */}
        {([-1, 1] as const).map((s) => (
          <group key={`leg${s}`} ref={s === -1 ? legL : legR} position={[s * 0.1 * w, HIP_Y, 0]}>
            {/* paha + betis */}
            <mesh position={[0, -LEG_LEN / 2 + 0.06, 0]}>
              <boxGeometry args={[0.15 * w, LEG_LEN - 0.12, 0.16]} />
              {M(isRok && rokPanjang ? c.bawahanWarna : isRok ? c.kulit : c.bawahanWarna)}
            </mesh>
            {/* sepatu */}
            <group position={[0, -LEG_LEN + 0.06, 0.03]}>
              {c.sepatu === "boots" ? (
                <mesh position={[0, 0.02, 0]}>
                  <boxGeometry args={[0.17 * w, 0.26, 0.26]} />
                  {M(c.sepatuWarna)}
                </mesh>
              ) : (
                <>
                  <mesh position={[0, -0.02, 0.02]}>
                    <boxGeometry args={[0.16 * w, 0.1, 0.27]} />
                    {M(c.sepatuWarna)}
                  </mesh>
                  {c.sepatu === "sneakers" && (
                    <mesh position={[0, -0.06, 0.02]}>
                      <boxGeometry args={[0.172 * w, 0.045, 0.28]} />
                      {M("#f4f1de")}
                    </mesh>
                  )}
                </>
              )}
            </group>
          </group>
        ))}

        {/* ══ ROK / KULOT (menutup pangkal kaki) ══ */}
        {isRok && (
          <mesh position={[0, HIP_Y - (rokPanjang ? 0.26 : 0.16), 0]}>
            <cylinderGeometry args={[0.21 * w, rokPanjang ? 0.34 * w : 0.3 * w, rokPanjang ? 0.56 : 0.34, 10]} />
            {M(c.bawahanWarna)}
          </mesh>
        )}

        {/* ══ PINGGUL ══ */}
        <mesh position={[0, HIP_Y + 0.05, 0]}>
          <boxGeometry args={[0.34 * w, 0.16, 0.21]} />
          {M(isRok ? c.bawahanWarna : c.bawahanWarna)}
        </mesh>

        {/* ══ BADAN / BAJU ══ */}
        <mesh position={[0, (HIP_Y + SHOULDER_Y) / 2 + 0.04, 0]}>
          <boxGeometry args={[0.38 * w, SHOULDER_Y - HIP_Y - 0.02, 0.23]} />
          {M(topColor)}
        </mesh>
        {/* kerah */}
        {(c.atasan === "kemeja" || c.atasan === "batik" || isTni) && (
          <>
            <mesh position={[0, SHOULDER_Y - 0.035, 0.085]}>
              <boxGeometry args={[0.17 * w, 0.07, 0.055]} />
              {M(isTni ? "#3f5131" : shade(topColor, -18))}
            </mesh>
            {/* deretan kancing */}
            <mesh position={[0, (HIP_Y + SHOULDER_Y) / 2 + 0.04, 0.118]}>
              <boxGeometry args={[0.022, SHOULDER_Y - HIP_Y - 0.1, 0.012]} />
              {M(shade(topColor, -28))}
            </mesh>
          </>
        )}
        {/* motif batik */}
        {c.atasan === "batik" &&
          [0.1, -0.05, -0.2].map((y, i) => (
            <mesh key={i} position={[(i % 2 ? 0.1 : -0.1) * w, SHOULDER_Y - 0.22 + y, 0.117]}>
              <circleGeometry args={[0.035, 6]} />
              <meshStandardMaterial color={shade(topColor, 42)} roughness={0.9} />
            </mesh>
          ))}
        {/* resleting cardigan */}
        {c.atasan === "cardigan" && (
          <mesh position={[0, (HIP_Y + SHOULDER_Y) / 2 + 0.04, 0.118]}>
            <boxGeometry args={[0.1 * w, SHOULDER_Y - HIP_Y - 0.06, 0.014]} />
            {M(shade(topColor, 30))}
          </mesh>
        )}
        {/* kantong + sabuk TNI */}
        {isTni && (
          <>
            {([-1, 1] as const).map((s) => (
              <mesh key={s} position={[s * 0.1 * w, SHOULDER_Y - 0.2, 0.118]}>
                <boxGeometry args={[0.11, 0.09, 0.02]} />
                {M("#3f5131")}
              </mesh>
            ))}
            <mesh position={[0, HIP_Y + 0.14, 0]}>
              <boxGeometry args={[0.4 * w, 0.07, 0.235]} />
              {M("#20211c")}
            </mesh>
          </>
        )}
        {/* tudung hoodie */}
        {c.atasan === "hoodie" && (
          <mesh position={[0, SHOULDER_Y - 0.01, -0.1]}>
            <sphereGeometry args={[0.19 * w, 8, 6]} />
            {M(shade(topColor, -14))}
          </mesh>
        )}

        {/* ══ LENGAN ══ */}
        {([-1, 1] as const).map((s) => (
          <group key={`arm${s}`} ref={s === -1 ? armL : armR} position={[s * (0.19 * w + 0.042), SHOULDER_Y - 0.03, 0]}>
            {/* bahu (selalu warna baju) */}
            <mesh position={[0, -0.05, 0]}>
              <boxGeometry args={[0.1, 0.15, 0.16]} />
              {M(topColor)}
            </mesh>
            {/* lengan atas–bawah */}
            <mesh position={[0, -ARM_LEN / 2 - 0.06, 0]}>
              <boxGeometry args={[0.095, ARM_LEN - 0.08, 0.125]} />
              {M(sleeveColor)}
            </mesh>
            {/* manset kalau lengan panjang */}
            {lenganPanjang && (
              <mesh position={[0, -ARM_LEN + 0.02, 0]}>
                <boxGeometry args={[0.1, 0.05, 0.13]} />
                {M(shade(topColor, -22))}
              </mesh>
            )}
            {/* telapak tangan */}
            <mesh position={[0, -ARM_LEN - 0.04, 0]}>
              <boxGeometry args={[0.085, 0.1, 0.11]} />
              {M(c.kulit)}
            </mesh>

            {/* ── benda yang dipegang (tangan kanan = s===1) ── */}
            {s === 1 && <HeldItem item={c.itemTangan} y={-ARM_LEN - 0.12} />}
            {s === -1 && c.itemTangan === "tas" && (
              <group position={[0.02, -ARM_LEN - 0.02, 0]}>
                <mesh position={[0, -0.1, 0]}>
                  <boxGeometry args={[0.17, 0.2, 0.1]} />
                  {M("#6b4a2f")}
                </mesh>
                <mesh position={[0, 0.02, 0]}>
                  <torusGeometry args={[0.07, 0.014, 5, 10]} />
                  {M("#4c3626")}
                </mesh>
              </group>
            )}
          </group>
        ))}

        {/* ══ LEHER ══ */}
        <mesh position={[0, SHOULDER_Y + 0.05, 0]}>
          <cylinderGeometry args={[0.062, 0.07, 0.1, 7]} />
          {M(c.kulit)}
        </mesh>

        {/* ══ KEPALA ══ */}
        <group position={[0, SHOULDER_Y + 0.27, 0]}>
          <mesh scale={[faceW(c.wajah), faceH(c.wajah), 0.97]}>
            <boxGeometry args={[0.29, 0.32, 0.275]} />
            {M(c.kulit, 0.82)}
          </mesh>
          {/* telinga */}
          {!hijab &&
            ([-1, 1] as const).map((s) => (
              <mesh key={s} position={[s * 0.16 * faceW(c.wajah), -0.01, 0]}>
                <boxGeometry args={[0.03, 0.08, 0.07]} />
                {M(c.kulit)}
              </mesh>
            ))}
          {/* mata */}
          <group ref={eyes}>
            {([-1, 1] as const).map((s) => (
              <group key={s} position={[s * 0.073, 0.025, 0.148]}>
                <mesh>
                  <boxGeometry args={[0.05, 0.045, 0.02]} />
                  <meshBasicMaterial color="#fdfbf5" />
                </mesh>
                <mesh position={[0, 0, 0.012]}>
                  <boxGeometry args={[0.026, 0.032, 0.012]} />
                  <meshBasicMaterial color="#17130f" />
                </mesh>
              </group>
            ))}
          </group>
          {/* alis */}
          {([-1, 1] as const).map((s) => (
            <mesh key={`b${s}`} position={[s * 0.073, 0.075, 0.149]}>
              <boxGeometry args={[0.055, 0.014, 0.012]} />
              <meshBasicMaterial color={c.rambutWarna} />
            </mesh>
          ))}
          {/* hidung + senyum */}
          <mesh position={[0, -0.025, 0.155]}>
            <boxGeometry args={[0.03, 0.04, 0.03]} />
            {M(shade(c.kulit, -12))}
          </mesh>
          <mesh position={[0, -0.095, 0.15]}>
            <boxGeometry args={[0.072, 0.016, 0.015]} />
            <meshBasicMaterial color="#9c4a3c" />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <mesh key={`c${s}`} position={[s * 0.115, -0.055, 0.14]}>
              <boxGeometry args={[0.05, 0.035, 0.02]} />
              <meshBasicMaterial color="#e5989b" transparent opacity={0.45} />
            </mesh>
          ))}
          {/* kacamata */}
          {c.kacamata && (
            <group position={[0, 0.025, 0.162]}>
              {([-1, 1] as const).map((s) => (
                <mesh key={s} position={[s * 0.073, 0, 0]}>
                  <torusGeometry args={[0.052, 0.009, 4, 10]} />
                  <meshStandardMaterial color="#26232e" roughness={0.4} metalness={0.3} />
                </mesh>
              ))}
              <mesh>
                <boxGeometry args={[0.05, 0.011, 0.011]} />
                <meshStandardMaterial color="#26232e" />
              </mesh>
            </group>
          )}

          {!hijab && <Hair model={c.rambutModel} color={c.rambutWarna} wajah={c.wajah} />}
          {hijab && <Hijab style={c.hijab} color={c.hijabWarna} />}
          {c.topi !== "none" && !hijab && <Headwear topi={c.topi} />}
          {c.topi !== "none" && hijab && c.topi.startsWith("baret") && <Headwear topi={c.topi} atasHijab />}
        </group>
      </group>

      {nameTag && (
        <Html position={[0, 2.05, 0]} center distanceFactor={9} zIndexRange={[20, 0]} occlude={false}>
          <div
            className={`pointer-events-none select-none whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-lg transition-transform ${
              hover ? "scale-110" : ""
            } ${isSelf ? "border-[#f2cc8f] bg-[#f2cc8f] text-[#3a2d18]" : "border-white/20 bg-black/60 text-[#f4ecdd]"} backdrop-blur-sm`}
          >
            {isSelf ? `★ ${nameTag} · INI KAMU` : nameTag}
            {role === "dosen" ? " · Dosen" : role === "admin" ? " · Admin" : ""}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── util warna ─────────────────────────────────────────────────────────────
function shade(hex: string, amt: number) {
  try {
    const c = new THREE.Color(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + amt / 100, 0.04, 0.96));
    return `#${c.getHexString()}`;
  } catch {
    return hex;
  }
}
const faceW = (f: string) => (f === "bulat" ? 1.08 : f === "tirus" ? 0.9 : f === "kotak" ? 1.05 : 1);
const faceH = (f: string) => (f === "kotak" ? 0.94 : f === "tirus" ? 1.07 : 1);

// ─── benda yang dipegang ────────────────────────────────────────────────────
function HeldItem({ item, y }: { item: string; y: number }) {
  const M = (c: string) => <meshStandardMaterial color={c} roughness={0.85} flatShading />;
  if (item === "buku")
    return (
      <group position={[0, y, 0.06]} rotation={[0.35, 0, 0.1]}>
        <mesh>
          <boxGeometry args={[0.19, 0.045, 0.25]} />
          {M("#f6f1e2")}
        </mesh>
        <mesh position={[0, 0.028, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.26]} />
          {M("#c75146")}
        </mesh>
      </group>
    );
  if (item === "bunga")
    return (
      <group position={[0, y + 0.02, 0.04]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.26, 5]} />
          {M("#4f772d")}
        </mesh>
        {[
          [0, 0.26, 0, "#e5989b"],
          [0.06, 0.22, 0.02, "#f2cc8f"],
          [-0.06, 0.23, -0.02, "#cdb4f5"],
        ].map(([x, yy, z, col], i) => (
          <mesh key={i} position={[x as number, yy as number, z as number]}>
            <icosahedronGeometry args={[0.045, 0]} />
            {M(col as string)}
          </mesh>
        ))}
      </group>
    );
  if (item === "trofi")
    return (
      <group position={[0, y + 0.03, 0.04]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.055, 0.025, 0.11, 7]} />
          <meshStandardMaterial color="#e9a84a" metalness={0.65} roughness={0.28} flatShading />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.09, 0.05, 0.09]} />
          {M("#5c4033")}
        </mesh>
      </group>
    );
  if (item === "pointer")
    return (
      <mesh position={[0, y + 0.08, 0.02]} rotation={[0.5, 0, 0.12]}>
        <cylinderGeometry args={[0.011, 0.011, 0.5, 5]} />
        {M("#e8e2d4")}
      </mesh>
    );
  return null;
}

// ─── rambut ─────────────────────────────────────────────────────────────────
function Hair({ model, color, wajah }: { model: string; color: string; wajah: string }) {
  const m = <meshStandardMaterial color={color} roughness={0.95} flatShading />;
  const fw = faceW(wajah);
  // batok rambut membungkus kepala: atas + belakang + sisi, menyisakan wajah
  const cap = (
    <group>
      <mesh position={[0, 0.095, -0.004]} scale={[fw, 1, 1]}>
        <boxGeometry args={[0.305, 0.14, 0.29]} />
        {m}
      </mesh>
      <mesh position={[0, 0.0, -0.125]} scale={[fw, 1, 1]}>
        <boxGeometry args={[0.3, 0.26, 0.05]} />
        {m}
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 0.142 * fw, 0.015, -0.02]}>
          <boxGeometry args={[0.03, 0.24, 0.26]} />
          {m}
        </mesh>
      ))}
    </group>
  );
  const poni = (
    <mesh position={[0, 0.095, 0.082]} scale={[fw, 1, 1]}>
      <boxGeometry args={[0.3, 0.14, 0.13]} />
      {m}
    </mesh>
  );
  const sisi = ([-1, 1] as const).map((s) => (
    <mesh key={s} position={[s * 0.15 * fw, -0.06, -0.03]}>
      <boxGeometry args={[0.045, 0.3, 0.26]} />
      {m}
    </mesh>
  ));

  switch (model) {
    case "panjang-lurus":
    case "panjang-bergelombang":
      return (
        <group>
          {cap}
          {poni}
          {sisi}
          <mesh position={[0, -0.16, -0.14]}>
            <boxGeometry args={[0.37 * fw, 0.56, 0.11]} />
            {m}
          </mesh>
        </group>
      );
    case "ponytail":
      return (
        <group>
          {cap}
          {poni}
          <mesh position={[0, 0.04, -0.175]}>
            <boxGeometry args={[0.13, 0.13, 0.08]} />
            {m}
          </mesh>
          <mesh position={[0, -0.16, -0.21]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.11, 0.44, 0.09]} />
            {m}
          </mesh>
        </group>
      );
    case "bob":
      return (
        <group>
          {cap}
          {poni}
          <mesh position={[0, -0.04, -0.015]} scale={[fw, 1, 1]}>
            <boxGeometry args={[0.355, 0.26, 0.33]} />
            {m}
          </mesh>
        </group>
      );
    case "lob":
      return (
        <group>
          {cap}
          {poni}
          {sisi}
          <mesh position={[0, -0.085, -0.1]}>
            <boxGeometry args={[0.36 * fw, 0.3, 0.17]} />
            {m}
          </mesh>
        </group>
      );
    case "cepol":
      return (
        <group>
          {cap}
          {poni}
          <mesh position={[0, 0.24, -0.06]}>
            <icosahedronGeometry args={[0.095, 0]} />
            {m}
          </mesh>
        </group>
      );
    case "keriting":
      return (
        <group>
          {cap}
          {[
            [0.15, 0.17, 0.05],
            [-0.15, 0.17, 0.05],
            [0, 0.22, -0.11],
            [0.11, 0.13, 0.16],
            [-0.11, 0.13, 0.16],
            [0.18, 0.02, -0.08],
            [-0.18, 0.02, -0.08],
          ].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <icosahedronGeometry args={[0.075, 0]} />
              {m}
            </mesh>
          ))}
        </group>
      );
    case "undercut":
      return (
        <group>
          <mesh position={[0, 0.105, -0.004]} scale={[fw * 0.96, 1, 0.96]}>
            <boxGeometry args={[0.3, 0.12, 0.285]} />
            {m}
          </mesh>
        </group>
      );
    case "side-part":
      return (
        <group>
          {cap}
          <mesh position={[0.05, 0.085, 0.142]} rotation={[0, 0, -0.18]} scale={[fw, 1, 1]}>
            <boxGeometry args={[0.24, 0.075, 0.05]} />
            {m}
          </mesh>
        </group>
      );
    case "curtain":
      return (
        <group>
          {cap}
          {([-1, 1] as const).map((s) => (
            <mesh key={s} position={[s * 0.08, 0.07, 0.145]} rotation={[0, 0, s * 0.3]}>
              <boxGeometry args={[0.15, 0.1, 0.05]} />
              {m}
            </mesh>
          ))}
        </group>
      );
    case "pendek":
    default:
      return (
        <group>
          {cap}
          <mesh position={[0, 0.085, 0.09]} scale={[fw, 1, 1]}>
            <boxGeometry args={[0.3, 0.11, 0.12]} />
            {m}
          </mesh>
        </group>
      );
  }
}

// ─── hijab ──────────────────────────────────────────────────────────────────
function Hijab({ style, color }: { style: string; color: string }) {
  const m = <meshStandardMaterial color={color} roughness={0.93} flatShading />;
  return (
    <group>
      {/* penutup kepala */}
      <mesh position={[0, 0.07, -0.02]}>
        <boxGeometry args={[0.36, 0.34, 0.345]} />
        {m}
      </mesh>
      {/* bukaan wajah */}
      <mesh position={[0, -0.01, 0.055]}>
        <boxGeometry args={[0.245, 0.27, 0.26]} />
        <meshStandardMaterial color="#00000000" transparent opacity={0} depthWrite={false} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 0.157, -0.02, 0.09]}>
          <boxGeometry args={[0.055, 0.3, 0.19]} />
          {m}
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0.1]}>
        <boxGeometry args={[0.33, 0.1, 0.16]} />
        {m}
      </mesh>
      {/* bagian bawah menutupi leher & bahu */}
      <mesh position={[0, -0.3, -0.03]}>
        <boxGeometry args={[0.37, 0.3, 0.33]} />
        {m}
      </mesh>
      {style === "pashmina" &&
        ([-1, 1] as const).map((s) => (
          <mesh key={s} position={[s * 0.18, -0.42, 0.02]} rotation={[0, 0, s * 0.1]}>
            <boxGeometry args={[0.1, 0.34, 0.16]} />
            {m}
          </mesh>
        ))}
      {style === "segi-empat" && (
        <mesh position={[0, -0.46, 0.08]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.3, 0.26, 0.03]} />
          {m}
        </mesh>
      )}
    </group>
  );
}

// ─── topi & baret ───────────────────────────────────────────────────────────
function Headwear({ topi, atasHijab }: { topi: string; atasHijab?: boolean }) {
  const y = atasHijab ? 0.26 : 0.2;
  if (topi.startsWith("baret")) {
    const col = BARET_COLORS[topi] ?? "#3d4f31";
    return (
      <group position={[0, y, 0]} rotation={[0.08, 0, 0.26]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.185, 0.07, 10]} />
          <meshStandardMaterial color={col} roughness={0.92} flatShading />
        </mesh>
        <mesh position={[0.12, 0.02, 0.1]}>
          <boxGeometry args={[0.05, 0.05, 0.01]} />
          <meshStandardMaterial color="#e9c46a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    );
  }
  if (topi === "bucket")
    return (
      <group position={[0, y - 0.02, 0]}>
        <mesh>
          <cylinderGeometry args={[0.17, 0.19, 0.14, 10]} />
          <meshStandardMaterial color="#e9c46a" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, -0.07, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.025, 12]} />
          <meshStandardMaterial color="#dcb45a" roughness={0.9} flatShading />
        </mesh>
      </group>
    );
  return (
    <group position={[0, y - 0.03, 0]}>
      <mesh>
        <boxGeometry args={[0.33, 0.12, 0.31]} />
        <meshStandardMaterial color="#c75146" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, -0.05, 0.21]}>
        <boxGeometry args={[0.31, 0.03, 0.16]} />
        <meshStandardMaterial color="#a8423b" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}
