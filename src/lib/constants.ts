// ─── Shared constants & types for Jejak Langkah Guru Matematika ────────────

export type Peran = "mahasiswa" | "dosen" | "admin";
export type ModeAvatar = "biasa" | "tni";

export type AvatarConfig = {
  kulit: string;
  tubuh: "langsing" | "sedang" | "tegap";
  rambutModel: string;
  rambutWarna: string;
  wajah: "oval" | "bulat" | "tirus" | "kotak";
  atasan: string;
  atasanWarna: string;
  bawahan: string;
  bawahanWarna: string;
  sepatu: string;
  sepatuWarna: string;
  topi: string; // none | topi | baret-hijau | baret-ungu | baret-hitam | baret-coklat | bucket
  hijab: string; // none | segi-empat | pashmina | instan | bergo
  hijabWarna: string;
  kacamata: boolean;
  itemTangan: string; // none | buku | bunga | bendera | trofi | tas | pointer | tongkat
};

export const KULIT_OPTIONS = ["#f6d7b8", "#eec39a", "#dfa878", "#c98a5a", "#a96b3f", "#7d4b28"];
export const TUBUH_OPTIONS = ["langsing", "sedang", "tegap"] as const;
export const WAJAH_OPTIONS = ["oval", "bulat", "tirus", "kotak"] as const;

// Daftar opsi sengaja diringkas agar setiap pilihan benar-benar terlihat beda di 3D.
export const RAMBUT_P = ["ponytail", "panjang-lurus", "bob", "cepol", "keriting", "lob"];
export const RAMBUT_L = ["pendek", "undercut", "side-part", "curtain"];
export const RAMBUT_WARNA = ["#17130f", "#3b2314", "#6b3f1d", "#8a5a2c", "#4a4a52", "#b8422e"];

export const ATASAN_OPTIONS = ["kemeja", "kaos", "cardigan", "batik", "hoodie"];
export const BAWAHAN_OPTIONS = ["celana-panjang", "jeans", "kulot", "rok-panjang"];
export const SEPATU_OPTIONS = ["sneakers", "flat", "boots"];
export const TOPI_OPTIONS = ["none", "topi", "bucket"];
export const TOPI_TNI = ["baret-hijau", "baret-ungu", "baret-hitam", "baret-coklat"];
export const HIJAB_OPTIONS = ["none", "segi-empat", "pashmina", "instan"];
export const ITEM_TANGAN_OPTIONS = ["none", "buku", "bunga", "tas", "trofi"];
export const ITEM_TANGAN_TNI = ["none", "buku", "pointer"];

export const VIBE_COLORS = [
  "#e07a5f", "#f2cc8f", "#81b29a", "#3d405b", "#5f8ac7", "#9b6dd6",
  "#e5989b", "#6d6875", "#4f772d", "#b08968", "#c75146", "#457b9d",
  "#8ecae6", "#ffb703", "#606c38", "#bc4749", "#2a9d8f", "#6a994e",
];

export const MOODS = [
  { id: "haru", label: "Haru", emoji: "😢", warna: "#5f8ac7" },
  { id: "lucu", label: "Lucu", emoji: "😂", warna: "#f2a93b" },
  { id: "syukur", label: "Syukur", emoji: "🙏", warna: "#81b29a" },
  { id: "semangat", label: "Semangat", emoji: "💪", warna: "#e07a5f" },
  { id: "kasih", label: "Kasih", emoji: "🥰", warna: "#e5989b" },
  { id: "inspiratif", label: "Inspiratif", emoji: "🌟", warna: "#9b6dd6" },
] as const;
export type MoodId = (typeof MOODS)[number]["id"];

export const SEKOLAH_LIST = [
  { id: "SMPN 2 Salatiga", singkat: "SMPN 2", ciri: "Gedung 2 lantai, beringin tua, lapangan upacara", warna: "#3d6fb4", secondary: "#f2cc8f" },
  { id: "SMAN 1 Salatiga", singkat: "SMAN 1", ciri: "Gedung megah, taman bunga, gazebo kayu", warna: "#b23a48", secondary: "#f4f1de" },
  { id: "SMAN 2 Salatiga", singkat: "SMAN 2", ciri: "Asri, pohon rindang, musholla kecil", warna: "#4f772d", secondary: "#e9edc9" },
  { id: "SMAN 3 Salatiga", singkat: "SMAN 3", ciri: "Lapangan olahraga luas, kantin hangat", warna: "#e07a5f", secondary: "#fefae0" },
  { id: "SMKN 1 Salatiga", singkat: "SMKN 1", ciri: "Bengkel praktik, lab komputer, area vokasi", warna: "#8a6fb0", secondary: "#f0e6ff" },
] as const;

// UKSW sub-zones where dosen ucapan are placed
export const UKSW_ZONES = [
  { id: "parkir", label: "Parkir & Gerbang", poi: [16, 6, 10] as const },
  { id: "lapangan", label: "Lapangan Bola", poi: [-18, 8, 14] as const },
  { id: "e102", label: "Ruang E102", poi: [-18, 5, -16] as const },
  { id: "e105", label: "Ruang E105", poi: [-10, 5, -20] as const },
  { id: "e107", label: "Ruang E107", poi: [-2, 5, -22] as const },
  { id: "e108", label: "Ruang E108", poi: [6, 5, -24] as const },
  { id: "aula", label: "Aula Seminar Lt.2", poi: [18, 9, -14] as const },
  { id: "perpus", label: "Perpus Lt.7 · Kelas Biru", poi: [0, 14, -34] as const },
] as const;
export type UkswZoneId = (typeof UKSW_ZONES)[number]["id"];

export const NARASI: Record<string, string> = {
  parkir: "Setiap pagi kamu parkir di sini, buru-buru mengejar kelas jam tujuh. Motor yang sama, senyum yang sama, doa yang sama: semoga hari ini lancar.",
  lapangan: "Di lapangan ini kita pernah lelah bersama, tertawa bersama, dan sekali waktu hujan-hujanan sambil lari membawa tumpukan LKPD.",
  e102: "Ruang E102. Papan tulisnya masih menyimpan bekas rumus yang tak sempat terhapus — seperti kenangan kita yang tak sempat diucapkan.",
  e105: "Ruang E105. Meja melingkar tempat diskusi tak pernah benar-benar selesai, karena selalu ada cerita di sela-sela integral.",
  e107: "Ruang E107. Di sinilah kita pertama kali berdiri di depan kelas dengan kaki gemetar, dan pulang membawa keyakinan baru.",
  e108: "Ruang E108. Hari ini kosong. Hanya ada satu kursi, dan gema langkah kaki kita yang dulu ramai mengisi lorong ini.",
  aula: "Aula seminar. Tempat proposal kepemimpinan dipresentasikan dengan tangan dingin, lalu diakhiri tepuk tangan yang hangat.",
  perpus: "Lantai tujuh. Di balik kaca besar ini, Merapi dan Merbabu selalu menemani setiap malam deadline yang panjang.",
  yonif: "Tidak ada yang menyangka PPG membawa kita ke Yonif 411/Raider — ke tempat kita belajar bahwa kebersamaan adalah bentuk bela negara yang paling sederhana.",
  bukit: "Dari bukit ini, Salatiga terlihat kecil. Tapi dari sini pula kita sadar: seberapa besar pun kita melangkah, kota ini pernah jadi rumah.",
};

// Character count per ucapan page (auto-paging)
export const CHAR_PER_PAGE = 200;

export function paginateText(isi: string): string[] {
  const clean = isi.trim();
  if (clean.length <= CHAR_PER_PAGE) return [clean];
  const pages: string[] = [];
  let rest = clean;
  while (rest.length > CHAR_PER_PAGE) {
    let cut = rest.lastIndexOf(" ", CHAR_PER_PAGE);
    if (cut < CHAR_PER_PAGE * 0.5) cut = CHAR_PER_PAGE;
    pages.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest.length) pages.push(rest);
  return pages;
}

export function randomAvatar(gender: "L" | "P", mode: ModeAvatar = "biasa"): AvatarConfig {
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)] as T;
  const rambut = gender === "P" ? pick(RAMBUT_P) : pick(RAMBUT_L);
  const bawahan = gender === "P" ? pick(["kulot", "rok-panjang", "celana-panjang", "jeans"] as const) : pick(["celana-panjang", "jeans"] as const);
  if (mode === "tni") {
    return {
      kulit: pick(KULIT_OPTIONS), tubuh: pick(TUBUH_OPTIONS), rambutModel: gender === "P" ? pick(["bob", "cepol", "lob"] as const) : pick(RAMBUT_L),
      rambutWarna: pick(RAMBUT_WARNA.slice(0, 5)), wajah: pick(WAJAH_OPTIONS),
      atasan: "seragam-tni", atasanWarna: "#4a5d3a", bawahan: "celana-loreng", bawahanWarna: "#3d4f31",
      sepatu: "boots", sepatuWarna: "#17130f", topi: pick(TOPI_TNI), hijab: gender === "P" && Math.random() < 0.4 ? "instan" : "none",
      hijabWarna: "#4a5d3a", kacamata: Math.random() < 0.15, itemTangan: pick(ITEM_TANGAN_TNI),
    };
  }
  return {
    kulit: pick(KULIT_OPTIONS), tubuh: pick(TUBUH_OPTIONS), rambutModel: rambut,
    rambutWarna: pick(RAMBUT_WARNA), wajah: pick(WAJAH_OPTIONS),
    atasan: pick(ATASAN_OPTIONS), atasanWarna: pick(VIBE_COLORS),
    bawahan: bawahan as string, bawahanWarna: pick(VIBE_COLORS),
    sepatu: pick(SEPATU_OPTIONS), sepatuWarna: pick(["#17130f", "#f4f1de", "#8a5a2c", "#3d405b"]),
    topi: "none", hijab: gender === "P" && Math.random() < 0.35 ? pick(["segi-empat", "pashmina", "instan"] as const) : "none",
    hijabWarna: pick(VIBE_COLORS), kacamata: Math.random() < 0.3, itemTangan: pick(ITEM_TANGAN_OPTIONS),
  };
}

// Fixed avatar for the admin male student (kemeja mustard, celana cream, sepatu hijau, rambut pendek)
export const ADMIN_AVATAR: AvatarConfig = {
  kulit: "#dfa878", tubuh: "sedang", rambutModel: "pendek", rambutWarna: "#17130f",
  wajah: "oval", atasan: "kemeja", atasanWarna: "#d9a036", bawahan: "celana-panjang",
  bawahanWarna: "#efe3c8", sepatu: "sneakers", sepatuWarna: "#2e5d34", topi: "none",
  hijab: "none", hijabWarna: "#efe3c8", kacamata: true, itemTangan: "buku",
};

export function dosenAvatar(gender: "L" | "P"): AvatarConfig {
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)] as T;
  const formal = ["#2f2a3c", "#3d405b", "#5c4033", "#274156", "#6d3b3b"];
  return {
    kulit: pick(KULIT_OPTIONS), tubuh: "sedang", rambutModel: gender === "P" ? pick(["bob", "cepol", "lob"] as const) : pick(["pendek", "side-part"] as const),
    rambutWarna: pick(RAMBUT_WARNA.slice(0, 5)), wajah: "oval",
    atasan: gender === "P" ? "blouse" : "kemeja", atasanWarna: pick(formal),
    bawahan: "celana-panjang", bawahanWarna: "#26232e", sepatu: "loafers", sepatuWarna: "#17130f",
    topi: "none", hijab: gender === "P" && Math.random() < 0.5 ? "pashmina" : "none",
    hijabWarna: pick(formal), kacamata: gender === "L", itemTangan: "buku",
  };
}

export type Hubs = "hub" | "uksw" | "ppl" | "yonif" | "bukit";
export const HUB_META: Record<Hubs, { label: string; subtitle: string; warna: string }> = {
  hub: { label: "Hub Utama", subtitle: "Pilih portal untuk menjelajah", warna: "#f2cc8f" },
  uksw: { label: "Kampus UKSW", subtitle: "Rumah kedua kita", warna: "#5f8ac7" },
  ppl: { label: "Area PPL", subtitle: "Panggilan nyata", warna: "#81b29a" },
  yonif: { label: "Yonif 411/Raider", subtitle: "Bela negara bersama", warna: "#c75146" },
  bukit: { label: "Bukit Salatiga", subtitle: "Ujung perjalanan", warna: "#f2a93b" },
};

export type SessionInfo = {
  id: string;
  namaLengkap: string;
  namaPanggilan: string | null;
  peran: Peran;
  jenisKelamin: "L" | "P";
  sekolahPpl: string | null;
  modeAvatar: ModeAvatar;
  sudahIsiData: boolean;
  isAdminAvatar?: boolean;
  token: string;
};
