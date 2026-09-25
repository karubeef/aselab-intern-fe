import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllReports } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import ReporterLayout from "../../components/ReporterLayout";
import { STATUS_LABELS, STATUS_COLORS, POLLUTION_LABELS, POLLUTION_COLORS } from "../../constants/report";

const STATUS_ORDER = ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function MyReports() {
  const { user } = useAuth();
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
      const allReports = await getAllReports();
      setMyReports(allReports.filter((r) => r.userId === user.id));
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
    return myReports.filter((r) => {
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const query = search.toLowerCase();
      const matchesSearch =
        query === "" ||
        `og-${r.id}`.includes(query) ||
        (r.locationName || "").toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [myReports, statusFilter, search]);

  if (loading) {
    return (
      <ReporterLayout>
        <p className="text-slate-500">Loading...</p>
      </ReporterLayout>
    );
  }

  if (error) {
    return (
      <ReporterLayout>
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</p>
      </ReporterLayout>
    );
  }

  return (
    <ReporterLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Laporan Saya</h1>
          <p className="text-slate-400 text-sm">Pantau status semua laporanmu</p>
        </div>
        <Link
          to="/reports/new"
          className="bg-[#1179C4] hover:bg-[#0f6aab] text-white font-semibold px-5 py-3 rounded-lg text-sm"
        >
          + Laporan Baru
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
        <span className="text-slate-400">🔍</span>
        <input
          type="text"
          placeholder="Cari laporan berdasarkan lokasi atau ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
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

      {filtered.length === 0 ? (
        <p className="text-slate-400 text-sm">
          {myReports.length === 0
            ? "Kamu belum pernah membuat laporan."
            : "Tidak ada laporan yang cocok dengan pencarian/filter."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0 overflow-hidden">
                {r.photos?.[0]?.fileUrl ? (
                  <img
                    src={r.photos[0].fileUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
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
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block text-xs font-medium px-3 py-1.5 rounded-full mb-1 ${STATUS_COLORS[r.status]}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
                <Link
                  to={`/reports/${r.id}`}
                  className="block text-[#1179C4] text-sm"
                >
                  Lihat detail →
                </Link>
              </div>
            </div>
          ))}
        </div>
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
          ? "bg-[#1179C4] text-white border-[#1179C4]"
          : "bg-white text-slate-600 border-slate-300"
      }`}
    >
      {label} ({count})
    </button>
  );
}