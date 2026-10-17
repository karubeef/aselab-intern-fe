
import { useEffect, useMemo, useState } from "react";
import { getAllInformasi } from "../api/informasi";

import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "../components/public/PublicFooter";
import PublicArticleCard from "../components/public/PublicArticleCard";

const PAGE_SIZE = 6;

export default function PublicInformationPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    getAllInformasi()
      .then((data) => {
        if (active) {
          setArticles(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const totalPages = Math.ceil(articles.length / PAGE_SIZE);

  const displayedArticles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return articles.slice(start, start + PAGE_SIZE);
  }, [articles, page]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* HEADER */}
      <section className="bg-[#07559E] px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Informasi & Edukasi
          </h1>
          <p className="mt-4 text-blue-100">
            Bacaan singkat soal sampah laut dan pelestarian pesisir.
          </p>
        </div>
      </section>

      {/* LIST ARTIKEL */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Artikel & Edukasi
            </h2>
            <p className="text-sm text-slate-400">
              {articles.length} artikel
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border p-10 text-center text-slate-500">
              Memuat artikel...
            </div>
          ) : error ? (
            <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-600">
              {error}
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-xl border p-14 text-center">
              <h3 className="text-xl font-semibold">
                Belum Ada Artikel
              </h3>
              <p className="mt-2 text-slate-500">
                Artikel akan tampil setelah ditambahkan oleh Admin.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map((article) => (
                  <PublicArticleCard
                    key={article.id}
                    article={article}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border px-4 py-2 disabled:opacity-40"
                  >
                    ←
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  ).map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => setPage(number)}
                      aria-current={page === number ? "page" : undefined}
                      className={`rounded-lg border px-4 py-2 ${
                        page === number
                          ? "bg-[#0B3D91] text-white"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border px-4 py-2 disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
