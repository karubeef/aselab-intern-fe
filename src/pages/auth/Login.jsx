import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("expired") === "true";
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await loginUser({ email, password });
      login(data.token, data.user);
      navigate(data.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">
        Selamat datang kembali
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Masuk ke akun OceanGuard kamu
      </p>

      {/* Tab switcher */}
      <div className="flex bg-slate-200/70 rounded-lg p-1 mb-6">
        <span className="flex-1 text-center py-2.5 rounded-md bg-white text-[#1179C4] font-semibold text-sm shadow-sm">
          Masuk
        </span>
        <Link
          to="/register"
          className="flex-1 text-center py-2.5 rounded-md text-slate-500 font-semibold text-sm"
        >
          Daftar
        </Link>
      </div>

      {resetSuccess && (
        <p className="bg-green-50 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          Kata sandi berhasil diubah, silakan masuk dengan kata sandi baru.
        </p>
      )}
      {sessionExpired && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          Sesi kamu telah berakhir, silakan login lagi.
        </p>
      )}
      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="youremail@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
          />
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-[#1179C4] text-sm">
            Lupa Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="bg-[#1179C4] hover:bg-[#0f6aab] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg mt-2"
        >
          {isSubmitting ? "Masuk..." : "Masuk"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#1179C4] font-medium">
            Daftar sekarang
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}