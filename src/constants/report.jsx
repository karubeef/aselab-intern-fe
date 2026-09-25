export const WASTE_TYPES = [
  { id: 1, name: "Plastik" },
  { id: 2, name: "Kaca" },
  { id: 3, name: "Logam" },
  { id: 4, name: "Jaring / Alat Pancing" },
  { id: 5, name: "Organik" },
  { id: 6, name: "Lainnya" },
];

export const POLLUTION_LEVELS = [
  { value: "LOW", label: "Rendah", desc: "Sampah sedikit, tidak mengganggu ekosistem" },
  { value: "MODERATE", label: "Sedang", desc: "Cukup banyak, perlu penanganan dalam 1–2 minggu" },
  { value: "HIGH", label: "Tinggi", desc: "Banyak sampah, mengancam satwa laut lokal" },
  { value: "CRITICAL", label: "Kritis", desc: "Darurat! Perlu penanganan segera dalam 24 jam" },
];

export const POLLUTION_LABELS = {
  LOW: "Rendah",
  MODERATE: "Sedang",
  HIGH: "Tinggi",
  CRITICAL: "Kritis",
};

export const POLLUTION_COLORS = {
  LOW: "bg-green-50 text-green-700",
  MODERATE: "bg-amber-50 text-amber-700",
  HIGH: "bg-orange-50 text-orange-700",
  CRITICAL: "bg-red-50 text-red-700",
};

export const STATUS_LABELS = {
  SUBMITTED: "Menunggu Verifikasi",
  UNDER_REVIEW: "Sedang Ditinjau",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  IN_PROGRESS: "Sedang Ditangani",
  RESOLVED: "Selesai",
};

export const STATUS_COLORS = {
  SUBMITTED: "bg-amber-50 text-amber-700",
  UNDER_REVIEW: "bg-blue-50 text-blue-700",
  VERIFIED: "bg-sky-50 text-sky-700",
  REJECTED: "bg-red-50 text-red-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  RESOLVED: "bg-green-50 text-green-700",
};

export function getPlaceholderPhotoUrl(index) {
  return `https://placehold.co/600x400?text=Foto+${index + 1}`;
}