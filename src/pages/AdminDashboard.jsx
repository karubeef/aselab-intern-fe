
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { fixLeafletIcons } from "../utils/leafletIconFix";
import { getAllReports } from "../api/reports";
import { useAuth } from "../context/authContext";
import ReporterLayout from "../components/ReporterLayout";
import {
  POLLUTION_LABELS,
  POLLUTION_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "../constants/report";

fixLeafletIcons();

const INDONESIA_CENTER = [-2.5, 118];

const SEVERITY_COLORS = {
  LOW: "#22c55e",
  MODERATE: "#f97316",
  HIGH: "#ef4444",
  CRITICAL: "#ef4444",
};

const WASTE_TYPE_OPTIONS = [
  "Plastik",
  "Kaca",
  "Logam",
  "Jaring / Alat Tangkap",
  "Organik",
  "Berbahaya (B3)",
];

const SEVERITY_OPTIONS = [
  { key: "Rendah", levels: ["LOW"] },
  { key: "Sedang", levels: ["MODERATE"] },
  { key: "Tinggi", levels: ["HIGH", "CRITICAL"] },
];

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "VERIFIED", label: "Terverifikasi" },
  { value: "IN_PROGRESS", label: "Sedang Proses" },
  { value: "RESOLVED", label: "Telah Diselesaikan" },
  { value: "REJECTED", label: "Ditolak" },
];

const DATE_RANGE_OPTIONS = [
  { value: 7, label: "7 Hari Terakhir" },
  { value: 30, label: "30 Hari Terakhir" },
  { value: 90, label: "90 Hari Terakhir" },
  { value: 0, label: "Semua Waktu" },
];

function getDisplayStatus(report) {
  if (
    ["REJECTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"].includes(
      report.status
    )
  ) {
    return report.status;
  }

  return null;
}

function createStatusPinIcon(displayStatus) {
  const config = {
    IN_PROGRESS: { bg: "#f97316", icon: "⚙" },
    RESOLVED: { bg: "#22c55e", icon: "✓" },
    REJECTED: { bg: "#ef4444", icon: "✕" },
  }[displayStatus];

  if (!config) return null;

  return L.divIcon({
    html: `<div style="background:${config.bg};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);">
      <span style="transform:rotate(45deg);color:white;font-size:13px;font-weight:bold;">${config.icon}</span>
    </div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [appliedStatus, setAppliedStatus] = useState("ALL");
  const [appliedSeverities, setAppliedSeverities] = useState([]);
  const [appliedDateRange, setAppliedDateRange] = useState(30);
  const [appliedSearch, setAppliedSearch] = useState("");

  const [draftStatus, setDraftStatus] = useState("ALL");
  const [draftSeverities, setDraftSeverities] = useState([]);
  const [draftDateRange, setDraftDateRange] = useState(30);
  const [draftSearch, setDraftSearch] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const reports = await getAllReports();
      setAllReports(reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const laporanBaru = allReports.filter(
      (r) => new Date(r.createdAt).toDateString() === todayStr
    ).length;

    const critical = allReports.filter(
      (r) => r.pollutionLevel === "CRITICAL"
    ).length;

    const sedangDiproses = allReports.filter(
      (r) => r.status === "IN_PROGRESS"
    ).length;

    const resolved = allReports.filter(
      (r) => r.status === "RESOLVED"
    );

    const resolvedThisMonth = resolved.filter((r) => {
      const d = new Date(r.updatedAt);
      return (
        d.getMonth() === thisMonth &&
        d.getFullYear() === thisYear
      );
    }).length;

    const handled = allReports.filter((r) =>
      ["VERIFIED", "IN_PROGRESS", "RESOLVED"].includes(r.status)
    ).length;

    const resolutionRate =
      handled > 0
        ? Math.round((resolved.length / handled) * 100)
        : 0;

    return {
      laporanBaru,
      critical,
      sedangDiproses,
      resolvedThisMonth,
      resolutionRate,
      total: allReports.length,
    };
  }, [allReports]);

  const mapReports = useMemo(() => {
    const now = Date.now();

    return allReports
      .map((r) => ({
        ...r,
        displayStatus: getDisplayStatus(r),
      }))
      .filter((r) => {
        if (!r.displayStatus) return false;

        if (
          appliedStatus !== "ALL" &&
          r.displayStatus !== appliedStatus
        ) {
          return false;
        }

        const matchesSeverity =
          appliedSeverities.length === 0 ||
          appliedSeverities.some((key) =>
            SEVERITY_OPTIONS.find(
              (s) => s.key === key
            )?.levels.includes(r.pollutionLevel)
          );

        if (!matchesSeverity) return false;

        if (appliedDateRange !== 0) {
          const days =
            (now - new Date(r.createdAt).getTime()) / 86400000;

          if (days > appliedDateRange) return false;
        }

        const query = appliedSearch.toLowerCase();

        if (
          query &&
          !(r.locationName || "").toLowerCase().includes(query)
        ) {
          return false;
        }

        return true;
      });
  }, [
    allReports,
    appliedStatus,
    appliedSeverities,
    appliedDateRange,
    appliedSearch,
  ]);

  function toggleDraftSeverity(key) {
    setDraftSeverities((prev) =>
      prev.includes(key)
        ? prev.filter((s) => s !== key)
        : [...prev, key]
    );
  }

  function handleApplyFilter() {
    setAppliedStatus(draftStatus);
    setAppliedSeverities(draftSeverities);
    setAppliedDateRange(draftDateRange);
    setAppliedSearch(draftSearch);
  }

  function handleResetFilter() {
    setDraftStatus("ALL");
    setDraftSeverities([]);
    setDraftDateRange(30);
    setDraftSearch("");

    setAppliedStatus("ALL");
    setAppliedSeverities([]);
    setAppliedDateRange(30);
    setAppliedSearch("");
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const latestReports = allReports.slice(0, 2);

  const statusLabel = STATUS_FILTER_OPTIONS.find(
    (o) => o.value === draftStatus
  )?.label;

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#15316E]">
          Selamat datang, {user?.name}! 👋
        </h1>

        <p className="text-sm text-slate-400">
          {today} · Bandung, Indonesia
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat data...</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard
              value={stats.laporanBaru}
              label="Laporan Baru"
              sub="Hari ini"
              valueClass="text-[#1179C4]"
              badge="↑"
            />

            <StatCard
              value={stats.critical}
              label="Critical"
              sub="Perlu perhatian"
              valueClass="text-red-600"
              badge="!"
            />

            <StatCard
              value={stats.sedangDiproses}
              label="Sedang Diproses"
              sub="Oleh tim lapangan"
              valueClass="text-orange-500"
            />

            <StatCard
              value={stats.resolvedThisMonth}
              label="Selesai Bulan Ini"
              sub={`Resolusi Rate ${stats.resolutionRate}%`}
              valueClass="text-green-600"
            />

            <StatCard
              value={stats.total}
              label="Total Laporan"
              sub="Semua waktu"
              valueClass="text-slate-900"
            />
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">
                Peta Hotspot Laporan
              </h2>

              <div className="flex w-72 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-slate-400">🔍</span>

                <input
                  placeholder="Cari nama pantai, teluk, atau desa..."
                  value={draftSearch}
                  onChange={(e) =>
                    setDraftSearch(e.target.value)
                  }
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div
                className="flex-1 overflow-hidden rounded-xl border border-slate-200"
                style={{ minHeight: 320 }}
              >
                <MapContainer
                  center={INDONESIA_CENTER}
                  zoom={5}
                  className="h-full w-full"
                  style={{ minHeight: 320 }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {mapReports.map((r) => {
                    const pinIcon = createStatusPinIcon(
                      r.displayStatus
                    );

                    if (pinIcon) {
                      return (
                        <Marker
                          key={r.id}
                          position={[r.latitude, r.longitude]}
                          icon={pinIcon}
                        />
                      );
                    }

                    const color =
                      SEVERITY_COLORS[r.pollutionLevel] ||
                      SEVERITY_COLORS.LOW;

                    return (
                      <CircleMarker
                        key={r.id}
                        center={[r.latitude, r.longitude]}
                        radius={12}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: 0.6,
                        }}
                      />
                    );
                  })}
                </MapContainer>
              </div>

              <div className="w-full shrink-0 lg:w-72">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Filter
                  </h3>

                  <button
                    onClick={handleResetFilter}
                    className="text-xs text-[#1179C4]"
                  >
                    Reset
                  </button>
                </div>

                <p className="mb-1 text-xs font-medium tracking-wide text-slate-400">
                  TAMPILKAN STATUS
                </p>

                <div className="relative mb-3">
                  <button
                    onClick={() =>
                      setStatusDropdownOpen((o) => !o)
                    }
                    className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm"
                  >
                    {statusLabel}

                    <span className="text-slate-400">
                      {statusDropdownOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {statusDropdownOpen && (
                    <div className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                      {STATUS_FILTER_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => {
                            setDraftStatus(o.value);
                            setStatusDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                            draftStatus === o.value
                              ? "font-medium text-[#1179C4]"
                              : "text-slate-600"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="mb-2 text-xs font-medium tracking-wide text-slate-400">
                  JENIS SAMPAH
                </p>

                <div className="mb-3 grid grid-cols-2 gap-x-2 gap-y-1.5 opacity-40">
                  {WASTE_TYPE_OPTIONS.map((w) => (
                    <label
                      key={w}
                      className="flex items-center gap-1.5 text-xs text-slate-600"
                    >
                      <input type="checkbox" disabled />
                      {w}
                    </label>
                  ))}
                </div>

                <p className="mb-2 text-xs font-medium tracking-wide text-slate-400">
                  TINGKAT KEPARAHAN
                </p>

                <div className="mb-3 flex flex-wrap gap-2">
                  {SEVERITY_OPTIONS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() =>
                        toggleDraftSeverity(s.key)
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        draftSeverities.includes(s.key)
                          ? "border-[#15316E] bg-[#15316E] text-white"
                          : "border-[#15316E] bg-white text-[#15316E]"
                      }`}
                    >
                      {s.key}
                    </button>
                  ))}
                </div>

                <p className="mb-1 text-xs font-medium tracking-wide text-slate-400">
                  RENTANG TANGGAL
                </p>

                <select
                  value={draftDateRange}
                  onChange={(e) =>
                    setDraftDateRange(Number(e.target.value))
                  }
                  className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {DATE_RANGE_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                    >
                      {o.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleApplyFilter}
                  className="w-full rounded-lg bg-[#15316E] py-2.5 text-sm font-semibold text-white hover:bg-[#0F2555]"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  Laporan Terbaru
                </h3>

                <Link
                  to="/admin/manage-reports"
                  className="text-sm text-[#1179C4]"
                >
                  Lihat semua →
                </Link>
              </div>

              {latestReports.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Belum ada laporan.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {latestReports.map((r) => (
                    <Link
                      to={`/reports/${r.id}`}
                      key={r.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xs text-slate-400">
                          {r.photos?.[0]?.fileUrl ? (
                            <img
                              src={r.photos[0].fileUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            "IMG"
                          )}
                        </div>

                        <div>
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                              OG-{r.id}
                            </span>

                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${POLLUTION_COLORS[r.pollutionLevel]}`}
                            >
                              {POLLUTION_LABELS[r.pollutionLevel]}
                            </span>
                          </div>

                          <p className="text-sm font-medium">
                            {r.locationName ||
                              `${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}`}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[r.status]}`}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 font-semibold">
                Aktivitas Tim
              </h3>

              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-xs text-slate-400">
                  Fitur log aktivitas tim belum tersedia —
                  menunggu endpoint backend untuk mencatat
                  riwayat tindakan admin/handler.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </ReporterLayout>
  );
}

function StatCard({
  value,
  label,
  sub,
  valueClass,
  badge,
}) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4">
      {badge && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs">
          {badge}
        </span>
      )}

      <p className={`text-2xl font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="text-sm font-medium">
        {label}
      </p>

      <p className="text-xs text-slate-400">
        {sub}
      </p>
    </div>
  );
}
