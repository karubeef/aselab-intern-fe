
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import ReporterLayout from "../../components/ReporterLayout";
import PageHeading from "../../components/PageHeading";
import { getAllReports, getHeatmap } from "../../api/reports";

const DEFAULT_CENTER = [-6.9, 107.6];

const LEVELS = {
  LOW: { label: "Rendah", color: "#22c55e" },
  MODERATE: { label: "Sedang", color: "#f97316" },
  HIGH: { label: "Tinggi", color: "#ef4444" },
  CRITICAL: { label: "Kritis", color: "#dc2626" },
};

const WASTE_TYPES = [
  "Plastik",
  "Kaca",
  "Logam",
  "Jaring / Alat Tangkap",
  "Organik",
  "Berbahaya (B3)",
];

function positionOf(report) {
  if (report?.latitude == null || report?.longitude == null) {
    return null;
  }

  const lat = Number(report.latitude);
  const lng = Number(report.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }

  return [lat, lng];
}

function wasteNames(report) {
  return (report.wasteTypes || [])
    .map((type) =>
      typeof type === "string" ? type : type?.name
    )
    .filter(Boolean);
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

export default function AdminMapPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [wasteFilters, setWasteFilters] = useState([]);
  const [severityFilters, setSeverityFilters] = useState([]);
  const [dateRange, setDateRange] = useState(0);

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [focus, setFocus] = useState(null);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [reportData, areaData] = await Promise.all([
          getAllReports("VERIFIED"),
          getHeatmap(),
        ]);

        if (!active) return;

        setReports(
          Array.isArray(reportData) ? reportData : []
        );

        setAreas(
          Array.isArray(areaData) ? areaData : []
        );
      } catch (err) {
        if (active) {
          setError(err.message || "Gagal memuat data peta.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();

    return reports.filter((report) => {
      if (!positionOf(report)) return false;

      const types = wasteNames(report);
      const severity = String(
        report.pollutionLevel || "LOW"
      ).toUpperCase();

      const created = new Date(report.createdAt).getTime();

      const matchesSearch =
        !query ||
        String(report.id).includes(query) ||
        String(report.locationName || "")
          .toLowerCase()
          .includes(query);

      const matchesWaste =
        wasteFilters.length === 0 ||
        wasteFilters.some((type) =>
          types.some(
            (name) =>
              name.toLowerCase() === type.toLowerCase()
          )
        );

      const matchesSeverity =
        severityFilters.length === 0 ||
        severityFilters.some((level) =>
          level === "HIGH"
            ? ["HIGH", "CRITICAL"].includes(severity)
            : level === severity
        );

      const matchesDate =
        dateRange === 0 ||
        (Number.isFinite(created) &&
          created <= now &&
          now - created <= dateRange * 86400000);

      return (
        matchesSearch &&
        matchesWaste &&
        matchesSeverity &&
        matchesDate
      );
    });
  }, [
    reports,
    search,
    wasteFilters,
    severityFilters,
    dateRange,
  ]);

  function toggleFilter(value, list, setter) {
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  }

  function resetFilters() {
    setSearch("");
    setWasteFilters([]);
    setSeverityFilters([]);
    setDateRange(0);
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = [
          coords.latitude,
          coords.longitude,
        ];

        setUserPosition(position);
        setFocus([...position]);
      },
      () => {
        setError("Lokasi tidak tersedia atau izin ditolak.");
      }
    );
  }

  function openReport(id) {
    navigate(`/admin/manage-reports/${id}`);
  }

  const selectedLevel = selectedReport
    ? LEVELS[selectedReport.pollutionLevel] || LEVELS.LOW
    : null;

  return (
    <ReporterLayout>
      <PageHeading
        title="Explore Map"
        subtitle="Pantau persebaran laporan sampah terverifikasi"
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Peta Persebaran Laporan
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredReports.length} laporan ditampilkan
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={locateMe}
              className="rounded-lg border border-[#0B3D91] px-4 py-2 text-xs font-semibold text-[#0B3D91]"
            >
              Lokasi Saya
            </button>

            <button
              type="button"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="rounded-lg bg-[#0B3D91] px-4 py-2 text-xs font-semibold text-white"
            >
              {showHeatmap
                ? "Sembunyikan Heatmap"
                : "Tampilkan Heatmap"}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative h-[560px] overflow-hidden rounded-lg border border-slate-200">
            {loading && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80">
                <p className="text-sm text-slate-500">
                  Memuat peta...
                </p>
              </div>
            )}

            <MapContainer
              center={DEFAULT_CENTER}
              zoom={11}
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapFocus position={focus} />

              {showHeatmap &&
                areas.map((area, index) => {
                  const lat = Number(area.centerLat);
                  const lng = Number(
                    area.centerLon ?? area.centerLng
                  );

                  if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lng)
                  ) {
                    return null;
                  }

                  return (
                    <Circle
                      key={area.areaId ?? index}
                      center={[lat, lng]}
                      radius={20}
                      pathOptions={{
                        color: "#0B3D91",
                        weight: 1,
                        fillColor: "#f59e0b",
                        fillOpacity: 0.25,
                      }}
                    />
                  );
                })}

              {filteredReports.map((report) => {
                const level =
                  LEVELS[report.pollutionLevel] ||
                  LEVELS.LOW;

                return (
                  <CircleMarker
                    key={report.id}
                    center={positionOf(report)}
                    radius={8}
                    pathOptions={{
                      color: "#fff",
                      weight: 2,
                      fillColor: level.color,
                      fillOpacity: 1,
                    }}
                    eventHandlers={{
                      click: () => setSelectedReport(report),
                    }}
                  >
                    <Popup>
                      <div>
                        <p className="font-semibold">
                          {report.locationName ||
                            `Laporan #${report.id}`}
                        </p>

                        <p className="mt-1 text-xs">
                          Keparahan: {level.label}
                        </p>

                        <button
                          type="button"
                          onClick={() => openReport(report.id)}
                          className="mt-2 rounded bg-[#0B3D91] px-3 py-2 text-xs text-white"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {userPosition && (
                <CircleMarker
                  center={userPosition}
                  radius={10}
                  pathOptions={{
                    color: "white",
                    weight: 3,
                    fillColor: "#0ea5e9",
                    fillOpacity: 1,
                  }}
                >
                  <Popup>Lokasi Admin</Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Filter Laporan
              </h3>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari lokasi atau ID..."
                className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />

              <p className="mb-2 text-xs font-semibold text-slate-600">
                Jenis Sampah
              </p>

              <div className="mb-4 space-y-2">
                {WASTE_TYPES.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <input
                      type="checkbox"
                      checked={wasteFilters.includes(type)}
                      onChange={() =>
                        toggleFilter(
                          type,
                          wasteFilters,
                          setWasteFilters
                        )
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>

              <p className="mb-2 text-xs font-semibold text-slate-600">
                Tingkat Keparahan
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {["LOW", "MODERATE", "HIGH"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      toggleFilter(
                        level,
                        severityFilters,
                        setSeverityFilters
                      )
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs ${
                      severityFilters.includes(level)
                        ? "border-[#0B3D91] bg-[#0B3D91] text-white"
                        : "border-slate-300 text-slate-600"
                    }`}
                  >
                    {LEVELS[level].label}
                  </button>
                ))}
              </div>

              <label
                htmlFor="admin-map-date"
                className="mb-2 block text-xs font-semibold text-slate-600"
              >
                Rentang Tanggal
              </label>

              <select
                id="admin-map-date"
                value={dateRange}
                onChange={(e) =>
                  setDateRange(Number(e.target.value))
                }
                className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              >
                <option value={0}>Semua Waktu</option>
                <option value={7}>7 Hari Terakhir</option>
                <option value={30}>30 Hari Terakhir</option>
                <option value={90}>90 Hari Terakhir</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-lg border border-[#0B3D91] px-4 py-2 text-xs font-semibold text-[#0B3D91]"
              >
                Reset Filter
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                {selectedReport
                  ? "Detail Laporan"
                  : "Informasi Peta"}
              </h3>

              {selectedReport ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-800">
                    {selectedReport.locationName ||
                      `Laporan #${selectedReport.id}`}
                  </p>

                  <p className="text-xs text-slate-600">
                    Jenis Sampah:{" "}
                    {wasteNames(selectedReport).join(", ") ||
                      "-"}
                  </p>

                  <p className="text-xs text-slate-600">
                    Keparahan: {selectedLevel.label}
                  </p>

                  <p className="text-xs text-slate-600">
                    {selectedReport.description || "-"}
                  </p>

                  <button
                    type="button"
                    onClick={() => openReport(selectedReport.id)}
                    className="w-full rounded-lg bg-[#0B3D91] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Lihat Detail Laporan
                  </button>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-500">
                  Pilih marker pada peta untuk melihat detail
                  laporan. Aktifkan heatmap untuk melihat
                  area laporan yang dikelompokkan backend.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </ReporterLayout>
  );
}
