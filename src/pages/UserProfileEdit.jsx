
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Image as ImageIcon } from "lucide-react";

import ReporterLayout from "../components/ReporterLayout";
import ProfileAvatar from "../components/ProfileAvatar";
import { getMe, updateProfile } from "../api/users";
import { uploadPhotos } from "../api/uploads";
import { useAuth } from "../context/authContext";

const buttonPrimary =
  "rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50";

const buttonOutline =
  "rounded-lg border border-[#0B3D91] px-6 py-3 text-sm font-semibold text-[#0B3D91] hover:bg-blue-50";

export default function UserProfileEdit() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [photoMode, setPhotoMode] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    getMe()
      .then((user) => {
        if (!active) return;
        setProfile(user);
        setName(user.name || "");
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) return undefined;

    const url = URL.createObjectURL(selectedFile);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const invalidName = submitted && !name.trim();

  function handleChooseFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPhotoError("Pilih file JPG atau PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Ukuran foto maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(String(reader.result));
      setSelectedFile(file);
      setPhotoError("");
      setPhotoReady(false);
    };

    reader.readAsDataURL(file);
  }

  function useSelectedPhoto() {
    if (!selectedFile) {
      setPhotoError("Pilih foto terlebih dahulu.");
      return;
    }

    setPhotoReady(true);
    setPhotoMode(false);
    setSuccess(
      "Foto siap disimpan. Klik Simpan Perubahan untuk menerapkannya."
    );
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    if (!name.trim() || photoError) return;

    const changedName = name.trim() !== profile.name;

    if (!changedName && !photoReady) {
      setError("Belum ada perubahan yang perlu disimpan.");
      return;
    }

    setSaving(true);

    try {
      const payload = {};

      if (changedName) payload.name = name.trim();

      if (photoReady && selectedFile) {
        const urls = await uploadPhotos([selectedFile]);
        payload.profilePicture = urls[0];
      }

      const updated = await updateProfile(payload);

      updateUser({
        name: updated.name,
        profilePicture: updated.profilePicture,
      });

      setProfile((previous) => ({
        ...previous,
        ...updated,
      }));

      setPhotoReady(false);
      setSuccess("Profil berhasil diperbarui.");
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (photoMode) {
    return (
      <ReporterLayout>
        <h1 className="mb-10 text-2xl font-semibold text-slate-900">
          Pilih Foto Profil
        </h1>

        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <p className="mb-6 text-sm text-slate-500">
            Pilih foto, lalu periksa pratinjaunya sebelum menyimpan.
          </p>

          <div className="mb-6">
            {preview ? (
              <img
                src={preview}
                alt="Pratinjau foto"
                className="h-48 w-48 rounded-full object-cover"
              />
            ) : (
              <ProfileAvatar
                name={name}
                src={profile?.profilePicture}
                size={192}
              />
            )}
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png"
            capture="user"
            onChange={handleChooseFile}
            className="hidden"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleChooseFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className={`${buttonOutline} mb-3 flex w-56 items-center justify-center gap-2`}
          >
            <Camera size={18} />
            Ambil Foto
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`${buttonOutline} mb-4 flex w-56 items-center justify-center gap-2`}
          >
            <ImageIcon size={18} />
            Pilih dari Perangkat
          </button>

          <p className="mb-5 text-sm text-slate-500">
            Format gambar: JPG atau PNG
          </p>

          {photoError && (
            <p className="mb-4 text-sm text-red-600">
              {photoError}
            </p>
          )}

          <button
            type="button"
            onClick={useSelectedPhoto}
            className={`${buttonPrimary} mb-3 w-56`}
          >
            Gunakan Foto Ini
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setPreview("");
              setPhotoReady(false);
              setPhotoError("");
              setPhotoMode(false);
            }}
            className={`${buttonOutline} w-56`}
          >
            Batal
          </button>
        </div>
      </ReporterLayout>
    );
  }

  return (
    <ReporterLayout>
      <h1 className="mb-10 text-2xl font-semibold text-slate-900">
        Edit Profil
      </h1>

      <Link
        to="/profile"
        className={`${buttonOutline} inline-block`}
      >
        Kembali ke Profil
      </Link>

      <p className="mb-5 mt-7 text-sm text-slate-500">
        Perbarui nama dan foto yang tampil pada profilmu.
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">
          Memuat profil...
        </p>
      ) : !profile ? (
        <p className="text-sm text-red-600">
          {error || "Profil tidak ditemukan."}
        </p>
      ) : (
        <form onSubmit={saveProfile}>
          <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 lg:grid-cols-[36%_1fr]">
            <div className="flex flex-col items-start gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Foto profil"
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                <ProfileAvatar
                  name={name}
                  src={profile.profilePicture}
                  size={112}
                />
              )}

              <button
                type="button"
                onClick={() => setPhotoMode(true)}
                className={`${buttonOutline} flex items-center gap-2`}
              >
                <ImageIcon size={18} />
                Ubah Foto
              </button>

              <p className="text-xs text-slate-500">
                JPG atau PNG. Pilih foto yang terlihat jelas.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="user-profile-name"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Nama lengkap *
                </label>

                <input
                  id="user-profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none ${
                    invalidName
                      ? "border-red-500"
                      : "border-slate-300 focus:border-[#0B3D91]"
                  }`}
                />

                {invalidName ? (
                  <p className="mt-2 text-xs text-red-600">
                    Nama lengkap wajib diisi.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">
                    Nama ini akan tampil di profil dan akunmu.
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-500">
                  Email
                </p>

                <p className="text-sm text-slate-800">
                  {profile.email}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Email digunakan sebagai identitas akun.
                </p>
              </div>
            </div>
          </div>

          {(error || invalidName || photoError) && (
            <div className="mt-5 rounded-lg bg-red-100 p-4 text-red-800">
              <p className="font-semibold">
                Perubahan belum disimpan
              </p>
              <p className="mt-2 text-sm">
                {error || photoError ||
                  "Periksa nama dan foto profil, kemudian simpan kembali."}
              </p>
            </div>
          )}

          {success && !error && (
            <div className="mt-5 rounded-lg bg-blue-100 p-4 text-blue-900">
              <p className="font-semibold">
                Foto siap disimpan
              </p>
              <p className="mt-2 text-sm">
                {success}
              </p>
            </div>
          )}

          <div className="my-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className={buttonPrimary}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <Link
              to="/profile"
              className={buttonOutline}
            >
              Batal
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-6">
            <div>
              <h3 className="font-semibold text-slate-900">
                Kata sandi
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Perbarui kata sandi untuk menjaga akses akunmu.
              </p>
            </div>

            <Link
              to="/profile/password"
              className={buttonOutline}
            >
              Ganti Password
            </Link>
          </div>
        </form>
      )}
    </ReporterLayout>
  );
}
