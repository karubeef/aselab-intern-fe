import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcons } from "../../utils/leafletIconFix";
import { getReportById, verifyReport, updateReportStatus } from "../../api/reports";
import { getLocalResolution, setLocalResolution } from "../../utils/localResolution";
import { getCurrentStage, getStagePath, STAGE_LABELS, STAGE_COLORS } from "../../utils/reportStage";
import ReporterLayout from "../../components/ReporterLayout";
import { POLLUTION_LABELS } from "../../constants/report";

fixLeafletIcons();

const REJECT_REASONS = ["Foto tidak jelas", "Informasi tidak sesuai", "Lainnya"];

export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checklist, setChecklist] = useState({ a: false, b: false, c: false });
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectPreset, setRejectPreset] = useState("");
  const [rejectExplanation, setRejectExplanation] = useState("");
  const [rejectTouched, setRejectTouched] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveTouched, setResolveTouched] = useState(false);
  const [resolving, setResolving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getReportById(id);
      setReport(data);
      setLocal(getLocalResolution(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function persistLocal(next) {
    setLocalResolution(id, next);
    setLocal(next);
  }

  async function handleMulaiTinjau() {
      try {
        await updateReportStatus(id, "UNDER_REVIEW");
        await load();
        } catch (err) {
            alert(err.message);
        }
    }

  const allChecked = checklist.a && checklist.b && checklist.c;

  async function handleKonfirmasiVerifikasi() {
    setVerifying(true);
    try {
        await verifyReport(id, "VERIFIED");
        await load();
        } catch (err) {
            alert(err.message);
        } finally {
        setVerifying(false);
    }
  }

   
  async function handleKonfirmasiPenolakan() {
    setRejectTouched(true);
    if (!rejectPreset) return;

    setRejecting(true);

    try {
      const combined = rejectExplanation.trim()
        ? `${rejectPreset}: ${rejectExplanation.trim()}`
        : rejectPreset;

      await verifyReport(id, "REJECTED", combined);

      setShowRejectForm(false);
      setRejectPreset("");
      setRejectExplanation("");
      setRejectTouched(false);

      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setRejecting(false);
    }
  }

  async function handleMulaiPenanganan() {
    try {
        await updateReportStatus(id, "IN_PROGRESS");
        await load();
    } catch (err) {
        alert(err.message);
    }
  }

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setResolutionPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleTandaiSelesai() {
    setResolveTouched(true);
    if (!resolutionPhoto || !resolutionNote.trim()) return;
    setResolving(true);
    try {
        await updateReportStatus(id, "RESOLVED");
        persistLocal({
        photo: resolutionPhoto,
        note: resolutionNote,
        resolvedAt: new Date().toISOString(),
        });
        await load();
    } catch (err) {
        alert(err.message);
    } finally {
        setResolving(false);
    }
  }

  if (loading) {
    return (
      <ReporterLayout>
        <p className="text-slate-500">Loading...</p>
      </ReporterLayout>
    );
  }

  if (error || !report) {
    return (
      <ReporterLayout>
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</p>
      </ReporterLayout>
    );
  }

  const stage = getCurrentStage(report);
  const path = getStagePath(report);
  const riwayatText = path.map((s) => STAGE_LABELS[s]).join(" → ");

    let rejectPresetDisplay = "";
    let rejectExplanationDisplay = "";
    if (report.status === "REJECTED" && report.rejectReason) {
        const cleaned = report.rejectReason.replace("|||", ": ");
        const separatorIndex = cleaned.indexOf(": ");
        rejectPresetDisplay = separatorIndex === -1 ? cleaned : cleaned.slice(0, separatorIndex);
        rejectExplanationDisplay = separatorIndex === -1 ? "" : cleaned.slice(separatorIndex + 2);
    }

  return (
    <ReporterLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#15316E]">Kelola Laporan</h1>
          <p className="text-slate-400 text-sm">Tinjau laporan dan pantau penanganannya</p>
        </div>
      </div>

      <Link
        to="/admin/manage-reports"
        className="inline-block border border-[#1179C4] text-[#1179C4] font-semibold px-5 py-2.5 rounded-lg text-sm mb-5"
      >
        Kembali ke Daftar Laporan
      </Link>

      <div className="border border-slate-200 rounded-xl p-6 mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold mb-1">
            OG-{report.id} · {report.locationName || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
          </h2>
          <p className="text-slate-400 text-sm mb-1">
            {report.user?.name || "Tidak diketahui"} ·{" "}
            {new Date(report.createdAt).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}{" "}WIB
          </p>
          <p className="text-slate-600 text-sm">
            {report.wasteTypes.map((w) => w.name).join(", ")} · Tingkat kekotoran: {POLLUTION_LABELS[report.pollutionLevel]}
          </p>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${STAGE_COLORS[stage]}`}>
          {STAGE_LABELS[stage]}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Foto laporan · {report.photos?.length || 0} foto</h3>
              {report.photos?.length > 0 ? (
                <img src={report.photos[0].fileUrl} alt="Foto laporan" className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-48 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                  Belum ada foto
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Lokasi laporan</h3>
              <div className="h-48 rounded-lg overflow-hidden mb-2">
                <MapContainer center={[report.latitude, report.longitude]} zoom={13} className="w-full h-full" scrollWheelZoom={false}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[report.latitude, report.longitude]} />
                </MapContainer>
              </div>
              <p className="text-slate-400 text-sm">{report.latitude.toFixed(3)}, {report.longitude.toFixed(3)}</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold mb-3">Deskripsi reporter</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{report.description || "Tidak ada deskripsi"}</p>
          </div>

            {stage === "VERIFIED" && (
                <div className="bg-green-50 rounded-xl p-5">
                    <p className="text-green-700 font-semibold mb-1">Verifikasi berhasil</p>
                    <p className="text-green-700 text-sm">Status laporan diperbarui dan reporter menerima notifikasi.</p>
                </div>
            )}

            {stage === "RESOLVED" && local && (
                <div className="bg-green-50 rounded-xl p-5">
                    <p className="text-green-700 font-semibold mb-1">Laporan selesai</p>
                    <p className="text-green-700 text-sm">Bukti dan catatan penyelesaian tersimpan.</p>
                </div>
            )}

            {stage === "RESOLVED" && !local && (
                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-semibold mb-2">Hasil penyelesaian</h3>
                    <p className="text-slate-400 text-sm">
                    Bukti dan catatan penyelesaian tidak tersimpan di perangkat ini.
                    </p>
                </div>
            )}

            {stage === "REJECTED" && (
                <div className="bg-red-50 rounded-xl p-5">
                    <p className="text-red-600 font-semibold mb-1">Laporan ditolak</p>
                    <p className="text-red-600 text-sm">Alasan penolakan tetap tersimpan pada riwayat reporter.</p>
                </div>
            )}

          <div className="border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Riwayat status</h3>
            <p className="text-slate-500 text-sm">{riwayatText}</p>
          </div>
        </div>

        <div>
            {stage === "SUBMITTED" && (
                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-semibold mb-3">Tindakan admin</h3>
                    <p className="text-slate-500 text-sm mb-4">Mulai tinjau untuk memeriksa bukti dan lokasi laporan.</p>
                <button
                    onClick={handleMulaiTinjau}
                    className="w-full bg-[#15316E] hover:bg-[#0F2555] text-white font-semibold py-3 rounded-lg text-sm"
                >
                Mulai Tinjau
                </button>
                </div>
            )}

            {stage === "UNDER_REVIEW" && !showRejectForm && (
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Tindakan admin</h3>
              <p className="text-slate-500 text-sm font-medium mb-2">Checklist verifikasi</p>
              <div className="flex flex-col gap-2 mb-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={checklist.a} onChange={(e) => setChecklist((c) => ({ ...c, a: e.target.checked }))} />
                  Foto jelas dan relevan
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={checklist.b} onChange={(e) => setChecklist((c) => ({ ...c, b: e.target.checked }))} />
                  Koordinat sesuai lokasi
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={checklist.c} onChange={(e) => setChecklist((c) => ({ ...c, c: e.target.checked }))} />
                  Informasi laporan konsisten
                </label>
              </div>
              <button
                onClick={handleKonfirmasiVerifikasi}
                disabled={!allChecked || verifying}
                className="w-full bg-[#15316E] hover:bg-[#0F2555] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-lg text-sm mb-3"
              >
                {verifying ? "Memproses..." : "Konfirmasi Verifikasi"}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg text-sm"
              >
                Tolak Laporan
              </button>
            </div>
            )}

            {stage === "UNDER_REVIEW" && showRejectForm && (
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Penolakan laporan</h3>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alasan penolakan *</label>
              <select
                value={rejectPreset}
                onChange={(e) => setRejectPreset(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none mb-1 ${
                  rejectTouched && !rejectPreset ? "border-red-400" : "border-slate-300"
                }`}
              >
                <option value="">Pilih alasan</option>
                {REJECT_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {rejectTouched && !rejectPreset && (
                <p className="text-red-500 text-xs mb-3">Alasan penolakan wajib diisi.</p>
              )}

              <label className="block text-sm font-medium text-slate-700 mb-1.5 mt-2">Penjelasan untuk reporter</label>
              <textarea
                rows={3}
                value={rejectExplanation}
                onChange={(e) => setRejectExplanation(e.target.value)}
                placeholder="Tambahkan penjelasan..."
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none mb-4"
              />

              <button
                onClick={handleKonfirmasiPenolakan}
                disabled={rejecting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg text-sm mb-3"
              >
                {rejecting ? "Memproses..." : "Konfirmasi Penolakan"}
              </button>
              <button
                onClick={() => setShowRejectForm(false)}
                className="w-full border border-[#1179C4] text-[#1179C4] font-semibold py-3 rounded-lg text-sm"
              >
                Batal
              </button>
            </div>
            )}

            {stage === "VERIFIED" && (
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Tindakan admin</h3>
              <p className="text-slate-500 text-sm mb-4">Laporan sudah terverifikasi dan siap ditangani.</p>
              <button
                onClick={handleMulaiPenanganan}
                className="w-full bg-[#15316E] hover:bg-[#0F2555] text-white font-semibold py-3 rounded-lg text-sm"
              >
                Mulai Penanganan
              </button>
            </div>
            )}

            {stage === "IN_PROGRESS" && (
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Tindakan admin</h3>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto penyelesaian *</label>
              {resolutionPhoto ? (
                <div className="mb-2">
                  <img src={resolutionPhoto} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-1" />
                  <p className="text-slate-400 text-xs">1 foto siap disimpan</p>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border rounded-lg py-3 text-sm font-medium text-[#1179C4] mb-1 ${
                    resolveTouched && !resolutionPhoto ? "border-red-400" : "border-[#1179C4]"
                  }`}
                >
                  Unggah Foto
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />

              <label className="block text-sm font-medium text-slate-700 mb-1.5 mt-4">Catatan penyelesaian *</label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Tuliskan hasil penanganan..."
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none mb-1 ${
                  resolveTouched && !resolutionNote.trim() ? "border-red-400" : "border-slate-300"
                }`}
              />
              {resolveTouched && (!resolutionPhoto || !resolutionNote.trim()) && (
                <p className="text-red-500 text-xs mb-3">Foto dan catatan wajib dilengkapi.</p>
              )}

              <button
                onClick={handleTandaiSelesai}
                disabled={resolving}
                className="w-full bg-[#15316E] hover:bg-[#0F2555] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-lg text-sm mt-3"
              >
                {resolving ? "Menyimpan..." : "Tandai Selesai"}
              </button>
            </div>
            )}

            {stage === "RESOLVED" && local && (
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-1">Hasil penyelesaian</h3>
              <p className="text-green-600 text-sm mb-3">
                Diselesaikan{" "}
                {new Date(local.resolvedAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}{" "}WIB
              </p>
              <img src={local.photo} alt="Hasil penyelesaian" className="w-full rounded-lg mb-4" />
              <p className="font-semibold text-sm mb-1">Catatan penyelesaian</p>
              <p className="text-slate-600 text-sm">{local.note}</p>
            </div>
            )}

            {stage === "REJECTED" && (
            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Penolakan laporan</h3>
              <p className="text-red-600 font-medium text-sm mb-2">Alasan: {rejectPresetDisplay}</p>
              <p className="text-slate-600 text-sm mb-3">{rejectExplanationDisplay}</p>
              <p className="text-slate-400 text-xs">
                Ditolak{" "}
                {new Date(report.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}{" "}WIB
              </p>
            </div>
            )}
        </div>
      </div>
    </ReporterLayout>
  );
}