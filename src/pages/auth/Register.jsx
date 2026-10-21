
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import AuthLayout from "./AuthLayout";

const fieldClass =
  "h-[49px] w-full rounded-[9px] border border-[#CDD5E0] bg-white px-4 text-[14px] text-[#172033] outline-none placeholder:text-[#8291AA] focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-[13px] font-medium text-[#364152]";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const isPasswordValid =
    hasMinLength && hasLetter && hasNumber && hasSymbol;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    isPasswordValid &&
    passwordsMatch &&
    agreed &&
    !isSubmitting;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setError("");
    setIsSubmitting(true);

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Pendaftaran gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-[23px] font-bold tracking-tight text-[#171B30]">
        Buat akun baru
      </h2>
      <p className="mt-2 text-[13px] text-[#919CB1]">
        Daftar dan mulai berkontribusi
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-[8px] border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="register-name" className={labelClass}>
            Nama Lengkap
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Masukkan Nama Lengkap Anda"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="register-email" className={labelClass}>
            Email
          </label>
          <input
            id="register-email"
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

        <div>
          <label htmlFor="register-password" className={labelClass}>
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="Masukkan Password Anda"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            required
            minLength={8}
            className={fieldClass}
          />

          {password.length > 0 && !isPasswordValid && (
            <p className="mt-1.5 text-[11px] text-[#8B94A5]">
              Minimal 8 karakter, terdiri dari huruf, angka, dan simbol.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm" className={labelClass}>
            Konfirmasi Password
          </label>
          <input
            id="register-confirm"
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
              confirmPassword && !passwordsMatch
                ? "!border-red-400"
                : ""
            }`}
          />
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1.5 text-[11px] text-red-500">
              Konfirmasi password tidak cocok.
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 pt-2 text-[13px] leading-relaxed text-[#99A5B9]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#0B3D91]"
          />
          <span>
            Saya setuju dengan{" "}
            <span className="font-medium text-[#0B3D91] underline">
              Syarat & Ketentuan
            </span>{" "}
            dan{" "}
            <span className="font-medium text-[#0B3D91] underline">
              Kebijakan Privasi
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-[49px] w-full rounded-[8px] bg-[#0B3D91] text-[14px] font-semibold text-white transition hover:bg-[#082C70] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Mendaftarkan..." : "Daftar"}
        </button>

        <p className="text-center text-[13px] text-[#9AA6BA]">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-medium text-[#0B3D91] hover:underline"
          >
            Masuk
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
