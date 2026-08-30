import { 
  Activity, 
  Award, 
  BarChart3, 
  DollarSign, 
  GraduationCap, 
  RefreshCw, 
  Target, 
  TrendingDown, 
  TrendingUp, 
  UserPlus, 
  Users, 
  Wallet, 
  Layers, 
  Percent, 
  CheckCircle2,
  Info
} from 'lucide-react';
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

/* Vertical bar chart of the monthly revenue trend. */
function MonthlyRevenueChart({ monthly, currency }) {
  const data = monthly || [];
  if (data.length === 0) {
    return <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', padding: '1rem 0' }}>Aucune donnée de revenus pour le moment.</p>;
  }
  const max = Math.max(...data.map((m) => Number(m.revenue) || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: 180, overflowX: 'auto', paddingTop: '1.5rem' }}>
      {data.map((m) => {
        const val = Number(m.instructorEarnings ?? (m.revenue * 0.7)) || 0;
        const gross = Number(m.revenue) || 0;
        const h = Math.max((val / (max * 0.7 || 1)) * 140, val > 0 ? 4 : 0);
        return (
          <div key={m.month} title={`${monthLabel(m.month)} · Net Formateur: ${fmtMoney(val)} ${currency} (Brut: ${fmtMoney(gross)} ${currency}) · ${fmtInt(m.enrollments)} vente(s)`}
            style={{ flex: '1 0 42px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>{val > 0 ? fmtMoney(val) : ''}</span>
            <div style={{ width: '100%', maxWidth: 40, height: h, background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', borderRadius: '4px 4px 2px 2px', transition: 'height .3s' }} />
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
  const max = Math.max(...data.map((c) => Number(c.instructorEarnings ?? (c.revenue * 0.7)) || 0), 1);
  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      {data.map((c, i) => {
        const val = Number(c.instructorEarnings ?? (c.revenue * 0.7)) || 0;
        const gross = Number(c.revenue) || 0;
        const w = Math.max((val / max) * 100, val > 0 ? 3 : 0);
        return (
          <div key={c.courseId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {i + 1}. {c.title}
              </span>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
                  {fmtMoney(val)} {currency} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--secondary)' }}>(Net)</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>
                  Brut: {fmtMoney(gross)} {currency}
                </span>
              </div>
            </div>
            <div style={{ background: 'var(--border-color)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div title={`${fmtInt(c.students)} étudiant(s)`} style={{ width: `${w}%`, height: '100%', background: '#10b981', borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{fmtInt(c.students)} étudiant(s) inscrits</div>
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
  const totalGrossRevenue = Number(revenueData?.totalRevenue || 0);
  const sharePct = Number(revenueData?.instructorSharePercentage || 70);
  const instructorNetEarnings = Number(revenueData?.instructorEarnings ?? (totalGrossRevenue * (sharePct / 100)));
  const currentMonthEarnings = Number(revenueData?.currentMonthEarnings ?? ((revenueData?.currentMonthRevenue || 0) * (sharePct / 100)));
  const platformFee = Number(revenueData?.platformRetention ?? (totalGrossRevenue * ((100 - sharePct) / 100)));

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
  const groups = studentsData?.groups || [];
  const scope = revenueData?.scope || 'group_students';

  const growthColor = growth > 0 ? '#059669' : growth < 0 ? 'var(--error-color, #ef4444)' : 'var(--secondary)';
  const GrowthIcon = growth >= 0 ? TrendingUp : TrendingDown;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text-color)' }}>
            📊 Tableau de Bord Financier & Analytics
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Consultez votre rémunération nette à percevoir, vos revenus et la progression des étudiants que vous encadrez.
          </p>
        </div>
        <button
          onClick={refetch}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem',
            background: 'var(--surface-color, #fff)', color: 'var(--text-color)', border: '1px solid var(--border-color)',
            borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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

          {/* ── Scope Explanation Banner ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            background: 'rgba(79, 70, 229, 0.06)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            color: 'var(--primary)',
            fontSize: '0.86rem',
          }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <span>
              {scope === 'group_students'
                ? "👥 Vos revenus et statistiques sont calculés précisément sur les étudiants inscrits dans les groupes de classe que vous encadrez."
                : "📚 Vos revenus sont calculés sur l'ensemble des étudiants inscrits à vos cours."}
            </span>
          </div>

          {/* ── Hero Payout Statement Card ── */}
          <div style={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
            padding: '2rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(4, 120, 87, 0.3)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.75rem',
            alignItems: 'center',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            
            {/* Net Payout to Receive */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <Wallet size={14} /> Votre Rémunération Nette ({sharePct}%)
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
                {fmtMoney(instructorNetEarnings)} <span style={{ fontSize: '1.3rem', fontWeight: 600 }}>{currency}</span>
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.4rem' }}>
                Montant total que vous recevrez ({sharePct}% de reversement formateur)
              </div>
            </div>

            {/* Breakdown Mini-Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', padding: '1rem', borderRadius: '14px', backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Chiffre d'Affaires Brut</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {fmtMoney(totalGrossRevenue)} {currency}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.15rem' }}>100% ventes validées</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.12)', padding: '1rem', borderRadius: '14px', backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Gains ce mois</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {fmtMoney(currentMonthEarnings)} {currency}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.15rem' }}>Net perçu ce mois</div>
              </div>
            </div>
          </div>

          {/* ── KPI tiles ─────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            <StatTile icon={Users} accent="#2563eb" label="Étudiants encadrés"
              value={fmtInt(totalStudents)}
              sub={`${fmtInt(totalEnrollments)} inscription(s) payée(s)`} />
            <StatTile icon={UserPlus} accent="#7c3aed" label="Nouveaux ce mois"
              value={fmtInt(newStudents)}
              sub="Apprenants inscrits ce mois-ci" />
            <StatTile icon={BarChart3} accent="#c1652f" label="Croissance mensuelle"
              value={`${growth >= 0 ? '+' : ''}${growth}%`}
              sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><GrowthIcon size={13} /> vs mois précédent</span>}
              subColor={growthColor} />
            <StatTile icon={Award} accent="#d97706" label="Complétion moyenne"
              value={`${avgCompletion}%`}
              sub="Étudiants ayant tout terminé" />
            <StatTile icon={Activity} accent="#0891b2" label="Progression moyenne"
              value={`${avgProgress}%`}
              sub="Avancement moyen des leçons" />
          </div>

          {/* ── Groups taught breakdown (if any) ──────── */}
          {groups.length > 0 && (
            <SectionCard title="Vos Groupes de Classe Encadrés" subtitle="Cohortes d'étudiants dont vous êtes le formateur attitré" icon={Layers}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {groups.map((g) => (
                  <div key={g.id} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-color, #f8fafc)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-color)' }}>
                      💬 {g.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                      Formation : {g.courseTitle}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.4rem' }}>
                      👥 {g.studentsCount} étudiant(s) inscrits
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Monthly net revenue trend ─────────────── */}
          <SectionCard title="Rémunération Mensuelle Nette" subtitle={`Vos gains nets perçus sur les 12 derniers mois (${sharePct}% des ventes)`} icon={BarChart3}>
            <MonthlyRevenueChart monthly={monthly} currency={currency} />
          </SectionCard>

          {/* ── Top courses by revenue ────────────────── */}
          <SectionCard title="Meilleurs cours par rémunération" subtitle="Vos formations les plus rémunératrices (Montants Nets Formateur)" icon={TrendingUp}>
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
