import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import AuthLayout from "./AuthLayout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const isEmailValid = EMAIL_PATTERN.test(email.trim());

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isEmailValid) return;

    setError("");
    setIsSubmitting(true);

    try {
      const data = await forgotPassword(email.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTryAnotherEmail() {
    setResult(null);
    setEmail("");
  }

  if (result) {
    return (
      <AuthLayout>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Periksa email kamu</h2>
        <p className="text-slate-500 text-sm mb-6">
          {result.message}. Tautan berlaku selama 15 menit.
        </p>

        {result.resetToken && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-700 text-sm font-semibold mb-1"></p>
            <p className="text-amber-700 text-xs mb-3">
              Layanan email belum tersedia di backend
            </p>
            <Link
              to={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
              className="inline-block bg-[#1179C4] hover:bg-[#0f6aab] text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              Lanjutkan ke halaman reset
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleTryAnotherEmail}
            className="border border-slate-300 text-slate-600 font-medium py-3 rounded-lg text-sm"
          >
            Gunakan email lain
          </button>
          <Link to="/login" className="text-center text-[#1179C4] text-sm font-medium">
            Kembali ke halaman masuk
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Lupa kata sandi?</h2>
      <p className="text-slate-500 text-sm mb-6">
        Masukkan email akunmu dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
      </p>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4]"
          />
        </div>

        <button
          type="submit"
          disabled={!isEmailValid || isSubmitting}
          className="bg-[#1179C4] hover:bg-[#0f6aab] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Tautan Reset"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Ingat kata sandimu?{" "}
          <Link to="/login" className="text-[#1179C4] font-medium">
            Masuk
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}