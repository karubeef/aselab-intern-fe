import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllReports } from "../../api/reports";
import "./Report.css";

const STATUS_LABELS = {
  SUBMITTED: "Menunggu Verifikasi",
  UNDER_REVIEW: "Sedang Ditinjau",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  IN_PROGRESS: "Sedang Ditangani",
  RESOLVED: "Selesai",
};

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "SUBMITTED", label: "Menunggu Verifikasi" },
  { value: "VERIFIED", label: "Terverifikasi" },
  { value: "IN_PROGRESS", label: "Sedang Ditangani" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
];

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  async function loadReports() {
    try {
      setLoading(true);
      const data = await getAllReports(statusFilter || undefined);
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="report-list-container">
      <div className="report-list-header">
        <h1>Laporan Sampah</h1>
        <Link to="/reports/new" className="btn-primary">
          + Buat Laporan
        </Link>
      </div>

      <div className="filter-bar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-chip ${statusFilter === f.value ? "active" : ""}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && reports.length === 0 && <p>Belum ada laporan.</p>}

      {!loading && !error && reports.length > 0 && (
        <div className="report-cards">
          {reports.map((r) => (
            <Link to={`/reports/${r.id}`} className="report-card" key={r.id}>
              <div className={`status-badge status-${r.status.toLowerCase()}`}>
                {STATUS_LABELS[r.status] || r.status}
              </div>
              <p className="report-waste-types">
                {Array.isArray(r.wasteTypes) ? r.wasteTypes.join(", ") : r.wasteTypes}
              </p>
              <p className="report-desc">{r.description || "Tanpa deskripsi"}</p>
              <p className="report-coords">
                📍 {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
              </p>
              <p className="report-date">
                {new Date(r.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}