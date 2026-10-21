"use client";

/**
 * Ikon SVG mini untuk setiap pilihan kustomisasi avatar,
 * supaya pengguna melihat bentuknya sebelum memilih.
 */

type P = { color?: string; skin?: string };
const S = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
    {children}
  </svg>
);

// ─── RAMBUT ─────────────────────────────────────────────────────────────────
function Head({ skin = "#e3b084" }: { skin?: string }) {
  return (
    <>
      <rect x="13" y="12" width="14" height="16" rx="3" fill={skin} />
      <circle cx="17" cy="19" r="1.2" fill="#2b2119" />
      <circle cx="23" cy="19" r="1.2" fill="#2b2119" />
      <path d="M17.5 23.5h5" stroke="#9c4a3c" strokeWidth="1.2" strokeLinecap="round" />
    </>
  );
}

export function HairIcon({ model, color = "#2b1d12", skin }: { model: string } & P) {
  const c = color;
  return (
    <S>
      <Head skin={skin} />
      {/* batok rambut dasar */}
      <path d="M12 17c0-5 3.6-7.5 8-7.5s8 2.5 8 7.5v1.5h-2.4V15H14.4v3.5H12z" fill={c} />
      {model === "panjang-lurus" && <path d="M12 17h3v13h-3zM25 17h3v13h-3z" fill={c} />}
      {model === "lob" && <path d="M12 17h3v8.5h-3zM25 17h3v8.5h-3z" fill={c} />}
      {model === "bob" && <path d="M11.4 16.5h4V26h-4zM24.6 16.5h4V26h-4z" fill={c} />}
      {model === "ponytail" && (
        <>
          <circle cx="29.4" cy="17.4" r="2.6" fill={c} />
          <path d="M29 19.6c2.6 2.4 2.8 6.4 1 9.4l-2.6-1c1.4-2.4 1.4-5.4-.4-7.4z" fill={c} />
        </>
      )}
      {model === "cepol" && <circle cx="20" cy="7.6" r="3.4" fill={c} />}
      {model === "keriting" && (
        <>
          {[
            [13, 12],
            [20, 8.6],
            [27, 12],
            [11.6, 17],
            [28.4, 17],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.1" fill={c} />
          ))}
        </>
      )}
      {model === "undercut" && <path d="M13.4 13.6c1.2-3 4-4.2 6.6-4.2s5.4 1.2 6.6 4.2z" fill={c} />}
      {model === "side-part" && <path d="M13 14.6c2-3.4 5-4.4 7.6-4.4 3 0 5.2 1.2 6.4 3l-8.4 2z" fill={c} />}
      {model === "curtain" && (
        <>
          <path d="M14 14l4 1.6-1 4-3-1.4z" fill={c} />
          <path d="M26 14l-4 1.6 1 4 3-1.4z" fill={c} />
        </>
      )}
      {model === "pendek" && <path d="M13 15.6h14v-1.2c0-3-3-4.8-7-4.8s-7 1.8-7 4.8z" fill={c} />}
    </S>
  );
}

// ─── HIJAB ──────────────────────────────────────────────────────────────────
export function HijabIcon({ style, color = "#5f8ac7", skin }: { style: string } & P) {
  if (style === "none") return <HairIcon model="panjang-lurus" color="#3b2314" skin={skin} />;
  return (
    <S>
      <path d="M20 7c-6 0-9.6 4.4-9.6 10.4 0 5 1.4 9 2.6 12.6h14c1.2-3.6 2.6-7.6 2.6-12.6C29.6 11.4 26 7 20 7z" fill={color} />
      <rect x="15" y="12.6" width="10" height="13" rx="3.4" fill={skin ?? "#e3b084"} />
      <circle cx="17.6" cy="18.4" r="1.1" fill="#2b2119" />
      <circle cx="22.4" cy="18.4" r="1.1" fill="#2b2119" />
      <path d="M18 22.6h4" stroke="#9c4a3c" strokeWidth="1.1" strokeLinecap="round" />
      {style === "pashmina" && <path d="M10.6 24l-1.4 9h4.2l1-8zM29.4 24l1.4 9h-4.2l-1-8z" fill={color} opacity="0.92" />}
      {style === "segi-empat" && <path d="M13 28h14l-2.4 8h-9.2z" fill={color} opacity="0.92" />}
      {style === "instan" && <path d="M12.6 26.6h14.8v4H12.6z" fill={color} opacity="0.92" />}
    </S>
  );
}

// ─── ATASAN ─────────────────────────────────────────────────────────────────
export function TopIcon({ model, color = "#81b29a" }: { model: string } & P) {
  const sleeveLong = ["kemeja", "cardigan", "hoodie", "batik"].includes(model);
  return (
    <S>
      {/* badan baju */}
      <path d="M14 11h12l3 3-2.4 2.6V32H13.4V16.6L11 14z" fill={color} />
      {/* lengan */}
      {sleeveLong ? (
        <>
          <path d="M11 14l-2.6 3 2 10h3.2V16.6z" fill={color} />
          <path d="M29 14l2.6 3-2 10h-3.2V16.6z" fill={color} />
        </>
      ) : (
        <>
          <path d="M11 14l-2.2 2.6 1.4 4.4h3.2V16.6z" fill={color} />
          <path d="M29 14l2.2 2.6-1.4 4.4h-3.2V16.6z" fill={color} />
        </>
      )}
      {model === "kemeja" && (
        <>
          <path d="M17.4 11l2.6 3.4 2.6-3.4-1.2-1.4h-2.8z" fill="#ffffff" opacity="0.85" />
          <path d="M20 15v16" stroke="#00000033" strokeWidth="1" />
          {[18, 23, 28].map((y) => (
            <circle key={y} cx="20" cy={y} r="0.8" fill="#00000055" />
          ))}
        </>
      )}
      {model === "batik" &&
        [
          [16.4, 20],
          [23.6, 23],
          [16.4, 27],
          [23.6, 30],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.7" fill="#ffffff" opacity="0.55" />)}
      {model === "cardigan" && (
        <>
          <rect x="18.8" y="13" width="2.4" height="19" fill="#ffffff" opacity="0.55" />
          <path d="M14 11l4 2.6M26 11l-4 2.6" stroke="#00000033" strokeWidth="1.1" />
        </>
      )}
      {model === "hoodie" && (
        <>
          <path d="M15 10.4c1.6 3 8.4 3 10 0 .6 1.6.4 3.4-5 3.4s-5.6-1.8-5-3.4z" fill="#00000033" />
          <path d="M18.6 16v6M21.4 16v6" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
        </>
      )}
      {model === "kaos" && <ellipse cx="20" cy="11.4" rx="3.2" ry="1.6" fill="#00000026" />}
    </S>
  );
}

// ─── BAWAHAN ────────────────────────────────────────────────────────────────
export function BottomIcon({ model, color = "#3d405b" }: { model: string } & P) {
  return (
    <S>
      {model === "rok-panjang" ? (
        <path d="M14 8h12l5 24H9z" fill={color} />
      ) : model === "kulot" ? (
        <>
          <path d="M14 8h12l1.6 12h-5.2l-.8-6h-1.2l-.8 6h-5.2z" fill={color} />
          <path d="M12.4 20h6.2l-.8 12h-6.6zM21.4 20h6.2l1.2 12h-6.6z" fill={color} />
        </>
      ) : (
        <>
          <path d="M14 8h12v6l-1.6 18h-5.2l-1.2-13h-.4l-1.2 13H11z" fill={color} />
          <path d="M14 8h12v4H14z" fill="#00000033" />
          {model === "jeans" && (
            <>
              <path d="M15 14v16M25 14v16" stroke="#ffffff" strokeWidth="0.7" opacity="0.45" strokeDasharray="2 2" />
              <rect x="14" y="8" width="12" height="2.4" fill="#00000044" />
            </>
          )}
        </>
      )}
      <rect x="13.4" y="6.6" width="13.2" height="2.6" rx="1" fill="#00000055" />
    </S>
  );
}

// ─── SEPATU ─────────────────────────────────────────────────────────────────
export function ShoeIcon({ model, color = "#17130f" }: { model: string } & P) {
  return (
    <S>
      {model === "boots" ? (
        <>
          <path d="M12 8h9v16h-9z" fill={color} />
          <path d="M12 24h17a2 2 0 0 1 2 2v4H12z" fill={color} />
          <path d="M12 29h19v2.6H12z" fill="#00000066" />
          {[12, 16, 20].map((y) => (
            <rect key={y} x="12.6" y={y} width="7.8" height="1.2" fill="#ffffff" opacity="0.25" />
          ))}
        </>
      ) : model === "flat" ? (
        <>
          <path d="M11 22h8c5 0 8 2.4 11 4.6v2.8H11z" fill={color} />
          <ellipse cx="16" cy="23.4" rx="3.4" ry="1.6" fill="#00000044" />
        </>
      ) : (
        <>
          <path d="M11 18h8.6c3 0 5.6 3.2 10.4 5.4v3.6H11z" fill={color} />
          <rect x="10.6" y="26.4" width="19.8" height="3" rx="1.4" fill="#f4f1de" />
          <path d="M14 19.6l3.6 3M16.6 18.6l3.6 3.4" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        </>
      )}
    </S>
  );
}

// ─── TOPI / BARET ───────────────────────────────────────────────────────────
const BARET: Record<string, string> = {
  "baret-hijau": "#3d4f31",
  "baret-ungu": "#5b4b8a",
  "baret-hitam": "#1c1c20",
  "baret-coklat": "#6b4a2f",
};

export function HatIcon({ model, skin }: { model: string } & P) {
  if (model === "none")
    return (
      <S>
        <Head skin={skin} />
        <path d="M12 17c0-5 3.6-7.5 8-7.5s8 2.5 8 7.5v1.5h-2.4V15H14.4v3.5H12z" fill="#3b2314" />
        <path d="M11 31l18-18" stroke="#c75146" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      </S>
    );
  if (model.startsWith("baret"))
    return (
      <S>
        <Head skin={skin} />
        <path d="M11.6 13.4c0-3.4 3.8-6 8.4-6s8.4 2.6 8.4 6c0 1.6-1.6 2.4-4 2.4H14c-1.6 0-2.4-.8-2.4-2.4z" fill={BARET[model]} />
        <path d="M27.6 9.2c2.4-.4 3.6.8 3 2.4-.4 1.2-2 1.6-3.4 1.2z" fill={BARET[model]} />
        <circle cx="15.4" cy="12" r="1.5" fill="#e9c46a" />
      </S>
    );
  if (model === "bucket")
    return (
      <S>
        <Head skin={skin} />
        <path d="M13.4 13.6c0-4 2.8-6.2 6.6-6.2s6.6 2.2 6.6 6.2z" fill="#e9c46a" />
        <path d="M9.6 13.4h20.8c.8 0 1.4.8 1.4 1.8s-.6 1.8-1.4 1.8H9.6c-.8 0-1.4-.8-1.4-1.8s.6-1.8 1.4-1.8z" fill="#dcb45a" />
      </S>
    );
  return (
    <S>
      <Head skin={skin} />
      <path d="M13 13.4c0-4 3-6.4 7-6.4s7 2.4 7 6.4z" fill="#c75146" />
      <path d="M13 13.2h14.6c3.4 0 5.4 1 5.4 2.2s-2 1.6-5.4 1.6H13z" fill="#a8423b" />
    </S>
  );
}

// ─── ITEM TANGAN ────────────────────────────────────────────────────────────
export function ItemIcon({ model }: { model: string }) {
  if (model === "none")
    return (
      <S>
        <path d="M14 15c0-1.6 1-2.6 2.2-2.6s2 1 2 2.4v5.6" fill="none" stroke="#e3b084" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M18.2 14.4c0-1.6 1-2.6 2.2-2.6s2.2 1 2.2 2.6v6.4" fill="none" stroke="#e3b084" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M14 20.4c0 5 2.6 8.6 7 8.6s6.6-3.6 6.6-8.4v-4.4" fill="none" stroke="#e3b084" strokeWidth="3.2" strokeLinecap="round" />
      </S>
    );
  if (model === "buku")
    return (
      <S>
        <path d="M8 11h11c1.4 0 2 .8 2 2v17c0-1.2-.8-2-2-2H8z" fill="#f4f1de" stroke="#c0b79f" />
        <path d="M32 11H21c-1.4 0-2 .8-2 2v17c0-1.2.8-2 2-2h11z" fill="#efe8d4" stroke="#c0b79f" />
        <rect x="18.6" y="9.4" width="2.8" height="22" rx="1" fill="#c75146" />
      </S>
    );
  if (model === "bunga")
    return (
      <S>
        <path d="M20 34V18" stroke="#4f772d" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M20 26c-4 0-6-2-6-5 3.4 0 6 1.6 6 5z" fill="#4f772d" />
        {[
          [20, 10, "#e5989b"],
          [14.6, 14, "#f2cc8f"],
          [25.4, 14, "#cdb4f5"],
          [17, 19, "#f08a5d"],
          [23, 19, "#8ecae6"],
        ].map(([x, y, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r="3.4" fill={c as string} />
        ))}
      </S>
    );
  if (model === "tas")
    return (
      <S>
        <path d="M15 14c0-3 2.2-5 5-5s5 2 5 5" fill="none" stroke="#5c4033" strokeWidth="2" />
        <rect x="9" y="14" width="22" height="17" rx="2.6" fill="#8a5a2c" />
        <rect x="9" y="19" width="22" height="2.6" fill="#6b4a2f" />
        <rect x="17.6" y="22" width="4.8" height="4" rx="1" fill="#e9c46a" />
      </S>
    );
  if (model === "pointer")
    return (
      <S>
        <path d="M9 31L29 11" stroke="#e8e2d4" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="10" r="2.6" fill="#c75146" />
      </S>
    );
  return (
    <S>
      <path d="M13 8h14v6a7 7 0 0 1-14 0z" fill="#e9a84a" />
      <path d="M13 9.4H9.4c0 4 1.6 6.2 4.2 6.6zM27 9.4h3.6c0 4-1.6 6.2-4.2 6.6z" fill="none" stroke="#e9a84a" strokeWidth="1.8" />
      <rect x="18.4" y="21" width="3.2" height="5" fill="#d1912f" />
      <rect x="13.6" y="26" width="12.8" height="4.4" rx="1.2" fill="#5c4033" />
    </S>
  );
}

// ─── BENTUK WAJAH & TUBUH ───────────────────────────────────────────────────
export function FaceIcon({ model, skin = "#e3b084" }: { model: string } & P) {
  const r = model === "bulat" ? 9 : model === "kotak" ? 2.5 : 5;
  const w = model === "bulat" ? 18 : model === "tirus" ? 14 : 16;
  const h = model === "tirus" ? 19 : 17;
  return (
    <S>
      <rect x={20 - w / 2} y={20 - h / 2} width={w} height={h} rx={r} fill={skin} />
      <circle cx="17" cy="18" r="1.3" fill="#2b2119" />
      <circle cx="23" cy="18" r="1.3" fill="#2b2119" />
      <path d="M17.4 23h5" stroke="#9c4a3c" strokeWidth="1.3" strokeLinecap="round" />
      {model === "tirus" && <path d="M15 26l5 3 5-3" fill={skin} />}
    </S>
  );
}

export function BodyIcon({ model }: { model: string }) {
  const w = model === "langsing" ? 9 : model === "tegap" ? 15 : 12;
  return (
    <S>
      <circle cx="20" cy="10" r="4.4" fill="#e3b084" />
      <rect x={20 - w / 2} y="15" width={w} height="13" rx="3" fill="#81b29a" />
      <rect x={20 - w / 2 - 3} y="15.6" width="3" height="10" rx="1.4" fill="#81b29a" />
      <rect x={20 + w / 2} y="15.6" width="3" height="10" rx="1.4" fill="#81b29a" />
      <rect x={20 - w / 2 + 0.6} y="28" width={w / 2 - 1} height="8" rx="1.4" fill="#3d405b" />
      <rect x={20 + 0.4} y="28" width={w / 2 - 1} height="8" rx="1.4" fill="#3d405b" />
    </S>
  );
}

export function GlassesIcon({ on }: { on: boolean }) {
  return (
    <S>
      <Head />
      <path d="M12 17c0-5 3.6-7.5 8-7.5s8 2.5 8 7.5v1.5h-2.4V15H14.4v3.5H12z" fill="#3b2314" />
      {on ? (
        <>
          <circle cx="16.6" cy="19.4" r="3.4" fill="#9fd0e8" opacity="0.55" stroke="#26232e" strokeWidth="1.3" />
          <circle cx="23.4" cy="19.4" r="3.4" fill="#9fd0e8" opacity="0.55" stroke="#26232e" strokeWidth="1.3" />
          <path d="M20 19.4h-0.1M13.2 19h-2M26.8 19h2" stroke="#26232e" strokeWidth="1.3" />
          <path d="M19.9 19.4h0.3" stroke="#26232e" strokeWidth="1.3" />
        </>
      ) : (
        <path d="M12 30l16-16" stroke="#c75146" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      )}
    </S>
  );
}
