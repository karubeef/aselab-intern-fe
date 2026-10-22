
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./styles/page-transitions.css";

export default function App() {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="og-page-transition"
    >
      <AppRoutes />
    </div>
  );
}
