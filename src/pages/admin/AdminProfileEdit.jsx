
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ReporterLayout from "../../components/ReporterLayout";
import PageHeading from "../../components/PageHeading";
import ProfileAvatar from "../../components/ProfileAvatar";
import NoticeBanner from "../../components/NoticeBanner";

import useMyProfile from "../../hooks/useMyProfile";
import { useAuth } from "../../context/authContext";
import { updateProfile } from "../../api/users";
import { uploadPhotos } from "../../api/uploads";

const backButton =
  "inline-flex items-center justify-center rounded-lg border border-[#0B3D91] px-5 py-3 text-sm font-semibold text-[#0B3D91] hover:bg-blue-50";

const primaryButton =
  "rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminProfileEdit() {
  const { profile, loading, error, reload } = useMyProfile();

  return (
    <ReporterLayout>
      <PageHeading
        title="Profil & Pengaturan"
        subtitle="Kelola informasi profil dan keamanan akun admin"
      />

      <Link
        to="/profile"
        className={`${backButton} mb-4`}
      >
        Kembali ke Profil
      </Link>

      {loading && (
        <p className="text-sm text-slate-500">
          Memuat profil...
        </p>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={reload}
            className="mt-2 text-sm font-semibold text-red-700 underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && profile && (
        <EditForm key={profile.id} profile={profile} />
      )}
    </ReporterLayout>
  );
}

function EditForm({ profile }) {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(profile.name || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [preview, setPreview] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const trimmedName = name.trim();

  const nameError = !trimmedName
    ? "Nama lengkap wajib diisi."
    : trimmedName.length > 100
      ? "Nama lengkap maksimal 100 karakter."
      : "";

  const hasChanges =
    trimmedName !== profile.name || Boolean(photoFile);

  // Pratinjau foto menggunakan object URL lokal.
  useEffect(() => {
    if (!photoFile) return undefined;

    const url = URL.createObjectURL(photoFile);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  // Penentuan preview disimpan di state terpisah
  // agar gambar terlihat sebelum dikirim.
  function handlePhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPhotoError("Foto harus berformat JPG atau PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Ukuran foto maksimal 5 MB.");
      return;
    }

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const url = URL.createObjectURL(file);

    setPreview(url);
    setPhotoFile(file);
    setPhotoError("");
    setApiError("");
  }

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function handleSave(e) {
    e.preventDefault();
    setSubmitted(true);
    setApiError("");

    if (nameError || photoError) return;

    if (!hasChanges) {
      setApiError("Belum ada perubahan yang disimpan.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: trimmedName,
      };

      if (photoFile) {
        const urls = await uploadPhotos([photoFile]);

        if (!urls?.[0]) {
          throw new Error("Upload foto tidak berhasil.");
        }

        payload.profilePicture = urls[0];
      }

      const updated = await updateProfile(payload);

      updateUser({
        name: updated.name,
        profilePicture: updated.profilePicture,
      });

      navigate("/profile", {
        replace: true,
        state: {
          notice: {
            type: "success",
            title: "Profil berhasil diperbarui",
            message: "Nama dan foto profil berhasil disimpan.",
          },
        },
      });
    } catch (err) {
      setApiError(
        err.message || "Gagal menyimpan profil."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      {submitted && (nameError || photoError) && (
        <NoticeBanner
          type="error"
          title="Perubahan belum dapat disimpan"
          message="Periksa nama dan foto yang ditandai, lalu simpan kembali."
        />
      )}

      {apiError && (
        <NoticeBanner
          type="error"
          title="Perubahan belum dapat disimpan"
          message={apiError}
        />
      )}

      <form
        onSubmit={handleSave}
        noValidate
        className="rounded-xl border-2 border-slate-200 bg-white p-6"
      >
        <h2 className="text-xl font-semibold text-slate-600">
          Edit Profil
        </h2>

        <p className="mb-6 mt-4 text-sm text-slate-500">
          Perbarui nama dan foto yang tampil pada profilmu.
        </p>

        {/* FOTO PROFIL */}
        <div className="mb-7 flex flex-wrap items-center gap-6">
          {preview ? (
            <img
              src={preview}
              alt="Pratinjau foto profil"
              className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <ProfileAvatar
              name={profile.name}
              src={profile.profilePicture}
              size={96}
            />
          )}

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={backButton}
            >
              Ubah Foto
            </button>

            <p className="mt-2 text-xs text-slate-500">
              JPG atau PNG. Pilih foto yang terlihat jelas.
            </p>

            {photoError && (
              <p className="mt-2 text-xs text-red-600">
                {photoError}
              </p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handlePhoto}
            className="hidden"
            aria-label="Pilih foto profil"
          />
        </div>

        {/* NAMA LENGKAP */}
        <div className="mb-5">
          <label
            htmlFor="admin-name"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Nama lengkap *
          </label>

          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setApiError("");
            }}
            aria-invalid={Boolean(submitted && nameError)}
            className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
              submitted && nameError
                ? "border-red-500 focus:border-red-500"
                : "border-slate-300 focus:border-[#0B3D91]"
            }`}
          />

          {submitted && nameError && (
            <p className="mt-2 text-xs text-red-600">
              {nameError}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div className="mb-7">
          <p className="mb-2 text-sm font-medium text-slate-800">
            Email
          </p>

          <p className="break-all text-sm text-slate-600">
            {profile.email}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Email digunakan sebagai identitas akun.
          </p>
        </div>

        {/* TOMBOL */}
        <div className="flex flex-wrap gap-3">
          <Link to="/profile" className={backButton}>
            Batal
          </Link>

          <button
            type="submit"
            disabled={saving}
            className={primaryButton}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
