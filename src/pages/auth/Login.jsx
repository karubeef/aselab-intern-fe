
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/authContext";
import AuthLayout from "./AuthLayout";

const fieldClass =
  "h-[49px] w-full rounded-[9px] border border-[#CDD5E0] bg-white px-4 text-[14px] text-[#172033] outline-none placeholder:text-[#8291AA] focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const sessionExpired =
    searchParams.get("expired") === "true";
  const resetSuccess =
    searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    email.trim() && password && !isSubmitting;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      login(result.token, result.user);

      navigate(
        result.user?.role === "ADMIN"
          ? "/admin/dashboard"
          : "/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(
        err.message || "Email atau kata sandi tidak sesuai."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-[23px] font-bold tracking-tight text-[#171B30]">
        Selamat datang
      </h2>

      <p className="mt-2 text-[13px] text-[#919CB1]">
        Masuk ke akun OceanGuard kamu
      </p>

      {resetSuccess && (
        <div
          role="status"
          className="mt-5 rounded-[8px] border border-[#91CDA7] bg-[#DFEFE5] px-4 py-4 text-[13px] text-[#166B37]"
        >
          <p className="font-semibold">
            Reset password berhasil
          </p>
          <p className="mt-1 text-[#40534A]">
            Silakan masuk menggunakan password yang baru.
          </p>
        </div>
      )}

      {sessionExpired && (
        <div
          role="alert"
          className="mt-5 rounded-[8px] border border-amber-300 bg-amber-50 px-4 py-4 text-[13px] text-amber-800"
        >
          Sesi telah berakhir. Silakan masuk kembali.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-[8px] border border-[#F1A0A0] bg-[#FCE2E2] px-4 py-4"
        >
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C92323]" />

          <div>
            <p className="text-[14px] font-semibold text-[#C92323]">
              Gagal masuk
            </p>

            <p className="mt-1 text-[13px] text-[#4C4850]">
              {error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-[13px] font-medium text-[#364152]"
          >
            Email
          </label>

          <input
            id="login-email"
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
          <label
            htmlFor="login-password"
            className="mb-2 block text-[13px] font-medium text-[#364152]"
          >
            Password
          </label>

          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan Password Anda"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            required
            className={fieldClass}
          />
        </div>

        {!error && (
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-[#0B3D91] hover:underline"
            >
              Lupa Password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-[49px] w-full rounded-[8px] bg-[#0B3D91] text-[14px] font-semibold text-white transition hover:bg-[#082C70] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Memproses..."
            : error
              ? "Coba Lagi"
              : "Masuk"}
        </button>

        {error && (
          <p className="text-center">
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-[#0B3D91] hover:underline"
            >
              Lupa password?
            </Link>
          </p>
        )}

        <p className="text-center text-[13px] text-[#9AA6BA]">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-medium text-[#0B3D91] hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
