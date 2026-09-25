import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllReports } from "../api/reports";
import { useAuth } from "../context/AuthContext";
import ReporterLayout from "../components/ReporterLayout";

const STATUS_LABELS = {
  SUBMITTED: "Menunggu Verifikasi",
  UNDER_REVIEW: "Sedang Ditinjau",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  IN_PROGRESS: "Sedang Ditangani",
  RESOLVED: "Selesai",
};

const STATUS_COLORS = {
  SUBMITTED: "bg-amber-50 text-amber-700",
  UNDER_REVIEW: "bg-blue-50 text-blue-700",
  VERIFIED: "bg-sky-50 text-sky-700",
  REJECTED: "bg-red-50 text-red-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  RESOLVED: "bg-green-50 text-green-700",
};

const DIRTY_COLORS = {
  BERSIH: "bg-green-50 text-green-700",
  SEDANG: "bg-amber-50 text-amber-700",
  KOTOR: "bg-red-50 text-red-700",
};

export default function Dashboard() {
  const { user } = useAuth();

  const [myReports, setMyReports] = useState([]);
  const [latestReports, setLatestReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const allReports = await getAllReports();
      setMyReports(allReports.filter((r) => r.userId === user.id));
      setLatestReports(allReports.slice(0, 4));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: myReports.length,
    verified: myReports.filter((r) =>
      ["VERIFIED", "IN_PROGRESS", "RESOLVED"].includes(r.status)
    ).length,
    inProgress: myReports.filter((r) => r.status === "IN_PROGRESS").length,
    resolved: myReports.filter((r) => r.status === "RESOLVED").length,
  };

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ReporterLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Selamat datang, {user?.name}! 👋
          </h1>
          <p className="text-slate-400 text-sm">{today}</p>
        </div>
        <Link
          to="/reports/new"
          className="bg-[#1179C4] hover:bg-[#0f6aab] text-white font-semibold px-5 py-3 rounded-lg text-sm"
        >
          + Buat Laporan Baru
        </Link>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat data...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Laporan Saya" value={stats.total} />
            <StatCard
              label="Terverifikasi"
              value={stats.verified}
              valueClass="text-green-600"
              sub={
                stats.total > 0
                  ? `${Math.round((stats.verified / stats.total) * 100)}% dari total`
                  : "-"
              }
            />
            <StatCard
              label="Sedang Ditangani"
              value={stats.inProgress}
              valueClass="text-orange-500"
              sub="Menunggu tim"
            />
            <StatCard
              label="Selesai"
              value={stats.resolved}
              valueClass="text-[#1179C4]"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Peta Sebaran Laporan</h2>
                <Link to="/map" className="text-[#1179C4] text-sm">
                  Buka peta lengkap →
                </Link>
              </div>
              <Link
                to="/map"
                className="border border-dashed border-slate-300 rounded-lg h-56 flex items-center justify-center text-slate-400 text-sm hover:bg-slate-50"
              >
                [Peta Interaktif — klik untuk membuka]
              </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="font-semibold mb-4">Ringkasan Laporanku</h2>
              {stats.total === 0 ? (
                <p className="text-slate-400 text-sm">
                  Kamu belum pernah membuat laporan.
                </p>
              ) : (
                <ul className="flex flex-col gap-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-500">Total</span>
                    <span className="font-semibold">{stats.total}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Terverifikasi</span>
                    <span className="font-semibold">{stats.verified}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Sedang ditangani</span>
                    <span className="font-semibold">{stats.inProgress}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Selesai</span>
                    <span className="font-semibold">{stats.resolved}</span>
                  </li>
                </ul>
              )}
              <Link
                to="/my-reports"
                className="block text-center text-[#1179C4] text-sm mt-4"
              >
                Lihat semua laporan saya →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Laporan Terbaru</h2>
              <Link to="/reports" className="text-[#1179C4] text-sm">
                Lihat semua →
              </Link>
            </div>

            {latestReports.length === 0 ? (
              <p className="text-slate-400 text-sm">Belum ada laporan.</p>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {latestReports.map((r) => (
                  <Link
                    to={`/reports/${r.id}`}
                    key={r.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        IMG
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-400 text-xs">
                            OG-{r.id}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIRTY_COLORS[r.dirtyLevel]}`}
                          >
                            {r.dirtyLevel}
                          </span>
                        </div>
                        <p className="font-medium text-sm">
                          {Array.isArray(r.wasteTypes)
                            ? r.wasteTypes.join(", ")
                            : r.wasteTypes}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {new Date(r.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </ReporterLayout>
  );
}

function StatCard({ label, value, valueClass = "text-slate-900", sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}