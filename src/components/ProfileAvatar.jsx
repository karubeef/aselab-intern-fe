export default function ProfileAvatar({ name = "", src, size = 96, bordered = false }) {
  const style = { width: size, height: size };
  const border = bordered ? "border-4 border-white shadow" : "border border-slate-200";

  if (src) {
    return (
      <img
        src={src}
        alt="Foto profil"
        style={style}
        className={`rounded-full object-cover bg-slate-100 ${border}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full bg-[#15316E] text-white flex items-center justify-center font-bold ${border}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{name?.[0]?.toUpperCase() || "A"}</span>
    </div>
  );
}