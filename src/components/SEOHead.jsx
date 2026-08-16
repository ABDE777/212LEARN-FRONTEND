import { useEffect } from 'react';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://212-learn.vercel.app').replace(/\/$/, '');

// Create-or-update a <meta> tag by name or property attribute.
function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Per-route SEO/AEO head management for the SPA: title, description, canonical
 * URL and Open Graph / Twitter tags. Structured data (JSON-LD) is handled
 * separately by <StructuredData />.
 */
export default function SEOHead({ title, description }) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | 212Learn`
      : '212Learn — Plateforme d\'apprentissage en ligne marocaine (tech & design)';
    document.title = fullTitle;

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    setMeta('property', 'og:title', fullTitle);
    setMeta('name', 'twitter:title', fullTitle);

    // Canonical + og:url for the current route (query string stripped).
    const canonicalUrl = `${SITE_URL}${window.location.pathname}`;
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
    setMeta('property', 'og:url', canonicalUrl);
  }, [title, description]);

  return null;
}
