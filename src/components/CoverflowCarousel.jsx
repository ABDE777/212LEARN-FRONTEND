import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function CoverflowCarousel({
  slides = [],
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = 'clamp(180px, 24vw, 280px)',
  gap = 0.05,
  loop = true,
  showCaption = true,
  showPagination = true,
  showNavigation = true,
  label = 'Formateurs carousel',
  className = '',
  cardClassName = '',
}) {
  const count = slides.length;

  const frameRef = useRef(null);
  const cardRefs = useRef([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = useRef(0);
  /** Where the current settle is headed. */
  const targetRef = useRef(0);
  const widthRef = useRef(0);
  const rafRef = useRef(null);
  const dragRef = useRef(null);

  const [selected, setSelected] = useState(0);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = useCallback(
    (pos) => ((Math.round(pos) % count) + count) % count,
    [count]
  );

  const paint = useCallback(() => {
    const width = widthRef.current;
    if (!width || count === 0) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = useCallback(
    (target) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint]
  );

  const clamp = useCallback(
    (pos) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop]
  );

  const goTo = useCallback(
    (index) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle]
  );

  const nudge = useCallback(
    (by) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle]
  );

  const onPointerDown = (event) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  if (!slides || slides.length === 0) return null;

  const active = slides[selected];

  return (
    <div
      className={`coverflow-carousel-container ${className}`}
      style={{ '--cf-card': cardWidth, width: '100%' }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              nudge(1);
            }
          }}
          style={{
            cursor: 'grab',
            overflow: 'hidden',
            paddingTop: '2.5rem',
            paddingBottom: '2.5rem',
            outline: 'none',
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: 'pan-y',
          }}
        >
          <div
            style={{
              position: 'relative',
              userSelect: 'none',
              height: 'var(--cf-card)',
              transformStyle: 'preserve-3d',
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                className={cardClassName}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  width: 'var(--cf-card)',
                  height: 'var(--cf-card)',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  background: 'var(--surface-color, #ffffff)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)',
                  willChange: 'transform',
                  border: '3px solid rgba(255, 255, 255, 0.9)',
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt || slide.title || 'Slide'}
                  draggable={false}
                  style={{
                    height: '100%',
                    width: '100%',
                    userSelect: 'none',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&h=640&fit=crop&q=80';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              style={{
                position: 'absolute',
                left: '12px',
                top: '40%',
                zIndex: 200,
                transform: 'translateY(-50%)',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                color: 'var(--text-color, #1a1a2e)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '40%',
                zIndex: 200,
                transform: 'translateY(-50%)',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                color: 'var(--text-color, #1a1a2e)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          style={{
            marginTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 1.5rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>
            {active.title}
          </h3>
          {active.subtitle && (
            <p style={{ marginTop: '0.25rem', fontSize: '0.98rem', color: 'var(--primary)', fontWeight: 700, margin: '0.25rem 0 0 0' }}>
              {active.subtitle}
            </p>
          )}
          {active.meta && active.meta.length > 0 && (
            <dl style={{ marginTop: '1rem', width: '100%', maxWidth: '300px', fontSize: '0.88rem', background: 'var(--surface-color, #ffffff)', padding: '0.85rem 1.25rem', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              {active.meta.map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <dt style={{ color: 'var(--secondary)' }}>{row.label}</dt>
                  <dd style={{ fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              style={{
                width: index === selected ? '28px' : '8px',
                height: '8px',
                borderRadius: '999px',
                background: index === selected ? 'var(--primary, #C1652F)' : 'var(--border-color, #ccc)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CoverflowCarousel;
