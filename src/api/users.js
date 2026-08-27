const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getMe() {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil data user");
  }

  return data.user;
}

export async function getAllUsers() {
  const res = await fetch(`${API_URL}/users`, {
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil daftar user");
  }

  return data.users;
}

export async function updateUserRole(id, role) {
  const res = await fetch(`${API_URL}/users/${id}/role`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengubah role");
  }

  return data.user;
}