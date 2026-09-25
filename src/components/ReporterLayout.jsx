import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/reports/new", label: "Lapor Sampah", icon: "＋" },
  { to: "/my-reports", label: "Laporan Saya", icon: "≡" },
  { to: "/map", label: "Explore Map", icon: "◎" },
  { to: "/profile", label: "Profil", icon: "○" },
];

export default function ReporterLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-100">
            <span className="w-9 h-9 rounded-full bg-[#1179C4] flex items-center justify-center text-white font-bold text-sm">
              O
            </span>
            <div>
              <p className="font-bold text-sm">OceanGuard</p>
              <p className="text-xs text-slate-400">Protect Our Ocean</p>
            </div>
          </div>

          <div className="px-6 pt-5">
            <span className="inline-block bg-sky-50 text-[#1179C4] text-xs font-medium px-3 py-1.5 rounded-full">
              {user?.role === "ADMIN" ? "Admin" : "Reporter / User"}
            </span>
          </div>

          <nav className="px-4 pt-6 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname === item.to
                    ? "bg-[#1179C4] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
            {user?.role === "ADMIN" && (
                <>
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 border border-slate-200"
                    >
                        ▦ Dashboard Admin
                    </Link>
                    <Link
                        to="/admin/verify-reports"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 border border-slate-200"
                    >
                        ⇄ Verifikasi Laporan
                    </Link>
                </>
            )}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-500"
          >
            ← Ke Landing Page
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white">
          <span className="text-slate-400 text-xs font-medium tracking-wide">
            REPORTER PANEL · OCEANGUARD
          </span>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#1179C4] text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}