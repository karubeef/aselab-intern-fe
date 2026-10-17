
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound, MapPin, CalendarDays,
  Award, LogOut, Trash2
} from "lucide-react";

import ReporterLayout from "../components/ReporterLayout";
import ProfileAvatar from "../components/ProfileAvatar";
import { useAuth } from "../context/authContext";
import { getMe, deleteMyAccount } from "../api/users";
import { getMyReports } from "../api/reports";
import { getAllBadges, getMyBadges } from "../api/badges";

const BLUE = "#0B3D91";

const TABS = [
  { id: "account", name: "Info Akun" },
  { id: "badges", name: "Badges" },
  { id: "impact", name: "Dampak Saya" },
  { id: "settings", name: "Pengaturan" },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ProfileSummary({ profile }) {
  const totalXP = Number(profile.totalXP) || 0;
  const level = profile.oceanLevel ||
    Math.floor(totalXP / 100) + 1;

  const earnedInLevel = totalXP % 100;
  const progress = earnedInLevel;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-5">
        <ProfileAvatar
          name={profile.name}
          src={profile.profilePicture}
          size={72}
        />

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900">
            {profile.name}
          </h2>

          <p className="mt-1 break-all text-sm text-slate-400">
            {profile.email}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#0B3D91] bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0B3D91]">
              Level {level}
              <span className="ml-2 font-normal">
                Ocean Warrior
              </span>
            </span>

            <span className="flex items-center gap-1 text-xs text-slate-400">
              <CalendarDays size={13} />
              Bergabung {formatDate(profile.createdAt)}
            </span>
          </div>
        </div>

        <Link
          to="/profile/edit"
          className="rounded-lg border border-[#0B3D91] px-5 py-2 text-xs font-semibold text-[#0B3D91] hover:bg-blue-50"
        >
          Edit Profil
        </Link>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-800">
            Progress ke Level {level + 1}
          </span>

          <span className="text-xs font-bold text-[#0B3D91]">
            {earnedInLevel} / 100 XP
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#0B3D91] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {100 - earnedInLevel} XP lagi untuk naik level
        </p>
      </div>
    </section>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="flex items-center gap-2 text-right text-sm text-slate-800">
        {Icon && <Icon size={16} />}
        {value}
      </span>
    </div>
  );
}

function AccountPanel({ profile }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <InfoRow
        label="Nama Lengkap"
        value={profile.name}
        icon={UserRound}
      />

      <InfoRow
        label="Email"
        value={profile.email}
      />

      <InfoRow
        label="Lokasi"
        value="Belum tersedia"
        icon={MapPin}
      />

      <InfoRow
        label="Bergabung Sejak"
        value={formatDate(profile.createdAt)}
      />

      <InfoRow
        label="Peran"
        value="Reporter / User"
      />
    </div>
  );
}

function BadgePanel({ badges, myBadges }) {
  const ownedIds = new Set(
    myBadges.map((item) => Number(item.badgeId))
  );

  const unlocked = badges.filter((badge) =>
    ownedIds.has(Number(badge.id))
  ).length;

  if (badges.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
        Belum ada badge yang tersedia.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {badges.map((badge) => {
          const owned = ownedIds.has(Number(badge.id));

          return (
            <div
              key={badge.id}
              className={`flex min-h-32 flex-col items-center justify-center rounded-lg border p-4 text-center ${
                owned
                  ? "border-[#0B3D91] bg-white shadow-sm"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              {badge.imageUrl ? (
                <img
                  src={badge.imageUrl}
                  alt=""
                  className="mb-2 h-10 w-10 object-contain"
                />
              ) : (
                <Award
                  size={36}
                  className={
                    owned
                      ? "mb-2 text-amber-500"
                      : "mb-2 text-slate-300"
                  }
                />
              )}

              <p
                className={`text-xs font-semibold ${
                  owned
                    ? "text-[#0B3D91]"
                    : "text-slate-400"
                }`}
              >
                {badge.name}
              </p>

              <p
                className={`mt-1 text-[11px] ${
                  owned
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              >
                {owned ? "Unlocked" : "Locked"}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-14 text-center text-sm text-slate-400">
        {unlocked} dari {badges.length} badge diraih
      </p>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center">
      <strong className="text-2xl text-[#0B3D91]">
        {value}
      </strong>

      <p className="mt-1 text-xs text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ImpactPanel({ reports, profile }) {
  const stats = useMemo(() => {
    const verified = reports.filter(
      (r) => ["VERIFIED", "IN_PROGRESS", "RESOLVED"]
        .includes(r.status)
    );

    const resolved = reports.filter(
      (r) => r.status === "RESOLVED"
    );

    const areas = new Set(
      reports
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) =>
          `${Number(r.latitude).toFixed(3)},${Number(r.longitude).toFixed(3)}`
        )
    );

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth();

      const count = reports.filter((report) => {
        const created = new Date(report.createdAt);

        return (
          created.getFullYear() === year &&
          created.getMonth() === month
        );
      }).length;

      months.push({
        label: date.toLocaleDateString("id-ID", {
          month: "short",
        }),
        count,
      });
    }

    return {
      verified: verified.length,
      resolved: resolved.length,
      areas: areas.size,
      months,
    };
  }, [reports]);

  const maxCount = Math.max(
    1,
    ...stats.months.map((item) => item.count)
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          value={reports.length}
          label="Total Laporan"
        />

        <StatCard
          value={stats.verified}
          label="Terverifikasi"
        />

        <StatCard
          value={stats.resolved}
          label="Terselesaikan"
        />

        <StatCard
          value={stats.areas}
          label="Area Dilaporkan"
        />

        <StatCard
          value={profile.totalXP || 0}
          label="Total XP"
        />

        <StatCard
          value="—"
          label="Sampah (est.)"
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-5 text-sm font-semibold text-slate-800">
          Kontribusi per Bulan
        </h3>

        <div className="flex h-44 items-end gap-2 sm:gap-3">
          {stats.months.map((month, index) => (
            <div
              key={`${month.label}-${index}`}
              className="flex h-full min-w-0 flex-1 flex-col justify-end"
            >
              <div className="flex flex-1 items-end">
                <div
                  title={`${month.count} laporan`}
                  className="w-full rounded-t bg-[#3764a9]"
                  style={{
                    height: month.count
                      ? `${Math.max(
                          8,
                          (month.count / maxCount) * 100
                        )}%`
                      : "0%",
                  }}
                />
              </div>

              <p className="mt-2 text-center text-[11px] text-slate-400">
                {month.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Statistik berasal dari laporan akun. Estimasi berat sampah
        belum dapat dihitung karena data berat tidak tersedia.
      </p>
    </div>
  );
}

function ToggleSetting({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#0B3D91]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsPanel({ onDelete, onLogout }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      return {
        report: true,
        challenge: true,
        badge: true,
        ...JSON.parse(
          localStorage.getItem("oceanguard_user_preferences") || "{}"
        ),
      };
    } catch {
      return {
        report: true,
        challenge: true,
        badge: true,
      };
    }
  });

  const [language, setLanguage] = useState(() =>
    localStorage.getItem("oceanguard_language") || "id"
  );

  function updatePref(key, value) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);

    localStorage.setItem(
      "oceanguard_user_preferences",
      JSON.stringify(next)
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <ToggleSetting
          title="Notifikasi Status Laporan"
          description="Preferensi update perubahan status laporan"
          checked={prefs.report}
          onChange={(value) => updatePref("report", value)}
        />

        <ToggleSetting
          title="Challenge Reminder"
          description="Preferensi pengingat challenge"
          checked={prefs.challenge}
          onChange={(value) => updatePref("challenge", value)}
        />

        <ToggleSetting
          title="Badge Unlocked Alert"
          description="Preferensi notifikasi badge baru"
          checked={prefs.badge}
          onChange={(value) => updatePref("badge", value)}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <label
          htmlFor="profile-language"
          className="mb-2 block text-sm font-medium text-slate-800"
        >
          Bahasa
        </label>

        <select
          id="profile-language"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            localStorage.setItem(
              "oceanguard_language",
              e.target.value
            );
          }}
          className="w-full max-w-3xl rounded-md border border-slate-300 px-4 py-3 text-sm"
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English (preferensi)</option>
        </select>

        <p className="mt-2 text-xs text-slate-400">
          Preferensi ini disimpan pada browser. Perubahan bahasa
          seluruh aplikasi belum tersedia.
        </p>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="w-full rounded-md border border-red-300 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Hapus Akun
      </button>

      <button
        type="button"
        onClick={onLogout}
        className="w-full rounded-md border border-red-300 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Keluar dari Akun
      </button>
    </div>
  );
}

function ConfirmModal({
  mode, password, setPassword,
  error, busy, onCancel, onConfirm,
}) {
  const deleting = mode === "delete";

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2
          id="confirm-title"
          className="text-xl font-semibold text-slate-900"
        >
          {deleting ? "Hapus Akun ini?" : "Keluar dari akun?"}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-500">
          {deleting
            ? "Akun yang dihapus tidak dapat diakses kembali. Tindakan ini tidak dapat dibatalkan."
            : "Sesi akan diakhiri. Kamu perlu login kembali untuk melanjutkan."}
        </p>

        {deleting && (
          <div className="mt-4">
            <label className="mb-2 block text-sm text-slate-700">
              Konfirmasi kata sandi
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi akun"
              className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-[#0B3D91] focus:outline-none"
            />
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-lg border border-[#0B3D91] px-6 py-3 text-sm font-semibold text-[#0B3D91]"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-lg px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 ${
              deleting
                ? "bg-red-700 hover:bg-red-800"
                : "bg-[#0B3D91] hover:bg-blue-900"
            }`}
          >
            {busy
              ? "Memproses..."
              : deleting
                ? "Ya, Hapus Akun"
                : "Ya, Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [tab, setTab] = useState("account");
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [badges, setBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [password, setPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const results = await Promise.allSettled([
        getMe(),
        getMyReports(),
        getAllBadges(),
        getMyBadges(),
      ]);

      if (!active) return;

      if (results[0].status === "fulfilled") {
        setProfile(results[0].value);
      } else {
        setError(results[0].reason?.message || "Gagal memuat profil.");
      }

      if (results[1].status === "fulfilled") {
        setReports(results[1].value || []);
      }

      if (results[2].status === "fulfilled") {
        setBadges(results[2].value || []);
      }

      if (results[3].status === "fulfilled") {
        setMyBadges(results[3].value || []);
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  function openModal(type) {
    setModal(type);
    setPassword("");
    setModalError("");
  }

  async function confirmAction() {
    if (modal === "logout") {
      logout();
      navigate("/login");
      return;
    }

    if (!password) {
      setModalError("Kata sandi wajib diisi.");
      return;
    }

    setBusy(true);
    setModalError("");

    try {
      await deleteMyAccount(password);
      logout();
      navigate("/login");
    } catch (err) {
      setModalError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ReporterLayout>
      <div className="w-full pb-8">
        <h1 className="mb-10 text-2xl font-semibold text-slate-900">
          Profile
        </h1>

        {loading && (
          <p className="text-sm text-slate-500">
            Memuat profil...
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && profile && (
          <>
            <ProfileSummary profile={profile} />

            {/* TAB NAVIGATION */}
            <div className="mb-8 mt-10 flex gap-1 overflow-x-auto border-b border-slate-200">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium ${
                    tab === item.id
                      ? "border-[#0B3D91] text-[#0B3D91]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {tab === "account" && (
              <AccountPanel profile={profile} />
            )}

            {tab === "badges" && (
              <BadgePanel
                badges={badges}
                myBadges={myBadges}
              />
            )}

            {tab === "impact" && (
              <ImpactPanel
                reports={reports}
                profile={profile}
              />
            )}

            {tab === "settings" && (
              <SettingsPanel
                onDelete={() => openModal("delete")}
                onLogout={() => openModal("logout")}
              />
            )}
          </>
        )}

        {modal && (
          <ConfirmModal
            mode={modal}
            password={password}
            setPassword={setPassword}
            error={modalError}
            busy={busy}
            onCancel={() => !busy && setModal(null)}
            onConfirm={confirmAction}
          />
        )}
      </div>
    </ReporterLayout>
  );
}
