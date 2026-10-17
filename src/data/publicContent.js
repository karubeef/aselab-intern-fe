import heroOcean from "../assets/public/hero-ocean.jpg";
import articlePlastic from "../assets/public/article-plastic.jpg";
import articleCamera from "../assets/public/article-camera.jpg";
import articleWorkers from "../assets/public/article-workers.jpg";
import articleBottle from "../assets/public/article-bottle.jpg";
import articleBagfish from "../assets/public/article-bagfish.jpg";
import articleBeachTrash from "../assets/public/article-beach-trash.jpg";
import eventBeachClean from "../assets/public/event-beach-clean.jpg";

export const publicArticles = [
  {
    id: "cara-memotret-sampah-agar-laporanmu-cepat-diverifikasi",
    category: "Panduan Pelaporan",
    title: "Cara memotret sampah agar laporanmu cepat diverifikasi",
    summary:
      "Pelajari cara mengambil foto yang jelas agar admin lebih mudah memverifikasi laporan sampahmu.",
    date: "5 Agu 2026",
    readTime: "3 menit baca",
    image: articleCamera,
    contentSections: [
      {
        heading: "Mulai dengan foto area sekitar",
        body:
          "Ambil satu foto dari jarak yang cukup untuk memperlihatkan area sampah dan lingkungan di sekitarnya. Sertakan penanda yang mudah dikenali, seperti akses pantai atau bangunan di dekat lokasi.",
      },
      {
        heading: "Tambahkan foto kondisi sampah",
        body:
          "Ambil foto yang lebih dekat agar jenis sampah terlihat. Bila sampah tersebar, gunakan sudut tambahan untuk menunjukkan sebarannya. Pilih foto yang terang dan tidak buram.",
      },
      {
        heading: "Periksa sebelum mengirim",
        body:
          "Pastikan jenis sampah, titik lokasi, dan deskripsi sudah sesuai. Lengkapi tingkat keparahan bila diperlukan agar petugas punya gambaran kondisi di lapangan.",
      },
      {
        heading: "Pantau hasil peninjauan",
        body:
          "Setelah dikirim, laporan akan melalui tahap peninjauan admin. Jika perlu perbaikan, pengguna masih dapat melihat status dan alasan pembaruan pada riwayat laporan.",
      },
    ],
  },
  {
    id: "kenapa-sampah-plastik-tidak-pernah-benar-benar-hilang",
    category: "Sampah Laut",
    title: "Kenapa sampah plastik tidak pernah benar-benar hilang",
    summary:
      "Sampah plastik terurai sangat lama dan berubah menjadi partikel kecil yang tetap mencemari laut.",
    date: "12 Agu 2026",
    readTime: "4 menit baca",
    image: articlePlastic,
  },
  {
    id: "apa-yang-terjadi-pada-sampah-setelah-diangkut-petugas",
    category: "Penanganan Sampah",
    title: "Apa yang terjadi pada sampah setelah diangkut petugas",
    summary:
      "Kenali alur penanganan sampah setelah laporan diverifikasi dan ditindaklanjuti petugas.",
    date: "28 Jul 2026",
    readTime: "4 menit baca",
    image: articleWorkers,
  },
  {
    id: "mengenal-enam-jenis-sampah-laut-yang-paling-sering-ditemukan",
    category: "Artikel",
    title: "Mengenal enam jenis sampah laut yang paling sering ditemukan",
    summary:
      "Mulai dari plastik sekali pakai hingga alat tangkap, setiap jenis sampah memiliki dampak berbeda.",
    date: "21 Jul 2026",
    readTime: "5 menit baca",
    image: articleBottle,
  },
  {
    id: "jaring-hantu-ancaman-senyap-bagi-ekosistem-pesisir",
    category: "Artikel",
    title: "Jaring hantu: ancaman senyap bagi ekosistem pesisir",
    summary:
      "Jaring atau alat tangkap yang terbuang tetap bisa menjebak biota laut dan merusak ekosistem.",
    date: "14 Jul 2026",
    readTime: "4 menit baca",
    image: articleBagfish,
  },
  {
    id: "bagaimana-laporan-warga-membantu-dinas-menyusun-prioritas",
    category: "Artikel",
    title: "Bagaimana laporan warga membantu dinas menyusun prioritas",
    summary:
      "Laporan warga membantu dinas memetakan area yang perlu penanganan lebih cepat.",
    date: "7 Jul 2026",
    readTime: "3 menit baca",
    image: articleBeachTrash,
  },
];

export const featuredEvent = {
  title: "Pekan Bersih Pantai",
  description:
    "Kirim 3 laporan terverifikasi selama periode event. Progresmu dihitung otomatis oleh sistem.",
  image: eventBeachClean,
  status: "Event · berakhir 6 hari 4 jam lagi",
  progressText: "0/0 · +0 XP",
};

export const faqItems = [
  {
    question: "Apakah lokasi rumah saya ikut terekam?",
    answer:
      "Tidak. Yang ditampilkan hanya titik koordinat sampah yang kamu tandai, bukan riwayat perjalananmu. Izin GPS hanya dipakai saat kamu membuat laporan.",
  },
  {
    question: "Berapa lama laporan saya diproses?",
    answer:
      "Waktu proses dapat berbeda, tetapi laporan akan melalui tahapan terkirim, ditinjau admin, lalu diteruskan ke petugas bila valid.",
  },
  {
    question: "Apa yang terjadi kalau laporan saya ditolak?",
    answer:
      "Laporan yang ditolak tetap tersimpan di riwayatmu beserta alasannya, sehingga kamu bisa memperbaiki pelaporan berikutnya.",
  },
  {
    question: "Perlu punya akun untuk melihat peta?",
    answer:
      "Tidak. Peta sebaran publik dapat dilihat tanpa login, namun untuk membuat laporan kamu perlu masuk terlebih dahulu.",
  },
  {
    question: "Wilayah mana saja yang sudah aktif?",
    answer:
      "Wilayah aktif akan terus bertambah. Saat ini contoh wilayah yang ditampilkan di desain adalah Bali dan Jawa Barat.",
  },
  {
    question: "Apa itu XP dan Ocean Level?",
    answer:
      "XP adalah poin aktivitas pengguna. Ocean Level meningkat seiring kontribusi laporan dan partisipasi event/challenge.",
  },
];

export const regionCards = [
  { title: "Bali", subtitle: "5 kabupaten · 3 dinas aktif" },
  { title: "Jawa Barat", subtitle: "7 kabupaten · 1 dinas aktif" },
  { title: "Wilayah lain", subtitle: "Belum ada dinas terdaftar" },
];

export const landingMapPoints = [
  { id: 1, label: "Terverifikasi", color: "#0B4DB5", left: "63%", top: "42%" },
  { id: 2, label: "Terverifikasi", color: "#0B4DB5", left: "72%", top: "58%" },
  { id: 3, label: "Sedang", color: "#F97316", left: "52%", top: "73%" },
  { id: 4, label: "Tinggi", color: "#DC2626", left: "36%", top: "69%" },
  { id: 5, label: "Rendah", color: "#16A34A", left: "67%", top: "80%" },
];