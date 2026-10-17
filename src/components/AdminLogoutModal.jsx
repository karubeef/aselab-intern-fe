
import { useEffect } from "react";

export default function AdminLogoutModal({
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#111b41]/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-logout-title"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0B3D91"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>

        <h2
          id="admin-logout-title"
          className="mt-5 text-2xl font-semibold text-slate-600"
        >
          Keluar dari akun?
        </h2>

        <p className="mt-5 text-sm leading-relaxed text-slate-600">
          Sesi kamu akan diakhiri. Login kembali untuk
          mengakses halaman admin OceanGuard.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#0B3D91] px-6 py-3 text-sm font-semibold text-[#0B3D91] hover:bg-blue-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900"
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
