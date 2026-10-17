import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllChallenges, deleteChallenge } from "../../api/challenges";
import ReporterLayout from "../../components/ReporterLayout";
import ChallengeIcon from "../../components/ChallengeIcon";
import DeleteChallengeModal from "../../components/DeleteChallengeModal";
import { formatPeriod, getDeleteErrorMessage } from "../../utils/challengeFormat";

export default function AdminChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadChallenge();
  }, [id]);

  async function loadChallenge() {
    try {
      setLoading(true);
      setError("");
      const all = await getAllChallenges();
      const found = all.find((c) => c.id === Number(id));
      if (!found) {
        setError("Challenge tidak ditemukan.");
      }
      setChallenge(found || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setDeleteError("");
    setShowModal(true);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteChallenge(challenge.id);
      navigate("/admin/challenges", {
        state: {
          notice: {
            type: "success",
            title: "Challenge berhasil dihapus",
            message: `${challenge.name} telah dihapus dari daftar challenge.`,
          },
        },
      });
    } catch (err) {
      setDeleteError(getDeleteErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#15316E]">Kelola Challenge</h1>
        <p className="text-slate-400 text-sm">Buat tantangan dan dorong kontribusi untuk laut</p>
      </div>

      <Link
        to="/admin/challenges"
        className="inline-block border border-[#0B3D91] text-[#0B3D91] font-semibold px-5 py-2.5 rounded-lg text-sm mb-5"
      >
        Kembali ke Daftar Challenge
      </Link>

      {loading && <p className="text-slate-500">Memuat challenge...</p>}

      {!loading && error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</p>
      )}

      {!loading && challenge && (
        <div className="border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <ChallengeIcon size={40} />
              <h2 className="text-2xl font-bold text-[#0B3D91]">{challenge.name}</h2>
            </div>
            <button
              onClick={openModal}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-3 rounded-lg text-sm"
            >
              Hapus
            </button>
          </div>

          <h3 className="font-semibold text-slate-700 mb-2">Deskripsi</h3>
          <p className="text-slate-600 text-sm mb-6">
            {challenge.description || "Tidak ada deskripsi."}
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <InfoBox label="Target" value={`${challenge.target} laporan terverifikasi`} />
            <InfoBox label="Periode" value={formatPeriod(challenge.startDate, challenge.endDate)} />
            <InfoBox label="Reward" value={`${challenge.rewardXP} XP`} />
          </div>

          <p className="text-slate-500 text-sm">
            Progress reporter bertambah otomatis dari laporan yang terverifikasi. Challenge selesai
            ketika target terpenuhi.
          </p>
        </div>
      )}

      {showModal && challenge && (
        <DeleteChallengeModal
          challengeName={challenge.name}
          deleting={deleting}
          error={deleteError}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </ReporterLayout>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-slate-100 rounded-lg px-5 py-4">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}