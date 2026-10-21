
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllReports } from "../../api/reports";
import { getLocalResolution } from "../../utils/localResolution";
import {
  getCurrentStage,
  STAGE_LABELS,
  STAGE_COLORS,
} from "../../utils/reportStage";
import ReporterLayout from "../../components/ReporterLayout";
import { POLLUTION_LABELS } from "../../constants/report";

const POLLUTION_DOTS = {
  LOW: "#22c55e",
  MODERATE: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua status" },
  { value: "SUBMITTED", label: "Terkirim" },
  { value: "UNDER_REVIEW", label: "Sedang Ditinjau" },
  { value: "VERIFIED", label: "Terverifikasi" },
  { value: "IN_PROGRESS", label: "Sedang Ditangani" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
];

export default function AdminManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState("ALL");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("ALL");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);

      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const enrichedReports = useMemo(() => {
    return reports
      .map((report) => {
        const local = getLocalResolution(report.id);

        return {
          ...report,
          stage: getCurrentStage(report, local),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
  }, [reports]);

  const filteredReports = useMemo(() => {
    const query = appliedSearch.toLowerCase();

    return enrichedReports.filter((report) => {
      const matchesStatus =
        appliedStatus === "ALL" ||
        report.stage === appliedStatus;

      const matchesQuery =
        query === "" ||
        `og-${report.id}`.includes(query) ||
        (report.locationName || "")
          .toLowerCase()
          .includes(query) ||
        (report.user?.name || "")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [
    enrichedReports,
    appliedSearch,
    appliedStatus,
  ]);

  function handleApply() {
    setAppliedSearch(draftSearch);
    setAppliedStatus(draftStatus);
  }

  return (
    <ReporterLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#15316E]">
            Kelola Laporan
          </h1>

          <p className="text-sm text-slate-400">
            Tinjau laporan dan pantau penanganannya
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="min-w-[260px] flex-1">
          <label
            htmlFor="admin-report-search"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Cari laporan
          </label>

          <input
            id="admin-report-search"
            type="text"
            placeholder="Cari ID, lokasi, atau reporter..."
            value={draftSearch}
            onChange={(event) =>
              setDraftSearch(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
          />
        </div>

        <div>
          <label
            htmlFor="admin-report-status"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id="admin-report-status"
            value={draftStatus}
            onChange={(event) =>
              setDraftStatus(event.target.value)
            }
            className="w-48 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="rounded-lg bg-[#15316E] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0F2555]"
        >
          Terapkan
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">
          Memuat data...
        </p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-2">
            <span className="font-semibold">
              {filteredReports.length} laporan
            </span>

            <span className="text-sm text-slate-400">
              Terbaru terlebih dahulu
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">
                    Laporan & Lokasi
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Reporter
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Keparahan
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Tanggal
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-400">
                        OG-{report.id}
                      </p>

                      <p className="font-semibold">
                        {report.locationName ||
                          `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {report.user?.name ||
                        "Tidak diketahui"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              POLLUTION_DOTS[
                                report.pollutionLevel
                              ],
                          }}
                        />

                        {
                          POLLUTION_LABELS[
                            report.pollutionLevel
                          ]
                        }
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          STAGE_COLORS[report.stage]
                        }`}
                      >
                        {STAGE_LABELS[report.stage]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {new Date(
                        report.createdAt
                      ).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/manage-reports/${report.id}`}
                        className="font-medium text-[#1179C4]"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ReporterLayout>
  );
}
