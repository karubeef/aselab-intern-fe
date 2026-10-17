
import { useAuth } from "../context/authContext";
import AdminMapPage from "./admin/AdminMapPage";
import UserMapPage from "./UserMapPage";

export default function MapPage() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <AdminMapPage />;
  }

  if (user?.role === "USER") {
    return <UserMapPage />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">
        Memuat halaman Explore Map...
      </p>
    </div>
  );
}
