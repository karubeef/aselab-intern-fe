
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/authContext";
import HeaderActions from "./HeaderActions";
import LogoutConfirmModal from "./LogoutConfirmModal";

import oceanGuardLogo from "../assets/oceanguard-logo.png";

import dashboardIcon from "../assets/icons/icon-dashboard.png";
import laporSampahIcon from "../assets/icons/icon-lapor-sampah.png";
import laporanSayaIcon from "../assets/icons/icon-laporan-saya.png";
import exploreMapIcon from "../assets/icons/icon-explore-map.png";
import challengesIcon from "../assets/icons/icon-challenges.png";
import profileIcon from "../assets/icons/icon-profile.png";
import logoutIcon from "../assets/icons/icon-logout.png";

import adminChallengeIcon from "../assets/icons/admin/icon-admin-challenge.png";
import adminArticleIcon from "../assets/icons/admin/icon-admin-article.png";

import "../styles/oceanguard-layout.css";
import "../styles/og-all-mobile.css";

const USER_NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: dashboardIcon,
  },
  {
    to: "/reports/new",
    label: "Lapor Sampah",
    icon: laporSampahIcon,
  },
  {
    to: "/my-reports",
    label: "Laporan Saya",
    icon: laporanSayaIcon,
  },
  {
    to: "/map",
    label: "Explore Map",
    icon: exploreMapIcon,
  },
  {
    to: "/challenges",
    label: "Challenges",
    icon: challengesIcon,
  },
  {
    to: "/profile",
    label: "Profil",
    icon: profileIcon,
    relatedPaths: [
      "/profile/edit",
      "/profile/password",
    ],
  },
];

const ADMIN_NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: dashboardIcon,
  },
  {
    to: "/admin/manage-reports",
    label: "Kelola Laporan",
    icon: laporanSayaIcon,
  },
  {
    to: "/map",
    label: "Explore Map",
    icon: exploreMapIcon,
  },
  {
    to: "/admin/challenges",
    label: "Kelola Challenge",
    icon: adminChallengeIcon,
  },
  {
    to: "/admin/articles",
    label: "Kelola Artikel",
    icon: adminArticleIcon,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: profileIcon,
    relatedPaths: [
      "/admin/profile/edit",
      "/admin/profile/password",
    ],
  },
];

function SidebarIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="h-6 w-6 shrink-0 object-contain"
    />
  );
}

function SidebarNavItem({
  item,
  active,
  onSelect,
}) {
  return (
    <Link
      to={item.to}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={`og-sidebar-item ${
        active ? "og-sidebar-item-active" : ""
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <SidebarIcon src={item.icon} />
      </span>

      <span className="truncate text-[15px]">
        {item.label}
      </span>
    </Link>
  );
}

export default function ReporterLayout({
  children,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const menuButtonRef = useRef(null);

  const isAdmin = user?.role === "ADMIN";

  const navItems = isAdmin
    ? ADMIN_NAV_ITEMS
    : USER_NAV_ITEMS;

  const home = isAdmin
    ? "/admin/dashboard"
    : "/dashboard";

  const currentPath = location.pathname;

  function isActiveRoute(item) {
    if (currentPath === item.to) {
      return true;
    }

    if (
      item.relatedPaths?.some(
        (path) =>
          currentPath === path ||
          currentPath.startsWith(`${path}/`)
      )
    ) {
      return true;
    }

    return currentPath.startsWith(
      `${item.to}/`
    );
  }

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      menuButtonRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  function openLogoutModal() {
    setMobileMenuOpen(false);
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    setShowLogoutModal(false);
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div
      className="og-app-shell flex min-h-screen font-sans"
      data-og-route={currentPath}
    >
      <aside
        className="og-sidebar og-desktop-sidebar hidden w-64 shrink-0 flex-col justify-between px-5 py-8 lg:flex xl:w-72 xl:px-6"
        aria-label="Sidebar navigasi"
      >
        <div>
          <Link
            to={home}
            className="mb-12 flex items-center gap-3"
          >
            <img
              src={oceanGuardLogo}
              alt="OceanGuard"
              className="h-12 w-12 shrink-0 object-contain"
            />

            <div className="min-w-0">
              <h1 className="text-[22px] font-bold leading-tight tracking-tight text-[#10254A]">
                OceanGuard
              </h1>

              <p className="mt-1 text-[13px] leading-tight text-white">
                Protect Our Ocean
              </p>
            </div>
          </Link>

          <nav
            aria-label={
              isAdmin
                ? "Navigasi Admin"
                : "Navigasi User"
            }
            className="flex flex-col gap-2"
          >
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.to}
                item={item}
                active={isActiveRoute(item)}
              />
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={openLogoutModal}
          className="og-sidebar-logout text-sm font-medium"
        >
          <SidebarIcon src={logoutIcon} />

          <span>Keluar dari akun</span>
        </button>
      </aside>

      <main className="og-shell-main min-w-0 flex-1 p-2 sm:p-4">
        <div className="og-main-panel relative px-5 pb-8 pt-12 md:px-8">
          <div className="og-desktop-header-actions absolute right-5 top-7 z-30 hidden lg:block md:right-8">
            <HeaderActions />
          </div>

          <header className="og-mobile-topbar">
            <Link
              to={home}
              className="og-mobile-brand"
              aria-label="Ke Dashboard"
            >
              <img
                src={oceanGuardLogo}
                alt=""
                className="h-9 w-9 shrink-0 object-contain"
              />

              <span>OceanGuard</span>
            </Link>

            <div className="og-mobile-topbar-right">
              <div className="og-mobile-header-actions">
                <HeaderActions />
              </div>

              <button
                ref={menuButtonRef}
                type="button"
                className="og-dashboard-menu-button"
                aria-label="Buka menu navigasi"
                aria-haspopup="dialog"
                aria-expanded={mobileMenuOpen}
                onClick={() => {
                  setMobileMenuOpen(true);
                }}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </header>

          <div className="og-page-content min-w-0">
            {children}
          </div>
        </div>
      </main>

      {mobileMenuOpen && (
        <div
          className="og-dashboard-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi akun"
        >
          <button
            type="button"
            className="og-dashboard-backdrop"
            aria-label="Tutup menu"
            onClick={() => {
              setMobileMenuOpen(false);
            }}
          />

          <div className="og-dashboard-drawer-panel og-sidebar">
            <div className="og-dashboard-drawer-heading">
              <Link
                to={home}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className="flex min-w-0 items-center gap-3"
              >
                <img
                  src={oceanGuardLogo}
                  alt="OceanGuard"
                  className="h-10 w-10 shrink-0 object-contain"
                />

                <div className="min-w-0">
                  <strong className="text-lg text-[#10254A]">
                    OceanGuard
                  </strong>

                  <p className="text-xs text-white">
                    Protect Our Ocean
                  </p>
                </div>
              </Link>

              <button
                type="button"
                aria-label="Tutup menu"
                className="og-dashboard-close"
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
              >
                ×
              </button>
            </div>

            <nav
              aria-label={
                isAdmin
                  ? "Menu Admin Mobile"
                  : "Menu User Mobile"
              }
              className="og-dashboard-drawer-links"
            >
              {navItems.map((item) => (
                <SidebarNavItem
                  key={item.to}
                  item={item}
                  active={isActiveRoute(item)}
                  onSelect={() => {
                    setMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>

            <button
              type="button"
              onClick={openLogoutModal}
              className="og-sidebar-logout og-dashboard-drawer-logout text-sm font-medium"
            >
              <SidebarIcon src={logoutIcon} />

              <span>Keluar dari akun</span>
            </button>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <LogoutConfirmModal
          onCancel={closeLogoutModal}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
