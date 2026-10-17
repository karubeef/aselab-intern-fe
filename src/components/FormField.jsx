export function inputClass(hasError) {
  return `w-full border rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1179C4] ${
    hasError ? "border-red-400" : "border-slate-300"
  }`;
}

export default function FormField({ label, required = true, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      ) : hint ? (
        <p className="text-slate-400 text-xs mt-1">{hint}</p>
      ) : null}
    </div>
  );
}