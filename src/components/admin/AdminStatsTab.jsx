import { Users, BookOpen, Folder, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminStatsTab() {
  const { stats, loading, error } = useAdminStats();

  /* ── SVG progress ring ── */
  const Ring = ({ pct = 0, color = '#2D8CFF', size = 56, stroke = 5 }) => {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
    );
  };

  /* ── Horizontal progress bar ── */
  const Bar = ({ pct = 0, color = 'var(--primary)', label = '' }) => (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px', background: color, transition: 'width 0.9s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
      <LoadingSpinner />
      <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Chargement des statistiques…</p>
    </div>
  );
  if (error) return <p style={{ color: 'var(--error-color)', padding: '2rem', textAlign: 'center' }}>{error}</p>;
  if (!stats) return null;

  const total = stats.totalUsers || 1;
  const totalCourses = (stats.activeCourses ?? 0) + (stats.draftCourses ?? 0);

  const kpis = [
    {
      label: 'Utilisateurs totaux',
      value: stats.totalUsers ?? 0,
      sub: `${stats.students ?? 0} étudiants`,
      gradient: 'linear-gradient(135deg, #1B4B5A 0%, #2d6b7e 100%)',
      icon: <Users size={20} />,
    },
    {
      label: 'Cours publiés',
      value: stats.activeCourses ?? 0,
      sub: `${stats.draftCourses ?? 0} en brouillon`,
      gradient: 'linear-gradient(135deg, #C1652F 0%, #d98244 100%)',
      icon: <BookOpen size={20} />,
    },
    {
      label: 'Instructeurs',
      value: stats.instructors ?? 0,
      sub: `${stats.admins ?? 0} admin(s)`,
      gradient: 'linear-gradient(135deg, #E8A33D 0%, #f0b968 100%)',
      icon: <TrendingUp size={20} />,
    },
    {
      label: 'Catégories',
      value: stats.totalCategories ?? 0,
      sub: 'Toutes actives',
      gradient: 'linear-gradient(135deg, #2d6b7e 0%, #4a8a9e 100%)',
      icon: <Folder size={20} />,
    },
    {
      label: 'Revenu total',
      value: `${(stats.totalRevenue ?? 0).toLocaleString()} MAD`,
      sub: 'Paiements confirmés',
      gradient: 'linear-gradient(135deg, #C1652F 0%, #E8A33D 100%)',
      icon: <DollarSign size={20} />,
    },
  ];

  const roles = [
    { label: 'Étudiants', count: stats.students ?? 0, color: '#1B4B5A' },
    { label: 'Instructeurs', count: stats.instructors ?? 0, color: '#C1652F' },
    { label: 'Administrateurs', count: stats.admins ?? 0, color: '#E8A33D' },
  ];

  const courseBreakdown = [
    { label: 'Publiés', count: stats.activeCourses ?? 0, color: '#1B4B5A' },
    { label: 'Brouillons', count: stats.draftCourses ?? 0, color: '#E8A33D' },
  ];


  return (
    <div style={{ padding: '0.25rem 0' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-color)', margin: 0 }}>
          📊 Tableau de bord analytique
        </h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Vue d'ensemble en temps réel de la plateforme <strong>212LEARN</strong>
        </p>
      </div>

      {/* ── KPI hero cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {kpis.map((k, i) => (
          <div key={i} style={{
            borderRadius: '18px',
            background: k.gradient,
            padding: '1.5rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>
              {k.icon}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontWeight: 600, marginTop: '0.3rem', fontSize: '0.95rem', opacity: 0.95 }}>{k.label}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.2rem' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column detail section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Users breakdown */}
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#1B4B5A,#2d6b7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Users size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>Répartition des utilisateurs</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--secondary)' }}>{stats.totalUsers ?? 0} au total</p>
            </div>
          </div>

          {roles.map((r, i) => {
            const pct = ((r.count / total) * 100);
            return (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-color)' }}>{r.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-color)' }}>{r.count}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', background: 'var(--border-color)', padding: '1px 8px', borderRadius: '99px', fontWeight: 600 }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px', background: r.color, transition: 'width 0.9s cubic-bezier(.4,0,.2,1)' }} />
                </div>
              </div>
            );
          })}

          {/* SVG rings */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {roles.map((r, i) => {
              const pct = (r.count / total) * 100;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    <Ring pct={pct} color={r.color} size={52} stroke={5} />
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-color)' }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 600 }}>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courses breakdown */}
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#C1652F,#d98244)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <BookOpen size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>Répartition des cours</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--secondary)' }}>{totalCourses} cours au total</p>
            </div>
          </div>

          {courseBreakdown.map((c, i) => {
            const pct = totalCourses > 0 ? (c.count / totalCourses) * 100 : 0;
            return (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-color)' }}>{c.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-color)' }}>{c.count}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', background: 'var(--border-color)', padding: '1px 8px', borderRadius: '99px', fontWeight: 600 }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: '99px', background: c.color, transition: 'width 0.9s cubic-bezier(.4,0,.2,1)' }} />
                </div>
              </div>
            );
          })}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {courseBreakdown.map((c, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', background: `${c.color}12`, border: `1px solid ${c.color}30` }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c.color }}>{c.count}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '0.2rem' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Revenue + Platform health ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.25rem' }}>

        <div style={{ background: 'linear-gradient(135deg, #1B4B5A 0%, #163b46 50%, #0e2b33 100%)', borderRadius: '18px', padding: '1.75rem', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(102,126,234,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(250,112,154,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', position: 'relative' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(250,225,64,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} style={{ color: '#E8A33D' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', opacity: 0.9 }}>Revenu de la plateforme</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', position: 'relative' }}>
            {(stats.totalRevenue ?? 0).toLocaleString()}
            <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.7, marginLeft: '6px' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.55, marginTop: '0.5rem', position: 'relative' }}>Paiements Wafacash confirmés</div>
        </div>

        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#E8A33D,#f0b968)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Activity size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>Santé de la plateforme</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--secondary)' }}>Indicateurs clés</p>
            </div>
          </div>

          {[
            { label: 'Taux de publication', pct: totalCourses > 0 ? ((stats.activeCourses ?? 0) / totalCourses) * 100 : 0, color: '#1B4B5A' },
            { label: 'Part étudiants', pct: ((stats.students ?? 0) / total) * 100, color: '#C1652F' },
            { label: 'Catégories utilisées', pct: Math.min(100, ((stats.totalCategories ?? 0) / 20) * 100), color: '#E8A33D' },
          ].map((m, i) => (
            <Bar key={i} pct={m.pct} color={m.color} label={m.label} />
          ))}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)' }}>{stats.totalCategories ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Catégories</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1B4B5A' }}>{stats.activeCourses ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Publiés</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C1652F' }}>{stats.totalUsers ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Membres</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
