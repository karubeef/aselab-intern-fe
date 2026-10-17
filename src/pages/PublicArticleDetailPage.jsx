
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAllInformasi, getInformasiById } from "../api/informasi";

import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "../components/public/PublicFooter";
import PublicArticleCard from "../components/public/PublicArticleCard";

export default function PublicArticleDetailPage() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      setLoading(true);
      setError("");

      try {
        const [detail, allArticles] = await Promise.all([
          getInformasiById(id),
          getAllInformasi(),
        ]);

        if (!active) return;

        setArticle(detail);

        const recommendations = (Array.isArray(allArticles)
          ? allArticles
          : []
        )
          .filter((item) => String(item.id) !== String(id))
          .slice(0, 2);

        setRelated(recommendations);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadArticle();

    return () => {
      active = false;
    };
  }, [id]);

  const formattedDate = article?.createdAt
    ? new Date(article.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {loading ? (
        <div className="mx-auto max-w-6xl px-6 py-20 text-slate-500">
          Memuat artikel...
        </div>
      ) : error || !article ? (
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p role="alert" className="text-red-600">
            {error || "Artikel tidak ditemukan."}
          </p>
          <Link to="/informasi" className="mt-5 inline-block text-blue-700">
            ← Kembali ke Informasi
          </Link>
        </div>
      ) : (
        <>
          {/* ARTICLE HEADER */}
          <section className="bg-[#0B3D91] px-6 py-12 text-white">
            <div className="mx-auto max-w-6xl">
              <p className="mb-5 text-sm text-blue-100">
                <Link to="/">Beranda</Link> /{" "}
                <Link to="/informasi">Informasi & Edukasi</Link> / Artikel
              </p>

              <span className="text-xs font-semibold uppercase text-blue-100">
                Artikel Edukasi
              </span>

              <h1 className="mt-4 max-w-5xl text-3xl font-bold leading-tight sm:text-4xl">
                {article.title}
              </h1>

              <p className="mt-5 text-sm text-blue-100">
                {formattedDate} · OceanGuard
              </p>
            </div>
          </section>

          {/* ARTICLE BODY */}
          <section className="px-6 py-12">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-4xl">
                {article.coverImageUrl && (
                  <figure className="mb-10">
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="max-h-[470px] w-full rounded-xl object-cover"
                    />
                    <figcaption className="mt-3 text-xs text-slate-400">
                      Gambar sampul artikel OceanGuard
                    </figcaption>
                  </figure>
                )}

                <article className="whitespace-pre-line break-words text-base leading-8 text-slate-700">
                  {article.content}
                </article>

                <div className="mt-10 border-t pt-6">
                  <Link
                    to="/informasi"
                    className="inline-flex rounded-lg border border-[#0B3D91] px-5 py-3 text-sm font-semibold text-[#0B3D91]"
                  >
                    Kembali ke Informasi & Edukasi
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* RELATED ARTICLES */}
          {related.length > 0 && (
            <section className="bg-slate-100 px-6 py-16">
              <div className="mx-auto max-w-6xl">
                <h2 className="mb-8 text-2xl font-semibold text-[#0B3D91]">
                  Lanjutkan membaca
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {related.map((item) => (
                    <PublicArticleCard
                      key={item.id}
                      article={item}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* BOTTOM CTA */}
          <section className="bg-[#0B3D91] px-6 py-14 text-white">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-2xl font-semibold">
                Lihat sampah di pesisir? Mulai dari satu laporan.
              </h2>
              <p className="mt-3 text-blue-100">
                Dokumentasikan kondisinya dan bantu petugas menemukan lokasinya.
              </p>
              <Link
                to="/reports/new"
                className="mt-5 inline-block rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#0B3D91]"
              >
                Lapor Sekarang
              </Link>
            </div>
          </section>
        </>
      )}

      <PublicFooter />
    </div>
  );
}
