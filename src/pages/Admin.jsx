import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../api/users";

const ROLES = ["USER", "ADMIN", "SUPER_ADMIN"];

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUserRole(userId, newRole);
      // Update state lokal supaya tabel langsung ke-update tanpa reload
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="auth-error">{error}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Admin — Kelola User</h1>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "8px" }}>Nama</th>
            <th style={{ padding: "8px" }}>Email</th>
            <th style={{ padding: "8px" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{u.name}</td>
              <td style={{ padding: "8px" }}>{u.email}</td>
              <td style={{ padding: "8px" }}>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}