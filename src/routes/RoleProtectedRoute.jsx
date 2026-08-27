import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userData);

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}