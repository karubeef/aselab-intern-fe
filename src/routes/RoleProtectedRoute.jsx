
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === "ADMIN"
            ? "/admin/dashboard"
            : "/dashboard"
        }
        replace
      />
    );
  }

  return children;
}
