
import { useEffect, useMemo, useState } from "react";
import { getAllInformasi } from "../api/informasi";

import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "../components/public/PublicFooter";
import PublicArticleCard from "../components/public/PublicArticleCard";

import infoDecor from "../assets/oceanguard-decor-info.png";

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
          setArticles(
            Array.isArray(data) ? data : []
          );
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message || "Gagal memuat artikel."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const totalPages = Math.ceil(
    articles.length / PAGE_SIZE
  );

  const displayedArticles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return articles.slice(
      start,
      start + PAGE_SIZE
    );
  }, [articles, page]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900">
      <PublicNavbar />

      <section className="relative isolate overflow-hidden bg-[#07559E] px-6 py-16 text-white sm:py-20">
        <img
          src={infoDecor}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute right-0 top-1/2 z-0 h-auto w-full min-w-[900px] -translate-y-1/2 select-none opacity-60"
        />

        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#07559E] via-[#07559E]/70 to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Informasi & Edukasi
          </h1>

          <p className="mt-4 max-w-2xl text-blue-100">
            Bacaan singkat soal sampah laut
            dan pelestarian pesisir.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
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
            <div className="rounded-xl border border-slate-200 p-10 text-center text-slate-500">
              Memuat artikel...
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-5 text-red-600"
            >
              {error}
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-14 text-center">
              <h3 className="text-xl font-semibold">
                Belum Ada Artikel
              </h3>

              <p className="mt-2 text-slate-500">
                Artikel akan tampil setelah
                ditambahkan oleh Admin.
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
                    onClick={() =>
                      setPage((p) => p - 1)
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                      onClick={() =>
                        setPage(number)
                      }
                      aria-current={
                        page === number
                          ? "page"
                          : undefined
                      }
                      className={`rounded-lg border px-4 py-2 transition-colors ${
                        page === number
                          ? "border-[#0B3D91] bg-[#0B3D91] text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((p) => p + 1)
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
