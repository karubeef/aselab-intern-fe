
import { Link } from "react-router-dom";
import logo from "../../assets/oceanguard-logo-w.png";

export default function PublicNavbar({ transparent = false }) {
  return (
    <header
      className={
        transparent
          ? "absolute inset-x-0 top-0 z-30 text-white"
          : "relative z-30 border-b border-slate-200 bg-white text-[#10254A]"
      }
    >
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span
            className={
              transparent
                ? "flex h-11 w-11 items-center justify-center"
                : "flex h-11 w-11 items-center justify-center rounded-lg bg-[#1179C4]"
            }
          >
            <img
              src={logo}
              alt="Logo OceanGuard"
              className="h-10 w-10 object-contain"
            />
          </span>

          <span className="text-xl font-bold">
            OceanGuard
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link to="/public-map" className="hover:underline">
            Peta
          </Link>

          <Link to="/#cara-kerja" className="hover:underline">
            Cara Kerja
          </Link>

          <Link to="/informasi" className="hover:underline">
            Informasi
          </Link>

          <Link to="/#faq" className="hover:underline">
            FAQ
          </Link>
        </nav>

        <div className="flex gap-2">
          <Link
            to="/login"
            className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
              transparent
                ? "border-white/70"
                : "border-[#0B3D91] text-[#0B3D91]"
            }`}
          >
            Masuk
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
