
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext";
import HeaderActions from "./HeaderActions";
import LogoutConfirmModal from "./LogoutConfirmModal";

import "../styles/oceanguard-layout.css";

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

const USER_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: dashboardIcon },
  { to: "/reports/new", label: "Lapor Sampah", icon: laporSampahIcon },
  { to: "/my-reports", label: "Laporan Saya", icon: laporanSayaIcon },
  { to: "/map", label: "Explore Map", icon: exploreMapIcon },
  { to: "/challenges", label: "Challenges", icon: challengesIcon },
  {
    to: "/profile",
    label: "Profil",
    icon: profileIcon,
    relatedPaths: ["/profile/edit", "/profile/password"],
  },
];

const ADMIN_NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: dashboardIcon },
  {
    to: "/admin/manage-reports",
    label: "Kelola Laporan",
    icon: laporanSayaIcon,
  },
  { to: "/map", label: "Explore Map", icon: exploreMapIcon },
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

function SidebarIcon({ src, size = "h-6 w-6" }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`${size} shrink-0 object-contain`}
    />
  );
}

function SidebarNavItem({ item, active }) {
  return (
    <Link
      to={item.to}
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

function MobileNavigation({
  navItems,
  isActiveRoute,
  onLogout,
}) {
  return (
    <div className="lg:hidden">
      <nav
        aria-label="Navigasi utama mobile"
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {navItems.map((item) => {
          const active = isActiveRoute(item);

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                active
                  ? "bg-[#0B3D91] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#416ba6]">
                <SidebarIcon
                  src={item.icon}
                  size="h-4 w-4"
                />
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#416ba6]">
          <SidebarIcon
            src={logoutIcon}
            size="h-4 w-4"
          />
        </span>

        Keluar dari akun
      </button>
    </div>
  );
}

export default function ReporterLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin
    ? ADMIN_NAV_ITEMS
    : USER_NAV_ITEMS;

  const homePath = isAdmin
    ? "/admin/dashboard"
    : "/dashboard";

  function isActiveRoute(item) {
    const currentPath = location.pathname;

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

    return currentPath.startsWith(`${item.to}/`);
  }

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    setShowLogoutModal(false);
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="og-app-shell flex font-sans">
      <aside className="og-sidebar hidden w-64 shrink-0 flex-col px-5 py-8 lg:flex xl:w-72 xl:px-6">
        <div className="og-sidebar-inner">
          <Link
            to={homePath}
            className="mb-12 flex shrink-0 items-center gap-3"
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
            className="og-sidebar-nav flex flex-col gap-2"
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
          className="og-sidebar-logout shrink-0 text-sm font-medium"
        >
          <SidebarIcon src={logoutIcon} />
          <span>Keluar dari akun</span>
        </button>
      </aside>

      <main className="og-main-area min-w-0 flex-1 p-2 sm:p-4">
        <div className="og-main-panel relative px-5 pb-8 pt-12 md:px-8">
          <div className="absolute right-5 top-7 z-30 md:right-8">
            <HeaderActions />
          </div>

          <div className="mb-6 lg:hidden">
            <Link
              to={homePath}
              className="mb-4 flex items-center gap-2"
            >
              <img
                src={oceanGuardLogo}
                alt="OceanGuard"
                className="h-9 w-9 object-contain"
              />

              <span className="text-lg font-bold text-[#10254A]">
                OceanGuard
              </span>
            </Link>

            <MobileNavigation
              navItems={navItems}
              isActiveRoute={isActiveRoute}
              onLogout={openLogoutModal}
            />
          </div>

          <div className="min-w-0">
            {children}
          </div>
        </div>
      </main>

      {showLogoutModal && (
        <LogoutConfirmModal
          onCancel={closeLogoutModal}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
