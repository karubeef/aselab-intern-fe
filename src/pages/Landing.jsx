import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import landingImage1 from "../assets/oceanGuard_landingPage.jpg";
import landingImage2 from "../assets/oceanGuard_landingPageImage2.png";

const LANDING_IMAGES = [landingImage1, landingImage2];

const STEPS_3 = [
  {
    number: "01",
    title: "Foto sampahnya",
    desc: "Ambil foto langsung dari HP. Lokasi terisi otomatis lewat GPS.",
  },
  {
    number: "02",
    title: "Kirim laporan",
    desc: "Pilih jenis sampah dan tingkat keparahan. Tidak perlu isi form panjang.",
  },
  {
    number: "03",
    title: "Pantau sampai selesai",
    desc: "Status berubah setiap kali dinas mengambil tindakan. Kamu selalu diberi tahu.",
  },
];

const FLOW_6 = [
  { number: 1, title: "Terkirim", desc: "Laporanmu tercatat" },
  { number: 2, title: "Ditinjau", desc: "Admin memeriksa bukti" },
  { number: 3, title: "Diverifikasi", desc: "Muncul di peta publik" },
  { number: 4, title: "Ditugaskan", desc: "Diteruskan ke petugas" },
  { number: 5, title: "Ditangani", desc: "Petugas turun ke lokasi" },
  { number: 6, title: "Selesai", desc: "Ada foto sesudahnya" },
];

const REGIONS = [
  { name: "Bali", desc: "5 kabupaten · 3 dinas aktif" },
  { name: "Jawa Timur", desc: "2 kabupaten · 1 dinas aktif" },
  { name: "Wilayah lain", desc: "Belum ada dinas terdaftar" },
];

const FAQS = [
  {
    q: "Apakah lokasi rumah saya ikut terekam?",
    a: "Tidak. Yang disimpan hanya titik koordinat sampah yang kamu tandai, bukan riwayat perjalananmu. Izin GPS hanya dipakai saat kamu membuat laporan.",
  },
  {
    q: "Berapa lama laporan saya diproses?",
    a: "Waktu proses tergantung dinas di wilayahmu, tapi rata-rata laporan ditinjau dalam 1-3 hari kerja setelah dikirim.",
  },
  {
    q: "Apa yang terjadi kalau laporan saya ditolak?",
    a: "Laporan yang ditolak tetap tersimpan di riwayatmu lengkap dengan alasannya, supaya kamu tahu apa yang perlu diperbaiki.",
  },
  {
    q: "Perlu punya akun untuk melihat peta?",
    a: "Tidak, peta sebaran laporan bisa dilihat siapa saja tanpa akun. Akun hanya diperlukan untuk mengirim laporan.",
  },
  {
    q: "Wilayah mana saja yang sudah aktif?",
    a: "Saat ini Bali dan Jawa Timur sudah punya dinas terdaftar. Wilayah lain tetap bisa menerima laporan, menunggu dinas setempat bergabung.",
  },
  {
    q: "Apa itu XP dan Ocean Level?",
    a: "XP dan Ocean Level adalah sistem penghargaan atas kontribusimu — makin banyak laporan valid yang kamu kirim, level kamu makin naik.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % LANDING_IMAGES.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  function toggleFaq(index) {
    setOpenFaq((prev) => (prev === index ? -1 : index));
  }

  return (
    <div className="relative font-sans text-slate-800 w-full">
      {/* Satu gradient tunggal, membentang seluruh tinggi halaman, jadi "latar belakang" di balik semua section */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, #0555A7 0px, #0555A7 650px, #023890 2000px, #0D143F 3200px, #0D143F 100%)",
        }}
      />

      {/* Navbar + Hero */}
      <div className="relative h-[650px] overflow-hidden">
        {LANDING_IMAGES.map((img, index) => (
          <img
            key={img}
            src={img}
            alt="Laut Indonesia"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === activeImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Overlay gelap tipis supaya teks putih tetap kebaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[#0555A7]/40" />

        {/* Fade dasar foto, melebur ke gradient global di baliknya */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(39,109,166,0.3) 40%, rgba(39,109,166,0.75) 70%, #0555A7 100%)",
          }}
        />

        <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <span className="text-white font-bold text-lg tracking-wide">
            OCEANGUARD
          </span>

          <nav className="hidden md:flex gap-8 text-white text-sm">
            <a href="#peta">Peta</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#informasi">Informasi</a>
            <a href="#faq">FAQ</a>
            <a href="#dinas">Untuk Dinas</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-white text-sm">
              Masuk
            </Link>
            <Link
              to="/register"
              className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              Daftar
            </Link>
          </div>
        </header>

        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-28 pb-40">
          <div className="max-w-2xl">
            <h1 className="text-white text-5xl font-bold leading-tight mb-5">
              Sampah di laut tidak hilang sendiri.
            </h1>
            <p className="text-white/90 text-lg mb-7">
              Foto, kirim lokasi, dan pantau sampai benar-benar ditangani dinas
              setempat. Butuh dua menit.
            </p>
            <div className="flex gap-3 mb-4">
              <Link
                to="/reports/new"
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Lapor Sekarang
              </Link>
              <Link
                to="/map"
                className="bg-white hover:bg-slate-100 text-slate-800 font-semibold px-6 py-3 rounded-lg"
              >
                Lihat Peta
              </Link>
            </div>
            <p className="text-white/70 text-sm">
              Gratis · Tanpa aplikasi · Bisa dari HP
            </p>
          </div>
        </div>
      </div>

      {/* Map preview section — transparan, biar gradient global keliatan */}
      <section id="peta" className="bg-transparent px-8 py-20 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-200 text-xs font-semibold tracking-widest mb-3">
            LIHAT SENDIRI
          </p>
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-3">
            Bagaimana kondisi pantai di dekatmu?
          </h2>
          <p className="text-blue-100 text-base mb-8">
            Peta ini menampilkan laporan yang sudah diverifikasi. Cari nama
            pantai atau geser ke wilayahmu.
          </p>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Cari nama pantai, teluk, atau desa..."
              className="flex-1 rounded-lg px-4 py-3 text-sm outline-none"
            />
            <Link
              to="/map"
              className="bg-white hover:bg-slate-100 text-slate-800 font-semibold px-6 py-3 rounded-lg whitespace-nowrap"
            >
              Buka Peta Lengkap
            </Link>
          </div>

          <div className="bg-slate-200 border border-dashed border-slate-400 rounded-lg h-72 flex items-center justify-center px-10">
            <p className="text-slate-500 text-sm text-center">
              [Preview Peta Sebaran Laporan — Heatmap + Marker Laporan Terbaru]
            </p>
          </div>
        </div>
      </section>

      {/* 3 steps — putih solid, menutupi gradient */}
      <section id="cara-kerja" className="px-8 py-20 w-full bg-white">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          Tiga langkah, selesai dalam dua menit
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {STEPS_3.map((step) => (
            <div key={step.number} className="border border-slate-200 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-3">{step.number}</p>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6-step flow — transparan */}
      <section className="bg-transparent px-8 py-20 w-full">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-blue-200 text-xs font-semibold tracking-widest mb-3">
            YANG TERJADI SETELAH KAMU LAPOR
          </p>
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-3">
            Laporanmu tidak berhenti di kotak masuk
          </h2>
          <p className="text-blue-100 text-base mb-10">
            Setiap laporan melewati tahapan ini, dan kamu bisa melihat
            posisinya kapan saja.
          </p>

          <div className="bg-[#0D143F] rounded-2xl p-8 grid grid-cols-2 md:grid-cols-6 gap-6">
            {FLOW_6.map((step) => (
              <div key={step.number}>
                <div className="w-9 h-9 mx-auto mb-3 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-semibold">
                  {step.number}
                </div>
                <h4 className="text-blue-300 font-semibold text-sm mb-1">
                  {step.title}
                </h4>
                <p className="text-white/70 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-blue-200 text-sm mt-8 text-left max-w-5xl mx-auto">
            Laporan yang ditolak tetap tersimpan di riwayatmu, lengkap dengan
            alasannya.
          </p>
        </div>
      </section>

      {/* Regions — putih solid */}
      <section id="informasi" className="px-8 py-20 w-full bg-white">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          Wilayah yang sudah punya dinas terdaftar
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5 mb-6">
          {REGIONS.map((r) => (
            <div key={r.name} className="border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-1">{r.name}</h3>
              <p className="text-slate-500 text-sm">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto bg-slate-100 rounded-lg px-6 py-4">
          <p className="text-slate-500 text-sm">
            Di luar wilayah tersebut laporanmu tetap tercatat dan tampil di
            peta publik, tapi belum ada instansi yang menanganinya. Kami akan
            memberi tahu begitu wilayahmu aktif.
          </p>
        </div>
      </section>

      {/* Admin panel promo — transparan */}
      <section id="dinas" className="bg-transparent px-8 py-20 w-full">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-blue-300 text-xs font-semibold tracking-widest mb-3">
              UNTUK DINAS & INSTANSI
            </p>
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
              Satu panel untuk seluruh laporan warga di wilayah kerja Anda
            </h2>
            <p className="text-blue-100 text-base mb-6">
              Verifikasi laporan, tugaskan petugas, dan catat bukti
              penyelesaian dalam satu alur yang terekam. Akun dibuat oleh tim
              kami setelah kerja sama disepakati.
            </p>
            <div className="flex gap-3">
              
                <a href="mailto:hello@oceanguard.id"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Hubungi Kami
              </a>
              <Link
                to="/admin/verify-reports"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-blue-300/30"
              >
                Lihat Panel Admin
              </Link>
            </div>
          </div>

          <div className="bg-slate-200 rounded-xl h-64 flex items-center justify-center">
            <p className="text-slate-500 text-sm">[Tangkapan Layar Panel Admin]</p>
          </div>
        </div>
      </section>

      {/* FAQ — putih solid */}
      <section id="faq" className="px-8 py-20 w-full bg-white">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          Pertanyaan yang sering ditanyakan
        </h2>

        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {FAQS.map((faq, index) => (
            <div key={faq.q} className="border border-slate-200 rounded-lg">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-base"
              >
                {faq.q}
                <span className="text-slate-400 text-xl">
                  {openFaq === index ? "−" : "+"}
                </span>
              </button>

              {openFaq === index && (
                <p className="px-5 pb-4 text-slate-500 text-sm">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA — transparan, paling gelap */}
      <section className="bg-transparent px-8 py-20 text-center w-full">
        <h2 className="text-white text-3xl md:text-4xl font-bold mb-3">
          Ada sampah di pantai dekat rumahmu?
        </h2>
        <p className="text-blue-200 text-base mb-8">
          Butuh dua menit. Foto, kirim, lalu pantau sampai selesai.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/reports/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Lapor Sekarang
          </Link>
          <Link
            to="/register"
            className="bg-white hover:bg-slate-100 text-slate-800 font-semibold px-6 py-3 rounded-lg"
          >
            Buat Akun Gratis
          </Link>
        </div>
      </section>

      {/* Footer — putih solid */}
      <footer className="px-8 py-16 w-full bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-2">OCEANGUARD</h4>
            <p className="text-slate-500 text-sm">
              Platform pelaporan sampah laut dan pesisir. Mendukung SDG 14,
              11, dan 17.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-sm mb-3">Platform</h5>
            <ul className="text-slate-500 text-sm flex flex-col gap-2">
              <li><a href="#peta">Peta Sebaran</a></li>
              <li><a href="#cara-kerja">Cara Kerja</a></li>
              <li><a href="#informasi">Informasi & Edukasi</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-sm mb-3">Untuk Dinas</h5>
            <ul className="text-slate-500 text-sm flex flex-col gap-2">
              <li><Link to="/admin/verify-reports">Panel Admin</Link></li>
              <li><a href="mailto:hello@oceanguard.id">Hubungi Kami</a></li>
              <li><a href="#dinas">Kerja Sama</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-sm mb-3">Legal</h5>
            <ul className="text-slate-500 text-sm flex flex-col gap-2">
              <li><a href="#syarat">Syarat & Ketentuan</a></li>
              <li><a href="#privasi">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}