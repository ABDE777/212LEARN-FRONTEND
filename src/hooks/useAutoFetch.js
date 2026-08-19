import { useEffect } from 'react';

/**
 * Drives a data hook's fetching:
 *  - fetches on mount (and whenever `fetchFn` identity changes) — but only while
 *    `enabled` is true, so a dashboard tab fetches its data only when opened
 *    instead of every tab firing its API on mount;
 *  - re-fetches after any create/update/delete anywhere in the app (the
 *    `api:mutated` event dispatched by the axios response interceptor), so lists
 *    stay live without a manual page reload.
 *
 * `fetchFn` must be memoized by the caller (useCallback), as is the convention
 * for the app's data hooks.
 *
 * @param {() => (void|Promise<void>)} fetchFn
 * @param {boolean} [enabled=true]
 */
export function useAutoFetch(fetchFn, enabled = true) {
  useEffect(() => {
    if (enabled) fetchFn();
  }, [enabled, fetchFn]);

  useEffect(() => {
    if (!enabled) return undefined;
    const handler = () => { fetchFn(); };
    window.addEventListener('api:mutated', handler);
    return () => window.removeEventListener('api:mutated', handler);
  }, [enabled, fetchFn]);
}
