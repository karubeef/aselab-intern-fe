
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import logo from "../assets/oceanguard-logo.png";
import {
  getHeatmap,
  getHeatmapAreaDetail,
} from "../api/reports";

const DEFAULT_CENTER = [-2.5, 118];

const WASTE_TYPES = [
  "Plastik",
  "Kaca",
  "Logam",
  "Jaring / Alat Tangkap",
  "Organik",
  "Berbahaya (B3)",
];

const LEVELS = [
  { label: "Rendah", values: ["LOW"] },
  { label: "Sedang", values: ["MODERATE", "MEDIUM"] },
  { label: "Tinggi", values: ["HIGH", "CRITICAL"] },
];

const DATE_OPTIONS = [
  { value: 30, label: "30 Hari Terakhir" },
  { value: 7, label: "7 Hari Terakhir" },
  { value: 90, label: "90 Hari Terakhir" },
  { value: 0, label: "Semua Waktu" },
];

function getPosition(area) {
  if (
    area?.centerLat == null ||
    area?.centerLon == null
  ) {
    return null;
  }

  const lat = Number(area.centerLat);
  const lng = Number(area.centerLon);

  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? [lat, lng]
    : null;
}

function getReportWasteTypes(report) {
  const result = Array.isArray(report?.wasteTypes)
    ? report.wasteTypes.map((item) =>
        typeof item === "string" ? item : item?.name
      )
    : [];

  if (report?.customWasteType) {
    result.push(report.customWasteType);
  }

  return result.filter(Boolean);
}

function severityColor(level) {
  const value = String(level || "").toUpperCase();

  if (value === "HIGH" || value === "CRITICAL") {
    return "#E52529";
  }

  if (value === "MODERATE" || value === "MEDIUM") {
    return "#ED6205";
  }

  return "#16833F";
}

function areaMatches(
  area,
  search,
  selectedWaste,
  selectedLevels,
  days
) {
  const report = area.latestReport || {};
  const query = search.trim().toLowerCase();

  const title = String(
    report.locationName || ""
  ).toLowerCase();

  const wasteTypes = getReportWasteTypes(report);

  const level = String(
    report.pollutionLevel || ""
  ).toUpperCase();

  const matchesQuery =
    !query ||
    title.includes(query) ||
    String(area.areaId).toLowerCase().includes(query) ||
    wasteTypes.some((item) =>
      item.toLowerCase().includes(query)
    );

  const matchesWaste =
    selectedWaste.length === 0 ||
    selectedWaste.some((item) =>
      wasteTypes.some(
        (w) => w.toLowerCase() === item.toLowerCase()
      )
    );

  const matchesLevel =
    selectedLevels.length === 0 ||
    selectedLevels.some((item) =>
      LEVELS.find(
        (option) => option.label === item
      )?.values.includes(level)
    );

  const created = report.createdAt
    ? new Date(report.createdAt).getTime()
    : NaN;

  const matchesDate =
    days === 0 ||
    !Number.isFinite(created) ||
    (created <= Date.now() &&
      Date.now() - created <= days * 86400000);

  return (
    matchesQuery &&
    matchesWaste &&
    matchesLevel &&
    matchesDate
  );
}

function MapCamera({
  areas,
  focusedPosition,
  locationPosition,
}) {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || areas.length === 0) {
      return;
    }

    const validAreas = areas.filter(
      (area) => getPosition(area) !== null
    );

    const points = validAreas.map(getPosition);

    if (!points.length) return;

    initialized.current = true;

    if (points.length === 1) {
      map.setView(points[0], 16, {
        animate: false,
      });
      return;
    }

    const bounds = L.latLngBounds(points);

    const diagonal = map.distance(
      bounds.getSouthWest(),
      bounds.getNorthEast()
    );

    if (diagonal > 60000) {
      const mostReported = [...validAreas].sort(
        (a, b) =>
          Number(b.totalReports || 0) -
          Number(a.totalReports || 0)
      )[0];

      map.setView(getPosition(mostReported), 15, {
        animate: false,
      });
    } else {
      map.fitBounds(bounds, {
        padding: [70, 70],
        maxZoom: 16,
        animate: false,
      });
    }
  }, [areas, map]);

  useEffect(() => {
    if (focusedPosition) {
      map.flyTo(focusedPosition, 16, {
        duration: 0.7,
      });
    }
  }, [focusedPosition, map]);

  useEffect(() => {
    if (locationPosition) {
      map.flyTo(locationPosition, 16, {
        duration: 0.7,
      });
    }
  }, [locationPosition, map]);

  return null;
}

function Legend() {
  const items = [
    ["#2458AC", "Posisi Anda"],
    ["#16833F", "Tingkat Keparahan Rendah"],
    ["#ED6205", "Tingkat Keparahan Sedang"],
    ["#E52529", "Tingkat Keparahan Tinggi"],
  ];

  return (
    <div className="rounded-md bg-white px-4 py-3 shadow-[0_4px_18px_rgba(9,35,81,0.08)] sm:px-5">
      {items.map(([color, label], index) => (
        <div
          key={label}
          className={`flex items-center gap-3 py-2.5 ${
            index === items.length - 1
              ? ""
              : "border-b border-[#C5D1DF]"
          }`}
        >
          <span
            className="h-[21px] w-[21px] shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />

          <span className="text-[14px] font-normal text-[#111827] sm:text-[15px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PublicMapPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedWaste, setSelectedWaste] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [dateRange, setDateRange] = useState(30);

  const [selectedArea, setSelectedArea] = useState(null);
  const [areaDetail, setAreaDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [focusedPosition, setFocusedPosition] = useState(null);
  const [locationPosition, setLocationPosition] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let mounted = true;

    getHeatmap()
      .then((result) => {
        if (mounted) {
          setAreas(
            Array.isArray(result) ? result : []
          );
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err.message || "Gagal memuat data peta."
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredAreas = useMemo(
    () =>
      areas.filter(
        (area) =>
          getPosition(area) &&
          areaMatches(
            area,
            search,
            selectedWaste,
            selectedLevels,
            dateRange
          )
      ),
    [
      areas,
      search,
      selectedWaste,
      selectedLevels,
      dateRange,
    ]
  );

  function toggleSelection(value, setter) {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedWaste([]);
    setSelectedLevels([]);
    setDateRange(30);
    setError("");
  }

  async function selectArea(area) {
    setSelectedArea(area);
    setAreaDetail(null);
    setFocusedPosition(getPosition(area));
    setDetailLoading(true);
    setError("");

    try {
      const result = await getHeatmapAreaDetail(
        area.areaId
      );

      setAreaDetail(result);
    } catch (err) {
      setError(
        err.message ||
          "Tidak dapat memuat detail area."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function locateMe() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Browser tidak mendukung akses lokasi."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationPosition([
          coords.latitude,
          coords.longitude,
        ]);
      },
      () => {
        setLocationError(
          "Lokasi tidak dapat diakses. Periksa izin lokasi browser."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      }
    );
  }

  const totalVisibleReports = filteredAreas.reduce(
    (total, area) =>
      total + Number(area.totalReports || 0),
    0
  );

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-white font-sans text-[#14213A]">
      <header className="relative z-[1001] flex h-[91px] shrink-0 items-center justify-between border-b border-[#D3DCE8] bg-white px-5 sm:px-10 lg:px-[5%]">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
        >
          <img
            src={logo}
            alt="Logo OceanGuard"
            className="h-11 w-11 object-contain"
          />

          <span className="text-xl font-bold tracking-tight text-[#0F204C] sm:text-2xl">
            OceanGuard
          </span>
        </Link>

        <h1 className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-2xl font-medium text-black md:block">
          Peta Sebaran Sampah
        </h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-[#0B3D91] px-4 py-2.5 text-sm font-semibold text-[#0B3D91] hover:bg-blue-50 sm:px-6"
          >
            Masuk
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-[#0B3D91] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#082D71] sm:px-6"
          >
            Daftar
          </Link>
        </div>
      </header>

      <h1 className="shrink-0 border-b border-[#D3DCE8] bg-white py-2 text-center text-lg font-medium text-[#111827] md:hidden">
        Peta Sebaran Sampah
      </h1>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="z-[501] max-h-[43dvh] w-full shrink-0 overflow-y-auto border-b border-[#D7E0EB] bg-white px-5 py-6 md:h-full md:max-h-none md:w-[306px] md:border-b-0 md:border-r">
          <div className="relative">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1F2937]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari nama pantai, teluk, atau desa..."
              className="h-[66px] w-full rounded-lg border border-[#D2DBE7] bg-white py-3 pl-12 pr-3 text-sm leading-snug outline-none placeholder:text-[#9399A1] focus:border-[#0B3D91]"
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#111827]">
              Filter
            </h2>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-[#8A9AB2] hover:text-[#0B3D91]"
            >
              Reset
            </button>
          </div>

          <div className="mt-7">
            <p className="mb-4 text-xs font-medium uppercase text-[#8798AF]">
              Jenis Sampah
            </p>

            <div className="space-y-2.5">
              {WASTE_TYPES.map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-3 text-[14px] text-[#4A596F]"
                >
                  <input
                    type="checkbox"
                    checked={selectedWaste.includes(name)}
                    onChange={() =>
                      toggleSelection(
                        name,
                        setSelectedWaste
                      )
                    }
                    className="h-[18px] w-[18px] accent-[#0B3D91]"
                  />

                  {name}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-3 text-xs font-medium uppercase text-[#8798AF]">
              Tingkat Keparahan
            </p>

            <div className="flex flex-wrap gap-2">
              {LEVELS.map(({ label }) => {
                const active =
                  selectedLevels.includes(label);

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      toggleSelection(
                        label,
                        setSelectedLevels
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      active
                        ? "border-[#0B3D91] bg-[#0B3D91] text-white"
                        : "border-[#0B3D91] bg-white text-[#0B3D91] hover:bg-blue-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <label
              htmlFor="public-map-date"
              className="mb-3 block text-xs font-medium uppercase text-[#8798AF]"
            >
              Rentang Tanggal
            </label>

            <div className="relative">
              <select
                id="public-map-date"
                value={dateRange}
                onChange={(event) =>
                  setDateRange(
                    Number(event.target.value)
                  )
                }
                className="h-[51px] w-full appearance-none rounded-lg border border-[#D2DBE7] bg-white px-4 pr-10 text-sm text-[#637187] outline-none focus:border-[#0B3D91]"
              >
                {DATE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <div className="mt-7 rounded-lg bg-[#F7F8FA] px-4 py-4">
            <p className="text-xs font-medium uppercase text-[#91969E]">
              Kepadatan Laporan
            </p>

            <div className="mt-2.5 flex h-[9px] overflow-hidden">
              <span className="w-1/3 bg-[#16833F]" />
              <span className="w-1/3 bg-[#ED6205]" />
              <span className="w-1/3 bg-[#E52529]" />
            </div>

            <div className="mt-2 flex justify-between text-xs text-[#90959D]">
              <span>Rendah</span>
              <span>Tinggi</span>
            </div>
          </div>

          <button
            type="button"
            onClick={locateMe}
            className="mt-5 w-full rounded-lg border border-[#0B3D91] bg-white px-3 py-2.5 text-sm font-semibold text-[#0B3D91] hover:bg-blue-50"
          >
            Lokasi Saya
          </button>

          {locationError && (
            <p
              role="alert"
              className="mt-2 text-xs text-red-600"
            >
              {locationError}
            </p>
          )}

          <p className="mt-4 text-xs text-[#8798AF]">
            {loading
              ? "Memuat data peta..."
              : `${filteredAreas.length} area · ${totalVisibleReports} laporan terverifikasi`}
          </p>
        </aside>

        <main className="relative min-h-[360px] min-w-0 flex-1 overflow-hidden bg-[#EAF1F7]">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={5}
            zoomControl={false}
            scrollWheelZoom
            className="h-full w-full"
          >
            <ZoomControl position="bottomright" />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCamera
              areas={areas}
              focusedPosition={focusedPosition}
              locationPosition={locationPosition}
            />

            {filteredAreas.map((area) => {
              const position = getPosition(area);

              const color = severityColor(
                area.latestReport?.pollutionLevel
              );

              return (
                <CircleMarker
                  key={area.areaId}
                  center={position}
                  radius={11}
                  pathOptions={{
                    color: "#FFFFFF",
                    weight: 2.5,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () => selectArea(area),
                  }}
                >
                  <Popup>
                    <div className="min-w-[175px]">
                      <p className="font-semibold">
                        {area.latestReport?.locationName ||
                          `Area ${area.areaId}`}
                      </p>

                      <p>
                        {area.totalReports} laporan
                        terverifikasi
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          selectArea(area)
                        }
                        className="text-sm font-semibold text-[#0B3D91]"
                      >
                        Lihat detail area →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {locationPosition && (
              <CircleMarker
                center={locationPosition}
                radius={11}
                pathOptions={{
                  color: "white",
                  weight: 2.5,
                  fillColor: "#2458AC",
                  fillOpacity: 1,
                }}
              >
                <Popup>Posisi Anda</Popup>
              </CircleMarker>
            )}
          </MapContainer>

          <div className="pointer-events-none absolute right-4 top-6 z-[500] w-[min(342px,calc(100%-32px))] sm:right-6">
            <div className="pointer-events-auto">
              {selectedArea ? (
                <div className="max-h-[65vh] overflow-y-auto rounded-md bg-white p-5 shadow-[0_4px_18px_rgba(9,35,81,0.08)]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArea(null);
                      setAreaDetail(null);
                    }}
                    className="mb-4 text-xs font-semibold text-[#0B3D91]"
                  >
                    ← Kembali ke legenda
                  </button>

                  <h2 className="text-lg font-semibold">
                    {selectedArea.latestReport
                      ?.locationName ||
                      `Area ${selectedArea.areaId}`}
                  </h2>

                  <p className="mt-2 text-sm text-[#66758A]">
                    {selectedArea.totalReports} laporan
                    terverifikasi
                  </p>

                  {detailLoading ? (
                    <p className="mt-4 text-sm text-slate-500">
                      Memuat laporan...
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {(areaDetail?.reports || []).map(
                        (report) => (
                          <div
                            key={report.id}
                            className="rounded-lg border border-[#E1E7EF] p-3"
                          >
                            <p className="font-semibold text-[#112452]">
                              Laporan #{report.id}
                            </p>

                            <p className="mt-1 text-sm text-[#66758A]">
                              {report.locationName ||
                                "Lokasi laporan"}
                            </p>

                            <p className="mt-1 text-xs text-[#66758A]">
                              {getReportWasteTypes(
                                report
                              ).join(", ")}
                            </p>

                            {report.description && (
                              <p className="mt-2 text-sm text-[#334155]">
                                {report.description}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <Link
                    to="/reports/new"
                    className="mt-4 block rounded-md bg-[#0B3D91] px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Buat Laporan
                  </Link>
                </div>
              ) : (
                <Legend />
              )}
            </div>
          </div>

          {loading && (
            <div className="pointer-events-none absolute bottom-5 left-5 z-[500] rounded-lg bg-white px-4 py-3 text-sm text-[#0B3D91] shadow">
              Memuat data peta...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="absolute bottom-5 left-5 z-[500] max-w-[450px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow"
            >
              {error}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
