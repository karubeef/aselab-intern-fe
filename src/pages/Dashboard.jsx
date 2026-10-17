import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { getUserDashboard } from "../api/dashboard";
import { getMyReports } from "../api/reports";
import { getAllBadges } from "../api/badges";
import { useAuth } from "../context/AuthContext";
import ReporterLayout from "../components/ReporterLayout";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  POLLUTION_LABELS,
  POLLUTION_COLORS,
} from "../constants/report";

const STATUS_ORDER = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

const STATUS_BAR_COLORS = {
  SUBMITTED: "bg-slate-400",
  UNDER_REVIEW: "bg-amber-400",
  VERIFIED: "bg-sky-500",
  IN_PROGRESS: "bg-orange-500",
  RESOLVED: "bg-green-500",
  REJECTED: "bg-red-500",
};

function describeRequirement(badge) {
  if (badge.requirementType === "VERIFIED_REPORT_COUNT") {
    return `Raih ${badge.requirementValue} laporan terverifikasi`;
  }
  return `Selesaikan ${badge.requirementValue} challenge`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [summary, setSummary] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [dashboardData, reports, badges] = await Promise.all([
        getUserDashboard(),
        getMyReports(),
        getAllBadges(),
      ]);
      setSummary(dashboardData);
      setRecentReports(reports.slice(0, 4));
      setAllBadges(badges);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#15316E]">
          Selamat datang, {user?.name}! 👋
        </h1>
        <p className="text-slate-400 text-sm mb-4">{today}</p>
        <Link
          to="/reports/new"
          className="inline-block bg-[#15316E] hover:bg-[#0F2555] text-white font-semibold px-5 py-3 rounded-lg text-sm"
        >
          + Buat Laporan Baru
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="font-medium underline">
            Coba lagi
          </button>
        </div>
      )}

      {loading && <p className="text-slate-500">Memuat data...</p>}

      {!loading && summary && (
        <DashboardContent
          summary={summary}
          recentReports={recentReports}
          allBadges={allBadges}
        />
      )}
    </ReporterLayout>
  );
}

function DashboardContent({ summary, recentReports, allBadges }) {
  const { totalReports, reportsByStatus, totalXP, oceanLevel } = summary;

  const waiting = reportsByStatus.SUBMITTED + reportsByStatus.UNDER_REVIEW;
  const inProgress = reportsByStatus.IN_PROGRESS;
  const resolved = reportsByStatus.RESOLVED;
  const resolvedRate = totalReports > 0 ? Math.round((resolved / totalReports) * 100) : 0;

  const xpIntoLevel = totalXP % 100;
  const xpToNext = 100 - xpIntoLevel;

  const earnedMap = new Map(summary.badges.map((b) => [b.id, b.earnedAt]));
  const sortedBadges = [...allBadges].sort(
    (a, b) => Number(earnedMap.has(b.id)) - Number(earnedMap.has(a.id))
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Laporan" value={totalReports} sub="Semua laporanmu" />
        <StatCard
          label="Menunggu Verifikasi"
          value={waiting}
          sub="Terkirim atau ditinjau"
          valueClass="text-amber-600"
        />
        <StatCard
          label="Sedang Ditangani"
          value={inProgress}
          sub="Oleh tim lapangan"
          valueClass="text-orange-500"
        />
        <StatCard
          label="Selesai"
          value={resolved}
          sub={`${resolvedRate}% dari total`}
          valueClass="text-green-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Ringkasan Status Laporan</h2>

          {totalReports === 0 ? (
            <p className="text-slate-400 text-sm">
              Kamu belum pernah membuat laporan.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {STATUS_ORDER.map((status) => {
                const count = reportsByStatus[status];
                const percent = Math.round((count / totalReports) * 100);

                return (
                  <div key={status} className="flex items-center gap-3">
                    <span
                      className={`w-36 shrink-0 text-center text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${STATUS_BAR_COLORS[status]}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold text-sm">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Ocean Level</p>
          <p className="text-3xl font-bold text-[#1179C4] mb-4">Lv.{oceanLevel}</p>

          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Total XP</span>
            <span className="font-semibold">{totalXP} XP</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-[#1179C4]" style={{ width: `${xpIntoLevel}%` }} />
          </div>
          <p className="text-slate-400 text-xs mb-5">
            {xpToNext} XP lagi menuju Lv.{oceanLevel + 1}
          </p>

          <div className="border-t border-slate-100 pt-4 flex justify-between text-sm">
            <div>
              <p className="text-slate-400 text-xs">Challenge diikuti</p>
              <p className="font-semibold">{summary.challengesJoined}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Challenge selesai</p>
              <p className="font-semibold">{summary.challengesCompleted}</p>
            </div>
          </div>

          <Link to="/challenges" className="block text-[#1179C4] text-sm mt-4">
            Lihat challenge →
          </Link>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Badge Saya</h2>
          <span className="text-slate-400 text-sm">
            {summary.badges.length} dari {allBadges.length} didapat
          </span>
        </div>

        {allBadges.length === 0 ? (
          <p className="text-slate-400 text-sm">Belum ada badge yang tersedia.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sortedBadges.map((badge) => {
              const earnedAt = earnedMap.get(badge.id);
              const isEarned = earnedAt !== undefined;
              const showProgress =
                !isEarned && badge.requirementType === "COMPLETED_CHALLENGE_COUNT";
              const progressPercent = Math.min(
                100,
                Math.round((summary.challengesCompleted / badge.requirementValue) * 100)
              );

              return (
                <div
                  key={badge.id}
                  className={`border rounded-xl p-4 text-center ${
                    isEarned ? "border-[#1179C4] bg-sky-50/50" : "border-slate-200"
                  }`}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-3xl overflow-hidden ${
                      isEarned ? "" : "grayscale opacity-50"
                    }`}
                  >
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                    ) : (
                      "🎖️"
                    )}
                  </div>

                  <p className={`font-semibold text-sm ${isEarned ? "" : "text-slate-500"}`}>
                    {badge.name}
                  </p>

                  {badge.description && (
                    <p className="text-slate-400 text-xs mt-1">{badge.description}</p>
                  )}

                  {isEarned ? (
                    <p className="text-green-600 text-xs font-medium mt-2">
                      Didapat{" "}
                      {new Date(earnedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  ) : (
                    <>
                      <p className="text-slate-400 text-xs mt-2">{describeRequirement(badge)}</p>
                      {showProgress && (
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-[#1179C4]" style={{ width: `${progressPercent}%` }} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Laporan Terbaru Saya</h2>
          <Link to="/my-reports" className="text-[#1179C4] text-sm">
            Lihat semua →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <p className="text-slate-400 text-sm">Belum ada laporan.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {recentReports.map((r) => (
              <Link
                key={r.id}
                to={`/reports/${r.id}`}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0 overflow-hidden">
                    {r.photos?.[0]?.fileUrl ? (
                      <img src={r.photos[0].fileUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "IMG"
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 text-xs">OG-{r.id}</span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${POLLUTION_COLORS[r.pollutionLevel]}`}
                      >
                        {POLLUTION_LABELS[r.pollutionLevel]}
                      </span>
                    </div>
                    <p className="font-medium text-sm truncate">
                      {r.locationName || `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {r.wasteTypes.map((w) => w.name).join(", ")} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${STATUS_COLORS[r.status]}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, sub, valueClass = "text-slate-900" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
      <p className="text-slate-400 text-xs mt-1">{sub}</p>
    </div>
  );
}