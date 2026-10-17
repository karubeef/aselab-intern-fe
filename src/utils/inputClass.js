
export function inputClass(error = false) {
  return [
    "w-full",
    "rounded-lg",
    "border",
    "px-4",
    "py-3",
    "text-sm",
    "text-slate-800",
    "outline-none",
    "transition-colors",
    "placeholder:text-slate-400",
    error
      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
      : "border-slate-300 focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91]",
  ].join(" ");
}
