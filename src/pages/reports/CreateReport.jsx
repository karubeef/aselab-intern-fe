
import { useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { fixLeafletIcons } from "../../utils/leafletIconFix";
import { createReport } from "../../api/reports";
import ReporterLayout from "../../components/ReporterLayout";
import { uploadPhotos } from "../../api/uploads";

import {
  WASTE_TYPES,
  POLLUTION_LEVELS,
} from "../../constants/report";

fixLeafletIcons();

const STEPS = [
  "Lokasi",
  "Foto",
  "Jenis",
  "Keparahan",
  "Deskripsi",
  "Review",
];

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );

  const data = await res.json();

  return data.display_name || `${lat}, ${lon}`;
}

async function searchLocations(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  );

  return res.json();
}

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function CreateReport() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);

  // Step 1 — Lokasi
  const [locationTab, setLocationTab] = useState("gps");

  const [latitude, setLatitude] = useState(
    location.state?.prefillLat ?? null
  );

  const [longitude, setLongitude] = useState(
    location.state?.prefillLon ?? null
  );

  const [locationName, setLocationName] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Step 2 — Foto
  const [photos, setPhotos] = useState([]);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Step 3 — Jenis sampah
  const [wasteTypeIds, setWasteTypeIds] = useState([]);
  const [customWasteType, setCustomWasteType] = useState("");

  // Step 4 — Keparahan
  const [pollutionLevel, setPollutionLevel] = useState("");

  // Step 5 — Deskripsi
  const [description, setDescription] = useState("");

  // Submit laporan
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedReport, setSubmittedReport] = useState(null);

  function useMyLocation() {
    setLocationError("");
    setDetecting(true);

    if (!navigator.geolocation) {
      setLocationError(
        "Browser kamu tidak mendukung deteksi lokasi."
      );

      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);

        try {
          const name = await reverseGeocode(lat, lon);
          setLocationName(name);
        } catch {
          setLocationName("");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setLocationError(
          "Gagal mendapatkan lokasi. Coba tab lain."
        );

        setDetecting(false);
      }
    );
  }

  async function handleSearch(e) {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setSearching(true);
    setLocationError("");

    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch {
      setLocationError("Pencarian lokasi gagal.");
    } finally {
      setSearching(false);
    }
  }

  function pickSearchResult(result) {
    setLatitude(parseFloat(result.lat));
    setLongitude(parseFloat(result.lon));
    setLocationName(result.display_name);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  }

  async function handleMapPick(lat, lon) {
    setLatitude(lat);
    setLongitude(lon);

    try {
      const name = await reverseGeocode(lat, lon);
      setLocationName(name);
    } catch {
      setLocationName("");
    }
  }

  function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);

    const valid = files.filter(
      (file) =>
        ["image/jpeg", "image/png"].includes(file.type) &&
        file.size <= 5 * 1024 * 1024
    );

    if (valid.length !== files.length) {
      alert(
        "Hanya file JPG atau PNG dengan ukuran maksimal 5MB yang diperbolehkan."
      );
    }

    const remaining = 5 - photos.length;

    const toAdd = valid.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...toAdd]);

    e.target.value = "";
  }

  function removePhoto(index) {
    setPhotos((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function toggleWasteType(id) {
    setWasteTypeIds((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id]
    );
  }

  const includesLainnya = wasteTypeIds.includes(6);

  const canProceed = {
    1: latitude !== null && longitude !== null,
    2: photos.length >= 1,
    3:
      wasteTypeIds.length > 0 &&
      (!includesLainnya || customWasteType.trim() !== ""),
    4: pollutionLevel !== "",
    5: true,
  };

  function goNext() {
    if (step < 6 && canProceed[step]) {
      setStep(step + 1);
    }
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  async function handleSubmit() {
    setSubmitError("");
    setSubmitting(true);

    try {
      const photoUrls = await uploadPhotos(
        photos.map((p) => p.file)
      );

      const report = await createReport({
        latitude,
        longitude,
        locationName: locationName || null,
        wasteTypeIds,
        customWasteType: includesLainnya
          ? customWasteType
          : null,
        pollutionLevel,
        description: description || null,
        photoUrls,
      });

      setSubmittedReport(report);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(1);
    setLatitude(null);
    setLongitude(null);
    setLocationName("");
    setPhotos([]);
    setWasteTypeIds([]);
    setCustomWasteType("");
    setPollutionLevel("");
    setDescription("");
    setSubmittedReport(null);
    setSubmitError("");
  }

  // Tampilan setelah laporan berhasil dikirim
  if (submittedReport) {
    return (
      <ReporterLayout>
        <div className="flex flex-col items-center text-center pt-16">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-6">
            ✅
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Laporan Berhasil Dikirim!
          </h1>

          <p className="text-slate-500 mb-4">
            Laporan kamu telah diterima dengan ID:
          </p>

          <span className="bg-sky-50 text-[#1179C4] font-bold px-5 py-2 rounded-lg mb-6">
            OG-{submittedReport.id}
          </span>

          <p className="text-slate-500 text-sm max-w-md mb-8">
            Admin akan memverifikasi laporanmu. Pantau statusnya di
            halaman Laporan Saya.
          </p>

          <div className="flex gap-3">
            <Link
              to="/my-reports"
              className="bg-[#1179C4] hover:bg-[#0f6aab] text-white font-semibold px-6 py-3 rounded-lg"
            >
              Lihat Laporan Saya
            </Link>

            <button
              onClick={resetForm}
              className="bg-white border border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-lg"
            >
              Buat Laporan Baru
            </button>
          </div>
        </div>
      </ReporterLayout>
    );
  }

  return (
    <ReporterLayout>
      {/* Judul halaman */}
      <h1 className="text-2xl font-bold mb-1">
        Buat Laporan Sampah
      </h1>

      <p className="text-slate-500 text-sm mb-6">
        Isi informasi berikut untuk melaporkan polusi laut
      </p>

      {/* Indikator langkah */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center">
          {STEPS.map((label, index) => {
            const num = index + 1;
            const isDone = num < step;
            const isActive = num === step;

            return (
              <div
                key={label}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                      isDone
                        ? "bg-[#1179C4] border-[#1179C4] text-white"
                        : isActive
                        ? "border-[#1179C4] text-[#1179C4]"
                        : "border-slate-200 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : num}
                  </div>

                  <span
                    className={`text-xs mt-2 ${
                      isActive
                        ? "text-[#1179C4] font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {num < 6 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isDone
                        ? "bg-[#1179C4]"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Isi formulir */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        {/* STEP 1 — LOKASI */}
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-lg mb-4">
              Pilih Lokasi Sampah
            </h2>

            <div className="flex gap-3 mb-4">
              {[
                { key: "gps", label: "📍 Gunakan GPS" },
                { key: "search", label: "🔍 Cari Lokasi" },
                { key: "map", label: "🗺️ Pilih di Peta" },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setLocationTab(tab.key)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium border ${
                    locationTab === tab.key
                      ? "bg-[#1179C4] text-white border-[#1179C4]"
                      : "bg-white text-slate-600 border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {locationTab === "gps" && (
              <button
                type="button"
                onClick={useMyLocation}
                disabled={detecting}
                className="w-full mb-4 bg-slate-50 border border-slate-200 rounded-lg py-3 text-sm font-medium text-[#1179C4]"
              >
                {detecting
                  ? "Mendeteksi lokasi..."
                  : "📍 Deteksi Lokasi Saya"}
              </button>
            )}

            {locationTab === "search" && (
              <form onSubmit={handleSearch} className="mb-4">
                <input
                  type="text"
                  placeholder="Cari nama pantai, teluk, atau desa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4] mb-2"
                />

                {searching && (
                  <p className="text-slate-400 text-sm">
                    Mencari...
                  </p>
                )}

                {searchResults.length > 0 && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {searchResults.map((r) => (
                      <button
                        type="button"
                        key={r.place_id}
                        onClick={() => pickSearchResult(r)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50"
                      >
                        {r.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            )}

            {locationError && (
              <p className="text-red-500 text-sm mb-4">
                {locationError}
              </p>
            )}

            {latitude !== null && (
              <div className="bg-sky-50 text-[#1179C4] text-sm rounded-lg px-4 py-3 mb-4">
                📍 {locationName || "Lokasi terpilih"} (
                {latitude.toFixed(4)}, {longitude.toFixed(4)})
              </div>
            )}

            {locationTab === "map" && (
              <div className="h-72 rounded-lg overflow-hidden mb-4 border border-slate-200">
                <MapContainer
                  center={[
                    latitude ?? -2.5,
                    longitude ?? 118,
                  ]}
                  zoom={latitude !== null ? 12 : 5}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <LocationPicker onPick={handleMapPick} />

                  {latitude !== null && (
                    <Marker position={[latitude, longitude]} />
                  )}
                </MapContainer>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Konfirmasi Nama Lokasi
              </label>

              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Nama lokasi (opsional)"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2 — FOTO */}
        {step === 2 && (
          <div>
            <h2 className="font-semibold text-lg mb-1">
              Upload Foto Bukti
            </h2>

            <p className="text-slate-400 text-sm mb-4">
              Wajib upload 1–5 foto sebagai bukti laporan
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-200"
                >
                  <img
                    src={photo.previewUrl}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {photos.length < 5 &&
                Array.from({
                  length: Math.min(
                    3 - (photos.length % 3 || 3),
                    5 - photos.length
                  ),
                }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="aspect-square rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-sm"
                  >
                    <span className="text-xl mb-1">＋</span>
                    Tambah foto
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={photos.length >= 5}
                className="border border-slate-300 rounded-lg py-3 text-sm font-medium disabled:opacity-50"
              >
                📷 Ambil Foto
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={photos.length >= 5}
                className="border border-slate-300 rounded-lg py-3 text-sm font-medium disabled:opacity-50"
              >
                🖼️ Upload dari Galeri
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
        )}

        {/* STEP 3 — JENIS SAMPAH */}
        {step === 3 && (
          <div>
            <h2 className="font-semibold text-lg mb-1">
              Pilih Jenis Sampah
            </h2>

            <p className="text-slate-400 text-sm mb-4">
              Pilih satu atau lebih jenis sampah yang kamu temukan
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {WASTE_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={`border rounded-lg px-4 py-3 text-sm cursor-pointer ${
                    wasteTypeIds.includes(type.id)
                      ? "border-[#1179C4] bg-sky-50 text-[#1179C4] font-medium"
                      : "border-slate-300 text-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={wasteTypeIds.includes(type.id)}
                    onChange={() => toggleWasteType(type.id)}
                    className="hidden"
                  />

                  {type.name}
                </label>
              ))}
            </div>

            {includesLainnya && (
              <input
                type="text"
                placeholder="Sebutkan jenis sampah lainnya"
                value={customWasteType}
                onChange={(e) => setCustomWasteType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none"
              />
            )}
          </div>
        )}

        {/* STEP 4 — KEparahan */}
        {step === 4 && (
          <div>
            <h2 className="font-semibold text-lg mb-1">
              Tentukan Tingkat Keparahan
            </h2>

            <p className="text-slate-400 text-sm mb-4">
              Seberapa parah kondisi polusi yang kamu temukan?
            </p>

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
                    <p className="font-semibold text-sm">
                      {opt.label}
                    </p>

                    <p className="text-slate-400 text-xs mt-0.5">
                      {opt.desc}
                    </p>
                  </div>

                  <input
                    type="radio"
                    name="pollutionLevel"
                    value={opt.value}
                    checked={pollutionLevel === opt.value}
                    onChange={(e) =>
                      setPollutionLevel(e.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5 — DESKRIPSI */}
        {step === 5 && (
          <div>
            <h2 className="font-semibold text-lg mb-1">
              Deskripsi (Opsional)
            </h2>

            <p className="text-slate-400 text-sm mb-4">
              Tambahkan informasi tambahan yang membantu admin menangani
              laporan
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Deskripsi Kondisi
            </label>

            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Sampah plastik berserakan di sepanjang garis pantai sekitar 200 meter, banyak botol dan kantong plastik."
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
            />
          </div>
        )}

        {/* STEP 6 — REVIEW */}
        {step === 6 && (
          <div>
            <h2 className="font-semibold text-lg mb-4">
              Review & Kirim Laporan
            </h2>

            {submitError && (
              <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                {submitError}
              </p>
            )}

            <div className="bg-slate-50 rounded-lg px-5 py-4 mb-4 flex flex-col gap-2 text-sm">
              <Row
                label="Lokasi"
                value={
                  locationName ||
                  `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`
                }
              />

              <Row
                label="Jenis Sampah"
                value={
                  wasteTypeIds.length > 0
                    ? WASTE_TYPES.filter((t) =>
                        wasteTypeIds.includes(t.id)
                      )
                        .map((t) =>
                          t.id === 6
                            ? customWasteType || "Lainnya"
                            : t.name
                        )
                        .join(", ")
                    : "-"
                }
              />

              <Row
                label="Tingkat Keparahan"
                value={
                  POLLUTION_LEVELS.find(
                    (o) => o.value === pollutionLevel
                  )?.label || "-"
                }
              />

              <Row
                label="Foto"
                value={`${photos.length} foto terlampir`}
              />
            </div>

            {photos.length > 0 ? (
              <img
                src={photos[0].previewUrl}
                alt="Preview"
                className="w-full h-56 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="border border-dashed border-slate-300 rounded-lg h-40 flex items-center justify-center text-slate-400 text-sm mb-4">
                Tidak ada foto dilampirkan
              </div>
            )}

            {description && (
              <div>
                <p className="text-slate-400 text-xs mb-1">
                  Deskripsi
                </p>

                <p className="text-sm text-slate-700">
                  {description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tombol navigasi langkah */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="border border-slate-300 text-slate-600 disabled:text-slate-300 disabled:border-slate-200 font-medium px-6 py-3 rounded-lg"
        >
          ← Kembali
        </button>

        {step < 6 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed[step]}
            className="bg-[#1179C4] hover:bg-[#0f6aab] disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Lanjutkan →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#1179C4] hover:bg-[#0f6aab] disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-lg"
          >
            {submitting ? "Mengirim..." : "Kirim Laporan ✓"}
          </button>
        )}
      </div>
    </ReporterLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
