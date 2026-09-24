import React from 'react';

interface GrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'white' | 'dark';
  showTagline?: boolean;
}

export const GrandLogo: React.FC<GrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'gold',
  showTagline = true,
}) => {
  const primaryColor =
    variant === 'white'
      ? '#FFFFFF'
      : variant === 'dark'
      ? '#1E1B18'
      : '#C88E13'; // Official Grand Gold

  const secondaryColor =
    variant === 'white'
      ? '#F1F5F9'
      : variant === 'dark'
      ? '#334155'
      : '#DDA01D';

  const sizeClasses = {
    sm: 'h-9',
    md: 'h-14',
    lg: 'h-20',
    xl: 'h-28',
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 180"
        className={`${sizeClasses[size]} w-auto drop-shadow-sm`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grandGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DF9F1A" />
            <stop offset="50%" stopColor="#C88E13" />
            <stop offset="100%" stopColor="#A87309" />
          </linearGradient>
          <linearGradient id="grandCrownGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C88E13" />
            <stop offset="60%" stopColor="#E5AB2C" />
            <stop offset="100%" stopColor="#F9D46A" />
          </linearGradient>
        </defs>

        {/* --- CROWN --- */}
        <g transform="translate(18, 2)">
          {/* 5-pointed Royal Crown */}
          <path
            d="M20 38 C 22 28, 26 20, 28 14 L 32 17 L 38 7 L 44 19 L 52 1 L 60 19 L 66 7 L 72 17 L 76 14 C 78 20, 82 28, 84 38 C 70 34, 34 34, 20 38 Z"
            fill={variant === 'gold' ? 'url(#grandCrownGradient)' : primaryColor}
          />
          {/* Jewels/Diamonds on tips */}
          <polygon points="52,-2 55,2 52,6 49,2" fill={primaryColor} />
          <polygon points="38,4 40.5,7 38,10 35.5,7" fill={primaryColor} />
          <polygon points="66,4 68.5,7 66,10 63.5,7" fill={primaryColor} />
          <circle cx="28" cy="13" r="2.2" fill={primaryColor} />
          <circle cx="76" cy="13" r="2.2" fill={primaryColor} />
          {/* Crown Base Filigree */}
          <path
            d="M 23 37 Q 52 32 81 37 Q 52 35 23 37"
            stroke={secondaryColor}
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* --- MAJESTIC 'G' WITH INTERNAL GROWTH BARS --- */}
        <g transform="translate(14, 42)">
          {/* Grand G Outer Silhouette */}
          <path
            d="M 68 12 C 55 5, 36 6, 22 17 C 8 28, 0 46, 0 68 C 0 92, 10 110, 26 122 C 40 132, 60 134, 76 126 C 92 118, 102 102, 104 84 L 84 84 C 82 95, 75 106, 64 111 C 52 117, 36 114, 26 104 C 16 93, 11 78, 11 63 C 11 47, 18 33, 29 25 C 38 18, 51 17, 62 21 C 67 23, 72 26, 75 30 L 85 18 C 80 14, 74 12, 68 12 Z"
            fill={variant === 'gold' ? 'url(#grandGoldGradient)' : primaryColor}
          />
          {/* Horizontal crossbar extending inward */}
          <path
            d="M 60 76 L 105 76 L 105 92 L 60 92 Z"
            fill={variant === 'gold' ? 'url(#grandGoldGradient)' : primaryColor}
          />
          {/* 3 Growth / Communication Columns Inside G */}
          <rect
            x="36"
            y="72"
            width="10"
            height="36"
            rx="1.5"
            fill={variant === 'gold' ? 'url(#grandCrownGradient)' : primaryColor}
          />
          <rect
            x="50"
            y="52"
            width="10"
            height="56"
            rx="1.5"
            fill={variant === 'gold' ? 'url(#grandCrownGradient)' : primaryColor}
          />
          <rect
            x="64"
            y="36"
            width="10"
            height="72"
            rx="1.5"
            fill={variant === 'gold' ? 'url(#grandCrownGradient)' : primaryColor}
          />
        </g>

        {/* --- 'RAND' TYPOGRAPHY --- */}
        <g transform="translate(108, 52)">
          {/* R */}
          <text
            x="0"
            y="85"
            fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
            fontSize="92"
            fontWeight="800"
            letterSpacing="-2"
            fill={variant === 'gold' ? 'url(#grandGoldGradient)' : primaryColor}
          >
            R
          </text>
          {/* A */}
          <text
            x="62"
            y="85"
            fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
            fontSize="92"
            fontWeight="800"
            letterSpacing="-2"
            fill={variant === 'gold' ? 'url(#grandGoldGradient)' : primaryColor}
          >
            A
          </text>
          {/* N */}
          <text
            x="126"
            y="85"
            fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
            fontSize="92"
            fontWeight="800"
            letterSpacing="-2"
            fill={variant === 'gold' ? 'url(#grandGoldGradient)' : primaryColor}
          >
            N
          </text>
          {/* D */}
          <text
            x="188"
            y="85"
            fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
            fontSize="92"
            fontWeight="800"
            letterSpacing="-2"
            fill={variant === 'gold' ? 'url(#grandGoldGradient)' : primaryColor}
          >
            D
          </text>
        </g>

        {/* --- TAGLINE & ESTABLISHED 2004 --- */}
        {showTagline && (
          <>
            <text
              x="160"
              y="156"
              textAnchor="middle"
              fontFamily="'Dancing Script', 'Brush Script MT', cursive"
              fontSize="21"
              fontWeight="700"
              fill={primaryColor}
              letterSpacing="0.8"
            >
              we value what you have to say!
            </text>
            {/* Divider lines & EST. 2004 */}
            <line
              x1="18"
              y1="172"
              x2="110"
              y2="172"
              stroke={primaryColor}
              strokeWidth="0.8"
              opacity="0.6"
            />
            <text
              x="160"
              y="175"
              textAnchor="middle"
              fontFamily="'Cinzel', sans-serif"
              fontSize="12.5"
              fontWeight="700"
              letterSpacing="5"
              fill={primaryColor}
            >
              EST. 2004
            </text>
            <line
              x1="210"
              y1="172"
              x2="302"
              y2="172"
              stroke={primaryColor}
              strokeWidth="0.8"
              opacity="0.6"
            />
          </>
        )}
      </svg>
    </div>
  );
};
