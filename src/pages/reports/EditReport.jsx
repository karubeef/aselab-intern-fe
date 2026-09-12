import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getReportById, updateReport } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import "./Report.css";

const WASTE_TYPE_OPTIONS = ["Plastik", "Kaca", "Logam", "Organik", "Lainnya"];
const DIRTY_LEVELS = [
  { value: "BERSIH", label: "Bersih" },
  { value: "SEDANG", label: "Sedang" },
  { value: "KOTOR", label: "Kotor" },
];

export default function EditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notAllowed, setNotAllowed] = useState(false);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [wasteTypes, setWasteTypes] = useState([]);
  const [otherWasteType, setOtherWasteType] = useState("");
  const [dirtyLevel, setDirtyLevel] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
      setWasteTypes(
        Array.isArray(report.wasteTypes) ? report.wasteTypes : []
      );
      setOtherWasteType(report.otherWasteType || "");
      setDirtyLevel(report.dirtyLevel);
      setDescription(report.description || "");
      setImageUrl(report.imageUrl || "");
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const includesLainnya = wasteTypes.includes("Lainnya");

  const isFormValid =
    latitude !== "" &&
    longitude !== "" &&
    wasteTypes.length > 0 &&
    dirtyLevel !== "" &&
    (!includesLainnya || otherWasteType.trim() !== "");

  function toggleWasteType(type) {
    setWasteTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await updateReport(id, {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        wasteTypes,
        otherWasteType: includesLainnya ? otherWasteType : null,
        dirtyLevel,
        description: description || null,
        imageUrl: imageUrl || null,
      });

      navigate(`/reports/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <p style={{ padding: "24px" }}>Loading...</p>;

  if (loadError) {
    return <p className="auth-error" style={{ margin: "24px" }}>{loadError}</p>;
  }

  if (notAllowed) {
    return (
      <div className="report-form-container">
        <p className="auth-error">
          Kamu tidak bisa mengedit laporan ini — laporan bukan milikmu, atau
          statusnya sudah bukan "Menunggu Verifikasi" lagi.
        </p>
        <Link to={`/reports/${id}`} className="btn-outline">
          Kembali ke Detail Laporan
        </Link>
      </div>
    );
  }

  return (
    <div className="report-form-container">
      <h1>Edit Laporan Sampah</h1>

      <form className="report-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}

        <div className="form-group">
          <label>Lokasi</label>
          <div className="location-inputs">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Jenis Sampah</label>
          <div className="checkbox-group">
            {WASTE_TYPE_OPTIONS.map((type) => (
              <label key={type} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={wasteTypes.includes(type)}
                  onChange={() => toggleWasteType(type)}
                />
                {type}
              </label>
            ))}
          </div>

          {includesLainnya && (
            <input
              type="text"
              placeholder="Sebutkan jenis sampah lainnya"
              value={otherWasteType}
              onChange={(e) => setOtherWasteType(e.target.value)}
              style={{ marginTop: "8px" }}
            />
          )}
        </div>

        <div className="form-group">
          <label>Tingkat Kekotoran</label>
          <div className="radio-group">
            {DIRTY_LEVELS.map((level) => (
              <label key={level.value} className="radio-item">
                <input
                  type="radio"
                  name="dirtyLevel"
                  value={level.value}
                  checked={dirtyLevel === level.value}
                  onChange={(e) => setDirtyLevel(e.target.value)}
                />
                {level.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Deskripsi (opsional)</label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">URL Foto Bukti (opsional)</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className="report-detail-actions">
          <button type="submit" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link to={`/reports/${id}`} className="btn-outline-small">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}