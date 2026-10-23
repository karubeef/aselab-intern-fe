
import { Link } from "react-router-dom";
import backArrow from "../../assets/back-arrow.png";

export default function BackLink({
  to,
  label,
  className = "",
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`og-mobile-back ${className}`.trim()}
    >
      <img
        src={backArrow}
        alt=""
        aria-hidden="true"
        className="og-mobile-back-arrow"
        draggable={false}
      />

      <span>{label}</span>
    </Link>
  );
}
