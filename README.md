# 🎓 Jejak Langkah Guru Matematika

**Dunia 3D Interaktif Perpisahan & Kenangan**
PPG Prajabatan 2026 · Prodi Matematika · Universitas Kristen Satya Wacana, Salatiga

> *"Dari angka dan rumus, kita menjadi guru yang mengubah dunia."*

Web 3D single-player untuk merayakan perjalanan Februari–Oktober 2026: setiap mahasiswa mengisi profil, merancang avatar 3D, dan menitipkan surat perpisahan di dunianya masing-masing — kampus UKSW, 5 sekolah PPL, Yonif 411/Raider, dan Bukit Salatiga. Saat semua ucapan terbaca, Grand Finale sinematik menunggu, dilanjutkan momen spesial *"Surat dari Kita untuk Kita"*.

---

## 🗄️ Struktur Database (Neon PostgreSQL)

Semua file SQL ada di folder **`database/`**:

| File | Isi |
|---|---|
| `database/schema.sql` | 8 tabel lengkap (`users`, `avatars`, `ucapan`, `balasan`, `progress`, `sekolah`, `admin_log`, `world_settings`) + index + foreign key. Aman dijalankan ulang. |
| `database/seed.sql` | Data awal: **39 akun, 35 ucapan siap baca, avatar, 12 balasan** — dunia langsung terbuka (29/29). Dapat dijalankan ulang. |

**Cara termudah di Neon:**
1. Login [neon.tech](https://neon.tech) → buat project baru (gratis) → copy **connection string**-nya.
2. Buka **SQL Editor** di dashboard Neon → paste & jalankan `database/schema.sql`.
3. Lalu paste & jalankan `database/seed.sql`.
4. Selesai — database langsung siap dipakai aplikasi.

Alternatif via terminal:
```bash
psql "postgresql://USER:PASSWORD@HOST/neondb?sslmode=require" -f database/schema.sql
psql "postgresql://USER:PASSWORD@HOST/neondb?sslmode=require" -f database/seed.sql
```

---

## 🔑 Akun Master — Masuk ke Semua Fitur (untuk Cek Dulu)

Tidak ada kata sandi — **ketik nama lengkap** di halaman login, lalu klik **MASUK**.

### ⭐ AKUN UTAMA (akses penuh ke mana-mana)

```
Nama login : Admin PPG
(atau ketik: Ahmad Fauzi)
```

| Halaman | URL | Yang bisa dicek |
|---|---|---|
| 📊 Dashboard Admin | `/dashboard` | Statistik, kunci/buka dunia paksa, daftar user, tambah/hapus user, **reset form siapa pun**, moderasi balasan, log admin, export JSON/CSV |
| 🌍 Dunia 3D penuh | `/world` | **Bebas masuk walau dunia terkunci** — jelajah semua zona, baca semua ucapan, balas, trigger finale |
| 🕵️ Mode Jelajah | `/world?admin=1` | Teleport semua zona lewat panel, **simulasi Grand Finale** tanpa syarat 100%, foto, sembunyikan UI, progres tidak tercatat |
| ✍️ Formulir | `/form` | Form 5 langkah (avatar admin ikonik: kemeja mustard, celana cream, sepatu hijau — terkunci sesuai desain) |

Dari dashboard, klik tombol **Mode Jelajah** untuk teleport & simulasi cepat.

### 🧪 Akun contoh untuk tiap skenario

| Nama login | Peran | Untuk menguji |
|---|---|---|
| `Nadia Putri Anjani` | Mahasiswa (Biasa) | Alur normal: dunia terbuka, suratnya ada di SMPN 2 Salatiga |
| `Aulia Rahma Safitri` | Mahasiswa (Mode TNI) | Avatar seragam loreng di **api unggun Yonif 411**; suratnya tetap di sekolah PPL |
| `Fitria Nur Hidayah` | Mahasiswa (Biasa) | Sekolah SMAN 1 Salatiga — cek avatar & surat di zona lain |
| `Ahmad Fauzi` | Admin / 1-satunya cowok | Sama seperti “Admin PPG” |
| `Dr. Budi Santoso, M.Pd.` | Dosen (sudah isi) | Surat dosen di kampus UKSW ruang E107, aksen emas |
| `Drs. Joko Pramono, M.Si.` | Dosen (belum isi) | **Uji form dosen** satu halaman → langsung masuk dunia |

### 🔒 Menguji alur “Dunia Terkunci”
1. Login `Admin PPG` → Dashboard → cari mahasiswa mana pun → klik ikon **⟲ Reset** → status jadi 28/29.
2. Login sebagai mahasiswa lain → `/world` menampilkan **ruang tunggu terkunci** (progress bar 28/29). Admin tetap bisa masuk.
3. Di dashboard pilih kunci **"Buka Paksa"** (atau klik Reset-kembali lalu isi form lagi lewat akun yang di-reset) → dunia terbuka lagi.

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Install dependensi
npm install

# 2. Isi environment — tulis connection string Neon kamu ke file .env
echo 'DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"' > .env

# 3. Buat tabel & isi data (pilih salah satu):
#    a. Pakai file SQL di Neon SQL Editor (lihat bagian Database), atau
#    b. Otomatis dari repo:
npx drizzle-kit push          # membuat tabel-migrasi dari src/db/schema.ts
npx tsx src/db/seed.ts        # mengisi 39 akun + 35 ucapan

# 4. Jalankan
npm run dev                   # http://localhost:3000
```

> Kalau `DATABASE_URL` belum diisi, API akan menolak jalan — app memang dirancang fail-fast.

---

## ☁️ Deploy ke Vercel (Rp 0)

1. Push repo ke GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. Di **Environment Variables** tambahkan:
   `DATABASE_URL = postgresql://USER:PASSWORD@HOST/neondb?sslmode=require`
4. Deploy. Neon free tier auto-sleep tidak masalah — request pertama mungkin lambat ±1 detik (cold start), selebihnya normal.

---

## 🧭 Peta Halaman & Fitur

| Route | Isi |
|---|---|
| `/` | Landing: langit fajar Merapi–Merbabu, status dunia live (polling 10 dtk), login nama |
| `/form` | Mahasiswa: 5 langkah (identitas → mode Biasa/TNI → **kustomisasi avatar 3D 360°** → pilih sekolah PPL → surat + mood, draft otosimpan tiap 10 dtk). Dosen: form satu halaman, avatar formal otomatis |
| `/world` | Dunia 3D room-based: **Hub Utama** (4 portal + papan progres), **Kampus UKSW** (gerbang, lapangan, lorong E102–E108, tangga spiral, aula seminar, perpus Lt.7), **Area PPL** (persimpangan → 5 sekolah bernuansa beda), **Yonif 411** (kabut pagi, api unggun, pasukan TNI), **Bukit Salatiga** (senja, lentera kenangan) |
| `/dashboard` | Semua kontrol admin (lihat tabel Akun Master) |

**Interaksi dunia:** seret = memutar kamera · scroll = zoom · klik amplop/avatar/pintu = membaca surat atau narasi · panel bawah (di UKSW) = teleport antar ruang.

**Alur pengalaman:** Login → Form → Ruang tunggu (menunggu 29/29) → Dunia terbuka → Baca 35 ucapan (HUD progres kiri atas) → 100% → **Grand Finale** sinematik 12 adegan → **Surat dari Kita untuk Kita** (amplop, polaroid, konstelasi 2026, kutipan teman, dedikasi personal, sunrise 29 siluet) → **Ending** (jelajah lagi / balas / screenshot / keluar).

**Balasan:** buka surat siapa pun → halaman terakhir → tulis ≤150 karakter (1 orang = 1 balasan). Suratmu sendiri bisa diklik (ikon ✉ di kanan atas) untuk melihat balasan masuk; badge merah menandai balasan baru.

---

## 🛠️ Teknologi

Next.js 16 (App Router, Turbopack) · React 19 · React Three Fiber + drei (Three.js) · Drizzle ORM · Neon PostgreSQL · Zustand · Framer Motion · Tailwind CSS 4 · Lucide · Web Audio API (ambience prosedural per zona).

Semua model 3D **prosedural** (tanpa file aset berat) — ringan dijalankan di HP.

---

## 📁 Struktur Penting

```
database/schema.sql       Skema Neon (jalankan pertama)
database/seed.sql         Data awal 39 akun (jalankan kedua)
src/db/schema.ts          Skema Drizzle (sumber kebenaran untuk push)
src/db/seed.ts            Seeder TypeScript (alternatif seed.sql)
src/app/                  Halaman: /, /form, /world, /dashboard + api/*
src/components/avatar/    Avatar 3D modular (8 lapisan kustomisasi)
src/components/world/     Scene 5 zona, kartu ucapan, finale, momen spesial, HUD
```

---

## 🔧 Troubleshooting

| Masalah | Solusi |
|---|---|
| `DATABASE_URL is required` | Isi `.env` lalu restart `npm run dev` |
| Dunia terkunci | Dashboard → kunci "Buka Paksa". Atau reset mahasiswa apa pun untuk menguji ruang tunggu |
| 3D lambat di HP | Normal pada device tua; app sudah low-poly + `dpr` dibatasi. Tutup tab lain, pakai Chrome/Safari terbaru |
| Sesi kedaluarsa | Login ulang (sesi 24 jam) |
| Lupa nama? | Daftar lengkap: Dashboard → Daftar Penjelajah, atau `SELECT nama_lengkap FROM users;` di Neon |

---

*Dibuat dengan hangat di Salatiga — untuk 29 calon guru matematika yang akan mengubah hidup ratusan siswa.* 🇮🇩
