import { ARTICLE_CATEGORY } from "../utils/articleFormat";

export default function ArticleView({ coverUrl, title, metaDate, content }) {
  return (
    <div className="border border-slate-200 rounded-xl p-6">
      {coverUrl && (
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-60 object-cover rounded-lg mb-4"
        />
      )}
      <h2 className="text-2xl font-bold text-[#0B3D91] mb-2">{title}</h2>
      <p className="text-slate-500 text-xs mb-4">
        {ARTICLE_CATEGORY} · {metaDate}
      </p>
      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{content}</div>
    </div>
  );
}