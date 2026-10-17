import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllReports } from "../../api/reports";
import { getLocalResolution } from "../../utils/localResolution";
import { getCurrentStage, STAGE_LABELS, STAGE_COLORS } from "../../utils/reportStage";
import ReporterLayout from "../../components/ReporterLayout";
import { POLLUTION_LABELS } from "../../constants/report";

const POLLUTION_DOTS = { LOW: "#22c55e", MODERATE: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444" };

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua status" },
  { value: "SUBMITTED", label: "Terkirim" },
  { value: "UNDER_REVIEW", label: "Sedang Ditinjau" },
  { value: "VERIFIED", label: "Terverifikasi" },
  { value: "IN_PROGRESS", label: "Sedang Ditangani" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
];

export default function AdminManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState("ALL");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("ALL");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const enrichedReports = useMemo(() => {
    return reports
      .map((r) => {
        const local = getLocalResolution(r.id);
        return { ...r, stage: getCurrentStage(r, local) };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports]);

  const filteredReports = useMemo(() => {
    const query = appliedSearch.toLowerCase();
    return enrichedReports.filter((r) => {
      const matchesStatus = appliedStatus === "ALL" || r.stage === appliedStatus;
      const matchesQuery =
        query === "" ||
        `og-${r.id}`.includes(query) ||
        (r.locationName || "").toLowerCase().includes(query) ||
        (r.user?.name || "").toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [enrichedReports, appliedSearch, appliedStatus]);

  function handleApply() {
    setAppliedSearch(draftSearch);
    setAppliedStatus(draftStatus);
  }

  return (
    <ReporterLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#15316E]">Kelola Laporan</h1>
          <p className="text-slate-400 text-sm">Tinjau laporan dan pantau penanganannya</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#15316E] text-white rounded-full pl-1.5 pr-4 py-1.5">
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">R</span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cari laporan</label>
          <input
            type="text"
            placeholder="Cari ID, lokasi, atau reporter..."
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none w-48"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleApply}
          className="bg-[#15316E] hover:bg-[#0F2555] text-white font-semibold px-6 py-3 rounded-lg text-sm"
        >
          Terapkan
        </button>
      </div>

      {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Memuat data...</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold">{filteredReports.length} laporan</span>
            <span className="text-slate-400 text-sm">Terbaru terlebih dahulu</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">Laporan & Lokasi</th>
                  <th className="px-5 py-3 font-medium">Reporter</th>
                  <th className="px-5 py-3 font-medium">Keparahan</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-4">
                      <p className="text-slate-400 text-xs">OG-{r.id}</p>
                      <p className="font-semibold">{r.locationName || `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`}</p>
                    </td>
                    <td className="px-5 py-4">{r.user?.name || "Tidak diketahui"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 border border-slate-200 rounded-full px-3 py-1 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: POLLUTION_DOTS[r.pollutionLevel] }} />
                        {POLLUTION_LABELS[r.pollutionLevel]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STAGE_COLORS[r.stage]}`}>
                        {STAGE_LABELS[r.stage]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/manage-reports/${r.id}`} className="text-[#1179C4] font-medium">
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ReporterLayout>
  );
}