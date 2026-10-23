
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAllInformasi } from "../../api/informasi";

import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";
import PublicArticleCard from "../../components/public/PublicArticleCard";
import BackLink from "../../components/public/BackLink";

import cleanupImage from "../../assets/oceanGuard_landingPageImage2.png";

export default function MobileInformationPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getAllInformasi()
      .then((data) => {
        if (mounted) {
          setArticles(
            Array.isArray(data) ? data : []
          );
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err.message || "Gagal memuat artikel"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="og-mobile-info og-mobile-standalone min-h-screen bg-white text-[#101C43]">
      <PublicNavbar />

      <main className="og-mobile-inner">
        <BackLink
          to="/"
          label="Kembali ke Beranda"
        />

        <h1 className="og-mobile-heading">
          Informasi &amp; Edukasi
        </h1>

        <p className="og-mobile-subtitle">
          Event bersih pantai dan bacaan singkat soal sampah laut.
        </p>

        <Link
          to="/challenges"
          className="og-mobile-feature"
        >
          <img
            src={cleanupImage}
            alt="Kegiatan membersihkan sampah pantai"
            loading="lazy"
          />

          <span className="og-mobile-eyebrow">
            CHALLENGE OCEANGUARD
          </span>

          <h2>Pekan Bersih Pantai</h2>

          <p>
            Lihat tantangan yang tersedia dan kumpulkan XP
            melalui kontribusi yang terverifikasi.
          </p>

          <span className="og-mobile-primary">
            Lihat Challenge
          </span>
        </Link>

        <h2 className="og-mobile-secondary-heading">
          Bacaan untuk laut yang lebih bersih
        </h2>

        {loading ? (
          <p role="status">
            Memuat artikel...
          </p>
        ) : error ? (
          <p
            role="alert"
            className="text-red-600"
          >
            {error}
          </p>
        ) : articles.length === 0 ? (
          <p>
            Belum ada artikel dari Admin.
          </p>
        ) : (
          <div className="og-mobile-articles">
            {articles.map((article) => (
              <PublicArticleCard
                key={article.id}
                article={article}
              />
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
