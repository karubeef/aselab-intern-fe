import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!token) return;

    getMe()
      .then((me) => {
        const synced = {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          profilePicture: me.profilePicture,
        };
        localStorage.setItem("user", JSON.stringify(synced));
        setUser(synced);
      })
      .catch(() => {});
  }, [token]);

  function login(newToken, newUser) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  function updateUser(partial) {
    const merged = { ...user, ...partial };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  }

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return context;
}