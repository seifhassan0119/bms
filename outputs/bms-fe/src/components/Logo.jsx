import React from 'react';

/**
 * AxiomBank Logo Component
 * Derived from Untitled.svg with exact colors:
 * - Brand Accent: #14AE5C
 * - Base Container: #1E1E1E
 * - Inner Cavity: #000000 (black)
 * - Accent Ribbons: #FFFFFF (white)
 */
export default function Logo({
  className = 'w-9 h-9',
  rounded = 'rounded-xl',
  title = 'AxiomBank Logo',
  showGlow = false,
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${rounded} overflow-hidden ${
        showGlow ? 'shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500/30' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 241 237"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
        aria-label={title}
        role="img"
      >
        <title>{title}</title>
        {/* Background container rect matching #1E1E1E */}
        <rect width="241" height="237" rx="36" fill="#1E1E1E" />
        {/* Peak / Triangle in brand emerald #14AE5C */}
        <path d="M120.378 0L240.755 235.5H0L120.378 0Z" fill="#14AE5C" />
        {/* Inner black cavity */}
        <path d="M119.878 101L188.378 237H51.3775L119.878 101Z" fill="#000000" />
        {/* White cross ribbons */}
        <path
          d="M140.443 147.432C145.57 150.083 125.216 170.438 101.634 194.02C78.0518 217.602 58.9348 236.719 55.0458 232.83C51.1567 228.941 70.2736 209.824 93.8555 186.242C117.437 162.66 135.317 144.781 140.443 147.432Z"
          fill="#FFFFFF"
        />
        <path
          d="M98.8772 147.5C101.524 142.368 121.957 162.801 145.63 186.474C169.303 210.147 188.494 229.338 184.605 233.227C180.716 237.116 161.525 217.926 137.852 194.253C114.179 170.579 96.2305 152.631 98.8772 147.5Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

