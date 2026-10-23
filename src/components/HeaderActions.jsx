
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import NotificationBell from "./NotificationBell";

function formatShortName(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}

export default function HeaderActions() {
  const { user } = useAuth();

  return (
    <div className="og-header-actions flex items-center justify-end gap-3">
      <NotificationBell />

      <Link
        to="/profile"
        className="og-profile-chip flex shrink-0 items-center gap-2 bg-[#15316E] text-white rounded-full pl-1.5 pr-4 py-1.5 hover:bg-[#1d4085] transition-colors"
      >
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Foto profil"
            className="og-profile-avatar w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <span className="og-profile-avatar w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </span>
        )}

        <span className="og-profile-name text-sm font-medium whitespace-nowrap">
          {formatShortName(user?.name) || "Pengguna"}
        </span>
      </Link>
    </div>
  );
}
