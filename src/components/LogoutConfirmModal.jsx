
export default function LogoutConfirmModal({
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-[3000] bg-slate-900/50 flex items-center justify-center p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        className="bg-white rounded-lg p-5 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Logout */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0B3D91"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-3"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>

        {/* Judul */}
        <h3
          id="logout-dialog-title"
          className="text-base font-semibold text-slate-800 mb-2"
        >
          Keluar dari akun?
        </h3>

        {/* Keterangan */}
        <p className="text-slate-600 text-xs mb-4">
          Sesi OceanGuard pada perangkat ini akan diakhiri.
          Kamu perlu masuk lagi untuk melanjutkan.
        </p>

        {/* Tombol Konfirmasi */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-4 py-2 rounded-md text-xs hover:bg-blue-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="bg-[#0B3D91] hover:bg-[#092c6e] text-white font-semibold px-4 py-2 rounded-md text-xs"
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
