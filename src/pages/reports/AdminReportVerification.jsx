import { useState, useEffect } from "react";
import { getAllReports, verifyReport } from "../../api/reports";
import "./Report.css";

export default function AdminReportVerification() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadPendingReports();
  }, []);

  async function loadPendingReports() {
    try {
      setLoading(true);
      const data = await getAllReports("SUBMITTED");
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      setProcessingId(id);
      await verifyReport(id, "VERIFIED");
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectForm(id) {
    setRejectingId(id);
    setRejectReason("");
  }

  function cancelReject() {
    setRejectingId(null);
    setRejectReason("");
  }

  async function handleReject(id) {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      setProcessingId(id);
      await verifyReport(id, "REJECTED", rejectReason);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) return <p style={{ padding: "24px" }}>Loading...</p>;
  if (error) return <p className="auth-error" style={{ margin: "24px" }}>{error}</p>;

  return (
    <div className="report-list-container">
      <h1>Verifikasi Laporan</h1>
      <p className="form-hint" style={{ marginBottom: "20px" }}>
        {reports.length} laporan menunggu verifikasi
      </p>

      {reports.length === 0 ? (
        <p>Tidak ada laporan yang menunggu verifikasi saat ini.</p>
      ) : (
        <div className="report-cards">
          {reports.map((r) => (
            <div className="report-card verify-card" key={r.id}>
              <p className="report-waste-types">
                {Array.isArray(r.wasteTypes) ? r.wasteTypes.join(", ") : r.wasteTypes}
                {r.otherWasteType ? ` (${r.otherWasteType})` : ""}
              </p>

              <p className="report-desc">{r.description || "Tanpa deskripsi"}</p>

              {r.imageUrl && (
                <img src={r.imageUrl} alt="Foto laporan" className="verify-image" />
              )}

              <div className="verify-meta">
                <span>Oleh: {r.user?.name || "Tidak diketahui"}</span>
                <span>Kekotoran: {r.dirtyLevel}</span>
                <span>
                  📍 {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                </span>
                <span>
                  {new Date(r.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {rejectingId === r.id ? (
                <div className="reject-form">
                  <textarea
                    rows={2}
                    placeholder="Alasan penolakan..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="verify-actions">
                    <button
                      className="btn-danger"
                      onClick={() => handleReject(r.id)}
                      disabled={processingId === r.id}
                    >
                      {processingId === r.id ? "Memproses..." : "Konfirmasi Tolak"}
                    </button>
                    <button className="btn-outline-small" onClick={cancelReject}>
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="verify-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleApprove(r.id)}
                    disabled={processingId === r.id}
                  >
                    {processingId === r.id ? "Memproses..." : "Approve"}
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => openRejectForm(r.id)}
                    disabled={processingId === r.id}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}