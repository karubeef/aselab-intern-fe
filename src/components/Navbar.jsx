import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={{ display: "flex", gap: "16px", padding: "12px", alignItems: "center" }}>
      <Link to="/">Landing</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>

      {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
      {isAuthenticated && <Link to="/profile">Profile</Link>}
      {isAuthenticated && user?.role === "SUPER_ADMIN" && (
        <Link to="/admin">Admin</Link>
      )}

      {isAuthenticated && (
        <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
          Logout
        </button>
      )}
    </nav>
  );
}