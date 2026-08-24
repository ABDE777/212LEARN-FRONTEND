/**
 * Returns a data-URI SVG avatar with the person's initials on a brand gradient.
 * Used as a placeholder when a user has no real avatar — no stock photos, no
 * external request. Works anywhere an <img src> is expected.
 */
export function initialsAvatar(name = '') {
  const initials =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase() || 'U';

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="#1B4B5A"/><stop offset="100%" stop-color="#C1652F"/>` +
    `</linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/>` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
    `font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="96" fill="#ffffff">` +
    `${initials}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default initialsAvatar;
