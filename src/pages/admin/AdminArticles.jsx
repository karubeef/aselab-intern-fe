import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAllInformasi, deleteInformasi } from "../../api/informasi";
import ReporterLayout from "../../components/ReporterLayout";
import NoticeBanner from "../../components/NoticeBanner";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { ARTICLE_CATEGORY, formatLongDate, formatTimeWib } from "../../utils/articleFormat";

function ArticleEmptyIcon() {
  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 64 64"
      fill="none"
      stroke="#0B3D91"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="10" y="6" width="38" height="50" rx="4" />
      <path d="M18 18h22M18 28h22M18 38h14" />
      <path d="M48 20h6a4 4 0 014 4v28a4 4 0 01-4 4H22" />
    </svg>
  );
}

export default function AdminArticles() {
  const location = useLocation();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
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
    loadArticles();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadArticles() {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getAllInformasi();
      setArticles(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openDeleteModal(article) {
    setDeleteError("");
    setToDelete(article);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteInformasi(toDelete.id);
      setArticles((prev) => prev.filter((a) => a.id !== toDelete.id));
      setNotice({
        type: "success",
        title: "Artikel berhasil dihapus",
        message: `${toDelete.title} telah dihapus dari daftar artikel.`,
      });
      setToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#15316E]">Kelola Artikel</h1>
        <p className="text-slate-400 text-sm">Kelola informasi dan edukasi tentang sampah laut</p>
      </div>

      {notice && <NoticeBanner {...notice} />}

      {loadError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={loadArticles} className="font-medium underline">
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Memuat artikel...</p>
      ) : articles.length === 0 ? (
        <div className="border border-slate-200 rounded-xl min-h-[460px] flex flex-col items-center justify-center text-center px-6 py-10">
          <ArticleEmptyIcon />
          <h2 className="text-2xl font-bold text-[#0B3D91] mt-6 mb-2">Belum ada artikel</h2>
          <p className="text-slate-500 max-w-sm mb-6">
            Tambahkan artikel pertama untuk membagikan informasi dan edukasi tentang sampah laut.
          </p>
          <Link
            to="/admin/articles/new"
            className="bg-[#0B3D91] hover:bg-[#093178] text-white font-semibold px-10 py-3.5 rounded-lg text-sm"
          >
            Tambah Artikel
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-slate-700">Daftar Artikel</h2>
            <Link
              to="/admin/articles/new"
              className="bg-[#0B3D91] hover:bg-[#093178] text-white font-semibold px-6 py-3 rounded-lg text-sm"
            >
              Tambah Artikel
            </Link>
          </div>
          <p className="text-slate-500 text-sm mb-4">{articles.length} artikel tersedia</p>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-slate-600">
                  <th className="px-5 py-3 font-medium">Artikel</th>
                  <th className="px-5 py-3 font-medium">Diperbarui</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-[72px] rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {a.coverImageUrl && (
                            <img
                              src={a.coverImageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/admin/articles/${a.id}`}
                            className="font-semibold text-[#0B3D91] hover:underline"
                          >
                            {a.title}
                          </Link>
                          <p className="text-slate-500 text-xs mt-1">{ARTICLE_CATEGORY}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{formatLongDate(a.updatedAt)}</p>
                      <p>{formatTimeWib(a.updatedAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/articles/${a.id}`}
                          className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-6 py-2.5 rounded-lg text-sm"
                        >
                          Detail
                        </Link>
                        <Link
                          to={`/admin/articles/${a.id}/edit`}
                          aria-label={`Edit ${a.title}`}
                          className="w-11 h-11 rounded-lg bg-[#3B63D9] hover:bg-[#2F52BD] flex items-center justify-center"
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
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(a)}
                          aria-label={`Hapus ${a.title}`}
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
        <ConfirmDeleteModal
          title="Hapus artikel ini?"
          message={`Artikel “${toDelete.title}” akan dihapus dari daftar dan tidak lagi tersedia untuk dibaca pengguna.`}
          confirmLabel="Ya, Hapus Artikel"
          deleting={deleting}
          error={deleteError}
          onCancel={() => setToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </ReporterLayout>
  );
}