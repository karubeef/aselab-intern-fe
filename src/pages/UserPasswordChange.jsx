
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReporterLayout from "../components/ReporterLayout";
import { updateProfile } from "../api/users";

export default function UserPasswordChange() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = {
    oldPassword: !oldPassword
      ? "Password saat ini wajib diisi."
      : "",
    newPassword: !newPassword
      ? "Password baru wajib diisi."
      : newPassword.length < 8
        ? "Password baru minimal 8 karakter."
        : newPassword === oldPassword
          ? "Password baru harus berbeda dari password saat ini."
          : "",
    confirmPassword: !confirmPassword
      ? "Konfirmasi password wajib diisi."
      : confirmPassword !== newPassword
        ? "Konfirmasi password belum sama dengan password baru."
        : "",
  };

  const invalid = Object.values(errors).some(Boolean);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (invalid) return;

    setSaving(true);

    try {
      await updateProfile({
        currentPassword: oldPassword,
        newPassword,
      });

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border px-4 py-3 text-sm outline-none ${
      hasError
        ? "border-red-500"
        : "border-slate-300 focus:border-[#0B3D91]"
    }`;

  if (success) {
    return (
      <ReporterLayout>
        <h1 className="mb-10 text-2xl font-semibold text-slate-900">
          Password berhasil diubah
        </h1>

        <div className="rounded-lg bg-green-100 p-5">
          <h2 className="font-semibold text-green-900">
            Password baru sudah tersimpan
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Gunakan password baru saat masuk kembali ke akun OceanGuard.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mt-5 rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white"
        >
          Kembali ke Profil
        </button>
      </ReporterLayout>
    );
  }

  return (
    <ReporterLayout>
      <h1 className="mb-10 text-2xl font-semibold text-slate-900">
        Ganti Password
      </h1>

      <p className="mb-5 text-sm text-slate-500">
        Masukkan kata sandi saat ini, lalu buat kata sandi baru.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8 rounded-xl border border-slate-200 p-6">
          <div className="max-w-2xl">
            <label className="mb-2 block text-sm text-slate-800">
              Password saat ini *
            </label>

            <input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass(
                submitted && errors.oldPassword
              )}
            />

            {submitted && errors.oldPassword && (
              <p className="mt-2 text-xs text-red-600">
                {errors.oldPassword}
              </p>
            )}
          </div>

          <div className="max-w-2xl">
            <label className="mb-2 block text-sm text-slate-800">
              Password baru *
            </label>

            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass(
                submitted && errors.newPassword
              )}
            />

            {submitted && errors.newPassword ? (
              <p className="mt-2 text-xs text-red-600">
                {errors.newPassword}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Gunakan password berbeda dari password saat ini.
              </p>
            )}
          </div>

          <div className="max-w-2xl">
            <label className="mb-2 block text-sm text-slate-800">
              Konfirmasi password baru *
            </label>

            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass(
                submitted && errors.confirmPassword
              )}
            />

            {submitted && errors.confirmPassword ? (
              <p className="mt-2 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Ulangi password baru yang sama.
              </p>
            )}
          </div>
        </div>

        {((submitted && invalid) || serverError) && (
          <div className="mt-5 rounded-lg bg-red-100 p-5">
            <h3 className="font-semibold text-red-800">
              Password belum diubah
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {serverError ||
                "Perbaiki bagian yang ditandai, kemudian simpan kembali."}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="min-w-44 rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Password"}
          </button>

          <Link
            to="/profile/edit"
            className="min-w-44 rounded-lg border border-[#0B3D91] px-6 py-3 text-center text-sm font-semibold text-[#0B3D91]"
          >
            Batal
          </Link>
        </div>
      </form>
    </ReporterLayout>
  );
}
