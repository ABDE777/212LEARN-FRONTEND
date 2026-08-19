import { Activity, Award, BarChart3, DollarSign, GraduationCap, RefreshCw, Target, TrendingDown, TrendingUp, UserPlus, Users } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const nf = new Intl.NumberFormat('fr-FR');
const fmtInt = (n) => nf.format(Math.round(Number(n) || 0));
const fmtMoney = (n) => nf.format(Math.round(Number(n) || 0));
const monthLabel = (key) => {
  if (!key || !key.includes('-')) return key || '';
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
};
const levelLabel = (lvl) => ({ beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[lvl] || lvl || '—');

/* One compact stat tile. */
function StatTile({ icon: Icon, label, value, sub, subColor, accent }) {
  return (
    <div style={{ padding: '1.1rem 1.25rem', background: 'var(--surface-color, #fff)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--secondary)' }}>
        <span style={{ display: 'inline-flex', width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', background: `${accent}1a`, color: accent }}>
          <Icon size={17} />
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1.1 }}>{value}</div>
      {sub != null && <div style={{ fontSize: '0.8rem', color: subColor || 'var(--secondary)', fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

/* Vertical bar chart of the monthly revenue trend (single series, one hue). */
function MonthlyRevenueChart({ monthly, currency }) {
  const data = monthly || [];
  if (data.length === 0) {
    return <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', padding: '1rem 0' }}>Aucune donnée de revenus pour le moment.</p>;
  }
  const max = Math.max(...data.map((m) => Number(m.revenue) || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: 180, overflowX: 'auto', paddingTop: '1.5rem' }}>
      {data.map((m) => {
        const val = Number(m.revenue) || 0;
        const h = Math.max((val / max) * 140, val > 0 ? 4 : 0);
        return (
          <div key={m.month} title={`${monthLabel(m.month)} · ${fmtMoney(val)} ${currency} · ${fmtInt(m.enrollments)} inscription(s)`}
            style={{ flex: '1 0 42px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-color)' }}>{val > 0 ? fmtMoney(val) : ''}</span>
            <div style={{ width: '100%', maxWidth: 40, height: h, background: 'var(--primary)', borderRadius: '4px 4px 2px 2px', transition: 'height .3s' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--secondary)', whiteSpace: 'nowrap' }}>{monthLabel(m.month)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* Horizontal ranked bars — top courses by revenue. */
function TopCoursesChart({ topCourses, currency }) {
  const data = topCourses || [];
  if (data.length === 0) {
    return <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucun revenu par cours à afficher.</p>;
  }
  const max = Math.max(...data.map((c) => Number(c.revenue) || 0), 1);
  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      {data.map((c, i) => {
        const val = Number(c.revenue) || 0;
        const w = Math.max((val / max) * 100, val > 0 ? 3 : 0);
        return (
          <div key={c.courseId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {i + 1}. {c.title}
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-color)', whiteSpace: 'nowrap' }}>
                {fmtMoney(val)} {currency}
              </span>
            </div>
            <div style={{ background: 'var(--border-color)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div title={`${fmtInt(c.students)} étudiant(s)`} style={{ width: `${w}%`, height: '100%', background: 'var(--primary)', borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{fmtInt(c.students)} étudiant(s)</div>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div style={{ background: 'var(--surface-color, #fff)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: subtitle ? '0.2rem' : '1rem' }}>
        {Icon && <Icon size={18} style={{ color: 'var(--primary)' }} />}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>{title}</h3>
      </div>
      {subtitle && <p style={{ color: 'var(--secondary)', fontSize: '0.82rem', margin: '0 0 1rem' }}>{subtitle}</p>}
      {children}
    </div>
  );
}

export default function AnalyticsTab({ revenueData, studentsData, completionData, loading, error, refetch }) {
  const currency = revenueData?.currency || 'MAD';

  const growth = Number(revenueData?.growth || 0);
  const totalRevenue = Number(revenueData?.totalRevenue || 0);
  const currentMonthRevenue = Number(revenueData?.currentMonthRevenue || 0);
  const avgOrder = Number(revenueData?.averageOrderValue || 0);
  const totalStudents = Number(studentsData?.totalStudents || 0);
  const totalEnrollments = Number(studentsData?.totalEnrollments ?? revenueData?.totalEnrollments ?? 0);
  const newStudents = Number(studentsData?.newStudentsThisMonth || 0);
  const avgCompletion = Number(completionData?.averageCompletion || 0);
  const avgProgress = Number(completionData?.averageProgress || 0);

  const monthly = revenueData?.monthly || [];
  const topCourses = revenueData?.topCourses || [];
  const studentCourses = studentsData?.courses || [];
  const completionCourses = completionData?.courses || [];

  const growthColor = growth > 0 ? '#059669' : growth < 0 ? 'var(--error-color, #ef4444)' : 'var(--secondary)';
  const GrowthIcon = growth >= 0 ? TrendingUp : TrendingDown;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-color)' }}>
            Analytics
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Revenus, étudiants et progression sur l'ensemble de vos cours
          </p>
        </div>
        <button
          onClick={refetch}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem',
            background: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* ── KPI tiles ─────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            <StatTile icon={DollarSign} accent="#059669" label="Revenus totaux"
              value={`${fmtMoney(totalRevenue)} ${currency}`}
              sub={`Panier moyen : ${fmtMoney(avgOrder)} ${currency}`} />
            <StatTile icon={BarChart3} accent="#c1652f" label="Revenus ce mois"
              value={`${fmtMoney(currentMonthRevenue)} ${currency}`}
              sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GrowthIcon size={13} />{growth >= 0 ? '+' : ''}{growth}% vs mois dernier</span>}
              subColor={growthColor} />
            <StatTile icon={Users} accent="#2563eb" label="Étudiants uniques"
              value={fmtInt(totalStudents)}
              sub={`${fmtInt(totalEnrollments)} inscription(s) au total`} />
            <StatTile icon={UserPlus} accent="#7c3aed" label="Nouveaux ce mois"
              value={fmtInt(newStudents)}
              sub="Étudiants inscrits ce mois-ci" />
            <StatTile icon={Award} accent="#d97706" label="Complétion moyenne"
              value={`${avgCompletion}%`}
              sub="Étudiants ayant tout terminé" />
            <StatTile icon={Activity} accent="#0891b2" label="Progression moyenne"
              value={`${avgProgress}%`}
              sub="Avancement moyen des étudiants" />
          </div>

          {/* ── Monthly revenue trend ─────────────────── */}
          <SectionCard title="Revenus mensuels" subtitle="Sur les 12 derniers mois" icon={BarChart3}>
            <MonthlyRevenueChart monthly={monthly} currency={currency} />
          </SectionCard>

          {/* ── Top courses by revenue ────────────────── */}
          <SectionCard title="Meilleurs cours par revenu" subtitle="Vos 5 cours les plus rentables" icon={TrendingUp}>
            <TopCoursesChart topCourses={topCourses} currency={currency} />
          </SectionCard>

          {/* ── Two-column: students + completion ─────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <SectionCard title="Étudiants par cours" icon={GraduationCap}>
              {studentCourses.length === 0 ? (
                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucun étudiant inscrit pour le moment.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {studentCourses.map((c) => (
                    <div key={c.courseId} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', background: 'var(--border-color)', padding: '1px 7px', borderRadius: 5 }}>{levelLabel(c.level)}</span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{fmtInt(c.students)}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>étudiant(s)</div>
                        </div>
                      </div>
                      {Array.isArray(c.recentStudents) && c.recentStudents.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.4rem' }}>
                          Récents : {c.recentStudents.map((s) => s.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Complétion par cours" icon={Target}>
              {completionCourses.length === 0 ? (
                <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Aucune donnée de complétion pour le moment.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {completionCourses.map((c) => (
                    <div key={c.courseId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-color)', whiteSpace: 'nowrap' }}>{c.averageProgress}%</span>
                      </div>
                      <div style={{ background: 'var(--border-color)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                        <div title={`Progression moyenne ${c.averageProgress}%`} style={{ width: `${c.averageProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: 6 }} />
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--secondary)', marginTop: '0.3rem' }}>
                        {fmtInt(c.completedCount)}/{fmtInt(c.totalEnrolled)} terminé(s) · {fmtInt(c.totalLessons)} leçon(s) · {c.completionRate}% complet
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
