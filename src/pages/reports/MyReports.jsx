import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllReports } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import "./Report.css";

const STATUS_LABELS = {
  SUBMITTED: "Menunggu Verifikasi",
  UNDER_REVIEW: "Sedang Ditinjau",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  IN_PROGRESS: "Sedang Ditangani",
  RESOLVED: "Selesai",
};

export default function MyReports() {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyReports();
  }, []);

  async function loadMyReports() {
    try {
      setLoading(true);
      const allReports = await getAllReports();
      const filtered = allReports.filter((r) => r.userId === user.id);
      setMyReports(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const summary = {
    total: myReports.length,
    submitted: myReports.filter((r) => r.status === "SUBMITTED").length,
    verified: myReports.filter((r) => r.status === "VERIFIED").length,
    resolved: myReports.filter((r) => r.status === "RESOLVED").length,
    rejected: myReports.filter((r) => r.status === "REJECTED").length,
  };

  if (loading) return <p style={{ padding: "24px" }}>Loading...</p>;
  if (error) return <p className="auth-error" style={{ margin: "24px" }}>{error}</p>;

  return (
    <div className="report-list-container">
      <div className="report-list-header">
        <h1>Laporan Saya</h1>
        <Link to="/reports/new" className="btn-primary">
          + Buat Laporan
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <SummaryCard label="Total" value={summary.total} />
        <SummaryCard label="Menunggu" value={summary.submitted} />
        <SummaryCard label="Terverifikasi" value={summary.verified} />
        <SummaryCard label="Selesai" value={summary.resolved} />
        <SummaryCard label="Ditolak" value={summary.rejected} />
      </div>

      {myReports.length === 0 ? (
        <p>
          Kamu belum pernah membuat laporan.{" "}
          <Link to="/reports/new" style={{ color: "#1273c2" }}>
            Buat laporan pertamamu
          </Link>
          .
        </p>
      ) : (
        <div className="report-cards">
          {myReports.map((r) => (
            <Link to={`/reports/${r.id}`} className="report-card" key={r.id}>
              <div className={`status-badge status-${r.status.toLowerCase()}`}>
                {STATUS_LABELS[r.status] || r.status}
              </div>
              <p className="report-waste-types">
                {Array.isArray(r.wasteTypes) ? r.wasteTypes.join(", ") : r.wasteTypes}
              </p>
              <p className="report-desc">{r.description || "Tanpa deskripsi"}</p>
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

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "8px",
        padding: "14px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "22px", fontWeight: 700, color: "#1273c2" }}>
        {value}
      </p>
      <p style={{ fontSize: "12px", color: "#64748b" }}>{label}</p>
    </div>
  );
}