
import { Link } from "react-router-dom";
import logo from "../../assets/oceanguard-logo.png";

export default function PublicFooter() {
  return (
    <footer className="bg-white px-6 py-12 text-sm text-slate-500">
      <div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-4">
        <div>
          <Link to="/" className="mb-3 flex items-center gap-2 text-xl font-bold text-[#10254A]">
            <img src={logo} alt="" className="h-9 w-9 object-contain" />
            OceanGuard
          </Link>
          <p>Platform pelaporan sampah laut dan pesisir.</p>
          <p>Mendukung SDG 14, 11, dan 17.</p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-slate-800">Platform</h3>
          <div className="flex flex-col gap-2">
            <Link to="/public-map">Peta Sebaran</Link>
            <Link to="/#cara-kerja">Cara Kerja</Link>
            <Link to="/informasi">Informasi & Edukasi</Link>
            <Link to="/#faq">FAQ</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-slate-800">Untuk Dinas</h3>
          <div className="flex flex-col gap-2">
            <Link to="/login">Panel Admin</Link>
            <span>Hubungi Kami</span>
            <span>Kerja Sama</span>
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-slate-800">Legal</h3>
          <p>Syarat & Ketentuan</p>
          <p>Kebijakan Privasi</p>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl border-t pt-5 text-xs text-slate-400">
        © 2026 OceanGuard · Protect Our Ocean, Together
      </p>
    </footer>
  );
}
