import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReport } from "../../api/reports";
import "./Report.css";

const WASTE_TYPE_OPTIONS = ["Plastik", "Kaca", "Logam", "Organik", "Lainnya"];
const DIRTY_LEVELS = [
  { value: "BERSIH", label: "Bersih" },
  { value: "SEDANG", label: "Sedang" },
  { value: "KOTOR", label: "Kotor" },
];

export default function CreateReport() {
  const navigate = useNavigate();

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [wasteTypes, setWasteTypes] = useState([]);
  const [otherWasteType, setOtherWasteType] = useState("");
  const [dirtyLevel, setDirtyLevel] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const report = await createReport({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        wasteTypes,
        otherWasteType: includesLainnya ? otherWasteType : null,
        dirtyLevel,
        description: description || null,
        imageUrl: imageUrl || null,
      });

      navigate(`/reports/${report.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Browser kamu tidak mendukung deteksi lokasi otomatis.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => {
        setError("Gagal mendapatkan lokasi. Isi manual atau coba lagi.");
      }
    );
  }

  return (
    <div className="report-form-container">
      <h1>Buat Laporan Sampah</h1>

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
            <button type="button" onClick={useMyLocation} className="btn-outline-small">
              Gunakan Lokasi Saya
            </button>
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
            placeholder="Jelaskan kondisi lokasi..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">URL Foto Bukti (opsional)</label>
          <input
            type="text"
            id="imageUrl"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <button type="submit" disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
        </button>
      </form>
    </div>
  );
}