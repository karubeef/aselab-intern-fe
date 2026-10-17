import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import AuthLayout from "./AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tooShort = newPassword.length > 0 && newPassword.length < 8;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = newPassword.length >= 8 && newPassword === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setIsSubmitting(true);

    try {
      await resetPassword(token, newPassword);
      navigate("/login?reset=success");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Tautan tidak valid</h2>
        <p className="text-slate-500 text-sm mb-6">
          Tautan reset kata sandi tidak lengkap atau sudah rusak. Silakan minta tautan baru.
        </p>
        <Link
          to="/forgot-password"
          className="block text-center bg-[#1179C4] hover:bg-[#0f6aab] text-white font-semibold py-3.5 rounded-lg"
        >
          Minta Tautan Baru
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Atur ulang kata sandi</h2>
      <p className="text-slate-500 text-sm mb-6">Masukkan kata sandi baru untuk akunmu.</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          <p>{error}</p>
          <Link to="/forgot-password" className="inline-block mt-2 font-medium underline">
            Minta tautan baru
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Kata sandi baru
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4] ${
              tooShort ? "border-red-400" : "border-slate-300"
            }`}
          />
          <p className={`text-xs mt-1 ${tooShort ? "text-red-500" : "text-slate-400"}`}>
            Minimal 8 karakter.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Konfirmasi kata sandi baru
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4] ${
              mismatch ? "border-red-400" : "border-slate-300"
            }`}
          />
          {mismatch && <p className="text-red-500 text-xs mt-1">Kata sandi tidak sama.</p>}
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="bg-[#1179C4] hover:bg-[#0f6aab] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
        </button>
      </form>
    </AuthLayout>
  );
}