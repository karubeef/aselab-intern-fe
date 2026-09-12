import { Link } from "react-router-dom";

const STATS = [
  { value: "14.8K", label: "Laporan Masuk" },
  { value: "3.2K", label: "Relawan Aktif" },
  { value: "247", label: "Titik Terpantau" },
  { value: "86%", label: "Tingkat Resolusi" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panel kiri */}
      <div className="bg-[#1179C4] text-white w-full md:w-1/2 flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#1179C4]" />
          </span>
          <span className="font-bold text-lg">OceanGuard</span>
        </div>

        <div className="py-12">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Protect Our
            <br />
            Ocean,
            <br />
            Together.
          </h1>
          <p className="text-white/85 text-base mb-10 max-w-sm">
            Bergabung dengan ribuan relawan yang aktif menjaga kebersihan laut
            Indonesia setiap harinya.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-lg p-5">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/70 text-sm">© 2026 OceanGuard</p>
      </div>

      {/* Panel kanan */}
      <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="text-slate-400 text-sm inline-flex items-center gap-1 mb-8"
          >
            ← Kembali ke Beranda
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}