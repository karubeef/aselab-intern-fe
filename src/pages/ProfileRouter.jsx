
import { useAuth } from "../context/authContext";

import Profile from "./Profile";
import AdminProfile from "./admin/AdminProfile";

export default function ProfileRouter() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <AdminProfile />;
  }

  return <Profile />;
}
