
import { useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import logoBlue from "../../assets/oceanguard-logo.png";
import logoWhite from "../../assets/oceanguard-logo-w.png";

const SCROLL_DURATION = 850;

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export default function PublicNavbar({
  transparent = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const animationRef = useRef(null);

  const logo = transparent ? logoWhite : logoBlue;

  function cancelScroll() {
    if (animationRef.current !== null) {
      window.cancelAnimationFrame(
        animationRef.current
      );
      animationRef.current = null;
    }
  }

  function smoothScrollTo(sectionId) {
    const section = document.getElementById(sectionId);

    if (!section) return;

    cancelScroll();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const startY = window.scrollY;

    const targetY = Math.max(
      0,
      section.getBoundingClientRect().top +
        window.scrollY -
        12
    );

    if (reducedMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    const distance = targetY - startY;

    if (Math.abs(distance) < 2) return;

    let startTime = null;

    function animateScroll(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(
        elapsed / SCROLL_DURATION,
        1
      );

      const easedProgress =
        easeInOutCubic(progress);

      window.scrollTo(
        0,
        startY + distance * easedProgress
      );

      if (progress < 1) {
        animationRef.current =
          window.requestAnimationFrame(
            animateScroll
          );
      } else {
        animationRef.current = null;
      }
    }

    animationRef.current =
      window.requestAnimationFrame(
        animateScroll
      );
  }

  useEffect(() => {
    if (
      location.pathname !== "/" ||
      !location.hash
    ) {
      return;
    }

    const sectionId = decodeURIComponent(
      location.hash.slice(1)
    );

    const frame = window.requestAnimationFrame(
      () => {
        smoothScrollTo(sectionId);
      }
    );

    return () => {
      window.cancelAnimationFrame(frame);
      cancelScroll();
    };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    return () => {
      cancelScroll();
    };
  }, []);

  function handleSectionClick(event, sectionId) {
    event.preventDefault();

    const targetHash = `#${sectionId}`;

    if (location.pathname === "/") {
      if (location.hash === targetHash) {
        smoothScrollTo(sectionId);
      } else {
        navigate(`/${targetHash}`);
      }
    } else {
      navigate(`/${targetHash}`);
    }
  }

  return (
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
            alt="Logo OceanGuard"
            className="h-11 w-11 shrink-0 object-contain"
          />

          <span className="text-xl font-bold">
            OceanGuard
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link
            to="/public-map"
            className="transition-opacity duration-200 hover:opacity-75"
          >
            Peta
          </Link>

          <Link
            to="/#cara-kerja"
            onClick={(event) =>
              handleSectionClick(
                event,
                "cara-kerja"
              )
            }
            className="transition-opacity duration-200 hover:opacity-75"
          >
            Cara Kerja
          </Link>

          <Link
            to="/informasi"
            className="transition-opacity duration-200 hover:opacity-75"
          >
            Informasi
          </Link>

          <Link
            to="/#faq"
            onClick={(event) =>
              handleSectionClick(event, "faq")
            }
            className="transition-opacity duration-200 hover:opacity-75"
          >
            FAQ
          </Link>
        </nav>

        <div className="flex shrink-0 gap-2">
          <Link
            to="/login"
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
              transparent
                ? "border-white/70 text-white hover:bg-white/10"
                : "border-[#0B3D91] text-[#0B3D91] hover:bg-blue-50"
            }`}
          >
            Masuk
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#082D71]"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
