export function Logo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ display: "block" }}>
      <rect x="2" y="2" width="40" height="40" rx="10" fill="var(--warn)" stroke="var(--ink)" strokeWidth="2" />
      <path
        d="M8 24 L14 24 L17 16 L23 32 L26 22 L30 22 L32 26 L36 26"
        stroke="var(--ink)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="36" cy="26" r="2" fill="var(--danger-2)" />
    </svg>
  );
}
