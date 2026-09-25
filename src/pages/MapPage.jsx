import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getHeatmap, getHeatmapAreaDetail } from "../api/reports";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const INDONESIA_CENTER = [-2.5, 118];

function getMarkerSize(totalReports) {
  if (totalReports >= 10) return 22;
  if (totalReports >= 5) return 16;
  return 10;
}

export default function MapPage() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadHeatmap();
  }, []);

  async function loadHeatmap() {
    try {
      setLoading(true);
      const data = await getHeatmap();
      setAreas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAreaClick(areaId) {
    try {
      setLoadingDetail(true);
      const detail = await getHeatmapAreaDetail(areaId);
      setSelectedArea(detail);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Peta */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70">
            <p>Memuat peta...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <MapContainer
          center={INDONESIA_CENTER}
          zoom={5}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {areas.map((area) => (
            <CircleMarker
              key={area.areaId}
              center={[area.centerLat, area.centerLon]}
              radius={getMarkerSize(area.totalReports)}
              pathOptions={{
                color: "#1179C4",
                fillColor: "#1179C4",
                fillOpacity: 0.6,
              }}
              eventHandlers={{
                click: () => handleAreaClick(area.areaId),
              }}
            >
              <Popup>
                <p className="font-semibold mb-1">
                  {area.totalReports} laporan di area ini
                </p>
                <p className="text-xs text-slate-500">
                  Jenis terakhir:{" "}
                  {Array.isArray(area.latestReport?.wasteTypes)
                    ? area.latestReport.wasteTypes.join(", ")
                    : "-"}
                </p>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Panel detail area */}
      <div className="w-full md:w-96 border-l border-slate-200 overflow-y-auto p-5">
        <h2 className="font-bold text-lg mb-1">Peta Sebaran Laporan</h2>
        <p className="text-slate-500 text-sm mb-4">
          Klik titik di peta untuk lihat detail laporan di area itu.
        </p>

        {loadingDetail && <p className="text-sm">Memuat detail...</p>}

        {!loadingDetail && !selectedArea && (
          <p className="text-slate-400 text-sm">
            Belum ada area yang dipilih. Total {areas.length} area laporan
            terverifikasi ditemukan.
          </p>
        )}

        {!loadingDetail && selectedArea && (
          <div>
            <p className="font-semibold mb-1">
              {selectedArea.totalReports} laporan di area ini
            </p>
            <p className="text-slate-400 text-xs mb-4">
              {selectedArea.centerLat.toFixed(4)},{" "}
              {selectedArea.centerLon.toFixed(4)}
            </p>

            <div className="flex flex-col gap-3">
              {selectedArea.reports.map((r) => (
                <Link
                  key={r.id}
                  to={`/reports/${r.id}`}
                  className="border border-slate-200 rounded-lg p-3 block hover:border-[#1179C4]"
                >
                  <p className="font-medium text-sm">
                    {Array.isArray(r.wasteTypes)
                      ? r.wasteTypes.join(", ")
                      : r.wasteTypes}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(r.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}