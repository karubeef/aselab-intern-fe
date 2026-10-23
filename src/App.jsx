
import { useEffect, useSyncExternalStore } from "react";
import { Navigate, useLocation } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";

import MobileInformationPage from "./pages/mobile/MobileInformationPage";
import MobileArticleDetailPage from "./pages/mobile/MobileArticleDetailPage";
import MobilePublicMapPage from "./pages/mobile/MobilePublicMapPage";
import MobileGuidePage from "./pages/mobile/MobileGuidePage";

import "./styles/mobile-public.css";
import "./styles/og-scroll-fix.css";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(callback) {
  const media = window.matchMedia(MOBILE_QUERY);

  media.addEventListener("change", callback);

  return () => {
    media.removeEventListener("change", callback);
  };
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

export default function App() {
  const location = useLocation();

  const mobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    () => false
  );

  const path = location.pathname;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [path]);

  let screen = <AppRoutes />;

  if (
    !mobile &&
    (path === "/cara-kerja" || path === "/faq")
  ) {
    screen = (
      <Navigate
        to={
          path === "/faq"
            ? "/#faq"
            : "/#cara-kerja"
        }
        replace
      />
    );
  }

  if (mobile) {
    if (
      path === "/public-map" ||
      path === "/public-map/filter" ||
      path.startsWith("/public-map/area/")
    ) {
      screen = <MobilePublicMapPage />;
    } else if (path === "/informasi") {
      screen = <MobileInformationPage />;
    } else if (
      /^\/informasi\/[^/]+$/.test(path)
    ) {
      screen = <MobileArticleDetailPage />;
    } else if (
      path === "/cara-kerja" ||
      path === "/faq"
    ) {
      screen = (
        <MobileGuidePage
          kind={
            path === "/faq" ? "faq" : "steps"
          }
        />
      );
    }
  }

  return (
    <div
      className={`og-app-root ${
        mobile ? "og-mobile-public-root" : ""
      } ${
        mobile && path === "/"
          ? "og-landing-route"
          : ""
      }`}
    >
      {screen}
    </div>
  );
}
