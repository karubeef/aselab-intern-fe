import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAllChallenges, deleteChallenge } from "../../api/challenges";
import ReporterLayout from "../../components/ReporterLayout";
import NoticeBanner from "../../components/NoticeBanner";
import ChallengeIcon from "../../components/ChallengeIcon";
import DeleteChallengeModal from "../../components/DeleteChallengeModal";
import { formatPeriod, getDeleteErrorMessage } from "../../utils/challengeFormat";

export default function AdminChallenges() {
  const location = useLocation();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
    loadChallenges();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadChallenges() {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getAllChallenges();
      setChallenges(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openDeleteModal(challenge) {
    setDeleteError("");
    setToDelete(challenge);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteChallenge(toDelete.id);
      setChallenges((prev) => prev.filter((c) => c.id !== toDelete.id));
      setNotice({
        type: "success",
        title: "Challenge berhasil dihapus",
        message: `${toDelete.name} telah dihapus dari daftar challenge.`,
      });
      setToDelete(null);
    } catch (err) {
      setDeleteError(getDeleteErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#15316E]">Kelola Challenge</h1>
        <p className="text-slate-400 text-sm">Buat tantangan dan dorong kontribusi untuk laut</p>
      </div>

      {notice && <NoticeBanner {...notice} />}

      {loadError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={loadChallenges} className="font-medium underline">
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat challenge...</p>
      ) : challenges.length === 0 ? (
        <div className="border border-slate-200 rounded-xl min-h-[460px] flex flex-col items-center justify-center text-center px-6 py-10">
          <ChallengeIcon size={110} />
          <h2 className="text-2xl font-bold text-[#0B3D91] mt-6 mb-2">Belum ada challenge</h2>
          <p className="text-slate-500 max-w-sm mb-6">
            Buat challenge pertama untuk mengajak reporter berkontribusi menjaga laut.
          </p>
          <Link
            to="/admin/challenges/new"
            className="bg-[#0B3D91] hover:bg-[#093178] text-white font-semibold px-10 py-3.5 rounded-lg text-sm"
          >
            Buat Challenge
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-slate-700">Daftar Challenge</h2>
            <Link
              to="/admin/challenges/new"
              className="bg-[#0B3D91] hover:bg-[#093178] text-white font-semibold px-6 py-3 rounded-lg text-sm"
            >
              Tambah Challenge
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-4">{challenges.length} challenge tersedia</p>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-600">
                  <th className="px-5 py-3 font-medium">Challenge</th>
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">Periode</th>
                  <th className="px-5 py-3 font-medium">Reward</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenges.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0B3D91]">{c.name}</p>
                      {c.description && (
                        <p className="text-slate-500 text-xs mt-1 max-w-xs truncate">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.target} laporan Verified</td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatPeriod(c.startDate, c.endDate)}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#0B3D91]">{c.rewardXP} XP</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/challenges/${c.id}`}
                          className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-6 py-2.5 rounded-lg text-sm"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => openDeleteModal(c)}
                          aria-label={`Hapus ${c.name}`}
                          className="w-11 h-11 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M6 6l1 14h10l1-14" />
                            <path d="M10 10v6M14 10v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {toDelete && (
        <DeleteChallengeModal
          challengeName={toDelete.name}
          deleting={deleting}
          error={deleteError}
          onCancel={() => setToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </ReporterLayout>
  );
}