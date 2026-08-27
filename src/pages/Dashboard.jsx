export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Selamat datang, {user?.name}!</p>
    </div>
  );
}