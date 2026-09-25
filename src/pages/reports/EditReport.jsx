import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getReportById, updateReport } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import ReporterLayout from "../../components/ReporterLayout";
import { POLLUTION_LEVELS } from "../../constants/report";

export default function EditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notAllowed, setNotAllowed] = useState(false);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [pollutionLevel, setPollutionLevel] = useState("");
  const [description, setDescription] = useState("");
  const [customWasteType, setCustomWasteType] = useState("");
  const [wasteTypesDisplay, setWasteTypesDisplay] = useState([]);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    try {
      setLoading(true);
      const report = await getReportById(id);

      const isOwner = user?.id === report.user?.id;
      const canEdit = isOwner && report.status === "SUBMITTED";

      if (!canEdit) {
        setNotAllowed(true);
        return;
      }

      setLatitude(String(report.latitude));
      setLongitude(String(report.longitude));
      setLocationName(report.locationName || "");
      setPollutionLevel(report.pollutionLevel);
      setDescription(report.description || "");
      setCustomWasteType(report.customWasteType || "");
      setWasteTypesDisplay(report.wasteTypes || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isFormValid =
    latitude !== "" && longitude !== "" && pollutionLevel !== "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await updateReport(id, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName: locationName || null,
        pollutionLevel,
        description: description || null,
        customWasteType: customWasteType || null,
      });

      navigate(`/reports/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ReporterLayout>
        <p className="text-slate-500">Loading...</p>
      </ReporterLayout>
    );
  }

  if (loadError) {
    return (
      <ReporterLayout>
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
          {loadError}
        </p>
      </ReporterLayout>
    );
  }

  if (notAllowed) {
    return (
      <ReporterLayout>
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          Kamu tidak bisa mengedit laporan ini — laporan bukan milikmu, atau
          statusnya sudah bukan "Menunggu Verifikasi" lagi.
        </p>
        <Link
          to={`/reports/${id}`}
          className="inline-block border border-[#1179C4] text-[#1179C4] font-semibold px-5 py-2.5 rounded-lg"
        >
          Kembali ke Detail Laporan
        </Link>
      </ReporterLayout>
    );
  }

  return (
    <ReporterLayout>
      <h1 className="text-2xl font-bold mb-1">Edit Laporan Sampah</h1>
      <p className="text-slate-500 text-sm mb-6">
        Perbarui informasi laporan yang masih menunggu verifikasi
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {/* Jenis sampah — read-only, tidak bisa diubah lewat edit */}
          {wasteTypesDisplay.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Jenis Sampah
              </label>
              <div className="flex flex-wrap gap-2">
                {wasteTypesDisplay.map((w) => (
                  <span
                    key={w.id}
                    className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full"
                  >
                    {w.name}
                  </span>
                ))}
              </div>
              <p className="text-slate-400 text-xs mt-1.5">
                Jenis sampah tidak bisa diubah lewat form edit.
              </p>
            </div>
          )}

          {customWasteType && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Keterangan Jenis Lainnya
              </label>
              <input
                type="text"
                value={customWasteType}
                onChange={(e) => setCustomWasteType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Lokasi
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Nama lokasi (opsional)"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tingkat Keparahan
            </label>
            <div className="flex flex-col gap-3">
              {POLLUTION_LEVELS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between border rounded-lg px-5 py-4 cursor-pointer ${
                    pollutionLevel === opt.value
                      ? "border-[#1179C4] bg-sky-50"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="pollutionLevel"
                    value={opt.value}
                    checked={pollutionLevel === opt.value}
                    onChange={(e) => setPollutionLevel(e.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="bg-[#1179C4] hover:bg-[#0f6aab] disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-lg"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <Link
              to={`/reports/${id}`}
              className="border border-slate-300 text-slate-600 font-medium px-6 py-3 rounded-lg"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </ReporterLayout>
  );
}