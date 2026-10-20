import React from "react";

/**
 * Google Maps styled SVG direction icons
 */
export function DirectionIcon({ action, size = 26, color = "#2563eb" }) {
  const s = size;

  switch (action) {
    case "turn-left":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="10 19 3 12 10 5" />
          <path d="M3 12h11a5 5 0 0 1 5 5v2" />
        </svg>
      );

    case "turn-right":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="14 5 21 12 14 19" />
          <path d="M21 12H10a5 5 0 0 0-5 5v2" />
        </svg>
      );

    case "slight-left":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="7" x2="17" y2="17" />
          <polyline points="7 14 7 7 14 7" />
        </svg>
      );

    case "slight-right":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="17" y1="7" x2="7" y2="17" />
          <polyline points="10 7 17 7 17 14" />
        </svg>
      );

    case "sharp-left":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 14 2 10 6 6" />
          <path d="M2 10h12a6 6 0 0 1 6 6v3" />
        </svg>
      );

    case "sharp-right":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 6 22 10 18 14" />
          <path d="M22 10H10a6 6 0 0 0-6 6v3" />
        </svg>
      );

    case "u-turn":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 10 4 15 9 20" />
          <path d="M20 4v7a4 4 0 0 1-4 4H4" />
        </svg>
      );

    case "lift":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <polyline points="8 10 10 7 12 10" />
          <polyline points="12 14 14 17 16 14" />
        </svg>
      );

    case "stairs":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 19 8 19 8 15 12 15 12 11 16 11 16 7 20 7" />
        </svg>
      );

    case "ramp":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="5" r="2" />
          <path d="M6 19a4 4 0 1 0 8 0" />
          <path d="M10 9v5h4" />
          <line x1="3" y1="21" x2="21" y2="12" />
        </svg>
      );

    case "escalator":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 19 7 19 15 7 21 7" />
        </svg>
      );

    case "destination":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
        </svg>
      );

    case "depart":
    case "straight":
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      );
  }
}

export default DirectionIcon;
