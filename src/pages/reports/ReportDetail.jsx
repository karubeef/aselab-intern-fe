import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getReportById, deleteReport } from "../../api/reports";
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

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    try {
      setLoading(true);
      const data = await getReportById(id);
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Yakin ingin menghapus laporan ini?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteReport(id);
      navigate("/reports");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) return <p style={{ padding: "24px" }}>Loading...</p>;
  if (error) return <p className="auth-error" style={{ margin: "24px" }}>{error}</p>;
  if (!report) return null;

  const isOwner = user?.id === report.user?.id;
  const canModify = isOwner && report.status === "SUBMITTED";

  return (
    <div className="report-detail-container">
      <Link to="/reports" className="back-link">
        ← Kembali ke daftar laporan
      </Link>

      <div className={`status-badge status-${report.status.toLowerCase()}`}>
        {STATUS_LABELS[report.status] || report.status}
      </div>

      <h1>
        {Array.isArray(report.wasteTypes)
          ? report.wasteTypes.join(", ")
          : report.wasteTypes}
      </h1>

      {report.imageUrl && (
        <img src={report.imageUrl} alt="Foto laporan" className="report-detail-image" />
      )}

      <div className="report-detail-info">
        <div>
          <strong>Dilaporkan oleh</strong>
          <p>{report.user?.name || "Tidak diketahui"}</p>
        </div>

        <div>
          <strong>Tingkat Kekotoran</strong>
          <p>{report.dirtyLevel}</p>
        </div>

        <div>
          <strong>Lokasi</strong>
          <p>
            {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
          </p>
        </div>

        <div>
          <strong>Deskripsi</strong>
          <p>{report.description || "Tidak ada deskripsi"}</p>
        </div>

        {report.status === "REJECTED" && report.rejectReason && (
          <div>
            <strong>Alasan Ditolak</strong>
            <p className="auth-error" style={{ margin: 0 }}>
              {report.rejectReason}
            </p>
          </div>
        )}

        <div>
          <strong>Dibuat pada</strong>
          <p>
            {new Date(report.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {canModify && (
        <div className="report-detail-actions">
          <Link to={`/reports/${id}/edit`} className="btn-outline">
            Edit Laporan
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-danger"
          >
            {isDeleting ? "Menghapus..." : "Hapus Laporan"}
          </button>
        </div>
      )}

      {isOwner && report.status !== "SUBMITTED" && (
        <p className="form-hint" style={{ marginTop: "16px" }}>
          Laporan ini sudah dalam proses peninjauan, tidak bisa diubah/dihapus lagi.
        </p>
      )}
    </div>
  );
}