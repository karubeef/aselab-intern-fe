import { useState, useEffect } from "react";
import { getAllReports, verifyReport } from "../../api/reports";
import ReporterLayout from "../../components/ReporterLayout";
import { POLLUTION_LABELS, POLLUTION_COLORS } from "../../constants/report";

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

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Verifikasi Laporan</h1>
        <p className="text-slate-400 text-sm">
          {reports.length} laporan menunggu verifikasi
        </p>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-slate-400 text-sm">
          Tidak ada laporan yang menunggu verifikasi saat ini.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 text-xs font-medium">
                      OG-{r.id}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${POLLUTION_COLORS[r.pollutionLevel]}`}
                    >
                      {POLLUTION_LABELS[r.pollutionLevel]}
                    </span>
                  </div>
                  <p className="font-semibold">
                    {r.wasteTypes.map((w) => w.name).join(", ")}
                    {r.customWasteType ? ` (${r.customWasteType})` : ""}
                  </p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {r.locationName || `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`}
                  </p>
                </div>

                <div className="text-right text-sm text-slate-400">
                  <p>Oleh {r.user?.name || "Tidak diketahui"}</p>
                  <p>
                    {new Date(r.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {r.description && (
                <p className="text-slate-600 text-sm mb-3">{r.description}</p>
              )}

              {r.photos?.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {r.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.fileUrl}
                      alt="Foto laporan"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              )}

              {rejectingId === r.id ? (
                <div>
                  <textarea
                    rows={2}
                    placeholder="Alasan penolakan..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4] mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={processingId === r.id}
                      className="border border-red-500 text-red-500 font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50"
                    >
                      {processingId === r.id ? "Memproses..." : "Konfirmasi Tolak"}
                    </button>
                    <button
                      onClick={cancelReject}
                      className="border border-slate-300 text-slate-600 font-medium px-5 py-2.5 rounded-lg text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(r.id)}
                    disabled={processingId === r.id}
                    className="bg-[#1179C4] hover:bg-[#0f6aab] text-white font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    {processingId === r.id ? "Memproses..." : "Approve"}
                  </button>
                  <button
                    onClick={() => openRejectForm(r.id)}
                    disabled={processingId === r.id}
                    className="border border-red-500 text-red-500 font-semibold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ReporterLayout>
  );
}