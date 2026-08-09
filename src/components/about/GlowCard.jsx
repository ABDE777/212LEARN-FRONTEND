import { useRef } from 'react';

/**
 * Glass card with 2D glow that follows the cursor + soft tilt.
 */
export default function GlowCard({
  icon,
  label,
  title,
  description,
  className = '',
  centered = false,
}) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    const rx = ((y / rect.height) - 0.5) * -6;
    const ry = ((x / rect.width) - 0.5) * 6;
    el.style.setProperty('--glow-x', `${px}%`);
    el.style.setProperty('--glow-y', `${py}%`);
    el.style.setProperty('--tilt-x', `${rx}deg`);
    el.style.setProperty('--tilt-y', `${ry}deg`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <article
      ref={ref}
      className={`about-glow-card${centered ? ' about-glow-card--centered' : ''} ${className}`.trim()}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="about-glow-card__aura" />
      <div className="about-glow-card__border" />
      <div className="about-glow-card__body">
        {icon ? <div className="about-glow-card__icon">{icon}</div> : null}
        {label ? <span className="about-glow-card__label">{label}</span> : null}
        {title ? <h3 className="about-glow-card__title">{title}</h3> : null}
        {description ? <p className="about-glow-card__desc">{description}</p> : null}
      </div>
    </article>
  );
}
