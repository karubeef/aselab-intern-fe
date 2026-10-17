import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import AuthLayout from "./AuthLayout";

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
  const hasNumberAndSymbol =
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\~`]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumberAndSymbol;
  const passwordsMatch =
    confirmPassword !== "" && password === confirmPassword;

  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    isPasswordValid &&
    passwordsMatch &&
    agreed;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerUser({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">
        Buat akun baru
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        Daftar dan mulai berkontribusi
      </p>

      {/* Tab switcher */}
      <div className="flex bg-slate-200/70 rounded-lg p-1 mb-6">
        <Link
          to="/login"
          className="flex-1 text-center py-2.5 rounded-md text-slate-500 font-semibold text-sm"
        >
          Masuk
        </Link>
        <span className="flex-1 text-center py-2.5 rounded-md bg-white text-[#1179C4] font-semibold text-sm shadow-sm">
          Daftar
        </span>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
          />
        </div>

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
          {password.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-xs">
              <li className={hasMinLength ? "text-green-600" : "text-slate-400"}>
                {hasMinLength ? "✓" : "✕"} Minimal 8 karakter
              </li>
              <li className={hasLetter ? "text-green-600" : "text-slate-400"}>
                {hasLetter ? "✓" : "✕"} Mengandung huruf
              </li>
              <li className={hasNumberAndSymbol ? "text-green-600" : "text-slate-400"}>
                {hasNumberAndSymbol ? "✓" : "✕"} Mengandung angka & simbol
              </li>
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Konfirmasi Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-red-500 text-xs mt-1.5">Password tidak sama</p>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Saya setuju dengan{" "}
            <a href="#syarat" className="text-[#1179C4] underline">
              Syarat & Ketentuan
            </a>{" "}
            dan{" "}
            <a href="#privasi" className="text-[#1179C4] underline">
              Kebijakan Privasi
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="bg-[#1179C4] hover:bg-[#0f6aab] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg mt-2"
        >
          {isSubmitting ? "Mendaftarkan..." : "Daftar"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#1179C4] font-medium">
            Masuk
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}