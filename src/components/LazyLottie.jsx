import { useState, useEffect, useRef, lazy, Suspense } from 'react';

// Lazy-load the lottie-react runtime so it stays out of the page's initial JS.
const LottiePlayer = lazy(() => import('lottie-react').then((m) => ({ default: m.default || m })));

/**
 * Renders a Lottie animation whose JSON is fetched on demand via a dynamic
 * import, keeping the (often 100 KB+) animation data AND the lottie runtime
 * out of the importing page's initial chunk. A same-size placeholder is shown
 * while loading to avoid layout shift.
 *
 * @param {() => Promise<any>} load - e.g. () => import('../lotties/login.json')
 * @param {object} [style]
 * @param {boolean} [loop=true]
 * @param {number} [minHeight=280] - reserved height while the animation loads
 */
export default function LazyLottie({ load, style, loop = true, minHeight = 280 }) {
  const [data, setData] = useState(null);
  const loadRef = useRef(load);

  useEffect(() => {
    let alive = true;
    loadRef.current()
      .then((m) => { if (alive) setData(m.default || m); })
      .catch(() => { /* animation is decorative — ignore load failures */ });
    return () => { alive = false; };
  }, []);

  const placeholder = <div style={{ width: '100%', minHeight, ...style }} aria-hidden="true" />;
  if (!data) return placeholder;

  return (
    <Suspense fallback={placeholder}>
      <LottiePlayer animationData={data} loop={loop} style={style} />
    </Suspense>
  );
}
