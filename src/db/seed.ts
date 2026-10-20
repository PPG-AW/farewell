import "dotenv/config";
import { db } from "@/db";
import { users, avatars, ucapan, balasan, progress, sekolah, adminLog, worldSettings } from "@/db/schema";
import { randomAvatar, dosenAvatar, ADMIN_AVATAR, paginateText, SEKOLAH_LIST } from "@/lib/constants";

type MhsDef = { nama: string; panggilan: string; gender: "L" | "P"; mode?: "tni"; sekolah: string; mood: string; judul: string; isi: string };

const S2 = "SMPN 2 Salatiga";
const SA1 = "SMAN 1 Salatiga";
const SA2 = "SMAN 2 Salatiga";
const SA3 = "SMAN 3 Salatiga";
const SK1 = "SMKN 1 Salatiga";

const MAHASISWA: MhsDef[] = [
  { nama: "Aulia Rahma Safitri", panggilan: "Aulia", gender: "P", mode: "tni", sekolah: S2, mood: "semangat", judul: "Dari Nol Jadi Berani", isi: "Kita masuk PPG cuma modal nekat dan doa. Sekarang lihat: kita bisa berdiri di depan kelas, menjelaskan fungsi kuadrat tanpa gemetar. Terima kasih sudah saling menguatkan saat tugas menumpuk dan air mata hampir jatuh. Kita berhasil, dan ini baru awal." },
  { nama: "Nadia Putri Anjani", panggilan: "Nadia", gender: "P", sekolah: S2, mood: "haru", judul: "Untuk Keluarga Matematikaku", isi: "Dulu aku pikir matematika itu cuma angka. Ternyata di PPG aku belajar yang paling sulit dihitung: kadar sayang pada orang-orang yang baru sembilan bulan dikenal. Terima kasih sudah jadi keluarga. Sampai jumpa di ruang guru masing-masing, ya." },
  { nama: "Salsabila Zahra Rahmadani", panggilan: "Salsa", gender: "P", sekolah: S2, mood: "lucu", judul: "Memoar Anak Kost Dekat Kampus", isi: "Terima kasih untuk yang selalu bangunin aku pas hampir telat microteaching, yang rela berbagi indomie jam 11 malam, dan yang pura-pura paham pas aku presentasi. Semoga rezeki kalian lancar seperti integral parsial yang ketemu polinom." },
  { nama: "Dewi Anggraini Puspita", panggilan: "Dewi", gender: "P", sekolah: S2, mood: "syukur", judul: "Sempurna pada Waktunya", isi: "Setiap kali merasa gagal saat PPL, ada saja yang bilang: gapapa, coba lagi besok. Kalimat sederhana itu yang bikin aku bertahan sampai hari ini. Semoga Tuhan membalas kebaikan kalian berlipat-lipat. Kita berpisah bukan untuk melupakan, tapi untuk membuktikan." },
  { nama: "Intan Permata Sari", panggilan: "Intan", gender: "P", mode: "tni", sekolah: S2, mood: "haru", judul: "Titik Temu Kita", isi: "Dari 29 latar belakang yang berbeda, kita menemukan titik temu yang sama: ingin jadi guru yang baik. Perjalanan dari Februari sampai Oktober ini melelahkan, tapi kalau diulang dari awal, aku tetap mau. Asalkan bareng kalian lagi." },
  { nama: "Khairun Nisa Maulida", panggilan: "Nisa", gender: "P", sekolah: S2, mood: "inspiratif", judul: "Rumus Bahagia", isi: "Kalau bahagia itu fungsi, maka variabelnya adalah waktu bersama kalian. Terima kasih untuk setiap diskusi yang berakhir tertawa, setiap remedial kehidupan yang kita jalani bareng. Jangan lupa: guru hebat lahir dari hati yang mau belajar terus." },
  { nama: "Fitria Nur Hidayah", panggilan: "Fitri", gender: "P", sekolah: SA1, mood: "semangat", judul: "Sampai Ketemu di Puncak", isi: "Kita pernah sama-sama nggak tidur karena revisi RPP. Sekarang saatnya kita sama-sama tidak tidur karena menyiapkan masa depan anak-anak Indonesia. Semangat terus, guruku. Kalau lelah, ingat Salatiga, ingat kita, ingat bahwa kamu tidak pernah sendirian." },
  { nama: "Annisa Fadhila Ramadhani", panggilan: "Icha", gender: "P", sekolah: SA1, mood: "kasih", judul: "Peluk Jarak Jauh", isi: "Buat kalian yang baca ini sambil senyum: iya, aku kangen duluan. Kangen ributnya grup chat, kangen piket bareng, kangen semua. Semoga kelak anak murid kalian tahu, gurunya pernah jadi orang paling hangat di Salatiga." },
  { nama: "Ratna Juwita Sari", panggilan: "Ratna", gender: "P", mode: "tni", sekolah: SA1, mood: "lucu", judul: "Bukti Otentik", isi: "Pernyataan: 29 orang asing bisa jadi keluarga dalam 9 bulan. Bukti: kita. Kesimpulan: matematika tidak pernah salah, perasaan juga tidak. Terima kasih sudah jadi jawaban dari soal yang tidak pernah selesai: 'nanti kangen siapa ya pas lulus?'" },
  { nama: "Tiara Maharani Putri", panggilan: "Tiara", gender: "P", sekolah: SA1, mood: "haru", judul: "Selasar E yang Kita Lewati", isi: "Masih ingat lorong waktu kita nunggu giliran microteaching? Deg-degannya, doanya, saling lempar semangatnya. Sekarang lorong itu cuma kenangan, tapi aku bawa semua suaranya dalam hati. Terima kasih, teman seperjalanan. Kalian luar biasa." },
  { nama: "Widya Astuti Lestari", panggilan: "Widya", gender: "P", sekolah: SA1, mood: "syukur", judul: "Hutang Budi pada Kalian", isi: "Aku pernah hampir menyerah di tengah jalan. Kalian yang menarikku kembali dengan cara yang sederhana: mengajak makan, mendengarkan, mengingatkan mimpi awal. Hutang budiku pada kalian tidak bisa dihitung dengan notasi sigma. Terima kasih banyak." },
  { nama: "Novi Indah Prasetyo", panggilan: "Novi", gender: "P", mode: "tni", sekolah: SA1, mood: "semangat", judul: "Garis Singgung", isi: "Hidup kita seperti garis singgung lingkaran: bertemu di satu titik bernama Salatiga, lalu melaju ke arah masing-masing. Tapi titik itu mengubah lintasan kita selamanya. Teruslah melaju, temanku. Sampai jumpa di titik-titik berikutnya." },
  { nama: "Eka Yuliana Sari", panggilan: "Eka", gender: "P", sekolah: SA2, mood: "inspiratif", judul: "Kita Adalah Bukti", isi: "Kata orang, jadi guru itu pengabdian tanpa ujung. Setelah PPG, aku percaya itu bukan beban, melainkan kehormatan. Kita sudah membuktikan bahwa kita mampu. Sekarang tinggal membuktikan bahwa kita konsisten. Ayo tunjukkan pada dunia." },
  { nama: "Maya Kusuma Wardani", panggilan: "Maya", gender: "P", sekolah: SA2, mood: "haru", judul: "Surat Kecil dari Maya", isi: "Aku tidak pandai berkata-kata saat pamit langsung, jadi kutulis di sini. Kalian adalah alasan Salatiga terasa seperti rumah. Setiap sudut kampus punya cerita tentang kita. Jaga kesehatan, jaga mimpi, jaga persahabatan ini. Aku sayang kalian semua." },
  { nama: "Dinda Ayu Lestari", panggilan: "Dinda", gender: "P", sekolah: SA2, mood: "lucu", judul: "Daftar Hadir Kebaikan", isi: "Hadir: yang minjemin catatan. Hadir: yang beliin kopi pas begadang. Hadir: yang bohong bilang 'nggak gendut kok'. Hadir: semua orang baik di PPG Matematika ini. Tidak ada yang alpha. Kalian semua lulus jadi manusia baik." },
  { nama: "Putri Ayu Ramadhani", panggilan: "Putri", gender: "P", mode: "tni", sekolah: SA2, mood: "kasih", judul: "Akar dan Sayap", isi: "Ada yang bilang, beri orang yang kamu sayangi dua hal: akar dan sayap. Kalian memberiku keduanya. Akar berupa persahabatan yang menenangkan, sayap berupa keberanian untuk terbang jadi guru. Terima kasih banyak-banyak. Sampai jumpa lagi." },
  { nama: "Silvi Angraini", panggilan: "Silvi", gender: "P", sekolah: SA2, mood: "syukur", judul: "Syiukur yang Tak Habis", isi: "Ya, aku sengaja salah tulis, biar kalian ketawa. Itulah kita: selalu menemukan alasan untuk tertawa bahkan di minggu paling berat. Terima kasih sudah mengajariku bahwa jadi guru tidak harus selalu serius. Kadang jadi manusia yang hadir saja sudah cukup." },
  { nama: "Laras Wulan Pertiwi", panggilan: "Laras", gender: "P", sekolah: SA2, mood: "inspiratif", judul: "Deret Tak Hingga", isi: "Kebaikan kalian padaku seperti deret geometri dengan rasio lebih dari satu: membesar tanpa henti, tanpa kesudahan. Semoga hidup kalian konvergen menuju bahagia. Dan semoga kelak, kita berkumpul lagi menceritakan murid-murid hebat kita." },
  { nama: "Hesti Wulandari", panggilan: "Hesti", gender: "P", sekolah: SA3, mood: "haru", judul: "Hal Terakhir yang Kukatakan", isi: "Kalau ditanya apa yang paling berat dari lulus, jawabannya bukan skripsi, bukan ujian — tapi berpisah dengan kalian. Terima kasih sudah jadi tempat pulang selama sembilan bulan ini. Semoga setiap langkah kita diberkahi." },
  { nama: "Riska Amelia Putri", panggilan: "Riska", gender: "P", sekolah: SA3, mood: "semangat", judul: "Jangan Padam", isi: "Kita sudah melewati Februari yang canggung, Maret yang melelahkan, Juli yang menegangkan, dan Oktober yang mengharukan. Api semangat kita sudah teruji. Jadi tolong, di manapun kalian bertugas nanti: jangan biarkan api itu padam." },
  { nama: "Yuni Hartati", panggilan: "Yuni", gender: "P", sekolah: SA3, mood: "kasih", judul: "Kotak Kenangan", isi: "Kalau kenangan bisa dikotakkan, kotakku penuh: tawa di kantin, panik bareng sebelum microteaching, terharu pas PPL perpisahan sama murid-murid. Isinya semua tentang kalian. Kusimpan rapat, kubawa jauh. Terima kasih sudah mengisinya." },
  { nama: "Citra Dewi Anggraini", panggilan: "Citra", gender: "P", sekolah: SA3, mood: "lucu", judul: "Logika Matematika Cinta", isi: "Jika A sayang B, dan B sayang C, belum tentu A sayang C. Tapi di PPG ini terbukti salah: kita semua saling sayang tanpa perlu pembuktian induksi. Terima kasih untuk 270 harinya. Jangan lupa balik modal ya, eh, balik kangen maksudnya." },
  { nama: "Bella Septiana Ningsih", panggilan: "Bella", gender: "P", sekolah: SA3, mood: "syukur", judul: "Rencana yang Indah", isi: "Dulu aku mendaftar PPG karena coba-coba. Sekarang aku pulang membawa mimpi besar dan 28 saudara baru. Rencana Tuhan memang selalu lebih indah dari rencana kita. Terima kasih untuk setiap doa yang diam-diam kalian kirimkan untukku." },
  { nama: "Oktavia Rahayu Ningrum", panggilan: "Via", gender: "P", sekolah: SA3, mood: "inspiratif", judul: "Transformasi", isi: "Dalam geometri, transformasi mengubah posisi tanpa menghilangkan identitas. Begitu pula kita: berpindah ke kota-kota baru, tapi tidak akan pernah kehilangan jati diri sebagai keluarga PPG Matematika 2026. Sampai jumpa di koordinat kebahagiaan masing-masing." },
  { nama: "Farah Dhiba Kirana", panggilan: "Farah", gender: "P", sekolah: SK1, mood: "haru", judul: "Terima Kasih, Guru-Guruku", isi: "Sebelum jadi guru sungguhan, izinkan aku memanggil kalian semua guruku. Guru tentang kesabaran, tentang kekuatan, tentang terus berusaha walau hasil belum terlihat. Semoga kelak kita bertemu dalam keadaan sudah mengubah banyak hidup." },
  { nama: "Gina Melati Sari", panggilan: "Gina", gender: "P", sekolah: SK1, mood: "semangat", judul: "Satu Frekuensi", isi: "Sembilan bulan cukup untuk memahami bahwa kita ini satu frekuensi: sama-sama pusing dengan asesmen, sama-sama bahagia saat murid bilang 'oh gitu caranya', sama-sama ingin Indonesia lebih baik. Bawa frekuensi ini ke sekolah kalian. Aku tunggu kabar baiknya." },
  { nama: "Talita Zahira Husna", panggilan: "Talita", gender: "P", sekolah: SK1, mood: "kasih", judul: "Bilangan Prima Kita", isi: "Kita ini seperti bilangan prima: unik, tidak bisa dipecah sembarangan, dan istimewa dengan caranya masing-masing. Terima kasih sudah menerimaku apa adanya. Semoga kita semua selalu dikelilingi orang-orang yang menghargai keunikan kita." },
  { nama: "Retno Palupi Kusuma", panggilan: "Retno", gender: "P", sekolah: SK1, mood: "lucu", judul: "Hasil Observasi Lapangan", isi: "Setelah mengobservasi 29 spesimen manusia selama 9 bulan, kudapatkan data: 100% baik hati, 90% hobi ngantuk di kelas pagi, 100% calon guru hebat. Kesimpulan: angkatan kita tidak perlu direvisi. Saran: jangan berubah, tetap jadi orang baik." },
  { nama: "Ahmad Fauzi", panggilan: "Fauzi", gender: "L", sekolah: SK1, mood: "syukur", judul: "Satu-Satunya yang Bilang Iya", isi: "Jadi satu-satunya laki-laki di angkatan ini mengajariku banyak hal: tentang mendengar, tentang menghormati, tentang ketulusan 28 kakak-adik yang luar biasa. Terima kasih sudah menerimaku. Suatu hari, murid-murid kalian akan bangga punya guru seperti kalian. Salam hangat dari admin kalian." },
];

const DOSEN: { nama: string; gender: "L" | "P"; filled: boolean; mood: string; judul: string; isi: string; zona: string }[] = [
  { nama: "Dr. Budi Santoso, M.Pd.", gender: "L", filled: true, mood: "inspiratif", judul: "Guru Adalah Perjalanan", isi: "Anak-anakku, mengajar matematika bukan sekadar menuliskan rumus di papan. Ia adalah cara kita menabur keberanian berpikir. Bawa integritas yang kalian pelajari di sini ke setiap kelas. Kami akan selalu bangga. — Pak Budi", zona: "e107" },
  { nama: "Dr. Sari Wulandari, M.Si.", gender: "P", filled: true, mood: "haru", judul: "Ruang E108 Akan Selalu Ada", isi: "Kalian datang sebagai mahasiswa, pergi sebagai guru. Ruang kelas ini akan sepi setelah kalian lulus, tapi pintunya tidak pernah tertutup. Kembalilah kapan saja, ceritakan murid-muridmu. Kami menunggu kabar baik. — Bu Sari", zona: "e108" },
  { nama: "Prof. Dr. Hendra Gunawan, M.Pd.", gender: "L", filled: true, mood: "semangat", judul: "Buktikan!", isi: "Dunia pendidikan menanti gagasan segar kalian. Jangan takut berbeda, jangan takut mencoba. Matematika mengajarkan ketelitian; kehidupan menuntut keberanian. Kalian punya keduanya. Buktikan di medan tugas!", zona: "aula" },
  { nama: "Dra. Ratna Kusuma, M.Pd.", gender: "P", filled: true, mood: "kasih", judul: "Peluk dari Ibu Dosen", isi: "Terima kasih sudah menjadi mahasiswa yang menyenangkan untuk dibimbing. Maaf bila tugas kami pernah membuat kalian begadang — itu tanda sayang kami pada masa depan kalian. Selamat bertugas, anak-anak hebat.", zona: "perpus" },
  { nama: "Dr. Agus Prasetyo, M.Si.", gender: "L", filled: true, mood: "lucu", judul: "Pesan dari Balik Kamera", isi: "Selama microteaching, saya banyak tertawa dalam hati melihat kalian gugup — dan menangis haru melihat kalian tumbuh. Sekarang giliran kalian membuat murid-murid tertawa dan menangis bangga. Semangat, Bapak-Ibu Guru!", zona: "parkir" },
  { nama: "Dr. Maya Anggraini, M.Pd.", gender: "P", filled: true, mood: "syukur", judul: "Titik Balik", isi: "Menyaksikan kalian bertransformasi adalah hadiah terbesar bagi kami para dosen. Ingatlah: setiap murid yang kalian sentuh hari ini adalah perubahan bagi Indonesia sepuluh tahun lagi. Jaga amanah ini. Terima kasih, terima kasih, terima kasih.", zona: "lapangan" },
  { nama: "Drs. Joko Pramono, M.Si.", gender: "L", filled: false, mood: "syukur", judul: "", isi: "", zona: "" },
  { nama: "Dr. Indah Permatasari, M.Pd.", gender: "P", filled: false, mood: "syukur", judul: "", isi: "", zona: "" },
  { nama: "Dr. Rina Handayani, M.Sc.", gender: "P", filled: false, mood: "syukur", judul: "", isi: "", zona: "" },
  { nama: "Dr. Bambang Riyanto, M.Pd.", gender: "L", filled: false, mood: "syukur", judul: "", isi: "", zona: "" },
];

const BALASAN_SEED: [number, number, string][] = [
  // [index penulis ucapan (mahasiswa), index pembalas (mahasiswa), isi]
  [0, 1, "Aku juga kuat karena kamu, Aulia. Semangat terus!"],
  [0, 6, "Bangga banget sama kamu. Sampai jumpa di puncak!"],
  [1, 4, "Nadiaa, jangan bikin nangis dong. Peluk!"],
  [1, 10, "Kita keluarga selamanya. Titik."],
  [3, 2, "Makasih udah jadi alarm hidupku, Dewi hehe"],
  [6, 7, "Ichaaa aku juga kangen duluan huee"],
  [8, 12, "Buktinya valid, tanpa perlu kontradiksi. Cinta kalian!"],
  [9, 13, "Selasar E saksi bisu kita semua, Ti."],
  [13, 16, "Maya, kamu juga alasan kami betah. Makasih ya"],
  [18, 19, "Hestii, jaga diri baik-baik di perantauan ya"],
  [21, 22, "Logikanya lolos uji validitas, Citra. Setuju 100%"],
  [26, 28, "Retno, observasimu akurat sekali wkwk. Kamu juga baik!"],
];

async function main() {
  console.log("Membersihkan data lama...");
  await db.delete(balasan);
  await db.delete(progress);
  await db.delete(ucapan);
  await db.delete(avatars);
  await db.delete(users);
  await db.delete(sekolah);
  await db.delete(adminLog);
  await db.delete(worldSettings);

  console.log("Menyimpan daftar sekolah & pengaturan dunia...");
  await db.insert(sekolah).values(SEKOLAH_LIST.map((s) => ({ nama: s.id, ciri: s.ciri })));
  await db.insert(worldSettings).values({ id: "global", lockMode: "auto" });

  console.log("Menyimpan 29 mahasiswa + ucapan + avatar...");
  const mhsIds: string[] = [];
  for (const m of MAHASISWA) {
    const isAdmin = m.gender === "L";
    const mode = isAdmin ? "biasa" : m.mode === "tni" ? "tni" : "biasa";
    const inserted = await db
      .insert(users)
      .values({
        namaLengkap: m.nama,
        namaPanggilan: m.panggilan,
        peran: isAdmin ? "admin" : "mahasiswa",
        jenisKelamin: m.gender,
        sekolahPpl: m.sekolah,
        modeAvatar: mode,
        isAdminAvatar: isAdmin,
        sudahIsiData: true,
      })
      .returning();
    const uid = inserted[0].id;
    mhsIds.push(uid);
    const config = isAdmin ? ADMIN_AVATAR : randomAvatar(m.gender, mode as "biasa" | "tni");
    await db.insert(avatars).values({ userId: uid, config: config as unknown as Record<string, unknown> });
    await db.insert(ucapan).values({
      userId: uid,
      judul: m.judul,
      isi: m.isi,
      mood: m.mood,
      zona: m.sekolah,
      halamanCount: paginateText(m.isi).length,
    });
  }

  console.log("Menyimpan 10 dosen (6 mengisi ucapan)...");
  for (const d of DOSEN) {
    const inserted = await db
      .insert(users)
      .values({
        namaLengkap: d.nama,
        namaPanggilan: d.nama.split(",")[0].split(" ").slice(-1)[0],
        peran: "dosen",
        jenisKelamin: d.gender,
        sudahIsiData: d.filled,
      })
      .returning();
    if (!d.filled) continue;
    const uid = inserted[0].id;
    await db.insert(avatars).values({ userId: uid, config: dosenAvatar(d.gender) as unknown as Record<string, unknown> });
    await db.insert(ucapan).values({
      userId: uid,
      judul: d.judul,
      isi: d.isi,
      mood: d.mood,
      zona: d.zona,
      halamanCount: paginateText(d.isi).length,
    });
  }

  console.log("Menyimpan balasan awal...");
  const ucapanRows = await db.select().from(ucapan);
  const byUser = new Map(ucapanRows.map((u) => [u.userId, u.id]));
  for (const [iPenulis, iPembalas, isi] of BALASAN_SEED) {
    const targetUcapan = byUser.get(mhsIds[iPenulis]);
    const replier = mhsIds[iPembalas];
    if (!targetUcapan || !replier || mhsIds[iPenulis] === replier) continue;
    await db.insert(balasan).values({ ucapanId: targetUcapan, userId: replier, isi, sudahDibaca: false });
  }

  console.log("Selesai! Dunia siap dijelajahi: 29/29 mahasiswa, 6/10 dosen.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
