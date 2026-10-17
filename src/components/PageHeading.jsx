export default function PageHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#15316E]">{title}</h1>
      <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>
  );
}