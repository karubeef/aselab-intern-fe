
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import ReporterLayout from "../../components/ReporterLayout";
import PageHeading from "../../components/PageHeading";
import ProfileAvatar from "../../components/ProfileAvatar";
import NoticeBanner from "../../components/NoticeBanner";
import AdminLogoutModal from "../../components/AdminLogoutModal";

import useMyProfile from "../../hooks/useMyProfile";
import { useAuth } from "../../context/authContext";

export default function AdminProfile() {
  const { profile, loading, error, reload } = useMyProfile();
  const { logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [showLogout, setShowLogout] = useState(false);

  // Notifikasi sukses setelah edit profil/password
  const notice = location.state?.notice;

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [notice, location.pathname, navigate]);

  function handleLogout() {
    setShowLogout(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <ReporterLayout>
      <div className="w-full">
        {/* ================= HEADER ================= */}
        <PageHeading
          title="Profil & Pengaturan"
          subtitle="Kelola informasi profil dan keamanan akun admin"
        />

        {/* ================= NOTIFIKASI ================= */}
        {notice && (
          <NoticeBanner
            type={notice.type}
            title={notice.title}
            message={notice.message}
          />
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={reload}
              className="text-sm font-semibold text-red-700 underline"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ================= LOADING ================= */}
        {loading && (
          <p className="py-8 text-sm text-slate-500">
            Memuat informasi profil...
          </p>
        )}

        {/* ================= PROFILE CONTENT ================= */}
        {!loading && profile && (
          <div className="space-y-4">

            {/* ================= KARTU PROFIL ================= */}
            <section className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white">

              {/* BANNER DARI FOTO PROFIL */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-200 sm:h-48">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Banner profil Admin"
                    className="h-full w-full scale-[2.5] object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#244b83] to-[#6296db]">
                    <span className="text-5xl font-bold text-white/30">
                      {profile.name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                )}

                {/* Overlay agar banner lebih lembut */}
                <div className="pointer-events-none absolute inset-0 bg-black/10" />
              </div>

              {/* ================= IDENTITAS ADMIN ================= */}
              <div className="relative flex flex-col gap-4 px-6 pb-7 sm:flex-row sm:items-start">

                {/* AVATAR */}
                <div className="-mt-14 shrink-0">
                  <ProfileAvatar
                    name={profile.name}
                    src={profile.profilePicture}
                    size={120}
                    bordered
                  />
                </div>

                {/* NAMA DAN EMAIL */}
                <div className="min-w-0 flex-1 pt-3">

                  <h2 className="text-xl font-semibold text-slate-600">
                    {profile.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Admin OceanGuard
                  </p>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:max-w-lg">

                    {/* NAMA LENGKAP */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">
                        Nama lengkap
                      </p>

                      <p className="break-words text-base text-slate-600">
                        {profile.name}
                      </p>
                    </div>

                    {/* EMAIL */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">
                        Email
                      </p>

                      <p className="break-all text-base text-slate-600">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* TOMBOL EDIT PROFIL */}
                <div className="self-start sm:mt-12">
                  <Link
                    to="/admin/profile/edit"
                    className="inline-flex min-w-40 items-center justify-center rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#082c6b]"
                  >
                    Edit Profil
                  </Link>
                </div>
              </div>
            </section>

            {/* ================= KEAMANAN AKUN ================= */}
            <section className="flex flex-col gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-lg font-semibold text-slate-600">
                  Keamanan Akun
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Perbarui kata sandi untuk menjaga akses akunmu.
                </p>
              </div>

              <Link
                to="/admin/profile/password"
                className="inline-flex min-w-40 items-center justify-center rounded-lg border border-[#0B3D91] px-5 py-3 text-sm font-semibold text-[#0B3D91] transition hover:bg-blue-50"
              >
                Ganti Kata Sandi
              </Link>
            </section>

            {/* ================= LOGOUT ================= */}
            <section className="flex flex-col gap-4 rounded-xl border-2 border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-lg font-semibold text-slate-600">
                  Keluar dari Akun
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Akhiri sesi penggunaan OceanGuard pada perangkat ini.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLogout(true)}
                className="min-w-40 rounded-lg bg-[#C52026] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Logout
              </button>
            </section>

          </div>
        )}

        {/* ================= MODAL LOGOUT ================= */}
        {showLogout && (
          <AdminLogoutModal
            onCancel={() => setShowLogout(false)}
            onConfirm={handleLogout}
          />
        )}
      </div>
    </ReporterLayout>
  );
}
