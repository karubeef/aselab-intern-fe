import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcons } from "../../utils/leafletIconFix";
import { getReportById, deleteReport } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import ReporterLayout from "../../components/ReporterLayout";
import { STATUS_LABELS, STATUS_COLORS, POLLUTION_LABELS, POLLUTION_COLORS } from "../../constants/report";

fixLeafletIcons();

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

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
      navigate("/my-reports");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

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

  if (!report) return null;

  const isOwner = user?.id === report.user?.id;
  const canModify = isOwner && report.status === "SUBMITTED";
  const photos = report.photos || [];

  return (
    <ReporterLayout>
      <div className="text-sm text-slate-400 mb-4">
        <Link to="/my-reports" className="hover:underline">← Kembali</Link>
        {" · "}
        <span className="text-slate-600 font-medium">OG-{report.id}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-400 text-sm font-medium">OG-{report.id}</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${POLLUTION_COLORS[report.pollutionLevel]}`}
            >
              {POLLUTION_LABELS[report.pollutionLevel]}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[report.status]}`}
            >
              {STATUS_LABELS[report.status]}
            </span>
          </div>
          <h1 className="text-xl font-bold mb-1">
            {report.locationName || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
          </h1>
          <p className="text-slate-400 text-sm">
            Dilaporkan pada{" "}
            {new Date(report.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            WIB
          </p>
        </div>

        <div className="text-right">
          <p className="text-slate-400 text-xs mb-1">Jenis Sampah</p>
          <p className="font-semibold">
            {report.wasteTypes.map((w) => w.name).join(", ")}
            {report.customWasteType ? ` (${report.customWasteType})` : ""}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Foto Bukti */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Foto Bukti</h2>

          {photos.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-lg h-56 flex items-center justify-center text-slate-400 text-sm">
              Belum ada foto
            </div>
          ) : (
            <>
              <img
                src={photos[activePhoto].fileUrl}
                alt="Foto utama"
                className="w-full h-56 object-cover rounded-lg mb-3"
              />
              {photos.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setActivePhoto(index)}
                      className={`h-20 rounded-lg overflow-hidden border-2 ${
                        index === activePhoto ? "border-[#1179C4]" : "border-transparent"
                      }`}
                    >
                      <img
                        src={photo.fileUrl}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Lokasi */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Lokasi</h2>

          <div className="h-56 rounded-lg overflow-hidden mb-3 border border-slate-200">
            <MapContainer
              center={[report.latitude, report.longitude]}
              zoom={14}
              className="w-full h-full"
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[report.latitude, report.longitude]} />
            </MapContainer>
          </div>

          <p className="text-sm">
            <strong>Koordinat:</strong> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
          </p>
          {report.locationName && (
            <p className="text-sm mt-1">
              <strong>Lokasi:</strong> {report.locationName}
            </p>
          )}
        </div>
      </div>

      {/* Deskripsi */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-3">Deskripsi</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          {report.description || "Tidak ada deskripsi"}
        </p>
      </div>

      {/* Informasi Status (pengganti jujur dari "Status Timeline" + "Catatan Handler" di Figma,
          karena BE belum menyimpan riwayat per-tahap atau catatan admin) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Informasi Status</h2>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Status saat ini</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[report.status]}`}
            >
              {STATUS_LABELS[report.status]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Dibuat pada</span>
            <span className="font-medium">
              {new Date(report.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Terakhir diperbarui</span>
            <span className="font-medium">
              {new Date(report.updatedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {report.status === "REJECTED" && report.rejectReason && (
          <div className="mt-4 bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
            <strong>Alasan ditolak:</strong> {report.rejectReason}
          </div>
        )}
      </div>

      {/* Aksi pemilik */}
      {canModify && (
        <div className="flex gap-3">
          <Link
            to={`/reports/${id}/edit`}
            className="border border-[#1179C4] text-[#1179C4] font-semibold px-6 py-3 rounded-lg"
          >
            Edit Laporan
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="border border-red-500 text-red-500 font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {isDeleting ? "Menghapus..." : "Hapus Laporan"}
          </button>
        </div>
      )}

      {isOwner && report.status !== "SUBMITTED" && (
        <p className="text-slate-400 text-sm mt-4">
          Laporan ini sudah dalam proses peninjauan, tidak bisa diubah/dihapus lagi.
        </p>
      )}
    </ReporterLayout>
  );
}