import { useState, useEffect } from "react";
import { getMe } from "../api/users";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getMe();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="auth-error">{error}</p>;

  return (
    <div style={{ padding: "24px", maxWidth: "480px" }}>
      <h1>My Profile</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
        <div>
          <strong>Name</strong>
          <p>{user.name}</p>
        </div>

        <div>
          <strong>Email</strong>
          <p>{user.email}</p>
        </div>

        <div>
          <strong>Role</strong>
          <p>{user.role}</p>
        </div>

        <div>
          <strong>Joined</strong>
          <p>{new Date(user.createdAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
        </div>
      </div>
    </div>
  );
}