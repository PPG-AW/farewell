import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  serial,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ─── 1. USERS ───────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    namaLengkap: varchar("nama_lengkap", { length: 120 }).notNull(),
    namaPanggilan: varchar("nama_panggilan", { length: 50 }),
    peran: varchar("peran", { length: 15 }).notNull().default("mahasiswa"), // mahasiswa | dosen | admin
    jenisKelamin: varchar("jenis_kelamin", { length: 1 }).notNull().default("P"), // L | P
    sekolahPpl: varchar("sekolah_ppl", { length: 30 }),
    modeAvatar: varchar("mode_avatar", { length: 10 }).notNull().default("biasa"), // biasa | tni
    isAdminAvatar: boolean("is_admin_avatar").notNull().default(false),
    sudahIsiData: boolean("sudah_isi_data").notNull().default(false),
    sessionToken: varchar("session_token", { length: 80 }),
    sessionExpires: timestamp("session_expires", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_nama_idx").on(t.namaLengkap)]
);

// ─── 2. AVATARS ─────────────────────────────────────────────────────────────
export const avatars = pgTable(
  "avatars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    config: jsonb("config").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("avatars_user_unique").on(t.userId)]
);

// ─── 3. UCAPAN ──────────────────────────────────────────────────────────────
export const ucapan = pgTable(
  "ucapan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    judul: varchar("judul", { length: 100 }).notNull().default("Untuk Kalian"),
    isi: text("isi").notNull(),
    mood: varchar("mood", { length: 15 }).notNull().default("syukur"),
    zona: varchar("zona", { length: 20 }).notNull().default("ppl"),
    halamanCount: integer("halaman_count").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("ucapan_user_unique").on(t.userId), index("ucapan_zona_idx").on(t.zona)]
);

// ─── 4. BALASAN ─────────────────────────────────────────────────────────────
export const balasan = pgTable(
  "balasan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ucapanId: uuid("ucapan_id")
      .notNull()
      .references(() => ucapan.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isi: varchar("isi", { length: 150 }).notNull(),
    sudahDibaca: boolean("sudah_dibaca").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("balasan_unique_pair").on(t.ucapanId, t.userId), index("balasan_ucapan_idx").on(t.ucapanId)]
);

// ─── 5. PROGRESS ────────────────────────────────────────────────────────────
export const progress = pgTable(
  "progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ucapanId: uuid("ucapan_id")
      .notNull()
      .references(() => ucapan.id, { onDelete: "cascade" }),
    sudahDibaca: boolean("sudah_dibaca").notNull().default(true),
    waktuBaca: timestamp("waktu_baca", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("progress_unique_pair").on(t.playerId, t.ucapanId), index("progress_player_idx").on(t.playerId)]
);

// ─── 6. SEKOLAH ─────────────────────────────────────────────────────────────
export const sekolah = pgTable("sekolah", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 30 }).notNull().unique(),
  ciri: varchar("ciri", { length: 120 }).notNull().default(""),
});

// ─── 7. ADMIN LOG ───────────────────────────────────────────────────────────
export const adminLog = pgTable("admin_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  aksi: varchar("aksi", { length: 50 }).notNull(),
  target: varchar("target", { length: 150 }).notNull().default(""),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

// ─── 8. WORLD SETTINGS ──────────────────────────────────────────────────────
export const worldSettings = pgTable("world_settings", {
  id: varchar("id", { length: 20 }).primaryKey().default("global"),
  lockMode: varchar("lock_mode", { length: 10 }).notNull().default("auto"), // auto | open | locked
  adminMessage: text("admin_message")
    .notNull()
    .default(
      "Terima kasih sudah menjadi keluarga. Bawa cahaya ini ke setiap kelas yang kalian masuki. — Admin PPG"
    ),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Ucapan = typeof ucapan.$inferSelect;
export type Balasan = typeof balasan.$inferSelect;
