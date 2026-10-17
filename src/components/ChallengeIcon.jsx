export default function ChallengeIcon({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="#0B3D91"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="38" cy="26" r="20" />
      <circle cx="38" cy="26" r="13" />
      <circle cx="38" cy="26" r="6" />
      <path d="M38 26 L56 8" />
      <path d="M50 6 L58 6 L58 14" />
      <path
        d="M18 34 L22 46 L34 46 L24 54 L28 64 L18 57 L8 64 L12 54 L2 46 L14 46 Z"
        fill="#0B3D91"
        stroke="none"
        transform="translate(2 -8)"
      />
    </svg>
  );
}