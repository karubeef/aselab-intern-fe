
import { Link } from "react-router-dom";

export default function PublicArticleCard({ article }) {
  const description = String(article.content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <Link
      to={`/informasi/${article.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
    >
      {article.coverImageUrl ? (
        <img
          src={article.coverImageUrl}
          alt={article.title}
          loading="lazy"
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-blue-50 text-[#0B3D91]">
          OceanGuard
        </div>
      )}

      <div className="p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Artikel
        </span>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-[#0B3D91]">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        <p className="mt-4 text-xs text-slate-400">
          {article.createdAt
            ? new Date(article.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </p>
      </div>
    </Link>
  );
}
