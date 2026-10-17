import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcons } from "../utils/leafletIconFix";
import { getAllReports } from "../api/reports";
import { useAuth } from "../context/authContext";
import ReporterLayout from "../components/ReporterLayout";
import { POLLUTION_LABELS, POLLUTION_COLORS, STATUS_LABELS, STATUS_COLORS } from "../constants/report";

fixLeafletIcons();

const INDONESIA_CENTER = [-2.5, 118];
const SEVERITY_COLORS = { LOW: "#22c55e", MODERATE: "#f97316", HIGH: "#ef4444", CRITICAL: "#ef4444" };
const WASTE_TYPE_OPTIONS = ["Plastik", "Kaca", "Logam", "Jaring / Alat Tangkap", "Organik", "Berbahaya (B3)"];
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
  if (["REJECTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"].includes(report.status)) {
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

    const critical = allReports.filter((r) => r.pollutionLevel === "CRITICAL").length;
    const sedangDiproses = allReports.filter((r) => r.status === "IN_PROGRESS").length;

    const resolved = allReports.filter((r) => r.status === "RESOLVED");
    const resolvedThisMonth = resolved.filter((r) => {
      const d = new Date(r.updatedAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const handled = allReports.filter((r) =>
      ["VERIFIED", "IN_PROGRESS", "RESOLVED"].includes(r.status)
    ).length;
    const resolutionRate = handled > 0 ? Math.round((resolved.length / handled) * 100) : 0;

    return { laporanBaru, critical, sedangDiproses, resolvedThisMonth, resolutionRate, total: allReports.length };
  }, [allReports]);

  const mapReports = useMemo(() => {
    const now = Date.now();
    return allReports
      .map((r) => ({ ...r, displayStatus: getDisplayStatus(r) }))
      .filter((r) => {
        if (!r.displayStatus) return false;
        if (appliedStatus !== "ALL" && r.displayStatus !== appliedStatus) return false;

        const matchesSeverity =
          appliedSeverities.length === 0 ||
          appliedSeverities.some((key) =>
            SEVERITY_OPTIONS.find((s) => s.key === key)?.levels.includes(r.pollutionLevel)
          );
        if (!matchesSeverity) return false;

        if (appliedDateRange !== 0) {
          const days = (now - new Date(r.createdAt).getTime()) / 86400000;
          if (days > appliedDateRange) return false;
        }

        const query = appliedSearch.toLowerCase();
        if (query && !(r.locationName || "").toLowerCase().includes(query)) return false;

        return true;
      });
  }, [allReports, appliedStatus, appliedSeverities, appliedDateRange, appliedSearch]);

  function toggleDraftSeverity(key) {
    setDraftSeverities((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
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

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const latestReports = allReports.slice(0, 2);
  const statusLabel = STATUS_FILTER_OPTIONS.find((o) => o.value === draftStatus)?.label;

  return (
    <ReporterLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#15316E]">Selamat datang, {user?.name}! 👋</h1>
          <p className="text-slate-400 text-sm">{today} · Bandung, Indonesia</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#15316E] text-white rounded-full pl-1.5 pr-4 py-1.5">
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </span>
            <span className="text-sm font-medium">{user?.name?.split(" ")[0]}</span>
          </div>
        </div>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Memuat data...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <StatCard value={stats.laporanBaru} label="Laporan Baru" sub="Hari ini" valueClass="text-[#1179C4]" badge="↑" />
            <StatCard value={stats.critical} label="Critical" sub="Perlu perhatian" valueClass="text-red-600" badge="!" />
            <StatCard value={stats.sedangDiproses} label="Sedang Diproses" sub="Oleh tim lapangan" valueClass="text-orange-500" />
            <StatCard value={stats.resolvedThisMonth} label="Selesai Bulan Ini" sub={`Resolusi Rate ${stats.resolutionRate}%`} valueClass="text-green-600" />
            <StatCard value={stats.total} label="Total Laporan" sub="Semua waktu" valueClass="text-slate-900" />
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-semibold">Peta Hotspot Laporan</h2>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-72">
                <span className="text-slate-400">🔍</span>
                <input
                  placeholder="Cari nama pantai, teluk, atau desa..."
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1"
                />
              </div>
            </div>

            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-200" style={{ minHeight: 320 }}>
                <MapContainer center={INDONESIA_CENTER} zoom={5} className="w-full h-full" style={{ minHeight: 320 }}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {mapReports.map((r) => {
                    const pinIcon = createStatusPinIcon(r.displayStatus);
                    if (pinIcon) {
                      return <Marker key={r.id} position={[r.latitude, r.longitude]} icon={pinIcon} />;
                    }
                    const color = SEVERITY_COLORS[r.pollutionLevel] || SEVERITY_COLORS.LOW;
                    return (
                      <CircleMarker
                        key={r.id}
                        center={[r.latitude, r.longitude]}
                        radius={12}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
                      />
                    );
                  })}
                </MapContainer>
              </div>

              <div className="w-full lg:w-72 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Filter</h3>
                  <button onClick={handleResetFilter} className="text-[#1179C4] text-xs">Reset</button>
                </div>

                <p className="text-slate-400 text-xs font-medium tracking-wide mb-1">TAMPILKAN STATUS</p>
                <div className="relative mb-3">
                  <button
                    onClick={() => setStatusDropdownOpen((o) => !o)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between bg-white"
                  >
                    {statusLabel}
                    <span className="text-slate-400">{statusDropdownOpen ? "▲" : "▼"}</span>
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute z-[1000] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      {STATUS_FILTER_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => {
                            setDraftStatus(o.value);
                            setStatusDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 ${
                            draftStatus === o.value ? "text-[#1179C4] font-medium" : "text-slate-600"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-xs font-medium tracking-wide mb-2">JENIS SAMPAH</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-3 opacity-40">
                  {WASTE_TYPE_OPTIONS.map((w) => (
                    <label key={w} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <input type="checkbox" disabled /> {w}
                    </label>
                  ))}
                </div>

                <p className="text-slate-400 text-xs font-medium tracking-wide mb-2">TINGKAT KEPARAHAN</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {SEVERITY_OPTIONS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => toggleDraftSeverity(s.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                        draftSeverities.includes(s.key)
                          ? "bg-[#15316E] text-white border-[#15316E]"
                          : "bg-white text-[#15316E] border-[#15316E]"
                      }`}
                    >
                      {s.key}
                    </button>
                  ))}
                </div>

                <p className="text-slate-400 text-xs font-medium tracking-wide mb-1">RENTANG TANGGAL</p>
                <select
                  value={draftDateRange}
                  onChange={(e) => setDraftDateRange(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3"
                >
                  {DATE_RANGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <button
                  onClick={handleApplyFilter}
                  className="w-full bg-[#15316E] hover:bg-[#0F2555] text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Laporan Terbaru</h3>
                <Link to="/admin/manage-reports" className="text-[#1179C4] text-sm">Lihat semua →</Link>
              </div>
              {latestReports.length === 0 ? (
                <p className="text-slate-400 text-sm">Belum ada laporan.</p>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {latestReports.map((r) => (
                    <Link to={`/reports/${r.id}`} key={r.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs overflow-hidden shrink-0">
                          {r.photos?.[0]?.fileUrl ? (
                            <img src={r.photos[0].fileUrl} alt="" className="w-full h-full object-cover" />
                          ) : "IMG"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-slate-400 text-xs">OG-{r.id}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${POLLUTION_COLORS[r.pollutionLevel]}`}>
                              {POLLUTION_LABELS[r.pollutionLevel]}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{r.locationName || `${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}`}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Aktivitas Tim</h3>
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center">
                <p className="text-slate-400 text-xs">
                  Fitur log aktivitas tim belum tersedia — menunggu endpoint backend untuk mencatat riwayat tindakan admin/handler.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </ReporterLayout>
  );
}

function StatCard({ value, label, sub, valueClass, badge }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 relative">
      {badge && (
        <span className="absolute top-3 right-3 text-xs bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-slate-400 text-xs">{sub}</p>
    </div>
  );
}