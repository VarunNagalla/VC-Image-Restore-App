import { CompareSlider } from "@/components/workspace/compare-slider";

function DamagedPhotoSvg() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0" />
        </filter>
        <linearGradient id="sepia" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9c8468" />
          <stop offset="100%" stopColor="#5b4a36" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sepia)" />
      <circle cx="200" cy="120" r="55" fill="#3a2f22" opacity="0.55" />
      <rect x="120" y="170" width="160" height="110" rx="30" fill="#3a2f22" opacity="0.5" />
      <rect width="400" height="300" filter="url(#grain)" opacity="0.5" />
      <line x1="40" y1="20" x2="60" y2="280" stroke="#1f1810" strokeWidth="2" opacity="0.6" />
      <line x1="300" y1="10" x2="330" y2="290" stroke="#1f1810" strokeWidth="3" opacity="0.5" />
      <circle cx="90" cy="60" r="4" fill="#1f1810" opacity="0.6" />
      <circle cx="310" cy="200" r="3" fill="#1f1810" opacity="0.6" />
      <circle cx="250" cy="80" r="2.5" fill="#1f1810" opacity="0.5" />
      <rect width="400" height="300" fill="black" opacity="0.18" />
    </svg>
  );
}

function RestoredPhotoSvg() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="clean" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dfe7ff" />
          <stop offset="100%" stopColor="#aebdf2" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#clean)" />
      <circle cx="200" cy="120" r="55" fill="#5b6bb8" />
      <rect x="120" y="170" width="160" height="110" rx="30" fill="#5b6bb8" />
      <circle cx="200" cy="120" r="55" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="2" />
    </svg>
  );
}

export function BeforeAfterDemo() {
  return (
    <CompareSlider
      before={<DamagedPhotoSvg />}
      after={<RestoredPhotoSvg />}
      beforeLabel="Damaged"
      afterLabel="Restored"
    />
  );
}
