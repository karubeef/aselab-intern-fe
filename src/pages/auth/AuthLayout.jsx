
import { Link } from "react-router-dom";
import logo from "../../assets/oceanguard-logo-w.png";
import background from "../../assets/oceanguard-auth.png";

const STATS = [
  { value: "14.8K", label: "Laporan Masuk" },
  { value: "3.2K", label: "Relawan Aktif" },
  { value: "247", label: "Titik Terpantau" },
  { value: "86%", label: "Tingkat Resolusi" },
];

export default function AuthLayout({ children }) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-2">
      <section
        className="relative flex min-h-[390px] flex-col overflow-hidden bg-[#063D66] bg-cover bg-center bg-no-repeat text-white md:min-h-screen"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#00385B]/10 via-transparent to-[#002440]/35" />

        <div className="relative z-10 flex min-h-[390px] flex-1 flex-col px-7 pb-10 pt-8 sm:px-12 md:px-[12%] md:pb-16 md:pt-10">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-3"
          >
            <img
              src={logo}
              alt="Logo OceanGuard"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-semibold tracking-tight">
              OceanGuard
            </span>
          </Link>

          <div className="my-auto w-full max-w-[535px] py-14 md:py-10">
            <h1 className="text-[42px] font-bold leading-[1.12] tracking-tight sm:text-[46px]">
              Protect Our
              <br />
              Ocean,
              <br />
              Together.
            </h1>

            <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-white">
              Bergabung dengan ribuan relawan yang aktif menjaga
              kebersihan laut Indonesia setiap harinya.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[4px] bg-white/70 px-4 py-4 text-[#073D85] backdrop-blur-[2px]"
                >
                  <p className="text-[27px] font-bold leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[13px] text-[#152A41]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[520px] items-center justify-center bg-white px-7 py-16 sm:px-12 md:min-h-screen">
        <div className="w-full max-w-[448px]">
          <Link
            to="/"
            className="mb-8 inline-block text-[13px] font-medium text-[#8F9CB2] hover:text-[#0B3D91]"
          >
            ← Kembali ke Beranda
          </Link>

          {children}
        </div>
      </section>
    </main>
  );
}
