export const STAGE_LABELS = {
  SUBMITTED: "Terkirim",
  UNDER_REVIEW: "Sedang Ditinjau",
  VERIFIED: "Terverifikasi",
  IN_PROGRESS: "Sedang Ditangani",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
};

export const STAGE_COLORS = {
  SUBMITTED: "bg-slate-100 text-slate-600",
  UNDER_REVIEW: "bg-amber-50 text-amber-700",
  VERIFIED: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  RESOLVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
};

export function getCurrentStage(report) {
  return report.status;
}

export function getStagePath(report) {
  if (report.status === "REJECTED") {
    return ["SUBMITTED", "UNDER_REVIEW", "REJECTED"];
  }

  const order = ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "IN_PROGRESS", "RESOLVED"];
  const index = order.indexOf(report.status);
  return order.slice(0, index + 1);
}