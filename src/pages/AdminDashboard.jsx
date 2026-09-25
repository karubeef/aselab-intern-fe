import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../api/dashboard";
import ReporterLayout from "../components/ReporterLayout";
import { STATUS_LABELS, STATUS_COLORS } from "../constants/report";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const result = await getAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ReporterLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-slate-400 text-sm">{today}</p>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat data...</p>
      ) : (
        data && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Laporan" value={data.totalReports} />
              <StatCard label="Total User" value={data.totalUsers} />
              <StatCard
                label="Menunggu Verifikasi"
                value={data.summaryByStatus.SUBMITTED}
                valueClass="text-amber-600"
              />
              <StatCard
                label="Terverifikasi"
                value={data.summaryByStatus.VERIFIED}
                valueClass="text-green-600"
              />
            </div>

            {/* Breakdown per status */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
              <h2 className="font-semibold mb-4">Ringkasan Status Laporan</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(data.summaryByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between border border-slate-100 rounded-lg px-4 py-3"
                  >
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}
                    >
                      {STATUS_LABELS[status] || status}
                    </span>
                    <span className="font-bold text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending reports */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Laporan Menunggu Verifikasi</h2>
                <Link to="/admin/verify-reports" className="text-[#1179C4] text-sm">
                  Verifikasi sekarang →
                </Link>
              </div>

              {data.pendingReports.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  Tidak ada laporan yang menunggu verifikasi saat ini.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {data.pendingReports.map((r) => (
                    <Link
                      to={`/reports/${r.id}`}
                      key={r.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="font-medium text-sm">OG-{r.id}</p>
                        <p className="text-slate-400 text-xs">
                          Oleh {r.user?.name || "Tidak diketahui"} ·{" "}
                          {new Date(r.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
                        {STATUS_LABELS.SUBMITTED}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )
      )}
    </ReporterLayout>
  );
}

function StatCard({ label, value, valueClass = "text-slate-900" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}