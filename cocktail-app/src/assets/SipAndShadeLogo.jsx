import React from 'react';

export default function SipAndShadeLogo({ className }) {
  return (
    <svg
      className={className}
      width="200"
      height="120"
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sip and Shade logo"
    >
      <title>Sip and Shade logo</title>
      <defs>
        <linearGradient id="gradGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF69B4" />
          <stop offset="50%" stopColor="#00CED1" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
        </filter>
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
            .citrus {
              animation: pulse 2.5s ease-in-out infinite;
              transform-origin: center;
            }
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(5px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .text {
              animation: fadeIn 1s ease-in-out forwards;
              opacity: 0;
            }
            .highlight {
              fill: rgba(255,255,255,0.3);
              filter: url(#shadow);
            }
          `}
        </style>
      </defs>

      {/* Glas en citrus in een groep bovenaan */}
      <g>
        {/* Glas vorm */}
        <path
          d="M50 15 L150 15 L110 60 L90 60 Z"
          fill="url(#gradGlass)"
          stroke="#1C1C1C"
          strokeWidth="2"
          filter="url(#shadow)"
          rx="10"
          ry="10"
        />
        {/* Glans op het glas */}
        <path
          d="M60 20 Q75 10 90 20 Q85 25 70 30 Q60 25 60 20 Z"
          className="highlight"
        />
        {/* Steel */}
        <line x1="100" y1="60" x2="100" y2="80" stroke="#1C1C1C" strokeWidth="3" />
        {/* Voet */}
        <ellipse cx="100" cy="85" rx="25" ry="7" fill="#1C1C1C" filter="url(#shadow)" />
        {/* Citrus */}
        <g className="citrus">
          <circle cx="140" cy="20" r="10" fill="#FFD700" stroke="#228B22" strokeWidth="2" />
          <line x1="140" y1="10" x2="140" y2="30" stroke="#228B22" strokeWidth="1" />
          <line x1="130" y1="17" x2="150" y2="23" stroke="#228B22" strokeWidth="1" />
          <line x1="130" y1="23" x2="150" y2="17" stroke="#228B22" strokeWidth="1" />
        </g>
      </g>

      {/* Tekst onder het glas */}
      <text
        x="100"
        y="115"
        fontFamily="Poppins, Arial, sans-serif"
        fontWeight="700"
        fontSize="24"
        fill="#1C1C1C"
        textAnchor="middle"
        className="text"
        filter="url(#shadow)"
      >
        Sip &amp; Shade
      </text>
    </svg>
  );
}
