-- ═══════════════════════════════════════════════════════════════════
--  JEJAK LANGKAH GURU MATEMATIKA — PPG Prajabatan 2026 · UKSW
--  Skema Database — Neon PostgreSQL (kompatibel PostgreSQL 13+)
-- -------------------------------------------------------------------
--  Cara pakai (pilih salah satu):
--    A) Neon Console → SQL Editor → paste seluruh file ini → Run
--    B) psql "postgresql://USER:PASS@HOST/neondb" -f database/schema.sql
--  Aman dijalankan ulang (IF NOT EXISTS). Setelah ini, jalankan
--  database/seed.sql untuk mengisi 39 akun + 35 ucapan siap jelajah.
-- ═══════════════════════════════════════════════════════════════════

-- gen_random_uuid() sudah built-in di PostgreSQL 13+;
-- baris ini hanya pengaman untuk versi lama.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 1. USERS ─────────────────────────────────────────────────────────
-- Semua pengguna: 29 mahasiswa (termasuk 1 admin) + 10 dosen.
-- Login dilakukan berdasarkan nama_lengkap (case-insensitive) yang
-- diinput admin, tanpa kata sandi. Sesi disimpan di session_token.
CREATE TABLE IF NOT EXISTS users (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap    varchar(120) NOT NULL,
    nama_panggilan  varchar(50),
    peran           varchar(15)  NOT NULL DEFAULT 'mahasiswa', -- mahasiswa | dosen | admin
    jenis_kelamin   varchar(1)   NOT NULL DEFAULT 'P',         -- L | P
    sekolah_ppl     varchar(30),                               -- nama sekolah PPL (mahasiswa)
    mode_avatar     varchar(10)  NOT NULL DEFAULT 'biasa',     -- biasa | tni
    is_admin_avatar boolean      NOT NULL DEFAULT false,       -- avatar terkunci (kemeja mustard)
    sudah_isi_data  boolean      NOT NULL DEFAULT false,
    session_token   varchar(80),
    session_expires timestamptz,
    created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_nama_idx ON users (nama_lengkap);

-- ─── 2. AVATARS ───────────────────────────────────────────────────────
-- Konfigurasi kustomisasi avatar 3D per user (1:1), disimpan sebagai
-- JSONB: kulit, tubuh, rambut, wajah, atasan, bawahan, sepatu,
-- topi/baret, hijab, kacamata, item_tangan.
CREATE TABLE IF NOT EXISTS avatars (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    config     jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT avatars_user_unique UNIQUE (user_id)
);

-- ─── 3. UCAPAN ────────────────────────────────────────────────────────
-- Surat perpisahan (1 per user). zona menentukan lokasi di dunia 3D:
-- nama sekolah PPL untuk mahasiswa, atau sub-zona UKSW untuk dosen
-- (parkir, lapangan, e102, e105, e107, e108, aula, perpus).
CREATE TABLE IF NOT EXISTS ucapan (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    judul         varchar(100) NOT NULL DEFAULT 'Untuk Kalian',
    isi           text NOT NULL,
    mood          varchar(15) NOT NULL DEFAULT 'syukur', -- haru|lucu|syukur|semangat|kasih|inspiratif
    zona          varchar(20) NOT NULL DEFAULT 'ppl',
    halaman_count integer NOT NULL DEFAULT 1,
    created_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ucapan_user_unique UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS ucapan_zona_idx ON ucapan (zona);

-- ─── 4. BALASAN ───────────────────────────────────────────────────────
-- Komentar balasan pada ucapan teman (maks 150 karakter).
-- Aturan: 1 user = 1 balasan per ucapan (unik ucapan_id + user_id).
CREATE TABLE IF NOT EXISTS balasan (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ucapan_id    uuid NOT NULL REFERENCES ucapan(id) ON DELETE CASCADE,
    user_id      uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    isi          varchar(150) NOT NULL,
    sudah_dibaca boolean NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT balasan_unique_pair UNIQUE (ucapan_id, user_id)
);
CREATE INDEX IF NOT EXISTS balasan_ucapan_idx ON balasan (ucapan_id);

-- ─── 5. PROGRESS ──────────────────────────────────────────────────────
-- Melacak ucapan mana yang sudah dibaca tiap pemain.
-- Terpenuhi 100% → tombol Grand Finale terbuka.
CREATE TABLE IF NOT EXISTS progress (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id    uuid NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    ucapan_id    uuid NOT NULL REFERENCES ucapan(id) ON DELETE CASCADE,
    sudah_dibaca boolean NOT NULL DEFAULT true,
    waktu_baca   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT progress_unique_pair UNIQUE (player_id, ucapan_id)
);
CREATE INDEX IF NOT EXISTS progress_player_idx ON progress (player_id);

-- ─── 6. SEKOLAH ───────────────────────────────────────────────────────
-- 5 sekolah PPL di Salatiga.
CREATE TABLE IF NOT EXISTS sekolah (
    id   serial PRIMARY KEY,
    nama varchar(30) NOT NULL UNIQUE,
    ciri varchar(120) NOT NULL DEFAULT ''
);

-- ─── 7. ADMIN LOG ─────────────────────────────────────────────────────
-- Jejak aktivitas admin (tambah/hapus user, ubah kunci, moderasi).
CREATE TABLE IF NOT EXISTS admin_log (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aksi      varchar(50)  NOT NULL,
    target    varchar(150) NOT NULL DEFAULT '',
    "timestamp" timestamptz NOT NULL DEFAULT now()
);

-- ─── 8. WORLD SETTINGS ────────────────────────────────────────────────
-- Pengaturan global dunia: lock_mode
--   'auto'   → terbuka otomatis saat semua mahasiswa sudah mengisi
--   'open'   → dibuka paksa oleh admin
--   'locked' → dikunci paksa oleh admin
CREATE TABLE IF NOT EXISTS world_settings (
    id            varchar(20) PRIMARY KEY DEFAULT 'global',
    lock_mode     varchar(10) NOT NULL DEFAULT 'auto',
    admin_message text NOT NULL DEFAULT 'Terima kasih sudah menjadi keluarga. Bawa cahaya ini ke setiap kelas yang kalian masuki. — Admin PPG',
    updated_at    timestamptz NOT NULL DEFAULT now()
);
