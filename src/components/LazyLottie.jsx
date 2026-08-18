import { useState, useEffect, useRef } from 'react';

// Pick the actual Lottie component out of whatever shape the bundler's module
// interop produces. Depending on the interop, the callable can sit at .default,
// .default.default, or the named LottiePlayer export — so walk the candidates
// and take the first real component (a function/class, or a forwardRef/memo
// object carrying $$typeof). Handing React.lazy or JSX a plain module object
// here is what caused the "Lazy element type must resolve to a class or
// function" crash (React #306).
function pickLottieComponent(m) {
  const candidates = [m?.default?.default, m?.default, m?.LottiePlayer, m];
  return candidates.find(
    (c) => typeof c === 'function' || (c && typeof c === 'object' && c.$$typeof)
  );
}

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
  const [Lottie, setLottie] = useState(null);
  const loadRef = useRef(load);

  useEffect(() => {
    let alive = true;
    // Load the animation data and the lottie-react runtime in parallel; the
    // animation is decorative, so any failure just leaves the placeholder.
    loadRef.current()
      .then((m) => { if (alive) setData(m?.default || m); })
      .catch(() => {});
    import('lottie-react')
      .then((m) => { if (alive) setLottie(() => pickLottieComponent(m)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const placeholder = <div style={{ width: '100%', minHeight, ...style }} aria-hidden="true" />;
  if (!data || !Lottie) return placeholder;

  return <Lottie animationData={data} loop={loop} style={style} />;
}
