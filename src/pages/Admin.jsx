import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../api/users";
import ReporterLayout from "../components/ReporterLayout";

const ROLES = ["USER", "ADMIN"];

const ROLE_COLORS = {
  USER: "bg-slate-100 text-slate-600",
  ADMIN: "bg-sky-50 text-[#1179C4]",
};

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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
      setUpdatingId(userId);
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <ReporterLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola User</h1>
        <p className="text-slate-400 text-sm">
          Atur role setiap pengguna terdaftar
        </p>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-slate-500 p-6">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-slate-400 text-sm p-6">Belum ada user terdaftar.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}
                      >
                        {u.role}
                      </span>
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none disabled:opacity-50"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {updatingId === u.id && (
                        <span className="text-slate-400 text-xs">Menyimpan...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ReporterLayout>
  );
}