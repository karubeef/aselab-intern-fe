
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import PublicNavbar from "../../components/public/PublicNavbar";
import BackLink from "../../components/public/BackLink";

import {
  getHeatmap,
  getHeatmapAreaDetail,
} from "../../api/reports";

const WASTES = [
  "Plastik",
  "Kaca",
  "Logam",
  "Jaring / Alat Tangkap",
  "Organik",
  "Berbahaya (B3)",
];

const LEVELS = [
  "Rendah",
  "Sedang",
  "Tinggi",
];

const OPTIONS = [
  { value: "30", label: "30 Hari Terakhir" },
  { value: "7", label: "7 Hari Terakhir" },
  { value: "90", label: "90 Hari Terakhir" },
  { value: "0", label: "Semua Waktu" },
];

const detailCache = new Map();

function getCoord(area) {
  if (
    area?.centerLat == null ||
    area?.centerLon == null
  ) {
    return null;
  }

  const lat = Number(area.centerLat);
  const lon = Number(area.centerLon);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  )
    ? [lat, lon]
    : null;
}

function getAreaColor(count) {
  if (count >= 6) return "#E52529";
  if (count >= 3) return "#ED6205";
  return "#16833F";
}

function getWasteNames(report) {
  const raw =
    report?.wasteTypes ||
    report?.types ||
    (report?.wasteType
      ? [report.wasteType]
      : []);

  const values = [
    ...(Array.isArray(raw) ? raw : [raw]),
  ];

  if (report?.customWasteType) {
    values.push(report.customWasteType);
  }

  return values
    .map((w) => {
      const item = String(
        typeof w === "string"
          ? w
          : w?.name || w?.type || ""
      ).toUpperCase();

      if (item.includes("PLAST")) {
        return "Plastik";
      }

      if (
        item.includes("GLASS") ||
        item.includes("KACA")
      ) {
        return "Kaca";
      }

      if (
        item.includes("METAL") ||
        item.includes("LOGAM")
      ) {
        return "Logam";
      }

      if (
        item.includes("NET") ||
        item.includes("FISHING") ||
        item.includes("JARING")
      ) {
        return "Jaring / Alat Tangkap";
      }

      if (item.includes("ORGAN")) {
        return "Organik";
      }

      if (
        item.includes("HAZARD") ||
        item.includes("B3") ||
        item.includes("BAHAYA")
      ) {
        return "Berbahaya (B3)";
      }

      return typeof w === "string"
        ? w
        : w?.name || "";
    })
    .filter(Boolean);
}

function levelName(report) {
  const level = String(
    report?.pollutionLevel ||
    report?.severity ||
    ""
  ).toUpperCase();

  if (
    level === "LOW" ||
    level === "RENDAH"
  ) {
    return "Rendah";
  }

  if (
    level === "MODERATE" ||
    level === "MEDIUM" ||
    level === "SEDANG"
  ) {
    return "Sedang";
  }

  if (
    level === "HIGH" ||
    level === "CRITICAL" ||
    level === "TINGGI"
  ) {
    return "Tinggi";
  }

  return "";
}

function matchesReport(report, params) {
  const query = (
    params.get("q") || ""
  )
    .trim()
    .toLowerCase();

  const wastes = (
    params.get("waste") || ""
  )
    .split("|")
    .filter(Boolean);

  const levels = (
    params.get("levels") || ""
  )
    .split("|")
    .filter(Boolean);

  const days = params.get("days");

  const title = String(
    report.locationName ||
    report.description ||
    ""
  ).toLowerCase();

  if (query && !title.includes(query)) {
    return false;
  }

  if (
    wastes.length &&
    !getWasteNames(report).some((w) =>
      wastes.includes(w)
    )
  ) {
    return false;
  }

  if (
    levels.length &&
    !levels.includes(levelName(report))
  ) {
    return false;
  }

  if (days && days !== "0") {
    const created = new Date(
      report.createdAt
    ).getTime();

    if (
      !Number.isFinite(created) ||
      Date.now() - created >
        Number(days) * 86400000
    ) {
      return false;
    }
  }

  return true;
}

async function readDetail(areaId) {
  const key = String(areaId);
  const cached = detailCache.get(key);

  if (
    !cached ||
    Date.now() - cached.at > 45000
  ) {
    const promise = getHeatmapAreaDetail(
      areaId
    ).catch((err) => {
      detailCache.delete(key);
      throw err;
    });

    detailCache.set(key, {
      promise,
      at: Date.now(),
    });
  }

  return detailCache.get(key).promise;
}

function FocusMap({ areas, selected }) {
  const map = useMap();
  const init = useRef(false);

  useEffect(() => {
    if (!areas.length || init.current) {
      return;
    }

    const points = areas
      .map(getCoord)
      .filter(Boolean);

    if (!points.length) return;

    init.current = true;

    if (points.length === 1) {
      map.setView(points[0], 18, {
        animate: false,
      });
    } else {
      const bounds = L.latLngBounds(points);

      const far =
        map.distance(
          bounds.getSouthWest(),
          bounds.getNorthEast()
        ) > 45000;

      const top = [...areas].sort(
        (a, b) =>
          Number(b.totalReports || 0) -
          Number(a.totalReports || 0)
      )[0];

      if (far) {
        map.setView(getCoord(top), 15, {
          animate: false,
        });
      } else {
        map.fitBounds(bounds, {
          padding: [25, 25],
          maxZoom: 16,
          animate: false,
        });
      }
    }
  }, [areas, map]);

  useEffect(() => {
    const position =
      selected && getCoord(selected);

    if (position) {
      map.flyTo(position, 18, {
        duration: 0.6,
      });
    }
  }, [selected, map]);

  return null;
}

function FilterScreen({ params, onApply }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState(
    params.get("q") || ""
  );

  const [wastes, setWastes] = useState(
    (params.get("waste") || "")
      .split("|")
      .filter(Boolean)
  );

  const [levels, setLevels] = useState(
    (params.get("levels") || "")
      .split("|")
      .filter(Boolean)
  );

  const [days, setDays] = useState(
    params.get("days") || "30"
  );

  function toggle(value, current, setter) {
    setter(
      current.includes(value)
        ? current.filter(
            (v) => v !== value
          )
        : [...current, value]
    );
  }

  function clear() {
    setSearch("");
    setWastes([]);
    setLevels([]);
    setDays("30");
  }

  function submit() {
    const next = new URLSearchParams();

    if (search.trim()) {
      next.set("q", search.trim());
    }

    if (wastes.length) {
      next.set(
        "waste",
        wastes.join("|")
      );
    }

    if (levels.length) {
      next.set(
        "levels",
        levels.join("|")
      );
    }

    next.set("days", days);

    onApply(
      `/public-map?${next.toString()}`
    );
  }

  return (
    <div className="og-mobile-standalone min-h-screen bg-white text-[#101C43]">
      <PublicNavbar />

      <main className="og-mobile-inner og-mobile-filter">
        <BackLink
          to={`/public-map${location.search}`}
          label="Kembali ke Peta"
        />

        <h1 className="og-mobile-heading">
          Cari lokasi &amp; filter
        </h1>

        <label className="og-mobile-searchbox">
          <span aria-hidden="true">
            ⌕
          </span>

          <input
            type="search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Cari nama pantai, teluk, atau desa..."
          />
        </label>

        <div className="og-mobile-filter-row">
          <strong>Filter</strong>

          <button
            type="button"
            onClick={clear}
          >
            Reset
          </button>
        </div>

        <div className="og-mobile-filter-group">
          <h2>JENIS SAMPAH</h2>

          {WASTES.map((w) => (
            <label
              key={w}
              className="og-mobile-checkbox"
            >
              <input
                type="checkbox"
                checked={wastes.includes(w)}
                onChange={() =>
                  toggle(
                    w,
                    wastes,
                    setWastes
                  )
                }
              />

              {w}
            </label>
          ))}
        </div>

        <div className="og-mobile-filter-group">
          <h2>TINGKAT KEPARAHAN</h2>

          <div className="og-mobile-pills">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={levels.includes(level)}
                onClick={() =>
                  toggle(
                    level,
                    levels,
                    setLevels
                  )
                }
                className={
                  levels.includes(level)
                    ? "selected"
                    : ""
                }
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="og-mobile-filter-group">
          <label htmlFor="og-mobile-days">
            RENTANG TANGGAL
          </label>

          <select
            id="og-mobile-days"
            value={days}
            onChange={(e) =>
              setDays(e.target.value)
            }
          >
            {OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="og-mobile-density">
          <h2>KEPADATAN LAPORAN</h2>

          <div className="og-density-bars">
            <i />
            <i />
            <i />
          </div>

          <div>
            <span>Rendah</span>
            <span>Tinggi</span>
          </div>
        </div>

        <button
          type="button"
          className="og-mobile-primary og-mobile-primary-wide"
          onClick={submit}
        >
          Terapkan Filter
        </button>

        <button
          type="button"
          className="og-mobile-outline og-mobile-primary-wide"
          onClick={() => {
            clear();
            navigate("/public-map");
          }}
        >
          Reset Filter
        </button>
      </main>
    </div>
  );
}

function SummaryScreen({
  areaId,
  areas,
  loading,
  error,
}) {
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] =
    useState(true);

  const [detailError, setDetailError] =
    useState("");

  const selected = areas.find(
    (area) =>
      String(area.areaId) === String(areaId)
  );

  useEffect(() => {
    let mounted = true;

    setDetailLoading(true);
    setDetailError("");

    readDetail(areaId)
      .then((value) => {
        if (mounted) {
          setDetail(value);
        }
      })
      .catch((err) => {
        if (mounted) {
          setDetailError(
            err.message ||
              "Gagal memuat ringkasan area"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setDetailLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [areaId]);

  const reports = Array.isArray(
    detail?.reports
  )
    ? detail.reports
    : [];

  const done = reports.filter(
    (r) => r.status === "RESOLVED"
  ).length;

  const pending = reports.filter(
    (r) => r.status !== "RESOLVED"
  ).length;

  const wasteCounts = new Map();

  reports.forEach((r) => {
    getWasteNames(r).forEach((w) => {
      wasteCounts.set(
        w,
        (wasteCounts.get(w) || 0) + 1
      );
    });
  });

  const wasteRank = [
    ...wasteCounts,
  ].sort((a, b) => b[1] - a[1]);

  const total =
    reports.length ||
    Number(selected?.totalReports || 0);

  const areaName =
    selected?.latestReport?.locationName ||
    detail?.name ||
    `Area ${areaId}`;

  return (
    <div className="og-mobile-standalone min-h-screen bg-white text-[#101C43]">
      <PublicNavbar />

      <main className="og-mobile-inner og-mobile-summary">
        <BackLink
          to="/public-map"
          label="Kembali ke Peta"
        />

        <h1 className="og-mobile-heading">
          Ringkasan area
        </h1>

        {loading || detailLoading ? (
          <p role="status">
            Memuat ringkasan area...
          </p>
        ) : error || detailError ? (
          <p
            role="alert"
            className="text-red-600"
          >
            {error || detailError}
          </p>
        ) : (
          <>
            <p className="og-summary-caption">
              AREA TERPILIH
            </p>

            <h2 className="og-summary-area-name">
              {areaName}
            </h2>

            <div className="og-summary-stats">
              <div>
                <strong>{total}</strong>
                <span>Laporan</span>
              </div>

              <div>
                <strong>
                  {reports.length
                    ? pending
                    : "–"}
                </strong>
                <span>
                  Belum ditangani
                </span>
              </div>

              <div>
                <strong>
                  {reports.length
                    ? done
                    : "–"}
                </strong>
                <span>Selesai</span>
              </div>
            </div>

            <h3 className="og-summary-caption">
              JENIS SAMPAH DOMINAN
            </h3>

            {wasteRank.length ? (
              <div className="og-summary-types">
                {wasteRank
                  .slice(0, 5)
                  .map(([name, count]) => (
                    <div key={name}>
                      <span>{name}</span>
                      <span>
                        {count} laporan
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="og-summary-note">
                Rincian jenis sampah belum
                tersedia pada data laporan
                area ini.
              </p>
            )}

            <h3 className="og-summary-caption">
              LAPORAN TERBARU DI AREA INI
            </h3>

            <div className="og-summary-reports">
              {reports.length ? (
                [...reports]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.createdAt || 0
                      ) -
                      new Date(
                        a.createdAt || 0
                      )
                  )
                  .slice(0, 3)
                  .map((r) => (
                    <div
                      className="og-summary-report"
                      key={r.id}
                    >
                      <h4>
                        {r.locationName ||
                          `Laporan #${r.id}`}
                      </h4>

                      <p>
                        {levelName(r) ||
                          "Status"}{" "}
                        ·{" "}
                        {r.createdAt
                          ? new Date(
                              r.createdAt
                            ).toLocaleDateString(
                              "id-ID"
                            )
                          : r.status ||
                            "Terverifikasi"}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="og-summary-note">
                  Belum ada detail laporan
                  yang bisa ditampilkan.
                </p>
              )}
            </div>

            <Link
              to="/reports/new"
              className="og-mobile-primary og-mobile-primary-wide"
            >
              Lapor di Area Ini
            </Link>

            <p className="og-summary-note">
              Peta hanya menampilkan area
              laporan yang sudah diverifikasi
              Admin.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default function MobilePublicMapPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () =>
      new URLSearchParams(
        location.search
      ),
    [location.search]
  );

  const isFilter =
    location.pathname === "/public-map/filter";

  const areaMatch = location.pathname.match(
    /^\/public-map\/area\/(.+)$/
  );

  const [areas, setAreas] = useState([]);
  const [areaDetails, setAreaDetails] =
    useState(null);

  const [selectedId, setSelectedId] = useState(
    params.get("area") || ""
  );

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getHeatmap()
      .then((result) => {
        if (mounted) {
          setAreas(
            Array.isArray(result)
              ? result
              : []
          );
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err.message ||
              "Gagal memuat peta"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const detailedFilter =
    params.has("waste") ||
    params.has("levels") ||
    params.has("days");

  useEffect(() => {
    if (
      !detailedFilter ||
      !areas.length ||
      isFilter ||
      areaMatch
    ) {
      setAreaDetails(null);
      return;
    }

    let mounted = true;
    setFilterLoading(true);

    Promise.allSettled(
      areas.map((area) =>
        readDetail(area.areaId)
      )
    )
      .then((results) => {
        if (!mounted) return;

        const byId = new Map();

        results.forEach((result, index) => {
          if (
            result.status === "fulfilled"
          ) {
            byId.set(
              String(areas[index].areaId),
              result.value
            );
          }
        });

        setAreaDetails(byId);
      })
      .finally(() => {
        if (mounted) {
          setFilterLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [
    areas,
    detailedFilter,
    isFilter,
    location.search,
  ]);

  const shown = useMemo(() => {
    return areas.filter((area) => {
      if (!getCoord(area)) {
        return false;
      }

      if (
        !params.has("q") &&
        !detailedFilter
      ) {
        return true;
      }

      const titleMatch = (
        area.latestReport?.locationName ||
        ""
      )
        .toLowerCase()
        .includes(
          (params.get("q") || "").toLowerCase()
        );

      if (detailedFilter) {
        if (!areaDetails) return false;

        const reports =
          areaDetails.get(
            String(area.areaId)
          )?.reports || [];

        return reports.some((report) =>
          matchesReport(report, params)
        );
      }

      return titleMatch;
    });
  }, [
    areas,
    params,
    detailedFilter,
    areaDetails,
  ]);

  if (isFilter) {
    return (
      <FilterScreen
        params={params}
        onApply={navigate}
      />
    );
  }

  if (areaMatch) {
    return (
      <SummaryScreen
        areaId={decodeURIComponent(
          areaMatch[1]
        )}
        areas={areas}
        loading={loading}
        error={error}
      />
    );
  }

  const selected =
    shown.find(
      (area) =>
        String(area.areaId) ===
        String(selectedId)
    ) ||
    shown[0] ||
    null;

  const summaryLink = selected
    ? `/public-map/area/${encodeURIComponent(
        selected.areaId
      )}`
    : "";

  return (
    <div className="og-mobile-standalone min-h-screen bg-white text-[#101C43]">
      <PublicNavbar />

      <main className="og-mobile-inner og-mobile-map">
        <BackLink
          to="/"
          label="Kembali ke Beranda"
        />

        <h1 className="og-mobile-heading">
          Peta sebaran sampah
        </h1>

        <p className="og-mobile-subtitle">
          Lihat laporan terverifikasi dan
          kepadatan laporan di pesisir.
        </p>

        <Link
          to={`/public-map/filter${location.search}`}
          className="og-mobile-outline og-mobile-primary-wide"
        >
          Cari Lokasi &amp; Filter
        </Link>

        <div className="og-mobile-map-canvas">
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            scrollWheelZoom={false}
            className="h-full w-full"
            key="mobile-public-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FocusMap
              areas={shown}
              selected={selected}
            />

            {shown.map((area) => {
              const coord = getCoord(area);

              return (
                <Fragment key={area.areaId}>
                  <Circle
                    center={coord}
                    radius={20}
                    pathOptions={{
                      color: getAreaColor(
                        Number(
                          area.totalReports || 0
                        )
                      ),
                      fillColor: getAreaColor(
                        Number(
                          area.totalReports || 0
                        )
                      ),
                      fillOpacity: 0.3,
                      weight: 1,
                    }}
                    eventHandlers={{
                      click: () =>
                        setSelectedId(
                          String(area.areaId)
                        ),
                    }}
                  />

                  <CircleMarker
                    center={coord}
                    radius={9}
                    pathOptions={{
                      color: "#FFFFFF",
                      fillColor: "#0B3D91",
                      fillOpacity: 1,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () =>
                        setSelectedId(
                          String(area.areaId)
                        ),
                    }}
                  >
                    <Popup>
                      <strong>
                        {area.latestReport
                          ?.locationName ||
                          `Area ${area.areaId}`}
                      </strong>

                      <p>
                        {area.totalReports} laporan
                        terverifikasi
                      </p>

                      <Link
                        to={`/public-map/area/${encodeURIComponent(
                          area.areaId
                        )}`}
                      >
                        Lihat Ringkasan Area →
                      </Link>
                    </Popup>
                  </CircleMarker>
                </Fragment>
              );
            })}
          </MapContainer>
        </div>

        {loading || filterLoading ? (
          <p
            role="status"
            className="og-map-message"
          >
            Memuat data peta...
          </p>
        ) : error ? (
          <p
            role="alert"
            className="og-map-message text-red-600"
          >
            {error}
          </p>
        ) : shown.length === 0 ? (
          <p className="og-map-message">
            Tidak ada area yang sesuai
            dengan filter.
          </p>
        ) : null}

        <p className="og-mobile-map-legend">
          Titik biru: laporan terverifikasi
          {"\n"}
          Warna area: kepadatan laporan
          {"\n"}
          Ilustrasi area: radius maksimal 20 m
        </p>

        {summaryLink ? (
          <Link
            to={summaryLink}
            className="og-mobile-primary og-mobile-primary-wide"
          >
            Lihat Ringkasan Area
          </Link>
        ) : (
          <span className="og-mobile-primary og-mobile-primary-wide og-primary-disabled">
            Pilih Area pada Peta
          </span>
        )}

        <p className="og-mobile-subtitle">
          Peta publik dapat dilihat tanpa
          masuk. Masuk untuk mengirim laporan.
        </p>
      </main>
    </div>
  );
}
