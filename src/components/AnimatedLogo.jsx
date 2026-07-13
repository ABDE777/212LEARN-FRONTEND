import React from "react";
import "./AnimatedLogo.css";

/**
 * Animated 212 LEARN logo.
 * Usage:
 *   <AnimatedLogo />                 // plays once on mount
 *   <AnimatedLogo replayKey={x} />   // pass a changing value (e.g. a counter) to replay it
 *   <AnimatedLogo size={320} />      // control rendered size (default 100% of parent)
 */
export default function AnimatedLogo({ size, replayKey, className = "" }) {
  return (
    <div
      className={`logo212-stage ${className}`}
      style={size ? { width: size, height: size } : undefined}
      key={replayKey /* changing this prop remounts + replays the animation */}
    >
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="logo212-glowGrad" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor="#e08f5f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e08f5f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="logo212-shimmerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffd9b0" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffe6c9" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffd9b0" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse
          id="logo212-glow"
          cx="250"
          cy="270"
          rx="190"
          ry="170"
          fill="url(#logo212-glowGrad)"
        />

        <path
          id="logo212-ribbon-main"
          d="M 155 355
             C 90 330, 90 260, 175 235
             C 260 210, 340 235, 340 195
             C 340 160, 300 150, 265 158
             M 265 158
             C 220 168, 210 210, 260 235
             C 330 268, 400 260, 385 300
             C 372 335, 300 330, 250 320
             C 190 308, 130 335, 175 360"
          fill="none"
          stroke="var(--logo212-clay)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          id="logo212-ribbon-shimmer"
          d="M 155 355
             C 90 330, 90 260, 175 235
             C 260 210, 340 235, 340 195
             C 340 160, 300 150, 265 158
             M 265 158
             C 220 168, 210 210, 260 235
             C 330 268, 400 260, 385 300
             C 372 335, 300 330, 250 320
             C 190 308, 130 335, 175 360"
          fill="none"
          stroke="url(#logo212-shimmerGrad)"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <g id="logo212-cap-group">
          <polygon points="205,70 300,95 205,120 110,95" fill="var(--logo212-clay)" />
          <polygon points="205,120 205,132 165,110 165,98" fill="var(--logo212-clay-light)" />
          <rect x="200" y="70" width="10" height="10" fill="var(--logo212-clay)" />
          <g id="logo212-tassel">
            <line
              x1="165"
              y1="104"
              x2="150"
              y2="150"
              stroke="var(--logo212-ink)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="150" cy="153" r="5" fill="var(--logo212-ink)" />
          </g>
        </g>

        <text
          id="logo212-num-2a"
          className="logo212-num"
          x="245"
          y="200"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="120"
          fill="var(--logo212-ink)"
          textAnchor="middle"
        >
          2
        </text>
        <text
          id="logo212-num-1"
          className="logo212-num"
          x="245"
          y="280"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="120"
          fill="var(--logo212-ink)"
          textAnchor="middle"
        >
          1
        </text>
        <text
          id="logo212-num-2b"
          className="logo212-num"
          x="245"
          y="360"
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="120"
          fill="var(--logo212-ink)"
          textAnchor="middle"
        >
          2
        </text>

        <g
          fontFamily="Arial Black, Arial, sans-serif"
          fontWeight="900"
          fontSize="34"
          fill="var(--logo212-ink)"
          textAnchor="middle"
        >
          <text id="logo212-L" className="logo212-letter" x="330" y="165">
            L
          </text>
          <text id="logo212-E" className="logo212-letter" x="330" y="205">
            E
          </text>
          <text id="logo212-A" className="logo212-letter" x="330" y="245">
            A
          </text>
          <text id="logo212-R" className="logo212-letter" x="330" y="285">
            R
          </text>
          <text id="logo212-N" className="logo212-letter" x="330" y="325">
            N
          </text>
        </g>
      </svg>
    </div>
  );
}
