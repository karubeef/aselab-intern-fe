import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createChallenge } from "../../api/challenges";
import ReporterLayout from "../../components/ReporterLayout";
import NoticeBanner from "../../components/NoticeBanner";
import ChallengeIcon from "../../components/ChallengeIcon";

const INITIAL_VALUES = {
  name: "",
  description: "",
  target: "",
  rewardXP: "",
  startDate: "",
  endDate: "",
};

function validate(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Nama challenge wajib diisi.";
  if (!values.description.trim()) errors.description = "Deskripsi wajib diisi.";

  const target = Number(values.target);
  if (values.target === "" || Number.isNaN(target) || target <= 0) {
    errors.target = "Target harus lebih dari 0.";
  } else if (!Number.isInteger(target)) {
    errors.target = "Target harus berupa bilangan bulat.";
  }

  const rewardXP = Number(values.rewardXP);
  if (values.rewardXP === "" || Number.isNaN(rewardXP) || rewardXP <= 0) {
    errors.rewardXP = "Reward XP harus lebih dari 0.";
  } else if (!Number.isInteger(rewardXP)) {
    errors.rewardXP = "Reward XP harus berupa bilangan bulat.";
  }

  if (!values.startDate) errors.startDate = "Tanggal mulai wajib diisi.";

  if (!values.endDate) {
    errors.endDate = "Tanggal selesai wajib diisi.";
  } else if (values.startDate && values.endDate < values.startDate) {
    errors.endDate = "Tanggal selesai mendahului mulai.";
  }

  return errors;
}

function inputClass(hasError) {
  return `w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4] ${
    hasError ? "border-red-400" : "border-slate-300"
  }`;
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label} *</label>
      {children}
      {error ? (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      ) : hint ? (
        <p className="text-slate-400 text-xs mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export default function AdminChallengeCreate() {
  const navigate = useNavigate();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const errors = validate(values);
  const shown = submitted ? errors : {};
  const hasErrors = Object.keys(errors).length > 0;

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setApiError("");

    if (hasErrors) return;

    setSaving(true);

    try {
      const challenge = await createChallenge({
        name: values.name.trim(),
        description: values.description.trim(),
        target: Number(values.target),
        rewardXP: Number(values.rewardXP),
        startDate: new Date(`${values.startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${values.endDate}T23:59:59`).toISOString(),
      });

      navigate("/admin/challenges", {
        state: {
          notice: {
            type: "success",
            title: "Challenge berhasil dibuat",
            message: `${challenge.name} telah ditambahkan ke daftar challenge.`,
          },
        },
      });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
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

      {submitted && hasErrors && (
        <NoticeBanner
          type="error"
          title="Data challenge belum valid"
          message="Periksa kolom yang ditandai sebelum menyimpan."
        />
      )}

      {apiError && (
        <NoticeBanner type="error" title="Challenge gagal disimpan" message={apiError} />
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4 items-start">
        <form onSubmit={handleSubmit} className="border border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-1">Tambah Challenge</h2>
          <p className="text-slate-500 text-xs mb-5">
            Lengkapi informasi berikut. Semua kolom wajib diisi.
          </p>

          <div className="flex flex-col gap-4">
            <Field label="Nama challenge" error={shown.name}>
              <input
                type="text"
                placeholder="Masukkan nama challenge"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                className={inputClass(shown.name)}
              />
            </Field>

            <Field label="Deskripsi" error={shown.description}>
              <input
                type="text"
                placeholder="Jelaskan tujuan dan cara menyelesaikan challenge"
                value={values.description}
                onChange={(e) => setField("description", e.target.value)}
                className={inputClass(shown.description)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Target laporan terverifikasi"
                error={shown.target}
                hint="Jumlah laporan Verified"
              >
                <input
                  type="number"
                  step="1"
                  placeholder="Contoh: 5"
                  value={values.target}
                  onChange={(e) => setField("target", e.target.value)}
                  className={inputClass(shown.target)}
                />
              </Field>

              <Field label="Reward XP" error={shown.rewardXP} hint="XP setelah challenge selesai">
                <input
                  type="number"
                  step="1"
                  placeholder="Contoh: 100"
                  value={values.rewardXP}
                  onChange={(e) => setField("rewardXP", e.target.value)}
                  className={inputClass(shown.rewardXP)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal mulai" error={shown.startDate}>
                <input
                  type="date"
                  value={values.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                  className={inputClass(shown.startDate)}
                />
              </Field>

              <Field label="Tanggal selesai" error={shown.endDate}>
                <input
                  type="date"
                  value={values.endDate}
                  onChange={(e) => setField("endDate", e.target.value)}
                  className={inputClass(shown.endDate)}
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate("/admin/challenges")}
                className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-6 py-3 rounded-lg text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0B3D91] hover:bg-[#093178] disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-lg text-sm"
              >
                {saving ? "Menyimpan..." : "Simpan Challenge"}
              </button>
            </div>
          </div>
        </form>

        <div className="border border-slate-200 rounded-xl p-6">
          <ChallengeIcon size={56} />
          <h3 className="text-lg font-bold text-[#0B3D91] mt-3 mb-3">Kontribusi yang terukur</h3>
          <div className="flex flex-col gap-3 text-slate-600 text-sm">
            <p>Target dihitung dari laporan reporter yang berstatus Verified selama periode challenge.</p>
            <p>Reward XP diberikan setelah target challenge tercapai.</p>
            <p>Gunakan nama dan deskripsi yang mudah dipahami reporter.</p>
          </div>
        </div>
      </div>
    </ReporterLayout>
  );
}