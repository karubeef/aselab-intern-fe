import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    const userData = localStorage.getItem("user");
    setRole(userData ? JSON.parse(userData).role : null);
  }, [location]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setRole(null);
    navigate("/login");
  }

  return (
    <nav style={{ display: "flex", gap: "16px", padding: "12px", alignItems: "center" }}>
      <Link to="/">Landing</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>

      {token && <Link to="/dashboard">Dashboard</Link>}
      {token && role === "SUPER_ADMIN" && <Link to="/admin">Admin</Link>}

      {token && (
        <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
          Logout
        </button>
      )}

          {token && <Link to="/dashboard">Dashboard</Link>}
          {token && <Link to="/profile">Profile</Link>}
          {token && role === "SUPER_ADMIN" && <Link to="/admin">Admin</Link>}
    </nav>
  );
}