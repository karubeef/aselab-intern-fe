
import PublicNavbar from "../../components/public/PublicNavbar";
import BackLink from "../../components/public/BackLink";

const STEPS = [
  {
    number: "01",
    title: "Foto sampahnya",
    description:
      "Ambil foto langsung dari HP. Lokasi terisi otomatis lewat GPS jika kamu mengizinkan akses lokasi.",
  },
  {
    number: "02",
    title: "Kirim laporan",
    description:
      "Pilih jenis sampah dan tingkat keparahan. Tambahkan informasi yang diperlukan agar laporan lebih jelas.",
  },
  {
    number: "03",
    title: "Pantau sampai selesai",
    description:
      "Status laporan berubah sesuai tindak lanjut Admin dan petugas. Pantau perkembangannya melalui Laporan Saya.",
  },
];

const FAQS = [
  [
    "Apakah lokasi rumah saya ikut terekam?",
    "Tidak. Yang ditampilkan pada peta adalah lokasi laporan sampah yang kamu tandai, bukan riwayat perjalananmu. Izin lokasi digunakan ketika kamu memakai fitur lokasi.",
  ],
  [
    "Berapa lama laporan saya diproses?",
    "Waktu penanganan bergantung pada kondisi laporan dan kesiapan petugas. Pantau perkembangannya melalui Laporan Saya.",
  ],
  [
    "Apa yang terjadi kalau laporan saya ditolak?",
    "Laporan tetap tersimpan di riwayat. Kamu dapat membaca alasan penolakannya pada detail laporan.",
  ],
  [
    "Perlu punya akun untuk melihat peta?",
    "Tidak. Peta publik dapat dilihat tanpa akun. Masuk atau daftar diperlukan untuk mengirim laporan.",
  ],
  [
    "Wilayah mana saja yang sudah aktif?",
    "Wilayah yang aktif bergantung pada ketersediaan instansi yang bekerja sama dengan OceanGuard.",
  ],
  [
    "Apa itu XP dan Ocean Level?",
    "XP menunjukkan kontribusimu dalam platform. Ocean Level menunjukkan perkembangan kontribusi tersebut.",
  ],
];

export default function MobileGuidePage({
  kind = "steps",
}) {
  const isFaq = kind === "faq";

  return (
    <div className="og-mobile-standalone min-h-screen bg-white text-[#101C43]">
      <PublicNavbar />

      <main className="og-mobile-inner">
        <BackLink
          to="/"
          label="Kembali ke Beranda"
        />

        <h1 className="og-mobile-heading">
          {isFaq
            ? "Pertanyaan yang sering ditanyakan"
            : "Tiga langkah, selesai dalam dua menit"}
        </h1>

        <div className="og-guide-stack">
          {isFaq
            ? FAQS.map(([question, answer]) => (
                <section
                  key={question}
                  className="og-guide-card"
                >
                  <h2>{question}</h2>
                  <p>{answer}</p>
                </section>
              ))
            : STEPS.map((step) => (
                <section
                  key={step.number}
                  className="og-guide-card"
                >
                  <span className="og-step-number">
                    {step.number}
                  </span>

                  <h2>{step.title}</h2>

                  <p>{step.description}</p>
                </section>
              ))}
        </div>
      </main>
    </div>
  );
}
