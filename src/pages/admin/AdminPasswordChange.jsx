
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ReporterLayout from "../../components/ReporterLayout";
import PageHeading from "../../components/PageHeading";
import NoticeBanner from "../../components/NoticeBanner";
import { updateProfile } from "../../api/users";

const INITIAL = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validate(values) {
  const errors = {};

  if (!values.currentPassword) {
    errors.currentPassword =
      "Kata sandi saat ini wajib diisi.";
  }

  if (!values.newPassword) {
    errors.newPassword =
      "Kata sandi baru wajib diisi.";
  } else if (values.newPassword.length < 8) {
    errors.newPassword =
      "Kata sandi baru minimal 8 karakter.";
  } else if (
    values.newPassword === values.currentPassword
  ) {
    errors.newPassword =
      "Kata sandi baru harus berbeda dari kata sandi saat ini.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword =
      "Konfirmasi kata sandi wajib diisi.";
  } else if (
    values.confirmPassword !== values.newPassword
  ) {
    errors.confirmPassword =
      "Konfirmasi kata sandi tidak cocok.";
  }

  return errors;
}

export default function AdminPasswordChange() {
  const navigate = useNavigate();

  const [values, setValues] = useState(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = validate(values);
  const hasErrors = Object.keys(errors).length > 0;

  function setField(field, value) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setServerError("");
  }

  function inputClass(field) {
    const invalid = submitted && errors[field];

    return `w-full rounded-lg border px-4 py-3 text-sm text-slate-800 outline-none transition ${
      invalid
        ? "border-red-500 focus:border-red-500"
        : "border-slate-300 focus:border-[#0B3D91]"
    }`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (hasErrors) return;

    setSaving(true);

    try {
      await updateProfile({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      navigate("/profile", {
        replace: true,
        state: {
          notice: {
            type: "success",
            title: "Kata sandi berhasil diubah",
            message:
              "Gunakan kata sandi baru saat login berikutnya.",
          },
        },
      });
    } catch (err) {
      setServerError(
        err.message || "Gagal mengubah kata sandi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ReporterLayout>
      <PageHeading
        title="Profil & Pengaturan"
        subtitle="Kelola informasi profil dan keamanan akun admin"
      />

      <Link
        to="/profile"
        className="mb-4 inline-flex rounded-lg border border-[#0B3D91] px-5 py-3 text-sm font-semibold text-[#0B3D91] hover:bg-blue-50"
      >
        Kembali ke Profil
      </Link>

      {submitted && hasErrors && (
        <NoticeBanner
          type="error"
          title="Kata sandi belum dapat diubah"
          message="Perbaiki bagian yang ditandai, kemudian simpan kembali."
        />
      )}

      {serverError && (
        <NoticeBanner
          type="error"
          title="Kata sandi belum dapat diubah"
          message={serverError}
        />
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border-2 border-slate-200 bg-white p-6"
      >
        <h2 className="text-xl font-semibold text-slate-600">
          Ganti Kata Sandi
        </h2>

        <p className="mb-7 mt-5 text-sm text-slate-500">
          Masukkan kata sandi saat ini, lalu buat kata sandi baru.
        </p>

        <div className="space-y-6">
          {/* PASSWORD LAMA */}
          <div>
            <label
              htmlFor="admin-current-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Kata sandi saat ini *
            </label>

            <input
              id="admin-current-password"
              type="password"
              autoComplete="current-password"
              value={values.currentPassword}
              onChange={(e) =>
                setField("currentPassword", e.target.value)
              }
              className={inputClass("currentPassword")}
            />

            {submitted && errors.currentPassword && (
              <p className="mt-2 text-xs text-red-600">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* PASSWORD BARU */}
          <div>
            <label
              htmlFor="admin-new-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Kata sandi baru *
            </label>

            <input
              id="admin-new-password"
              type="password"
              autoComplete="new-password"
              value={values.newPassword}
              onChange={(e) =>
                setField("newPassword", e.target.value)
              }
              className={inputClass("newPassword")}
            />

            {submitted && errors.newPassword && (
              <p className="mt-2 text-xs text-red-600">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* KONFIRMASI */}
          <div>
            <label
              htmlFor="admin-confirm-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Konfirmasi kata sandi baru *
            </label>

            <input
              id="admin-confirm-password"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(e) =>
                setField("confirmPassword", e.target.value)
              }
              className={inputClass("confirmPassword")}
            />

            {submitted && errors.confirmPassword && (
              <p className="mt-2 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/profile"
            className="rounded-lg border border-[#0B3D91] px-6 py-3 text-sm font-semibold text-[#0B3D91] hover:bg-blue-50"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Kata Sandi"}
          </button>
        </div>
      </form>
    </ReporterLayout>
  );
}
