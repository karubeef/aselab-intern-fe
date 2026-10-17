import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getInformasiById, updateInformasi } from "../../api/informasi";
import ReporterLayout from "../../components/ReporterLayout";
import ArticleForm from "../../components/ArticleForm";
import { formatLongDate } from "../../utils/articleFormat";

export default function AdminArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadArticle();
  }, [id]);

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

  async function handleSave(values) {
    await updateInformasi(id, values);

    navigate(`/admin/articles/${id}`, {
      state: {
        notice: {
          type: "success",
          title: "Perubahan berhasil disimpan",
          message: "Isi artikel telah diperbarui.",
        },
      },
    });
  }

  if (loading || error || !article) {
    return (
      <ReporterLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#15316E]">Kelola Artikel</h1>
          <p className="text-slate-400 text-sm">Kelola informasi dan edukasi tentang sampah laut</p>
        </div>

        <Link
          to="/admin/articles"
          className="inline-block border border-[#0B3D91] text-[#0B3D91] font-semibold px-5 py-2.5 rounded-lg text-sm mb-5"
        >
          Kembali ke Daftar Artikel
        </Link>

        {loading && <p className="text-slate-500">Memuat artikel...</p>}
        {!loading && error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</p>
        )}
      </ReporterLayout>
    );
  }

  return (
    <ArticleForm
      mode="edit"
      initial={{
        title: article.title,
        content: article.content,
        coverImageUrl: article.coverImageUrl || "",
      }}
      previewDate={formatLongDate(article.createdAt)}
      onSave={handleSave}
    />
  );
}