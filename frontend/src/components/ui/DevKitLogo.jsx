export default function DevKitLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="innerGlow" cx="30%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="120" height="120" rx="28" ry="28" fill="url(#bgGrad)" />
      <rect x="0" y="0" width="120" height="120" rx="28" ry="28" fill="url(#innerGlow)" />
      <rect x="1" y="1" width="118" height="118" rx="27.5" ry="27.5" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5" />
      <path d="M42 36 L22 60 L42 84" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />
      <path d="M78 36 L98 60 L78 84" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />
      <line x1="66" y1="30" x2="54" y2="90" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  )
}