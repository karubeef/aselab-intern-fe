import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getMyReports } from "../../api/reports";
import ReporterLayout from "../../components/ReporterLayout";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  POLLUTION_LABELS,
  POLLUTION_COLORS,
} from "../../constants/report";

const STATUS_ORDER = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

export default function MyReports() {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadMyReports();
  }, []);

  async function loadMyReports() {
    try {
      setLoading(true);
      setError("");
      const data = await getMyReports();
      setMyReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const counts = useMemo(() => {
    const result = { ALL: myReports.length };
    STATUS_ORDER.forEach((status) => {
      result[status] = myReports.filter((r) => r.status === status).length;
    });
    return result;
  }, [myReports]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return myReports.filter((r) => {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesSearch =
        query === "" ||
        `og-${r.id}`.includes(query) ||
        (r.locationName || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [myReports, statusFilter, search]);

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#15316E]">Laporan Saya</h1>
        <p className="text-slate-400 text-sm">Pantau status semua laporanmu</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Cari laporan berdasarkan lokasi atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>
        <Link
          to="/reports/new"
          className="bg-[#15316E] hover:bg-[#0F2555] text-white font-semibold px-5 py-3 rounded-xl text-sm whitespace-nowrap"
        >
          + Laporan Baru
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip
          label="Semua"
          count={counts.ALL}
          active={statusFilter === "ALL"}
          onClick={() => setStatusFilter("ALL")}
        />
        {STATUS_ORDER.map((status) => (
          <FilterChip
            key={status}
            label={STATUS_LABELS[status]}
            count={counts[status]}
            active={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadMyReports} className="font-medium underline">
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat laporan...</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-500 text-sm mb-3">
            {myReports.length === 0
              ? "Kamu belum pernah membuat laporan."
              : "Tidak ada laporan yang cocok dengan pencarian atau filter."}
          </p>
          {myReports.length === 0 && (
            <Link to="/reports/new" className="text-[#1179C4] text-sm font-medium">
              Buat laporan pertamamu →
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-slate-400 text-xs mb-3">
            {filtered.length} laporan · Terbaru terlebih dahulu
          </p>

          <div className="flex flex-col gap-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0 overflow-hidden">
                  {r.photos?.[0]?.fileUrl ? (
                    <img src={r.photos[0].fileUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    "IMG"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 text-xs font-medium">OG-{r.id}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${POLLUTION_COLORS[r.pollutionLevel]}`}
                    >
                      {POLLUTION_LABELS[r.pollutionLevel]}
                    </span>
                  </div>

                  <p className="font-semibold truncate">
                    {r.locationName || `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`}
                  </p>

                  <p className="text-slate-400 text-sm">
                    {r.wasteTypes.map((w) => w.name).join(", ")} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {r.status === "REJECTED" && r.rejectReason && (
                    <p className="text-red-600 text-xs mt-1 truncate">
                      Alasan ditolak: {r.rejectReason.replace("|||", ": ")}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-xs font-medium px-3 py-1.5 rounded-full mb-1 ${STATUS_COLORS[r.status]}`}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                  <Link to={`/reports/${r.id}`} className="block text-[#1179C4] text-sm">
                    Lihat detail →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ReporterLayout>
  );
}

function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border ${
        active
          ? "bg-[#15316E] text-white border-[#15316E]"
          : "bg-white text-slate-600 border-slate-300"
      }`}
    >
      {label} ({count})
    </button>
  );
}