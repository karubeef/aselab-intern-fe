
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import logoBlue from "../../assets/oceanguard-logo.png";
import logoWhite from "../../assets/oceanguard-logo-w.png";

const DURATION = 780;

function easing(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function PublicNavbar({
  transparent = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const animation = useRef(null);

  const logo = transparent ? logoWhite : logoBlue;

  const stop = () => {
    if (animation.current !== null) {
      cancelAnimationFrame(animation.current);
      animation.current = null;
    }
  };

  function scrollSection(id) {
    const element = document.getElementById(id);

    if (!element) return;

    stop();

    const end = Math.max(
      0,
      window.scrollY +
        element.getBoundingClientRect().top -
        12
    );

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      window.scrollTo(0, end);
      return;
    }

    const start = window.scrollY;
    const change = end - start;

    let started;

    function frame(time) {
      if (started == null) {
        started = time;
      }

      const t = Math.min(
        (time - started) / DURATION,
        1
      );

      window.scrollTo(
        0,
        start + change * easing(t)
      );

      animation.current =
        t < 1 ? requestAnimationFrame(frame) : null;
    }

    animation.current = requestAnimationFrame(frame);
  }

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;

    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (
      location.pathname !== "/" ||
      !location.hash
    ) {
      return;
    }

    const id = decodeURIComponent(
      location.hash.slice(1)
    );

    const frame = requestAnimationFrame(() => {
      scrollSection(id);
    });

    return () => {
      cancelAnimationFrame(frame);
      stop();
    };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    return () => stop();
  }, []);

  function onSection(event, id) {
    event.preventDefault();
    setOpen(false);

    if (
      window.matchMedia(
        "(max-width: 767px)"
      ).matches
    ) {
      navigate(
        id === "faq" ? "/faq" : "/cara-kerja"
      );
      return;
    }

    if (
      location.pathname === "/" &&
      location.hash === `#${id}`
    ) {
      scrollSection(id);
    } else {
      navigate(`/#${id}`);
    }
  }

  const menuLinks = [
    { label: "Beranda", to: "/" },
    { label: "Peta Publik", to: "/public-map" },
    { label: "Cara Kerja", to: "/cara-kerja" },
    {
      label: "Informasi & Edukasi",
      to: "/informasi",
    },
    { label: "FAQ", to: "/faq" },
  ];

  return (
    <>
      <header
        className={
          transparent
            ? "absolute inset-x-0 top-0 z-30 text-white"
            : "relative z-30 border-b border-slate-200 bg-white text-[#10254A]"
        }
      >
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
          >
            <img
              src={logo}
              alt="OceanGuard"
              className="h-11 w-11 shrink-0 object-contain"
            />

            <span className="text-xl font-bold">
              OceanGuard
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <Link
              to="/public-map"
              className="hover:underline"
            >
              Peta
            </Link>

            <Link
              to="/#cara-kerja"
              onClick={(e) =>
                onSection(e, "cara-kerja")
              }
              className="hover:underline"
            >
              Cara Kerja
            </Link>

            <Link
              to="/informasi"
              className="hover:underline"
            >
              Informasi
            </Link>

            <Link
              to="/#faq"
              onClick={(e) =>
                onSection(e, "faq")
              }
              className="hover:underline"
            >
              FAQ
            </Link>
          </nav>

          <div className="hidden gap-2 md:flex">
            <Link
              to="/login"
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                transparent
                  ? "border-white/70 text-white hover:bg-white/10"
                  : "border-[#0B3D91] text-[#0B3D91] hover:bg-blue-50"
              }`}
            >
              Masuk
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white"
            >
              Daftar
            </Link>
          </div>

          <button
            type="button"
            aria-label="Buka menu navigasi"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="og-mobile-hamburger md:hidden"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {open &&
        createPortal(
          <div
            className="og-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi OceanGuard"
          >
            <div className="og-mobile-menu-head">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3"
              >
                <img
                  src={logoBlue}
                  alt="OceanGuard"
                  className="h-11 w-11 object-contain"
                />

                <span className="text-xl font-bold text-[#0E1E4D]">
                  OceanGuard
                </span>
              </Link>

              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setOpen(false)}
                className="og-mobile-hamburger og-hamburger-blue"
              >
                <span />
                <span />
                <span />
              </button>
            </div>

            <div className="og-mobile-menu-content">
              <h1>Jelajahi OceanGuard</h1>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="og-mobile-menu-link"
              >
                Tutup Menu
              </button>

              {menuLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="og-mobile-menu-link"
                >
                  {item.label}
                </Link>
              ))}

              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="og-mobile-menu-link og-menu-primary"
              >
                Masuk
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="og-mobile-menu-link"
              >
                Daftar
              </Link>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
