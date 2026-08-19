import { createPortal } from 'react-dom';

/**
 * Renders its children into document.body via a portal. Modal/drawer overlays
 * use position:fixed, which is only viewport-relative when no ancestor creates
 * a containing block (a CSS transform/filter/perspective — e.g. framer-motion
 * animations). Portaling to <body> guarantees the overlay covers the whole
 * viewport instead of being trapped inside a transformed parent, so backdrops
 * and drawers sit above the page rather than looking like a shadow on a card.
 */
export default function ModalPortal({ children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
