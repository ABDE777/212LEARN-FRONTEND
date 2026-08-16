import { useEffect } from 'react';

/**
 * Injects a JSON-LD <script> into <head> for the lifetime of the component.
 * Used to add Schema.org structured data (Course, BreadcrumbList, FAQ…) so
 * search and answer engines can understand and cite the page (SEO/AEO/GEO).
 *
 * @param {object|object[]} data - a Schema.org object (or array) to serialize.
 * @param {string} id - a stable id so the tag is replaced, not duplicated.
 */
export default function StructuredData({ data, id = 'structured-data' }) {
  useEffect(() => {
    if (!data) return undefined;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      // Clean up on unmount so a stale schema doesn't leak to the next page.
      document.getElementById(id)?.remove();
    };
  }, [data, id]);

  return null;
}

// Canonical site origin. Swap when a custom domain is purchased (or set VITE_SITE_URL).
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://212-learn.vercel.app').replace(/\/$/, '');
