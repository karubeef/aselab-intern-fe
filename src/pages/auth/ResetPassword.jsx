
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { resetPassword } from "../../api/auth";
import AuthLayout from "./AuthLayout";

const fieldClass =
  "h-[49px] w-full rounded-[9px] border bg-white px-4 text-[14px] text-[#172033] outline-none placeholder:text-[#8291AA] focus:ring-2 focus:ring-blue-100";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")?.trim() || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tooShort =
    newPassword.length > 0 && newPassword.length < 8;

  const mismatch =
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  const tokenInvalid =
    !token ||
    /token tidak valid|kedaluwarsa|expired/i.test(error);

  const canSubmit =
    !tokenInvalid &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !isSubmitting;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setError("");
    setIsSubmitting(true);

    try {
      await resetPassword(token, newPassword);
      navigate("/login?reset=success", { replace: true });
    } catch (err) {
      setError(err.message || "Gagal memperbarui password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (tokenInvalid) {
    return (
      <AuthLayout>
        <h2 className="text-[23px] font-bold tracking-tight text-[#171B30]">
          Tautan reset tidak valid
        </h2>

        <p className="mt-2 text-[13px] leading-relaxed text-[#919CB1]">
          Tautan reset tidak lengkap, sudah digunakan, atau
          telah kedaluwarsa.
        </p>

        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-[8px] border border-[#F1A0A0] bg-[#FCE2E2] px-4 py-4"
        >
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C92323]" />
          <div>
            <p className="text-[14px] font-semibold text-[#C92323]">
              Reset password gagal
            </p>
            <p className="mt-1 text-[13px] text-[#4C4850]">
              {error ||
                "Silakan meminta tautan reset password yang baru."}
            </p>
          </div>
        </div>

        <Link
          to="/forgot-password"
          className="mt-5 flex h-[49px] w-full items-center justify-center rounded-[8px] bg-[#0B3D91] text-[14px] font-semibold text-white hover:bg-[#082C70]"
        >
          Minta Tautan Baru
        </Link>

        <p className="mt-5 text-center">
          <Link
            to="/login"
            className="text-[13px] font-medium text-[#0B3D91] hover:underline"
          >
            Kembali ke Login
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-[23px] font-bold tracking-tight text-[#171B30]">
        Buat password baru
      </h2>

      <p className="mt-3 text-[13px] text-[#919CB1]">
        Gunakan password dengan minimal 8 karakter.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label
            htmlFor="reset-password"
            className="mb-2 block text-[13px] font-medium text-[#364152]"
          >
            Password Baru
          </label>

          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            placeholder="Masukkan Password Baru Anda"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setError("");
            }}
            required
            minLength={8}
            className={`${fieldClass} ${
              tooShort
                ? "border-red-500 focus:border-red-500"
                : "border-[#CDD5E0] focus:border-[#0B3D91]"
            }`}
          />

          {tooShort && (
            <p className="mt-1.5 text-[11px] text-red-500">
              Kata sandi minimal 8 karakter.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="reset-confirm"
            className="mb-2 block text-[13px] font-medium text-[#364152]"
          >
            Konfirmasi Password
          </label>

          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Masukkan Ulang Password Anda"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setError("");
            }}
            required
            className={`${fieldClass} ${
              mismatch
                ? "border-red-500 focus:border-red-500"
                : "border-[#CDD5E0] focus:border-[#0B3D91]"
            }`}
          />

          {mismatch && (
            <p className="mt-1.5 text-[11px] text-red-500">
              Konfirmasi password tidak cocok.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-[49px] w-full rounded-[8px] bg-[#0B3D91] text-[14px] font-semibold text-white transition hover:bg-[#082C70] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Memperbarui..."
            : "Perbarui Password"}
        </button>

        <p className="text-center">
          <Link
            to="/login"
            className="text-[13px] font-medium text-[#0B3D91] hover:underline"
          >
            Kembali ke Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
