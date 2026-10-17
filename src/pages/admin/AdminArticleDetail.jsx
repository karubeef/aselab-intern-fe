import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getInformasiById, deleteInformasi } from "../../api/informasi";
import ReporterLayout from "../../components/ReporterLayout";
import NoticeBanner from "../../components/NoticeBanner";
import ArticleView from "../../components/ArticleView";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { formatLongDate } from "../../utils/articleFormat";

export default function AdminArticleDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
    loadArticle();
  }, [id]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadArticle() {
    try {
      setLoading(true);
      setError("");
      const data = await getInformasiById(id);
      setArticle(data);
    } catch (err) {
      setError(err.message === "Informasi tidak ditemukan" ? "Artikel tidak ditemukan." : err.message);
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
      await deleteInformasi(article.id);
      navigate("/admin/articles", {
        state: {
          notice: {
            type: "success",
            title: "Artikel berhasil dihapus",
            message: `${article.title} telah dihapus dari daftar artikel.`,
          },
        },
      });
    } catch (err) {
      setDeleteError(err.message);
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

      <div className="flex items-center justify-between mb-5">
        <Link
          to="/admin/articles"
          className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-5 py-2.5 rounded-lg text-sm"
        >
          Kembali ke Daftar Artikel
        </Link>

        {article && (
          <div className="flex gap-3">
            <Link
              to={`/admin/articles/${article.id}/edit`}
              className="border border-[#0B3D91] text-[#0B3D91] font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              Edit Artikel
            </Link>
            <button
              onClick={openModal}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {loading && <p className="text-slate-500">Memuat artikel...</p>}

      {!loading && error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</p>
      )}

      {!loading && article && (
        <ArticleView
          coverUrl={article.coverImageUrl}
          title={article.title}
          metaDate={formatLongDate(article.createdAt)}
          content={article.content}
        />
      )}

      {showModal && article && (
        <ConfirmDeleteModal
          title="Hapus artikel ini?"
          message={`Artikel “${article.title}” akan dihapus dari daftar dan tidak lagi tersedia untuk dibaca pengguna.`}
          confirmLabel="Ya, Hapus Artikel"
          deleting={deleting}
          error={deleteError}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </ReporterLayout>
  );
}