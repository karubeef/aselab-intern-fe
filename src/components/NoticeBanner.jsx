export default function NoticeBanner({ type, title, message }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-lg px-5 py-4 mb-5 flex gap-3 border ${
        isSuccess
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
          isSuccess ? "bg-green-600" : "bg-red-600"
        }`}
      />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs mt-0.5">{message}</p>
      </div>
    </div>
  );
}