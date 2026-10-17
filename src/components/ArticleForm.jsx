import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { uploadPhotos } from "../api/uploads";
import ReporterLayout from "./ReporterLayout";
import NoticeBanner from "./NoticeBanner";
import ArticleView from "./ArticleView";

function inputClass(hasError) {
  return `w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4] ${
    hasError ? "border-red-400" : "border-slate-300"
  }`;
}

export default function ArticleForm({ mode, initial, previewDate, onSave }) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial.coverImageUrl || "");
  const [coverError, setCoverError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const errors = {};
  if (!coverPreview) errors.cover = "Gambar sampul wajib dipilih.";
  if (!title.trim()) errors.title = "Judul artikel wajib diisi.";
  if (!content.trim()) errors.content = "Isi artikel wajib diisi.";

  const hasErrors = Object.keys(errors).length > 0;
  const shown = submitted ? errors : {};

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setCoverError("Hanya file JPG atau PNG yang diperbolehkan.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCoverError("Ukuran gambar maksimal 5MB.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    setCoverError("");
    setCoverFile(file);
    setCoverPreview(url);
  }

  async function handleSave() {
    setSubmitted(true);
    setApiError("");

    if (hasErrors) {
      setPreviewMode(false);
      return;
    }

    setSaving(true);

    try {
      let coverImageUrl = initial.coverImageUrl;

      if (coverFile) {
        const urls = await uploadPhotos([coverFile]);
        coverImageUrl = urls[0];
      }

      await onSave({
        title: title.trim(),
        content: content.trim(),
        coverImageUrl,
      });
    } catch (err) {
      setApiError(err.message);
      setPreviewMode(false);
      setSaving(false);
    }
  }

  const header = (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#15316E]">Kelola Artikel</h1>
      <p className="text-slate-400 text-sm">Kelola informasi dan edukasi tentang sampah laut</p>
    </div>
  );

  if (previewMode) {
    return (
      <ReporterLayout>
        {header}

        <button
          onClick={() => setPreviewMode(false)}
          className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-5 py-2.5 rounded-lg text-sm mb-5"
        >
          Kembali ke Form
        </button>

        <ArticleView
          coverUrl={coverPreview}
          title={title.trim() || "Judul artikel belum diisi"}
          metaDate={previewDate}
          content={content.trim() || "Isi artikel belum diisi."}
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0B3D91] hover:bg-[#093178] disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-lg text-sm mt-4"
        >
          {saving ? "Menyimpan..." : "Simpan Artikel"}
        </button>
      </ReporterLayout>
    );
  }

  return (
    <ReporterLayout>
      {header}

      <Link
        to="/admin/articles"
        className="inline-block border border-[#0B3D91] text-[#0B3D91] font-semibold px-5 py-2.5 rounded-lg text-sm mb-5"
      >
        Kembali ke Daftar Artikel
      </Link>

      {submitted && hasErrors && (
        <NoticeBanner
          type="error"
          title="Artikel belum dapat disimpan"
          message="Lengkapi kolom yang ditandai, lalu simpan kembali."
        />
      )}

      {apiError && (
        <NoticeBanner type="error" title="Artikel gagal disimpan" message={apiError} />
      )}

      <div className="border border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          {isEdit ? "Edit Artikel" : "Tambah Artikel"}
        </h2>

        <label className="block text-sm font-medium text-slate-700 mb-1.5">Gambar Sampul *</label>

        <div
          className={`h-44 rounded-lg border flex flex-col items-center justify-center overflow-hidden ${
            shown.cover ? "border-red-400" : "border-slate-300"
          }`}
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Gambar sampul" className="w-full h-full object-cover" />
          ) : (
            <>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F2937"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="16" cy="8" r="1.5" />
                <path d="M3 17l5-5 4 4 3-3 6 6" />
              </svg>
              <p className="text-slate-600 text-sm mt-3">Pilih gambar yang mewakili isi artikel.</p>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 mb-1">
          <p className="text-slate-500 text-xs">Sampul ditampilkan pada daftar dan detail artikel.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-4 py-1.5 rounded-lg text-xs"
          >
            {coverPreview ? "Ganti Gambar" : "Pilih Gambar"}
          </button>
        </div>

        {(shown.cover || coverError) && (
          <p className="text-red-500 text-xs mb-1">{coverError || shown.cover}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul artikel *</label>
          <input
            type="text"
            placeholder="Masukkan judul artikel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass(shown.title)}
          />
          {shown.title && <p className="text-red-500 text-xs mt-1">{shown.title}</p>}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Isi artikel *</label>
          <textarea
            rows={7}
            placeholder={
              isEdit
                ? "Tuliskan isi artikel..."
                : "Tulis informasi edukasi yang ingin dibagikan kepada pengguna."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={inputClass(shown.content)}
          />
          {shown.content && <p className="text-red-500 text-xs mt-1">{shown.content}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          {!isEdit && (
            <Link
              to="/admin/articles"
              className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-6 py-3 rounded-lg text-sm"
            >
              Batal
            </Link>
          )}
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-6 py-3 rounded-lg text-sm"
          >
            Pratinjau
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0B3D91] hover:bg-[#093178] disabled:bg-slate-300 text-white font-semibold px-6 py-3 rounded-lg text-sm"
          >
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Artikel"}
          </button>
        </div>
      </div>
    </ReporterLayout>
  );
}