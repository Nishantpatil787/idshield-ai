import React from 'react';

interface DocShieldLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const DocShieldLogo: React.FC<DocShieldLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-24 h-24', text: 'text-3xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Fidelity SVG Vector Emblem matching the DocShield badge */}
      <div className={`${dim.icon} relative flex-shrink-0 flex items-center justify-center transition-transform hover:scale-105`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Outer circle bevel gradient */}
            <linearGradient id="dsOuter" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* Shield rim gradient */}
            <linearGradient id="dsShieldRim" x1="100" y1="25" x2="100" y2="165" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Shield interior gradient */}
            <linearGradient id="dsShieldBody" x1="100" y1="40" x2="100" y2="155" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>

            {/* Lock body gradient */}
            <linearGradient id="dsLock" x1="75" y1="90" x2="125" y2="135" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Green Checkmark Gradient */}
            <linearGradient id="dsCheck" x1="105" y1="95" x2="135" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <filter id="dsShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" floodColor="#0284c7" />
            </filter>
          </defs>

          {/* Outer circular medallion */}
          <circle cx="100" cy="100" r="94" fill="url(#dsOuter)" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="100" cy="100" r="88" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Layered Outer Shield Border */}
          <path
            d="M100 30L158 54V98C158 134 132 158 100 170C68 158 42 134 42 98V54L100 30Z"
            fill="url(#dsShieldRim)"
            filter="url(#dsShadow)"
          />

          {/* Stepped Inner Shield */}
          <path
            d="M100 38L150 59V96C150 128 128 149 100 160C72 149 50 128 50 96V59L100 38Z"
            fill="url(#dsShieldBody)"
          />

          {/* Shield Facet Highlight (Left Half) */}
          <path
            d="M100 40L54 60V96C54 126 74 146 100 158V40Z"
            fill="#ffffff"
            fillOpacity="0.12"
          />

          {/* Document Background Sheets with folded corner */}
          <path
            d="M68 64H112L124 76V132H68V64Z"
            fill="#ffffff"
            stroke="#94a3b8"
            strokeWidth="1.5"
            rx="3"
          />
          <path
            d="M112 64V76H124"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Document Content Guidelines */}
          <line x1="76" y1="84" x2="104" y2="84" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="76" y1="92" x2="98" y2="92" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <line x1="76" y1="100" x2="92" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

          {/* Center Padlock */}
          {/* Shackle */}
          <path
            d="M86 88V78C86 70.3 92.3 64 100 64C107.7 64 114 70.3 114 78V88"
            stroke="#e2e8f0"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Lock Case */}
          <rect
            x="76"
            y="86"
            width="48"
            height="42"
            rx="7"
            fill="url(#dsLock)"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          {/* Keyhole */}
          <circle cx="100" cy="103" r="3.5" fill="#ffffff" />
          <path d="M98.5 105L97 115H103L101.5 105Z" fill="#ffffff" />

          {/* Overlaid Bright Emerald Green Checkmark */}
          <path
            d="M106 108L120 122L146 94"
            stroke="#ffffff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M106 108L120 122L146 94"
            stroke="url(#dsCheck)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Typography Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className={`font-black ${dim.text} tracking-tight text-slate-900 leading-none`}>
              DOC<span className="text-blue-600 ml-1">SHIELD</span>
            </span>
          </div>
          <span className={`font-bold ${dim.sub} text-slate-500 tracking-wider uppercase mt-0.5 leading-none`}>
            Secure Documents
          </span>
        </div>
      )}
    </div>
  );
};
