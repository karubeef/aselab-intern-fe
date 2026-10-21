
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import AuthLayout from "./AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
  "h-[49px] w-full rounded-[9px] border border-[#CDD5E0] bg-white px-4 text-[14px] text-[#172033] outline-none placeholder:text-[#8291AA] focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isEmailValid = EMAIL_PATTERN.test(email.trim());

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isEmailValid || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim());
      setIsSent(true);
    } catch (err) {
      setError(err.message || "Permintaan gagal. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!isEmailValid || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim());
    } catch (err) {
      setError(err.message || "Gagal meminta tautan baru.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <AuthLayout>
        <h2 className="text-[23px] font-bold tracking-tight text-[#171B30]">
          Periksa email kamu
        </h2>

        <p className="mt-3 text-[13px] leading-relaxed text-[#919CB1]">
          Jika email terdaftar di OceanGuard, tautan reset akan
          dikirim ke alamat tersebut.
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-[8px] border border-[#91CDA7] bg-[#DFEFE5] px-4 py-4">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#166B37]" />
          <div>
            <p className="text-[14px] font-semibold text-[#166B37]">
              Permintaan reset diterima
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#40534A]">
              Periksa kotak masuk atau folder spam. Jika email
              diterima, buka tautannya untuk membuat password baru.
              Tautan berlaku 15 menit.
            </p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            {error}
          </p>
        )}

        <Link
          to="/login"
          className="mt-4 flex h-[49px] w-full items-center justify-center rounded-[8px] bg-[#0B3D91] text-[14px] font-semibold text-white hover:bg-[#082C70]"
        >
          Kembali ke Login
        </Link>

        <button
          type="button"
          onClick={handleResend}
          disabled={isSubmitting}
          className="mt-5 w-full text-center text-[13px] font-medium text-[#0B3D91] hover:underline disabled:opacity-50"
        >
          {isSubmitting ? "Mengirim..." : "Kirim ulang tautan"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSent(false);
            setEmail("");
            setError("");
          }}
          className="mt-4 w-full text-center text-[12px] text-[#919CB1] hover:text-[#0B3D91]"
        >
          Gunakan email lain
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-[23px] font-bold tracking-tight text-[#171B30]">
        Lupa Password?
      </h2>

      <p className="mt-2 text-[13px] text-[#919CB1]">
        Masukkan email anda yang sudah terdaftar
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label
            htmlFor="forgot-email"
            className="mb-2 block text-[13px] font-medium text-[#364152]"
          >
            Email
          </label>

          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="Masukkan Email Anda"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            required
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={!isEmailValid || isSubmitting}
          className="h-[49px] w-full rounded-[8px] bg-[#0B3D91] text-[14px] font-semibold text-white hover:bg-[#082C70] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Mengirim..." : "Verifikasi"}
        </button>
      </form>
    </AuthLayout>
  );
}
