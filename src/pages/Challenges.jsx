
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ReporterLayout from "../components/ReporterLayout";
import {
  getAllChallenges,
  getMyChallengeProgress,
  joinChallenge,
} from "../api/challenges";
import { getMe } from "../api/users";

// Badge asli Figma
import level1Badge from "../assets/badges/ocean-level-1.png";
import level30Badge from "../assets/badges/ocean-level-30.png";
import level50Badge from "../assets/badges/ocean-level-50.png";

const BLUE = "#0B3D91";

// Backend OceanGuard menggunakan 100 XP per level.
// Jangan ubah menjadi 1000 tanpa mengubah aturan backend.
const XP_PER_LEVEL = 100;

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center rounded-lg bg-[#0B3D91] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#082E70] disabled:cursor-not-allowed disabled:opacity-50";

const OUTLINE_BUTTON =
  "inline-flex items-center justify-center rounded-lg border border-[#0B3D91] px-6 py-3 text-sm font-semibold text-[#0B3D91] transition hover:bg-blue-50";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPeriod(startDate, endDate) {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

function getLevel(totalXP) {
  return Math.floor(Math.max(0, totalXP) / XP_PER_LEVEL) + 1;
}

function getLevelProgress(totalXP) {
  return Math.max(0, totalXP) % XP_PER_LEVEL;
}

function getLevelBadge(level) {
  if (level >= 50) return level50Badge;
  if (level >= 30) return level30Badge;
  return level1Badge;
}

function getChallengeProgress(challenge, progress) {
  const target = Math.max(1, Number(challenge.target) || 1);
  const current = Math.max(0, Number(progress?.progress) || 0);

  const completed = Boolean(progress?.isCompleted);

  const percentage = completed
    ? 100
    : Math.min(100, Math.round((current / target) * 100));

  return {
    target,
    current,
    completed,
    percentage,
    remaining: Math.max(0, target - current),
  };
}

function getChallengeStatus(challenge, progress) {
  if (progress?.isCompleted) return "completed";

  const now = Date.now();
  const start = new Date(challenge.startDate).getTime();
  const end = new Date(challenge.endDate).getTime();

  if (Number.isFinite(start) && now < start) {
    return "upcoming";
  }

  if (Number.isFinite(end) && now > end) {
    return "expired";
  }

  return "active";
}

function ProgressBar({ percentage, height = "h-2" }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full bg-slate-100 ${height}`}
    >
      <div
        className="h-full rounded-full bg-[#0B3D91] transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, percentage))}%`,
        }}
      />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Challenges
      </h1>

      <p className="mt-2 text-sm text-slate-400 sm:text-base">
        Selesaikan challenge dari laporan terverifikasi dan raih XP
      </p>
    </div>
  );
}

// =====================================
// OCEAN LEVEL CARD
// =====================================
function OceanLevelCard({ totalXP, level, compact = false }) {
  const progress = getLevelProgress(totalXP);
  const percentage = Math.round(
    (progress / XP_PER_LEVEL) * 100
  );
  const remaining = XP_PER_LEVEL - progress;

  return (
    <section
      className={`rounded-xl border-2 border-slate-200 bg-white ${
        compact ? "p-5" : "p-5 sm:p-6"
      }`}
    >
      <div className={`flex justify-center ${compact ? "mb-4" : "mb-5"}`}>
        <img
          src={getLevelBadge(level)}
          alt={`Badge Ocean Guard Level ${level}`}
          className="h-36 w-36 object-contain sm:h-40 sm:w-40"
        />
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#0B3D91] sm:text-xl">
          Ocean Guard Level {level}
        </h2>

        <span className="text-lg font-semibold text-[#0B3D91]">
          {progress} / {XP_PER_LEVEL} XP
        </span>
      </div>

      <ProgressBar percentage={percentage} height="h-4" />

      <p className="mt-4 text-sm text-slate-400 sm:text-base">
        {remaining} XP lagi untuk naik ke Level {level + 1}
      </p>

      {compact && (
        <p className="mt-2 text-xs text-slate-400">
          Total XP akun: {totalXP.toLocaleString("id-ID")} XP
        </p>
      )}
    </section>
  );
}

// =====================================
// CHALLENGE ICON
// =====================================
function ChallengeIconSmall() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-2xl"
      aria-hidden="true"
    >
      🏄
    </div>
  );
}

// =====================================
// CHALLENGE CARD
// =====================================
function ChallengeCard({ challenge, progress, onOpen }) {
  const result = getChallengeProgress(challenge, progress);
  const status = getChallengeStatus(challenge, progress);

  return (
    <button
      type="button"
      onClick={() => onOpen(challenge)}
      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-left transition hover:border-blue-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <ChallengeIconSmall />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {challenge.name}
            </h3>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#0B3D91]">
                +{challenge.rewardXP} XP
              </span>

              <span className="text-slate-400" aria-hidden="true">
                ▾
              </span>
            </div>
          </div>

          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            {result.target} laporan terverifikasi ·{" "}
            {formatPeriod(challenge.startDate, challenge.endDate)}
          </p>

          {status === "expired" && (
            <p className="mt-1 text-xs text-amber-600">
              Periode challenge telah berakhir
            </p>
          )}

          {status === "upcoming" && (
            <p className="mt-1 text-xs text-blue-600">
              Challenge belum dimulai
            </p>
          )}

          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-slate-400">
              <span>
                {Math.min(result.current, result.target)}/
                {result.target} terverifikasi
              </span>

              <span>{result.percentage}%</span>
            </div>

            <ProgressBar percentage={result.percentage} />
          </div>
        </div>
      </div>
    </button>
  );
}

// =====================================
// EMPTY STATE
// =====================================
function EmptyChallenge({ completed }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center sm:min-h-[345px]">
      <h3 className="text-xl font-semibold text-slate-900">
        {completed
          ? "Belum Ada Challenge Selesai"
          : "Belum Ada Challenge Aktif"}
      </h3>

      <p className="mt-2 text-sm text-slate-400 sm:text-base">
        {completed
          ? "Segera selesaikan challenge agar kamu naik level!"
          : "Challenge baru akan ditampilkan saat tersedia."}
      </p>
    </div>
  );
}

// =====================================
// CHALLENGE DETAIL
// =====================================
function ChallengeDetail({
  challenge,
  progress,
  onBack,
  onJoin,
  joining,
  joinError,
  onReward,
  onCreateReport,
  onMyReports,
}) {
  const result = getChallengeProgress(challenge, progress);
  const status = getChallengeStatus(challenge, progress);

  const canJoin = status === "active" && !progress;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className={`${OUTLINE_BUTTON} mb-5`}
      >
        Kembali ke Challenges
      </button>

      <section className="rounded-xl border-2 border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-4">
          <ChallengeIconSmall />

          <div>
            <h2 className="text-xl font-semibold text-slate-700">
              {challenge.name}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {result.completed
                ? "Selesai"
                : status === "upcoming"
                  ? "Belum Dimulai"
                  : status === "expired"
                    ? "Berakhir"
                    : "Aktif"}
              {" · "}Reward +{challenge.rewardXP} XP
              {result.completed ? " diterima" : ""}
            </p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          {challenge.description ||
            `Selesaikan ${result.target} laporan terverifikasi selama periode challenge untuk memperoleh XP.`}
        </p>

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">
              Periode
            </p>

            <p className="text-sm text-slate-600">
              {formatPeriod(challenge.startDate, challenge.endDate)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">
              Target
            </p>

            <p className="text-sm text-slate-600">
              {result.target} laporan terverifikasi
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">
              Reward
            </p>

            <p className="text-sm text-slate-600">
              {challenge.rewardXP} XP otomatis
            </p>
          </div>
        </div>

        <div className="mb-5">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>
              {Math.min(result.current, result.target)}/
              {result.target} terverifikasi
            </span>

            <span>{result.percentage}%</span>
          </div>

          <ProgressBar percentage={result.percentage} />
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <h3 className="font-medium text-slate-700">
            Cara Progres Dihitung
          </h3>

          <p>
            Progres bertambah otomatis ketika laporanmu dalam periode
            challenge mendapatkan status Terverifikasi dari Admin.
            Laporan yang baru dikirim, sedang ditinjau, atau ditolak
            belum dihitung.
          </p>

          {result.completed ? (
            <p>
              Target telah terpenuhi. Challenge selesai dan reward
              {` ${challenge.rewardXP} XP`} telah diberikan oleh backend.
            </p>
          ) : progress ? (
            <p>
              {result.remaining > 0
                ? `Masih perlu ${result.remaining} laporan terverifikasi untuk menyelesaikan challenge ini.`
                : "Target laporan sudah terpenuhi; menunggu status penyelesaian dari server."}
            </p>
          ) : (
            <p>
              Ikuti challenge terlebih dahulu agar laporan
              terverifikasi berikutnya dihitung sebagai progres.
            </p>
          )}
        </div>

        {joinError && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {joinError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {result.completed ? (
            <button
              type="button"
              onClick={onReward}
              className={PRIMARY_BUTTON}
            >
              Lihat Reward
            </button>
          ) : canJoin ? (
            <button
              type="button"
              onClick={() => onJoin(challenge.id)}
              disabled={joining}
              className={PRIMARY_BUTTON}
            >
              {joining ? "Memproses..." : "Ikuti Challenge"}
            </button>
          ) : progress && status === "active" ? (
            <>
              <button
                type="button"
                onClick={onCreateReport}
                className={PRIMARY_BUTTON}
              >
                Buat Laporan
              </button>

              <button
                type="button"
                onClick={onMyReports}
                className={OUTLINE_BUTTON}
              >
                Laporan Saya
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className={OUTLINE_BUTTON}
            >
              Kembali ke Challenges
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

// =====================================
// REWARD PAGE
// =====================================
function ChallengeReward({
  challenge,
  progress,
  totalXP,
  level,
  onDetail,
  onProfile,
  onBack,
}) {
  const result = getChallengeProgress(challenge, progress);

  if (!result.completed) return null;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className={`${OUTLINE_BUTTON} mb-5`}
      >
        Kembali ke Challenges
      </button>

      <div className="mb-4 rounded-lg border border-green-200 bg-green-100 px-5 py-4">
        <p className="font-semibold text-green-800">
          ● Challenge selesai · +{challenge.rewardXP} XP diterima
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Target {challenge.name} terpenuhi.
          Reward telah diberikan secara otomatis oleh backend.
        </p>
      </div>

      <section className="rounded-xl border-2 border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <img
            src={getLevelBadge(level)}
            alt={`Ocean Guard Level ${level}`}
            className="h-40 w-40 object-contain"
          />
        </div>

        <h2 className="mb-4 text-xl font-semibold text-slate-700">
          {challenge.name} Selesai!
        </h2>

        <p className="mb-5 text-sm text-slate-600">
          {result.target} dari {result.target} laporan
          telah memenuhi target challenge.
        </p>

        <h3 className="mb-4 text-2xl font-semibold text-[#0B3D91]">
          +{challenge.rewardXP} XP
        </h3>

        <p className="mb-6 text-sm text-slate-600">
          Reward challenge sudah masuk ke akunmu.
          Tidak perlu menekan tombol klaim.
        </p>

        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#0B3D91]">
            Ocean Guard Level {level}
          </h3>

          <span className="font-semibold text-[#0B3D91]">
            {getLevelProgress(totalXP)} / {XP_PER_LEVEL} XP
          </span>
        </div>

        <ProgressBar
          percentage={
            (getLevelProgress(totalXP) / XP_PER_LEVEL) * 100
          }
          height="h-4"
        />

        <p className="mt-4 text-sm text-slate-400">
          {XP_PER_LEVEL - getLevelProgress(totalXP)} XP
          lagi untuk naik ke Level {level + 1}
        </p>

        <p className="mt-4 text-xs text-slate-500">
          Total XP akun: {totalXP.toLocaleString("id-ID")} XP.
          Reward challenge diberikan terpisah dari XP
          laporan terverifikasi.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onDetail}
            className={PRIMARY_BUTTON}
          >
            Lihat Detail Challenge
          </button>

          <button
            type="button"
            onClick={onProfile}
            className={OUTLINE_BUTTON}
          >
            Lihat Profil
          </button>
        </div>
      </section>
    </div>
  );
}

// =====================================
// MAIN CHALLENGES
// =====================================
export default function Challenges() {
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [totalXP, setTotalXP] = useState(0);

  const [tab, setTab] = useState("active");
  const [screen, setScreen] = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joiningId, setJoiningId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [challengeData, progressData, userData] =
        await Promise.all([
          getAllChallenges(),
          getMyChallengeProgress(),
          getMe(),
        ]);

      setChallenges(
        Array.isArray(challengeData) ? challengeData : []
      );

      setProgressList(
        Array.isArray(progressData) ? progressData : []
      );

      setTotalXP(
        Math.max(0, Number(userData?.totalXP) || 0)
      );
    } catch (err) {
      setError(
        err.message || "Gagal memuat data challenge."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const level = getLevel(totalXP);

  const progressMap = useMemo(
    () =>
      new Map(
        progressList.map((item) => [
          String(item.challengeId),
          item,
        ])
      ),
    [progressList]
  );

  const completedChallenges = useMemo(
    () =>
      challenges.filter((challenge) => {
        const progress = progressMap.get(String(challenge.id));
        return Boolean(progress?.isCompleted);
      }),
    [challenges, progressMap]
  );

  const activeChallenges = useMemo(
    () =>
      challenges.filter((challenge) => {
        const progress = progressMap.get(String(challenge.id));
        const status = getChallengeStatus(challenge, progress);

        return status === "active" || status === "upcoming";
      }),
    [challenges, progressMap]
  );

  const visibleChallenges =
    tab === "active"
      ? activeChallenges
      : completedChallenges;

  const selectedChallenge = challenges.find(
    (challenge) => String(challenge.id) === String(selectedId)
  );

  const selectedProgress = selectedChallenge
    ? progressMap.get(String(selectedChallenge.id))
    : null;

  function openChallenge(challenge) {
    setSelectedId(challenge.id);
    setScreen("detail");
    setJoinError("");
  }

  function backToList() {
    setSelectedId(null);
    setScreen("list");
    setJoinError("");
  }

  async function handleJoin(challengeId) {
    setJoiningId(challengeId);
    setJoinError("");

    try {
      await joinChallenge(challengeId);

      const updated = await getMyChallengeProgress();

      setProgressList(
        Array.isArray(updated) ? updated : []
      );
    } catch (err) {
      setJoinError(
        err.message || "Tidak dapat mengikuti challenge."
      );
    } finally {
      setJoiningId(null);
    }
  }

  function openReward() {
    if (!selectedProgress?.isCompleted) return;
    setScreen("reward");
  }

  return (
    <ReporterLayout>
      <div className="w-full pb-8">
        <PageHeader />

        {error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadData}
              className="text-sm font-semibold text-red-700 underline"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Memuat data Challenges...
          </div>
        ) : screen === "reward" &&
          selectedChallenge &&
          selectedProgress?.isCompleted ? (
          <ChallengeReward
            challenge={selectedChallenge}
            progress={selectedProgress}
            totalXP={totalXP}
            level={level}
            onDetail={() => setScreen("detail")}
            onProfile={() => navigate("/profile")}
            onBack={backToList}
          />
        ) : screen === "detail" && selectedChallenge ? (
          <ChallengeDetail
            challenge={selectedChallenge}
            progress={selectedProgress}
            onBack={backToList}
            onJoin={handleJoin}
            joining={joiningId === selectedChallenge.id}
            joinError={joinError}
            onReward={openReward}
            onCreateReport={() => navigate("/reports/new")}
            onMyReports={() => navigate("/my-reports")}
          />
        ) : (
          <>
            <OceanLevelCard
              totalXP={totalXP}
              level={level}
            />

            {/* TABS */}
            <div className="mb-6 mt-5 grid grid-cols-2 gap-1 rounded-lg bg-[#d5d9df] p-1">
              <button
                type="button"
                onClick={() => setTab("active")}
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  tab === "active"
                    ? "bg-white text-[#0B3D91]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Challenge Aktif
              </button>

              <button
                type="button"
                onClick={() => setTab("completed")}
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  tab === "completed"
                    ? "bg-white text-[#0B3D91]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Challenge Selesai
              </button>
            </div>

            {/* CHALLENGE LIST */}
            {visibleChallenges.length === 0 ? (
              <EmptyChallenge completed={tab === "completed"} />
            ) : (
              <div className="space-y-5">
                {visibleChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    progress={progressMap.get(
                      String(challenge.id)
                    )}
                    onOpen={openChallenge}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ReporterLayout>
  );
}
