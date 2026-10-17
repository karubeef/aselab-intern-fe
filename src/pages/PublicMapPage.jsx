
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import PublicNavbar from "../components/public/PublicNavbar";
import {
  getHeatmap,
  getHeatmapAreaDetail,
} from "../api/reports";

const BLUE = "#0B3D91";

function getColor(total) {
  if (total >= 6) return "#DC2626";
  if (total >= 3) return "#F97316";
  return "#15803D";
}

function MapFocus({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.8 });
    }
  }, [map, position]);

  return null;
}

export default function PublicMapPage() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [detail, setDetail] = useState(null);
  const [minimumReports, setMinimumReports] = useState(0);
  const [search, setSearch] = useState("");
  const [focus, setFocus] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let active = true;

    getHeatmap()
      .then((result) => {
        if (active) setAreas(Array.isArray(result) ? result : []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return areas.filter((area) => {
      if (Number(area.totalReports) < minimumReports) {
        return false;
      }

      if (!term) return true;

      const location = String(
        area.latestReport?.locationName || ""
      ).toLowerCase();

      const areaLabel = `area ${area.areaId}`;

      return (
        location.includes(term) ||
        areaLabel.includes(term)
      );
    });
  }, [areas, minimumReports, search]);

  const totalReports = filtered.reduce(
    (sum, area) => sum + Number(area.totalReports || 0),
    0
  );

  async function openArea(area) {
    setSelectedArea(area);
    setDetail(null);
    setDetailLoading(true);
    setError("");

    try {
      const result = await getHeatmapAreaDetail(area.areaId);
      setDetail(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  function useMyLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Browser tidak mendukung lokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setMyPosition(point);
        setFocus(point);
      },
      () => {
        setLocationError(
          "Lokasi tidak dapat diakses. Periksa izin GPS browser."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      }
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicNavbar />

      <header className="border-b bg-white px-5 py-5 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Peta Sebaran Sampah
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* SIDEBAR FILTER */}
        <aside className="w-full shrink-0 border-r bg-white p-5 lg:w-[300px]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pantai atau area..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
          />

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filter</h2>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setMinimumReports(0);
                setSelectedArea(null);
                setDetail(null);
              }}
              className="text-sm text-slate-500"
            >
              Reset
            </button>
          </div>

          <div className="mt-7">
            <p className="mb-3 text-xs font-semibold uppercase text-slate-400">
              Kepadatan Laporan
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "Semua", min: 0 },
                { label: "1+", min: 1 },
                { label: "3+", min: 3 },
                { label: "6+", min: 6 },
              ].map((option) => (
                <button
                  key={option.min}
                  type="button"
                  onClick={() => setMinimumReports(option.min)}
                  className={`rounded-full border px-3 py-2 text-sm ${
                    minimumReports === option.min
                      ? "border-[#0B3D91] bg-[#0B3D91] text-white"
                      : "border-[#0B3D91] text-[#0B3D91]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            className="mt-7 w-full rounded-lg border border-[#0B3D91] px-4 py-3 text-sm font-semibold text-[#0B3D91]"
          >
            Lokasi Saya
          </button>

          {locationError && (
            <p role="alert" className="mt-3 text-xs text-red-600">
              {locationError}
            </p>
          )}

          <div className="mt-7 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Kepadatan Laporan
            </p>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full">
              <span className="w-1/3 bg-green-600" />
              <span className="w-1/3 bg-orange-500" />
              <span className="w-1/3 bg-red-600" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Rendah</span>
              <span>Tinggi</span>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            {loading
              ? "Memuat peta..."
              : `${filtered.length} area · ${totalReports} laporan terverifikasi`}
          </p>
        </aside>

        {/* PETA */}
        <div className="relative min-h-[550px] flex-1">
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            scrollWheelZoom
            className="h-[70vh] min-h-[550px] w-full lg:h-[calc(100vh-170px)]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFocus position={focus} />

            {filtered.map((area) => {
              const lat = Number(area.centerLat);
              const lon = Number(area.centerLon);

              if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
                return null;
              }

              const color = getColor(Number(area.totalReports));

              return (
                <CircleMarker
                  key={area.areaId}
                  center={[lat, lon]}
                  radius={12 + Math.min(Number(area.totalReports), 15)}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.48,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => openArea(area),
                  }}
                >
                  <Popup>
                    <strong>Area {area.areaId}</strong>
                    <p>{area.totalReports} laporan terverifikasi</p>
                    <button
                      type="button"
                      onClick={() => openArea(area)}
                      style={{ color: BLUE, fontWeight: 700 }}
                    >
                      Lihat Detail
                    </button>
                  </Popup>
                </CircleMarker>
              );
            })}

            {myPosition && (
              <CircleMarker
                center={myPosition}
                radius={9}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#2457A8",
                  fillOpacity: 1,
                  weight: 3,
                }}
              >
                <Popup>Posisi Anda</Popup>
              </CircleMarker>
            )}
          </MapContainer>

          {error && (
            <p role="alert" className="absolute bottom-4 left-4 z-[500] rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* PANEL DETAIL */}
        <aside className="w-full shrink-0 border-l bg-white p-5 lg:w-[335px]">
          {selectedArea ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedArea(null);
                  setDetail(null);
                }}
                className="mb-4 text-sm font-semibold text-[#0B3D91]"
              >
                ← Kembali ke Legenda
              </button>

              <h2 className="text-xl font-semibold">
                Area {selectedArea.areaId}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {selectedArea.totalReports} laporan terverifikasi
              </p>

              {detailLoading ? (
                <p className="mt-5 text-sm">Memuat detail...</p>
              ) : (
                <div className="mt-6 max-h-[55vh] space-y-3 overflow-y-auto">
                  {(detail?.reports || []).map((report) => (
                    <div
                      key={report.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <h3 className="font-semibold text-slate-800">
                        Laporan #{report.id}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {report.locationName || "Lokasi laporan"}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString("id-ID")
                          : ""}
                      </p>
                      {report.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {report.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/reports/new"
                className="mt-6 block rounded-lg bg-[#0B3D91] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Lapor di Area Ini
              </Link>
            </>
          ) : (
            <>
              <h2 className="mb-5 text-xl font-semibold">
                Legenda Peta
              </h2>
              <div className="space-y-4 text-sm text-slate-700">
                {[
                  ["#2457A8", "Posisi Anda"],
                  ["#15803D", "Kepadatan rendah (1–2 laporan)"],
                  ["#F97316", "Kepadatan sedang (3–5 laporan)"],
                  ["#DC2626", "Kepadatan tinggi (6+ laporan)"],
                ].map(([color, label]) => (
                  <div key={label} className="flex items-center gap-3 border-b pb-3">
                    <span
                      className="h-5 w-5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm leading-relaxed text-slate-500">
                Warna menunjukkan jumlah laporan terverifikasi di dalam
                cluster area, bukan tingkat keparahan tiap laporan.
              </p>

              <p className="mt-4 text-xs text-slate-400">
                Klik titik area pada peta untuk melihat seluruh laporan
                yang tergabung dalam radius 20 meter.
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
