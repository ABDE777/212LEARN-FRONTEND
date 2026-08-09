import { useId } from 'react';

/**
 * Soft brand blobs + Moroccan diamond SVG pattern for About page depth.
 */
export default function BackgroundBlobs({ variant = 'warm' }) {
  const uid = useId().replace(/:/g, '');
  const patternId = `moroccan-grid-${variant}-${uid}`;
  const stroke = variant === 'cool' ? 'var(--secondary)' : 'var(--primary)';

  return (
    <div className="about-bg-blobs" aria-hidden="true">
      <div className="about-blob about-blob--amber" />
      <div className="about-blob about-blob--orange" />
      <div className="about-blob about-blob--teal" />
      <svg className="about-moroccan-pattern" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke={stroke} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
