import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * Apple-style magnifying Dock — adapted to this project's stack (plain JSX + inline styles + theme tokens).
 * Icons magnify with spring physics as pointer or finger nears them; each shows a label tooltip.
 */

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

const DockContext = createContext(undefined);

function DockProvider({ children, value }) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error('useDock must be used within a DockProvider');
  return ctx;
}

export function Dock({
  children,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4),
    [magnification]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{ height, scrollbarWidth: 'none', display: 'flex', width: '100%', alignItems: 'flex-end' }}
      className={className}
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        onTouchStart={(e) => {
          isHovered.set(1);
          if (e.touches[0]) mouseX.set(e.touches[0].pageX);
        }}
        onTouchMove={(e) => {
          isHovered.set(1);
          if (e.touches[0]) mouseX.set(e.touches[0].pageX);
        }}
        onTouchEnd={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        style={{
          height: panelHeight,
          margin: '0 auto',
          display: 'flex',
          width: '100%',
          justifyContent: 'space-around',
          gap: '0.5rem',
          alignItems: 'center',
          borderRadius: '18px',
          padding: '0 0.6rem',
          background: 'var(--surface-color, #fff)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 12px 34px rgba(43,38,34,0.20)',
          boxSizing: 'border-box',
        }}
        role="toolbar"
        aria-label="Navigation du site"
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </motion.div>
    </motion.div>
  );
}

export function DockItem({ children, className = '', onClick, title }) {
  const ref = useRef(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - rect.x - rect.width / 2;
  });
  const widthTransform = useTransform(mouseDistance, [-distance, 0, distance], [40, magnification, 40]);
  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width,
        aspectRatio: '1 / 1',
        borderRadius: '9999px',
        background: 'rgba(193,101,47,0.10)',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={className}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      {Children.map(children, (child) => cloneElement(child, { width, isHovered }))}
    </motion.div>
  );
}

export function DockLabel({ children, className = '', ...rest }) {
  const isHovered = rest.isHovered;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return undefined;
    const unsub = isHovered.on('change', (latest) => setIsVisible(latest === 1));
    return () => unsub();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: '-1.6rem',
            left: '50%',
            x: '-50%',
            width: 'fit-content',
            whiteSpace: 'pre',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color, #fff)',
            padding: '2px 8px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
          }}
          role="tooltip"
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children, className = '', ...rest }) {
  const width = rest.width;
  const widthTransform = useTransform(width, (val) => val / 2);

  return (
    <motion.div
      style={{ width: widthTransform, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

