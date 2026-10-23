
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  getAllInformasi,
  getInformasiById,
} from "../../api/informasi";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";
import PublicArticleCard from "../../components/public/PublicArticleCard";
import BackLink from "../../components/public/BackLink";

function readContent(value) {
  return String(value || "")
    .replace(/<\/(?:p|h[1-6]|div|li)>/gi, "\n\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export default function MobileArticleDetailPage() {
  const location = useLocation();

  const id = decodeURIComponent(
    location.pathname.split("/")[2] || ""
  );

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setArticle(null);
    setRelated([]);

    Promise.all([
      getInformasiById(id),
      getAllInformasi(),
    ])
      .then(([detail, items]) => {
        if (!active) return;

        setArticle(detail);

        const recommendations = (
          Array.isArray(items) ? items : []
        )
          .filter(
            (item) =>
              String(item.id) !== String(id)
          )
          .slice(0, 2);

        setRelated(recommendations);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message ||
              "Artikel gagal dimuat"
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
  }, [id]);

  const date = useMemo(() => {
    if (!article?.createdAt) {
      return "";
    }

    return new Date(
      article.createdAt
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [article?.createdAt]);

  return (
    <div className="og-mobile-article og-mobile-standalone min-h-screen bg-white text-[#101C43]">
      <PublicNavbar />

      <main className="og-mobile-inner">
        <BackLink
          to="/informasi"
          label="Kembali ke Informasi & Edukasi"
        />

        {loading ? (
          <p role="status">
            Memuat artikel...
          </p>
        ) : error || !article ? (
          <div>
            <p
              role="alert"
              className="text-red-600"
            >
              {error || "Artikel tidak ditemukan"}
            </p>

            <BackLink
              to="/informasi"
              label="Kembali ke Informasi & Edukasi"
              className="og-back-bottom"
            />
          </div>
        ) : (
          <>
            <p className="og-mobile-eyebrow">
              ARTIKEL EDUKASI
            </p>

            <h1 className="og-mobile-heading">
              {article.title}
            </h1>

            <p className="og-mobile-meta">
              {date} · OceanGuard
            </p>

            {article.coverImageUrl && (
              <img
                className="og-mobile-article-cover"
                src={article.coverImageUrl}
                alt={article.title}
                loading="lazy"
              />
            )}

            <article className="og-mobile-article-body">
              {readContent(article.content)}
            </article>

            {related.length > 0 && (
              <section className="og-mobile-related">
                <h2 className="og-mobile-secondary-heading">
                  Lanjutkan membaca
                </h2>

                <div className="og-mobile-articles">
                  {related.map((item) => (
                    <PublicArticleCard
                      key={item.id}
                      article={item}
                    />
                  ))}
                </div>
              </section>
            )}

            <Link
              to="/reports/new"
              className="og-mobile-primary og-mobile-primary-wide"
            >
              Lapor Sekarang
            </Link>

            <BackLink
              to="/informasi"
              label="Kembali ke Informasi & Edukasi"
              className="og-back-bottom"
            />
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
