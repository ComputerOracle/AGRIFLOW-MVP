interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'white';
  showSubtitle?: boolean;
  className?: string;
}

export function AgriFlowLogo({
  size = 'md',
  variant = 'full',
  showSubtitle = false,
  className = '',
}: LogoProps) {
  // Dimensions
  const markDimensions = {
    sm: 28,
    md: 34,
    lg: 44,
    xl: 56,
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Brandmark */}
      <svg
        width={markDimensions}
        height={markDimensions}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="agri-flow-grad1" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="60%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
          <linearGradient id="agri-flow-grad2" x1="42" y1="12" x2="10" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="leaf-highlight" x1="14" y1="8" x2="34" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="subtle-shadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#14532d" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Outer Hexagon / Rounded Shield Container for trust & solidity */}
        <rect width="48" height="48" rx="12" fill={isWhite ? '#ffffff' : '#14532d'} />

        <g filter="url(#subtle-shadow)">
          {/* Left Sprout / Inward Flow Loop */}
          <path
            d="M 12 28 C 12 17 21 11 32 10 C 33.5 14.5 32 20 27 24 C 22 28 17 28.5 12 28 Z"
            fill="url(#agri-flow-grad2)"
          />

          {/* Right Leaf / Escrow Return Arc */}
          <path
            d="M 36 20 C 36 31 27 37 16 38 C 14.5 33.5 16 28 21 24 C 26 20 31 19.5 36 20 Z"
            fill="url(#agri-flow-grad1)"
          />

          {/* Central Connecting Flow Core (Fluid Seed) */}
          <circle cx="24" cy="24" r="3.5" fill="#ffffff" />
          <circle cx="24" cy="24" r="2" fill="#15803d" />

          {/* Dynamic Light Sheen Stroke */}
          <path
            d="M 16 16 C 22 13 28 14 32 17"
            stroke="url(#leaf-highlight)"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Typography Wordmark */}
      {variant !== 'mark' && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight font-extrabold leading-none">
            <span className={`${textSizes} ${isWhite ? 'text-white' : 'text-gray-900'} font-bold`}>
              Agri
            </span>
            <span className={`${textSizes} text-agri-600 font-extrabold`}>
              Flow
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-agri-500 ml-0.5 inline-block animate-pulse" />
          </div>
          {showSubtitle && (
            <span className={`${subtitleSizes} font-medium tracking-wide uppercase ${isWhite ? 'text-green-100' : 'text-gray-500'} mt-0.5`}>
              Agricultural Trade Infrastructure
            </span>
          )}
        </div>
      )}
    </div>
  );
}
