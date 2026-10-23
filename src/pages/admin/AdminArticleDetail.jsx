
import { useState, useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getInformasiById,
  deleteInformasi,
} from "../../api/informasi";

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
  const [notice, setNotice] = useState(
    location.state?.notice || null
  );

  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }

    loadArticle();
  }, [id]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notice]);

  async function loadArticle() {
    try {
      setLoading(true);
      setError("");

      const data = await getInformasiById(id);
      setArticle(data);
    } catch (err) {
      setError(
        err.message === "Informasi tidak ditemukan"
          ? "Artikel tidak ditemukan."
          : err.message
      );
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
        <h1 className="text-2xl font-bold text-[#15316E]">
          Kelola Artikel
        </h1>

        <p className="text-slate-400 text-sm">
          Kelola informasi dan edukasi tentang sampah laut
        </p>
      </div>

      {notice && <NoticeBanner {...notice} />}

      <div className="mb-5 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/admin/articles"
          className="flex min-h-[44px] w-full items-center justify-center whitespace-nowrap rounded-lg border border-[#0B3D91] px-5 py-2.5 text-center text-sm font-semibold text-[#0B3D91] transition-colors hover:bg-blue-50 sm:w-auto"
        >
          Kembali ke Daftar Artikel
        </Link>

        {article && (
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:items-center">
            <Link
              to={`/admin/articles/${article.id}/edit`}
              className="flex min-h-[44px] w-full items-center justify-center whitespace-nowrap rounded-lg border border-[#0B3D91] px-3 py-2.5 text-center text-sm font-semibold text-[#0B3D91] transition-colors hover:bg-blue-50 sm:w-auto sm:px-5"
            >
              Edit Artikel
            </Link>

            <button
              type="button"
              onClick={openModal}
              className="flex min-h-[44px] w-full items-center justify-center whitespace-nowrap rounded-lg bg-red-600 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto sm:px-6"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-slate-500">
          Memuat artikel...
        </p>
      )}

      {!loading && error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
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
