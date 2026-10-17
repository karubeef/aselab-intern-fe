
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import ReporterLayout from "../components/ReporterLayout";
import {
  getAllReports,
  getHeatmap,
} from "../api/reports";

const BLUE = "#0B3D91";
const DEFAULT_CENTER = [-6.15, 110.4];
const RADIUS = 20;

const WASTE_OPTIONS = [
  "Plastik",
  "Kaca",
  "Logam",
  "Jaring / Alat Tangkap",
  "Organik",
  "Berbahaya (B3)",
];

const SEVERITIES = [
  { label: "Rendah", values: ["LOW"] },
  { label: "Sedang", values: ["MODERATE"] },
  { label: "Tinggi", values: ["HIGH", "CRITICAL"] },
];

const DATE_OPTIONS = [
  { value: 30, label: "30 Hari Terakhir" },
  { value: 7, label: "7 Hari Terakhir" },
  { value: 90, label: "90 Hari Terakhir" },
  { value: 0, label: "Semua Waktu" },
];

const LEVEL_LABELS = {
  LOW: "Rendah",
  MODERATE: "Sedang",
  HIGH: "Tinggi",
  CRITICAL: "Kritis",
};

const buttonPrimary =
  "w-full rounded-lg bg-[#0B3D91] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-900";

const buttonOutline =
  "w-full rounded-lg border border-[#0B3D91] px-4 py-3 text-center text-sm font-semibold text-[#0B3D91] hover:bg-blue-50";

function positionOf(report) {
  if (report?.latitude == null || report?.longitude == null) {
    return null;
  }

  const lat = Number(report.latitude);
  const lng = Number(report.longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function centerOf(area) {
  const lat = Number(area.centerLat);
  const lng = Number(area.centerLon ?? area.centerLng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return [lat, lng];
}

function distanceMeters(a, b) {
  const rad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) *
    Math.cos(rad(b[0])) *
    Math.sin(dLng / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.asin(Math.min(1, Math.sqrt(h)))
  );
}

function wasteNames(report) {
  const types = Array.isArray(report.wasteTypes)
    ? report.wasteTypes
        .map((w) =>
          typeof w === "string" ? w : w?.name
        )
        .filter(Boolean)
    : [];

  if (report.customWasteType) {
    types.push(report.customWasteType);
  }

  return types;
}

function locationName(report) {
  return (
    report.locationName ||
    "Lokasi laporan tidak bernama"
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }) + " WIB";
}

function reportPhoto(report) {
  const first = report.photos?.[0];

  if (typeof first === "string") {
    return first;
  }

  return first?.url ||
    first?.photoUrl ||
    first?.imageUrl ||
    null;
}

function MapMover({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    map.flyTo(target.position, target.zoom || 16, {
      duration: 0.8,
    });
  }, [map, target]);

  return null;
}

function MapClickListener({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function DensityCircles({ area, onClick }) {
  const center = centerOf(area);

  if (!center) return null;

  return (
    <>
      <Circle
        center={center}
        radius={RADIUS}
        pathOptions={{
          color: "#0B3D91",
          dashArray: "5 5",
          weight: 2,
          fillColor: "#22c55e",
          fillOpacity: 0.14,
        }}
        eventHandlers={{ click: onClick }}
      />

      <Circle
        center={center}
        radius={RADIUS * 0.7}
        pathOptions={{
          stroke: false,
          fillColor: "#22c55e",
          fillOpacity: 0.18,
        }}
        eventHandlers={{ click: onClick }}
      />

      <Circle
        center={center}
        radius={RADIUS * 0.45}
        pathOptions={{
          stroke: false,
          fillColor: "#eab308",
          fillOpacity: 0.30,
        }}
        eventHandlers={{ click: onClick }}
      />

      <Circle
        center={center}
        radius={RADIUS * 0.22}
        pathOptions={{
          stroke: false,
          fillColor: "#ef4444",
          fillOpacity: 0.35,
        }}
        eventHandlers={{ click: onClick }}
      />
    </>
  );
}

function FilterPanel({
  search,
  setSearch,
  wasteFilters,
  setWasteFilters,
  severityFilters,
  setSeverityFilters,
  dateRange,
  setDateRange,
  onReset,
}) {
  function toggle(value, values, setter) {
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-md">
      <div className="mb-4">
        <label
          htmlFor="user-map-search"
          className="sr-only"
        >
          Cari lokasi
        </label>

        <input
          id="user-map-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama pantai, teluk, atau desa..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0B3D91]"
        />
      </div>

      <div className="mb-6 flex justify-between">
        <h3 className="font-semibold text-slate-900">
          Filter
        </h3>

        <button
          type="button"
          onClick={onReset}
          className="text-sm text-slate-400 hover:text-[#0B3D91]"
        >
          Reset
        </button>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 text-xs font-semibold uppercase text-slate-400">
          Jenis Sampah
        </h4>

        <div className="space-y-3">
          {WASTE_OPTIONS.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
            >
              <input
                type="checkbox"
                checked={wasteFilters.includes(name)}
                onChange={() =>
                  toggle(
                    name,
                    wasteFilters,
                    setWasteFilters
                  )
                }
                className="h-4 w-4 accent-[#0B3D91]"
              />

              {name}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 text-xs font-semibold uppercase text-slate-400">
          Tingkat Keparahan
        </h4>

        <div className="flex flex-wrap gap-2">
          {SEVERITIES.map((option) => {
            const active = severityFilters.includes(
              option.label
            );

            return (
              <button
                key={option.label}
                type="button"
                onClick={() =>
                  toggle(
                    option.label,
                    severityFilters,
                    setSeverityFilters
                  )
                }
                className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                  active
                    ? "border-[#0B3D91] bg-[#0B3D91] text-white"
                    : "border-[#0B3D91] text-[#0B3D91]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="user-map-date"
          className="mb-3 block text-xs font-semibold uppercase text-slate-400"
        >
          Rentang Tanggal
        </label>

        <select
          id="user-map-date"
          value={dateRange}
          onChange={(e) =>
            setDateRange(Number(e.target.value))
          }
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-600"
        >
          {DATE_OPTIONS.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg bg-slate-50 p-4">
        <p className="mb-2 text-xs uppercase text-slate-400">
          Kepadatan Laporan
        </p>

        <div className="flex h-2 overflow-hidden">
          <div className="w-1/3 bg-green-600" />
          <div className="w-1/3 bg-amber-500" />
          <div className="w-1/3 bg-red-600" />
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>Rendah</span>
          <span>Tinggi</span>
        </div>
      </div>
    </div>
  );
}

function RightPanel({
  mode,
  selectedArea,
  areaReports,
  selectedPosition,
  filteredCount,
  filtersActive,
  selectedReport,
  onList,
  onReport,
  onDetail,
  onBack,
  onReset,
  onNewReport,
}) {
  if (mode === "empty") {
    return (
      <div className="rounded-lg bg-white p-5 shadow-md">
        <h3 className="mb-4 font-semibold text-slate-900">
          Area Belum Ada Laporan
        </h3>

        <p className="mb-3 text-sm text-slate-500">
          0 laporan terverifikasi
        </p>

        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Belum ada laporan terverifikasi di area yang
          dipilih. Kamu dapat melaporkan sampah yang
          ditemukan.
        </p>

        <p className="mb-4 text-xs text-slate-500">
          Laporan baru perlu diverifikasi Admin sebelum
          tampil di peta.
        </p>

        <button
          type="button"
          onClick={onNewReport}
          className={buttonPrimary}
        >
          Buat Laporan
        </button>

        <button
          type="button"
          onClick={onBack}
          className={`${buttonOutline} mt-3`}
        >
          Kembali ke Peta
        </button>
      </div>
    );
  }

  if (mode === "filter") {
    const newest = [...areaReports].sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    return (
      <div className="rounded-lg bg-white p-5 shadow-md">
        <h3 className="mb-4 font-semibold text-slate-900">
          Hasil Filter
        </h3>

        <p className="mb-4 text-sm text-slate-500">
          {filteredCount} laporan cocok dengan filter
        </p>

        <p className="mb-4 text-sm text-slate-600">
          {areaReports.length} laporan pada area pilihan
        </p>

        {newest && (
          <>
            <h4 className="mb-3 font-semibold text-slate-900">
              Laporan Terbaru
            </h4>

            <button
              type="button"
              onClick={() => onReport(newest)}
              className="mb-4 w-full rounded-lg border border-slate-200 p-3 text-left text-sm text-slate-600 hover:border-blue-300"
            >
              OG-{newest.id} ·{" "}
              {wasteNames(newest).join(", ") || "Lainnya"}
              <p className="mt-2 text-xs text-slate-500">
                {formatDate(newest.createdAt)}
              </p>
            </button>
          </>
        )}

        {areaReports.length > 0 && (
          <button
            type="button"
            onClick={onList}
            className={`${buttonPrimary} mb-3`}
          >
            Lihat Laporan Area
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className={`${buttonOutline} mb-3`}
        >
          Reset Filter
        </button>

        <button
          type="button"
          onClick={onNewReport}
          className={buttonOutline}
        >
          Buat Laporan
        </button>
      </div>
    );
  }

  if (mode === "area" && selectedArea) {
    return (
      <div className="rounded-lg bg-white p-5 shadow-md">
        <h3 className="mb-4 font-semibold text-slate-900">
          Detail Area
        </h3>

        <p className="mb-3 text-sm text-slate-500">
          {areaReports[0]
            ? locationName(areaReports[0])
            : "Area terpilih"}
        </p>

        <p className="mb-3 font-semibold text-slate-900">
          {areaReports.length} laporan terverifikasi
        </p>

        <p className="mb-4 text-xs leading-relaxed text-slate-500">
          Area dikelompokkan oleh backend dengan
          radius maksimal 20 meter dari pusat area.
          Setiap laporan tersimpan secara terpisah.
        </p>

        <h4 className="mb-3 font-semibold text-slate-900">
          Laporan Terbaru
        </h4>

        <div className="mb-4 space-y-3">
          {[...areaReports]
            .sort(
              (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
            )
            .slice(0, 3)
            .map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => onReport(report)}
                className="w-full rounded-lg border border-slate-200 p-3 text-left text-sm hover:border-blue-300"
              >
                <p className="font-medium text-slate-800">
                  OG-{report.id} ·{" "}
                  {wasteNames(report).join(", ")}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {formatDate(report.createdAt)}
                </p>
              </button>
            ))}
        </div>

        <button
          type="button"
          onClick={onList}
          className={`${buttonPrimary} mb-3`}
        >
          Lihat {areaReports.length} Laporan Area
        </button>

        <button
          type="button"
          onClick={onNewReport}
          className={buttonOutline}
        >
          Buat Laporan
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-5 shadow-md">
      <h3 className="mb-4 font-semibold text-slate-900">
        Legenda Peta
      </h3>

      <p className="mb-4 text-sm leading-relaxed text-slate-500">
        Titik biru menunjukkan laporan terverifikasi.
        Klik titik untuk membuka detail.
      </p>

      {[
        ["#16a34a", "Kepadatan rendah"],
        ["#d97706", "Kepadatan sedang"],
        ["#dc2626", "Kepadatan tinggi"],
      ].map(([color, title]) => (
        <div
          key={title}
          className="mb-4 flex items-center gap-3"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-slate-500">
            {title}
          </span>
        </div>
      ))}

      <p className="mb-6 text-xs leading-relaxed text-slate-500">
        Warna menunjukkan visualisasi kepadatan,
        bukan tingkat keparahan sampah.
      </p>

      <h4 className="mb-3 font-semibold text-slate-900">
        Area Heatmap
      </h4>

      <p className="mb-4 text-xs leading-relaxed text-slate-500">
        Area laporan dibentuk melalui pengelompokan
        titik oleh backend dengan radius 20 meter.
      </p>

      <button
        type="button"
        onClick={onDetail}
        disabled={!selectedArea}
        className={`${buttonPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {selectedArea
          ? "Lihat Detail Area"
          : "Pilih Area pada Peta"}
      </button>

      {selectedPosition && (
        <p className="mt-3 text-xs text-slate-400">
          Titik dipilih: {selectedPosition[0].toFixed(5)},{" "}
          {selectedPosition[1].toFixed(5)}
        </p>
      )}

      {filtersActive && (
        <button
          type="button"
          onClick={onReset}
          className={`${buttonOutline} mt-3`}
        >
          Reset Filter
        </button>
      )}

      {selectedReport && (
        <button
          type="button"
          onClick={() => onReport(selectedReport)}
          className={`${buttonOutline} mt-3`}
        >
          Lihat Laporan Dipilih
        </button>
      )}
    </div>
  );
}

function AreaReportList({
  reports,
  area,
  onBack,
  onOpen,
}) {
  const sorted = [...reports].sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm font-semibold text-sky-600 hover:underline"
      >
        ← Kembali ke Detail Area
      </button>

      <h2 className="text-lg font-semibold text-slate-900">
        {reports.length} Laporan di Area{" "}
        {area?.areaId ?? ""}
      </h2>

      <p className="mt-3 text-sm text-slate-500">
        {reports[0]
          ? locationName(reports[0])
          : "Area terpilih"}
      </p>

      <p className="mb-5 mt-4 text-xs text-slate-500">
        Daftar laporan terverifikasi pada area yang
        dipilih, diurutkan dari yang terbaru.
      </p>

      <div className="space-y-4">
        {sorted.map((report) => (
          <article
            key={report.id}
            className="rounded-lg border border-slate-200 p-5"
          >
            <h3 className="font-semibold text-slate-900">
              OG-{report.id} ·{" "}
              {wasteNames(report).join(", ") ||
                "Jenis tidak tersedia"}
            </h3>

            <p className="mt-3 text-sm text-slate-500">
              {formatDate(report.createdAt)} · Keparahan{" "}
              {LEVEL_LABELS[report.pollutionLevel] ||
                report.pollutionLevel}
            </p>

            <p className="my-4 text-sm text-slate-600">
              {report.description ||
                "Tidak ada deskripsi."}
            </p>

            <button
              type="button"
              onClick={() => onOpen(report)}
              className={buttonPrimary}
            >
              Lihat Detail Laporan
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function AreaReportDetail({
  report,
  area,
  onBack,
}) {
  const image = reportPhoto(report);

  return (
    <div className="min-h-[600px] rounded-xl border border-slate-200 bg-white p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm font-semibold text-sky-600 hover:underline"
      >
        ← Kembali ke Laporan Area
      </button>

      <h2 className="text-lg font-semibold text-slate-900">
        OG-{report.id} · Terverifikasi
      </h2>

      <p className="mt-3 text-sm text-slate-500">
        {locationName(report)}
        {area ? ` · Area ${area.areaId}` : ""}
      </p>

      <div className="mt-6 grid gap-7 lg:grid-cols-2">
        {image ? (
          <img
            src={image}
            alt={`Foto laporan OG-${report.id}`}
            className="h-72 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
            Foto tidak tersedia
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">
            Informasi Laporan
          </h3>

          <p className="text-sm text-slate-600">
            Dilaporkan {formatDate(report.createdAt)}
          </p>

          <p className="text-sm text-slate-600">
            Jenis sampah:{" "}
            {wasteNames(report).join(", ") ||
              "Tidak tersedia"}
          </p>

          <p className="text-sm text-slate-600">
            Tingkat keparahan:{" "}
            {LEVEL_LABELS[report.pollutionLevel] ||
              "Tidak tersedia"}
          </p>

          <p className="text-sm text-slate-600">
            Lokasi: {locationName(report)}
          </p>

          <h4 className="font-semibold text-slate-900">
            Deskripsi
          </h4>

          <p className="text-sm leading-relaxed text-slate-600">
            {report.description || "-"}
          </p>

          <p className="text-sm font-semibold text-sky-600">
            Status: Terverifikasi
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Penanganan dan perubahan status laporan
        dilakukan oleh Admin OceanGuard.
      </p>

      <button
        type="button"
        onClick={onBack}
        className={`${buttonOutline} mt-4`}
      >
        Kembali ke Daftar Laporan Area
      </button>
    </div>
  );
}

export default function UserMapPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [wasteFilters, setWasteFilters] = useState([]);
  const [severityFilters, setSeverityFilters] = useState([]);
  const [dateRange, setDateRange] = useState(30);

  const [screen, setScreen] = useState("map");
  const [panelMode, setPanelMode] = useState("legend");

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const [flyTarget, setFlyTarget] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [locationError, setLocationError] = useState("");

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
          setError(err.message || "Gagal memuat peta.");
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

  const filtersActive =
    Boolean(search.trim()) ||
    wasteFilters.length > 0 ||
    severityFilters.length > 0 ||
    dateRange !== 30;

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();

    return reports.filter((report) => {
      const position = positionOf(report);

      if (!position) return false;

      const waste = wasteNames(report);
      const date = new Date(report.createdAt).getTime();

      const matchSearch =
        !query ||
        locationName(report).toLowerCase().includes(query) ||
        String(report.id).includes(query) ||
        waste.some((name) =>
          name.toLowerCase().includes(query)
        );

      const matchWaste =
        wasteFilters.length === 0 ||
        wasteFilters.some((name) =>
          waste.some(
            (value) =>
              value.toLowerCase() === name.toLowerCase()
          )
        );

      const matchSeverity =
        severityFilters.length === 0 ||
        severityFilters.some((name) =>
          SEVERITIES.find(
            (item) => item.label === name
          )?.values.includes(report.pollutionLevel)
        );

      const matchDate =
        dateRange === 0 ||
        (Number.isFinite(date) &&
          date <= now &&
          now - date <= dateRange * 86400000);

      return (
        matchSearch &&
        matchWaste &&
        matchSeverity &&
        matchDate
      );
    });
  }, [
    reports,
    search,
    wasteFilters,
    severityFilters,
    dateRange,
  ]);

  const activeAreas = useMemo(() => {
    return areas
      .map((area) => {
        const center = centerOf(area);

        if (!center) return null;

        const matched = filteredReports.filter(
          (report) =>
            distanceMeters(
              center,
              positionOf(report)
            ) <= RADIUS
        );

        return {
          ...area,
          matched,
        };
      })
      .filter(
        (area) =>
          area &&
          area.matched.length > 0
      );
  }, [areas, filteredReports]);

  const areaReports = useMemo(() => {
    if (!selectedArea) return [];

    const center = centerOf(selectedArea);
    if (!center) return [];

    return filteredReports.filter(
      (report) =>
        distanceMeters(
          center,
          positionOf(report)
        ) <= RADIUS
    );
  }, [selectedArea, filteredReports]);

  function resetFilters() {
    setSearch("");
    setWasteFilters([]);
    setSeverityFilters([]);
    setDateRange(30);
    setPanelMode(selectedArea ? "area" : "legend");
  }

  function chooseArea(area) {
    setSelectedArea(area);
    setSelectedReport(null);
    setSelectedPosition(centerOf(area));
    setPanelMode("area");
    setFlyTarget({
      position: centerOf(area),
      zoom: 17,
    });
  }

  function chooseMapPosition(position) {
    setSelectedPosition(position);
    setSelectedReport(null);

    const found = activeAreas.find((area) =>
      distanceMeters(
        centerOf(area),
        position
      ) <= RADIUS
    );

    if (found) {
      chooseArea(found);
    } else {
      setSelectedArea(null);
      setPanelMode("empty");
    }
  }

  function chooseReport(report) {
    setSelectedReport(report);

    const position = positionOf(report);
    if (position) {
      setFlyTarget({
        position,
        zoom: 17,
      });
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
        const position = [
          coords.latitude,
          coords.longitude,
        ];

        setUserPosition(position);
        setFlyTarget({
          position,
          zoom: 17,
        });

        chooseMapPosition(position);
      },
      () => {
        setLocationError(
          "Lokasi tidak tersedia. Periksa izin lokasi browser."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  function backToMap() {
    setScreen("map");
    setSelectedReport(null);
    setPanelMode(selectedArea ? "area" : "legend");
  }

  function backToMapDefault() {
    setScreen("map");
    setSelectedArea(null);
    setSelectedReport(null);
    setSelectedPosition(null);
    setPanelMode("legend");
  }

  function openAreaList() {
    setScreen("list");
  }

  function openReportDetail(report) {
    setSelectedReport(report);
    setScreen("detail");
  }

  const subtitle =
    screen === "list"
      ? "Daftar laporan terverifikasi pada area terpilih"
      : screen === "detail"
        ? "Detail laporan terverifikasi dari peta"
        : "Peta lokasi dan kepadatan laporan terverifikasi";

  return (
    <ReporterLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Explore Map
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {subtitle}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {locationError && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          {locationError}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          Memuat data peta...
        </div>
      ) : screen === "list" ? (
        <AreaReportList
          reports={areaReports}
          area={selectedArea}
          onBack={backToMap}
          onOpen={openReportDetail}
        />
      ) : screen === "detail" && selectedReport ? (
        <AreaReportDetail
          report={selectedReport}
          area={selectedArea}
          onBack={openAreaList}
        />
      ) : (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
          <div className="relative h-[740px] overflow-hidden rounded-lg bg-slate-100">
            {/* PETA UTAMA */}
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={14}
              className="h-full w-full"
              zoomControl={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapMover target={flyTarget} />

              <MapClickListener
                onSelect={chooseMapPosition}
              />

              {activeAreas.map((area, index) => (
                <DensityCircles
                  key={area.areaId ?? index}
                  area={area}
                  onClick={() => chooseArea(area)}
                />
              ))}

              {filteredReports.map((report) => (
                <CircleMarker
                  key={report.id}
                  center={positionOf(report)}
                  radius={7}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2,
                    fillColor: BLUE,
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () => {
                      chooseReport(report);
                    },
                  }}
                >
                  <Popup>
                    <div>
                      <p className="font-semibold">
                        OG-{report.id}
                      </p>

                      <p className="text-xs">
                        {locationName(report)}
                      </p>

                      <p className="text-xs">
                        {wasteNames(report).join(", ")}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          const area = activeAreas.find(
                            (candidate) =>
                              distanceMeters(
                                centerOf(candidate),
                                positionOf(report)
                              ) <= RADIUS
                          );

                          if (area) {
                            setSelectedArea(area);
                          }

                          openReportDetail(report);
                        }}
                        className="mt-2 rounded bg-[#0B3D91] px-3 py-2 text-xs text-white"
                      >
                        Detail Laporan
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {userPosition && (
                <CircleMarker
                  center={userPosition}
                  radius={9}
                  pathOptions={{
                    color: "white",
                    weight: 3,
                    fillColor: "#38bdf8",
                    fillOpacity: 1,
                  }}
                >
                  <Popup>Lokasi saya</Popup>
                </CircleMarker>
              )}
            </MapContainer>

            {/* PANEL FILTER KIRI */}
            <div className="absolute left-3 top-3 z-[500] max-h-[calc(100%-24px)] w-[285px] overflow-y-auto sm:left-4 sm:w-[310px]">
              <FilterPanel
                search={search}
                setSearch={setSearch}
                wasteFilters={wasteFilters}
                setWasteFilters={setWasteFilters}
                severityFilters={severityFilters}
                setSeverityFilters={setSeverityFilters}
                dateRange={dateRange}
                setDateRange={setDateRange}
                onReset={resetFilters}
              />
            </div>

            {/* TOMBOL LOKASI */}
            <button
              type="button"
              onClick={locateMe}
              className="absolute left-[310px] top-4 z-[500] rounded-lg bg-white px-4 py-3 text-xs font-semibold text-sky-600 shadow sm:left-[340px]"
            >
              Lokasi saya
            </button>

            {/* PANEL KANAN */}
            <div className="absolute right-3 top-3 z-[500] max-h-[calc(100%-24px)] w-[270px] overflow-y-auto lg:right-4 lg:w-[315px]">
              <RightPanel
                mode={
                  filtersActive && panelMode === "legend"
                    ? "filter"
                    : panelMode
                }
                selectedArea={selectedArea}
                areaReports={areaReports}
                selectedPosition={selectedPosition}
                filteredCount={filteredReports.length}
                filtersActive={filtersActive}
                selectedReport={selectedReport}
                onList={openAreaList}
                onReport={openReportDetail}
                onDetail={() => {
                  if (selectedArea) {
                    setPanelMode("area");
                  }
                }}
                onBack={backToMapDefault}
                onReset={resetFilters}
                onNewReport={() =>
                  navigate("/reports/new")
                }
              />
            </div>

            {/* INFORMASI AREA BAWAH */}
            {selectedArea && (
              <div className="absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 rounded-lg bg-white px-5 py-3 text-xs text-slate-600 shadow">
                Area {selectedArea.areaId ?? "-"} ·{" "}
                {areaReports.length} laporan
              </div>
            )}
          </div>
        </div>
      )}
    </ReporterLayout>
  );
}
