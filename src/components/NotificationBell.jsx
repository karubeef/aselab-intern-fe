
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notifications";
import notificationBellIcon from "../assets/notificationbell.png";

const TYPE_ICONS = {
  REPORT_STATUS_CHANGED: "✅",
  REPORT_REJECTED: "❌",
  CHALLENGE_COMPLETED: "🏆",
  XP_EARNED: "⭐",
  BADGE_EARNED: "🎖️",
  NEW_REPORT_ADMIN: "🆕",
};

function formatRelativeTime(dateString) {
  const diffSeconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (diffSeconds < 60) return "Baru saja";

  if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)} mnt lalu`;
  }

  if (diffSeconds < 86400) {
    return `${Math.floor(diffSeconds / 3600)} jam lalu`;
  }

  if (diffSeconds < 604800) {
    return `${Math.floor(diffSeconds / 86400)} hari lalu`;
  }

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNotificationLink(notification, role) {
  if (notification.type === "NEW_REPORT_ADMIN") {
    const match = notification.message.match(/ID (\d+)/);

    return match
      ? `/admin/manage-reports/${match[1]}`
      : "/admin/manage-reports";
  }

  if (notification.type === "CHALLENGE_COMPLETED") {
    return "/challenges";
  }

  if (
    notification.type === "BADGE_EARNED" ||
    notification.type === "XP_EARNED"
  ) {
    return "/profile";
  }

  return role === "ADMIN"
    ? "/admin/manage-reports"
    : "/my-reports";
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchNotifications() {
    try {
      const data = await getNotifications();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Data sebelumnya tetap digunakan jika permintaan gagal.
    }
  }

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  async function handleToggle() {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  }

  async function handleItemClick(notification) {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await markNotificationRead(notification.id);
      } catch {
        fetchNotifications();
      }
    }

    setOpen(false);
    navigate(getNotificationLink(notification, user?.role));
  }

  async function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true }))
    );

    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      fetchNotifications();
    }
  }

  return (
    <div
      ref={containerRef}
      className="og-notification-root relative shrink-0"
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifikasi"
        aria-expanded={open}
        className="og-notification-trigger relative flex h-11 w-11 items-center justify-center rounded-full bg-[#15316E] hover:bg-[#1d4085] transition-colors"
      >
        <img
          src={notificationBellIcon}
          alt=""
          className="og-notification-icon h-7 w-7 object-contain"
        />

        {unreadCount > 0 && (
          <span className="og-notification-count absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="og-notification-popover absolute right-0 top-full mt-2 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-slate-800">
              Notifikasi Terkini
            </h3>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-[#1179C4] text-xs font-medium disabled:text-slate-300"
            >
              Tandai semua dibaca
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="text-slate-400 text-sm p-4">
                Memuat...
              </p>
            ) : notifications.length === 0 ? (
              <p className="text-slate-400 text-sm p-6 text-center">
                Belum ada notifikasi.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => handleItemClick(notification)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${
                    notification.isRead ? "" : "bg-sky-50/60"
                  }`}
                >
                  <span className="text-lg shrink-0">
                    {TYPE_ICONS[notification.type] || "🔔"}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate ${
                          notification.isRead
                            ? "text-slate-600"
                            : "font-semibold text-slate-900"
                        }`}
                      >
                        {notification.title}
                      </p>

                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#1179C4] shrink-0" />
                      )}
                    </div>

                    <p className="text-slate-500 text-xs mt-0.5 break-words">
                      {notification.message}
                    </p>

                    <p className="text-slate-400 text-[11px] mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
