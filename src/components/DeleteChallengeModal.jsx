export default function DeleteChallengeModal({
  challengeName,
  deleting,
  error,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M6 6l1 14h10l1-14" />
          <path d="M10 10v6M14 10v6" />
        </svg>

        <h3 className="text-2xl font-bold text-red-600 mb-3">Hapus challenge ini?</h3>
        <p className="text-slate-600 text-sm mb-5">
          Challenge “{challengeName}” akan dihapus dari daftar. Pastikan kamu memilih
          challenge yang benar.
        </p>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-6 py-3 rounded-lg text-sm"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-lg text-sm"
          >
            {deleting ? "Menghapus..." : "Ya, Hapus Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
}