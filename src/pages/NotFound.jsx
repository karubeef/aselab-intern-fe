import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <h1 style={{ fontSize: "72px", margin: 0, color: "#1273c2" }}>404</h1>
      <h2 style={{ margin: "8px 0" }}>Oops! Page not found.</h2>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        We couldn't find the page you were looking for.
      </p>
      <Link
        to="/"
        style={{
          background: "#1273c2",
          color: "white",
          padding: "10px 20px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to homepage.
      </Link>
    </div>
  );
}