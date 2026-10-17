
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "../components/public/PublicFooter";
import PublicArticleCard from "../components/public/PublicArticleCard";

import { getAllInformasi } from "../api/informasi";
import { getHeatmap } from "../api/reports";

import heroImage from "../assets/oceanGuard_landingPage.jpg";

const steps = [
  {
    number: "01",
    title: "Foto sampahnya",
    description: "Ambil foto kondisi sampah sebagai bukti pelaporan.",
  },
  {
    number: "02",
    title: "Kirim laporan",
    description: "Tentukan lokasi, jenis sampah, dan tingkat keparahan.",
  },
  {
    number: "03",
    title: "Pantau sampai selesai",
    description: "Pantau status setelah laporan diperiksa Admin.",
  },
];

const statuses = [
  "Terkirim",
  "Ditinjau",
  "Diverifikasi",
  "Ditugaskan",
  "Ditangani",
  "Selesai",
];

const faqs = [
  {
    question: "Apakah lokasi rumah saya ikut terekam?",
    answer:
      "Lokasi yang ditampilkan pada peta publik merupakan lokasi laporan sampah, bukan riwayat perjalanan pengguna.",
  },
  {
    question: "Berapa lama laporan saya diproses?",
    answer:
      "Waktu proses bergantung pada peninjauan Admin dan penanganan oleh petugas.",
  },
  {
    question: "Apa yang terjadi kalau laporan saya ditolak?",
    answer:
      "Laporan ditandai sebagai ditolak dengan alasan yang dapat dilihat pengguna.",
  },
  {
    question: "Perlu punya akun untuk melihat peta?",
    answer:
      "Tidak. Peta publik dapat dibuka tanpa login. Untuk mengirim laporan, pengguna perlu masuk.",
  },
  {
    question: "Wilayah mana saja yang sudah aktif?",
    answer:
      "Wilayah aktif bergantung pada ketersediaan instansi yang bekerja sama dengan OceanGuard.",
  },
  {
    question: "Apa itu XP dan Ocean Level?",
    answer:
      "XP merupakan poin kontribusi pengguna. Ocean Level menunjukkan perkembangan aktivitas yang memenuhi kriteria sistem.",
  },
];

const primaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#082C6B]";

const secondaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0B3D91] transition-colors hover:bg-blue-50";

function getDensityColor(total) {
  if (total >= 6) return "#DC2626";
  if (total >= 3) return "#F97316";
  return "#15803D";
}

function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    map.fitBounds(points, {
      padding: [45, 45],
      maxZoom: 14,
      animate: false,
    });
  }, [map, points]);

  return null;
}

export default function Landing() {
  const [articles, setArticles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [articleLoading, setArticleLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [articleError, setArticleError] = useState("");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let active = true;

    getAllInformasi()
      .then((result) => {
        if (active) {
          setArticles(Array.isArray(result) ? result : []);
        }
      })
      .catch((error) => {
        if (active) {
          setArticleError(
            error.message || "Gagal memuat artikel."
          );
        }
      })
      .finally(() => {
        if (active) setArticleLoading(false);
      });

    getHeatmap()
      .then((result) => {
        if (active) {
          setAreas(Array.isArray(result) ? result : []);
        }
      })
      .catch((error) => {
        if (active) {
          setMapError(
            error.message || "Gagal memuat peta."
          );
        }
      })
      .finally(() => {
        if (active) setMapLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalReports = useMemo(() => {
    return areas.reduce(
      (sum, area) => sum + Number(area.totalReports || 0),
      0
    );
  }, [areas]);

  const validPoints = useMemo(() => {
    return areas.filter((area) => {
      return (
        area.centerLat != null &&
        area.centerLon != null &&
        Number.isFinite(Number(area.centerLat)) &&
        Number.isFinite(Number(area.centerLon))
      );
    });
  }, [areas]);

  const coordinates = useMemo(() => {
    return validPoints.map((area) => [
      Number(area.centerLat),
      Number(area.centerLon),
    ]);
  }, [validPoints]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900">
      <section className="relative min-h-[680px] overflow-hidden bg-[#07559E]">
        <img
          src={heroImage}
          alt="Laut OceanGuard"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#031C43]/35 via-[#063A77]/10 to-[#07559E]" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[360px] bg-gradient-to-b from-transparent via-[#07559E]/50 to-[#07559E]" />

        <div className="relative z-20">
          <PublicNavbar transparent />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-center px-6 pb-32 pt-24 sm:px-8">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Sampah di laut tidak hilang sendiri.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              Foto, kirim lokasi, dan pantau sampai benar-benar
              ditangani dinas setempat. Butuh dua menit.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/reports/new" className={primaryBtn}>
                Lapor Sekarang
              </Link>

              <Link to="/public-map" className={secondaryBtn}>
                Lihat Peta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="peta"
        className="relative -mt-px bg-[#07559E] px-5 pb-12 pt-8 text-white"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">
              Bagaimana kondisi pantai di dekatmu?
            </h2>

            <p className="mt-3 text-blue-100">
              Lihat persebaran laporan sampah yang sudah diverifikasi.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,20,60,0.18)]">
            <MapContainer
              center={[-2.5, 118]}
              zoom={5}
              scrollWheelZoom={false}
              className="h-[420px] w-full sm:h-[470px]"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapBounds points={coordinates} />

              {validPoints.map((area) => {
                const total = Number(area.totalReports || 0);
                const color = getDensityColor(total);

                return (
                  <CircleMarker
                    key={area.areaId}
                    center={[
                      Number(area.centerLat),
                      Number(area.centerLon),
                    ]}
                    radius={Math.max(9, Math.min(20, 9 + total))}
                    pathOptions={{
                      color: "#FFFFFF",
                      weight: 2,
                      fillColor: color,
                      fillOpacity: 0.9,
                    }}
                  >
                    <Popup>
                      <div className="min-w-[170px]">
                        <strong>Area {area.areaId}</strong>

                        <p>
                          {area.latestReport?.locationName ||
                            "Area laporan"}
                        </p>

                        <p>{total} laporan terverifikasi</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">
                {mapLoading
                  ? "Memuat data peta..."
                  : mapError
                    ? "Data peta belum dapat dimuat"
                    : `${totalReports} laporan terverifikasi`}
              </p>

              <p className="mt-1 text-sm text-blue-100">
                {areas.length} area laporan terverifikasi
              </p>
            </div>

            <Link
              to="/public-map"
              className="inline-flex items-center justify-center rounded-lg bg-[#083780] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#062A63]"
            >
              Buka Peta Lengkap →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="cara-kerja"
        className="bg-white px-5 pb-20 pt-16"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-9 text-center text-3xl font-bold text-[#0B3D91]">
            Tiga langkah, selesai dalam dua menit
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-xl border border-blue-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-sm text-slate-400">
                  {step.number}
                </p>

                <h3 className="mt-3 text-lg font-semibold">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07559E] px-5 pb-20 pt-20 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">
            Laporanmu tidak berhenti di kotak masuk
          </h2>

          <p className="mt-3 text-center text-blue-100">
            Setiap laporan memiliki tahapan yang dapat dipantau.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-4 rounded-2xl border border-white/25 bg-white/5 p-6 md:grid-cols-6">
            {statuses.map((status, index) => (
              <div key={status} className="text-center">
                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white/15 font-bold">
                  {index + 1}
                </div>

                <p className="text-sm font-medium">
                  {status}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-7 text-center text-sm text-blue-100">
            Laporan yang ditolak tetap tersimpan di riwayat,
            lengkap dengan alasannya.
          </p>
        </div>
      </section>

      <section
        id="informasi"
        className="bg-[#07559E] px-5 pb-24 pt-12 text-white"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold">
                Informasi & Edukasi
              </h2>

              <p className="mt-2 text-blue-100">
                Artikel edukasi terbaru yang diterbitkan Admin.
              </p>
            </div>

            <Link
              to="/informasi"
              className="text-sm font-semibold hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          {articleLoading ? (
            <p>Memuat artikel...</p>
          ) : articleError ? (
            <p
              role="alert"
              className="rounded-lg bg-white p-4 text-red-600"
            >
              {articleError}
            </p>
          ) : articles.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-slate-500">
              Belum ada artikel dari Admin.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <PublicArticleCard
                  key={article.id}
                  article={article}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        id="faq"
        className="bg-white px-5 pb-24 pt-20"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-[#0B3D91]">
            Pertanyaan yang sering ditanyakan
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                open={index === 0}
                className="group rounded-lg border border-slate-200 bg-white p-5"
              >
                <summary className="cursor-pointer font-medium">
                  {faq.question}
                </summary>

                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102D69] px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold">
            Ada sampah di pantai dekat rumahmu?
          </h2>

          <p className="mt-3 text-blue-100">
            Butuh dua menit. Foto, kirim, lalu pantau sampai selesai.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/reports/new" className={primaryBtn}>
              Lapor Sekarang
            </Link>

            <Link to="/register" className={secondaryBtn}>
              Buat Akun Gratis
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
