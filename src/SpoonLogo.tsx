import React from 'react';

const SpoonLogo = ({ height = 32 }: { height?: number }) => {
  // Aspect ratio of the logo is roughly 4:1
  const width = height * 3.6;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 252 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="cherryL" cx="38%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#b91c1c" />
        </radialGradient>
        <radialGradient id="cherryR" cx="38%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#b91c1c" />
        </radialGradient>
      </defs>

      {/* S */}
      <text
        x="2"
        y="55"
        fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="56"
        fill="#e9a83a"
        letterSpacing="-1"
      >
        S
      </text>

      {/* p */}
      <text
        x="37"
        y="55"
        fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="56"
        fill="#e9a83a"
        letterSpacing="-1"
      >
        p
      </text>

      {/* Stem - curved brown line from cherries going up-right */}
      <path
        d="M100 26 C104 14, 114 5, 134 2"
        stroke="#6b5a1e"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Left cherry */}
      <circle cx="90" cy="40" r="16" fill="url(#cherryL)" />
      {/* Left cherry highlight */}
      <circle cx="84" cy="33" r="3.5" fill="white" opacity="0.65" />

      {/* Right cherry */}
      <circle cx="122" cy="38" r="16" fill="url(#cherryR)" />
      {/* Right cherry highlight */}
      <circle cx="116" cy="31" r="3.5" fill="white" opacity="0.65" />

      {/* n */}
      <text
        x="140"
        y="55"
        fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="56"
        fill="#e9a83a"
        letterSpacing="-1"
      >
        n
      </text>
    </svg>
  );
};

export default SpoonLogo;
