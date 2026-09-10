import React from 'react';

interface ArcticFoxEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ArcticFoxEmblem: React.FC<ArcticFoxEmblemProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${dimensions} flex items-center justify-center`}>
        {/* Ambient glow behind crest */}
        <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse" />

        {/* Outer Circular Ring with Cherry Blossom / Oriental Trims */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(244,114,182,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circular frame */}
          <circle cx="100" cy="100" r="92" stroke="#f472b6" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.8" />
          <circle cx="100" cy="100" r="86" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
          
          {/* Inner dark crest fill */}
          <circle cx="100" cy="100" r="82" fill="#0c0c11" stroke="#26262e" strokeWidth="2" />
          
          {/* Cherry blossom branch silhouette in background */}
          <path
            d="M50 140 Q80 120 100 130 T150 105"
            stroke="#ffb7c5"
            strokeWidth="2"
            opacity="0.3"
            strokeLinecap="round"
          />
          {/* Little blossom dots */}
          <circle cx="75" cy="122" r="3.5" fill="#f472b6" opacity="0.6" />
          <circle cx="110" cy="128" r="4" fill="#fb7185" opacity="0.7" />
          <circle cx="138" cy="112" r="3" fill="#ffb7c5" opacity="0.6" />
          
          {/* Arctic Fox Face (Geometric stylized origami / anime kitsune style) */}
          <g transform="translate(0, 5)">
            {/* Left Ear */}
            <polygon
              points="64,52 82,92 50,88"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Left Inner Ear Pink Accent */}
            <polygon
              points="66,60 78,86 58,84"
              fill="#f472b6"
              opacity="0.85"
            />

            {/* Right Ear */}
            <polygon
              points="136,52 118,92 150,88"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            {/* Right Inner Ear Pink Accent */}
            <polygon
              points="134,60 122,86 142,84"
              fill="#f472b6"
              opacity="0.85"
            />

            {/* Fox Head Base */}
            <polygon
              points="52,88 148,88 100,146"
              fill="#ffffff"
            />

            {/* Fox Cheek Fluffs / Side Tufts */}
            <polygon
              points="40,94 62,88 64,106"
              fill="#f8fafc"
            />
            <polygon
              points="160,94 138,88 136,106"
              fill="#f8fafc"
            />

            {/* Forehead Diamond Accent - Sakura Pink */}
            <polygon
              points="100,80 108,92 100,104 92,92"
              fill="#ec4899"
            />

            {/* Kitsune mystical eye marks (Japanese/Korean cherry paint) */}
            <path
              d="M72 100 Q80 104 88 98 Q80 108 72 100 Z"
              fill="#ec4899"
            />
            <path
              d="M128 100 Q120 104 112 98 Q120 108 128 100 Z"
              fill="#ec4899"
            />

            {/* Fox Eyes - Keen, mystical obsidian & dark pink */}
            <ellipse cx="80" cy="101" rx="4.5" ry="2.5" fill="#09090b" transform="rotate(-12 80 101)" />
            <ellipse cx="120" cy="101" rx="4.5" ry="2.5" fill="#09090b" transform="rotate(12 120 101)" />
            <circle cx="81" cy="100" r="1.2" fill="#ffffff" />
            <circle cx="119" cy="100" r="1.2" fill="#ffffff" />

            {/* Fox Nose */}
            <polygon
              points="97,136 103,136 100,140"
              fill="#09090b"
            />

            {/* Subtle whiskers / face accents */}
            <line x1="56" y1="116" x2="42" y2="114" stroke="#ffb7c5" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="57" y1="122" x2="44" y2="124" stroke="#ffb7c5" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="144" y1="116" x2="158" y2="114" stroke="#ffb7c5" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="143" y1="122" x2="156" y2="124" stroke="#ffb7c5" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Torii / Taegeuk small aesthetic crest marker */}
          <rect x="94" y="24" width="12" height="4" fill="#ec4899" rx="1" />
          <rect x="96" y="28" width="8" height="8" fill="#ffffff" rx="1" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <div className="mt-2 text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-pink-400">
            Raposa do Ártico
          </span>
        </div>
      )}
    </div>
  );
};
