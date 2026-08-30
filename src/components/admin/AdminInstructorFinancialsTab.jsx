import { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  Layers, 
  TrendingUp, 
  Search, 
  Filter, 
  Award, 
  ChevronRight, 
  X, 
  CheckCircle, 
  HelpCircle, 
  Percent, 
  ArrowUpRight, 
  Wallet,
  Building,
  Mail,
  Phone,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { useAdminInstructorFinancials } from '../../hooks/useAdminStats';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminInstructorFinancialsTab() {
  const { 
    rawSummary, 
    rawInstructors, 
    loading, 
    error, 
    refetch 
  } = useAdminInstructorFinancials(true);

  // The commission rate is a GLOBAL setting: seed the slider from the stored
  // value and persist changes so analytics/earnings everywhere reflect it live.
  const { settings, save: saveSettings, saving: savingRate } = useAdminSettings();
  const [sharePercentage, setSharePercentage] = useState(70);
  const [savedShare, setSavedShare] = useState(70);
  useEffect(() => {
    if (settings && typeof settings.instructorSharePct === 'number') {
      setSharePercentage(settings.instructorSharePct);
      setSavedShare(settings.instructorSharePct);
    }
  }, [settings]);

  const persistShare = async () => {
    const pct = Math.min(100, Math.max(0, Number(sharePercentage) || 0));
    try {
      await saveSettings({ instructorSharePct: pct });
      setSavedShare(pct);
    } catch { /* error surfaced by the hook */ }
  };

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | has_revenue | has_groups | no_groups
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);

  // Live in-memory instant recalculation — 0 network requests, 0 latency, 0 race conditions!
  const { summary, instructors } = useMemo(() => {
    const rate = Math.min(100, Math.max(0, Number(sharePercentage) || 0));
    const insts = (rawInstructors || []).map((item) => {
      const gross = Number(item.metrics?.totalRevenueGenerated || 0);
      const payoutDue = Number((gross * (rate / 100)).toFixed(2));
      const platformRet = Number((gross * ((100 - rate) / 100)).toFixed(2));

      const courses = (item.courses || []).map((c) => ({
        ...c,
        instructorEarnings: Number((Number(c.revenueGenerated || 0) * (rate / 100)).toFixed(2)),
      }));

      return {
        ...item,
        metrics: {
          ...item.metrics,
          instructorSharePercentage: rate,
          instructorPayoutDue: payoutDue,
          platformRetention: platformRet,
        },
        courses,
      };
    });

    const totalGross = insts.reduce((s, i) => s + i.metrics.totalRevenueGenerated, 0);
    const totalPayout = insts.reduce((s, i) => s + i.metrics.instructorPayoutDue, 0);
    const totalRet = insts.reduce((s, i) => s + i.metrics.platformRetention, 0);
    const totalStudents = insts.reduce((s, i) => s + i.metrics.studentsCount, 0);

    const sorted = [...insts].sort((a, b) => b.metrics.totalRevenueGenerated - a.metrics.totalRevenueGenerated);
    const top = sorted[0]?.metrics.totalRevenueGenerated > 0 ? sorted[0] : null;

    const summ = {
      totalInstructors: insts.length,
      totalRevenueGenerated: Number(totalGross.toFixed(2)),
      totalPayoutDue: Number(totalPayout.toFixed(2)),
      totalPlatformRetention: Number(totalRet.toFixed(2)),
      totalStudentsTaught: totalStudents,
      defaultSharePercentage: rate,
      currency: 'MAD',
      topInstructor: top ? {
        id: top.instructor.id,
        name: `${top.instructor.firstName} ${top.instructor.lastName}`,
        revenue: top.metrics.totalRevenueGenerated,
        payoutDue: top.metrics.instructorPayoutDue,
        students: top.metrics.studentsCount,
      } : null,
    };

    return { summary: summ, instructors: sorted };
  }, [rawInstructors, sharePercentage]);

  // Selected instructor resolved live from the current recalculated instructors list
  const selectedInstructor = useMemo(() => {
    if (!selectedInstructorId) return null;
    return instructors.find((i) => i.instructor.id === selectedInstructorId) || null;
  }, [instructors, selectedInstructorId]);

  // Filtered instructors list
  const filteredInstructors = useMemo(() => {
    return instructors.filter((inst) => {
      const q = search.trim().toLowerCase();
      const name = `${inst.instructor.firstName || ''} ${inst.instructor.lastName || ''}`.toLowerCase();
      const email = (inst.instructor.email || '').toLowerCase();
      const spec = (inst.instructor.specialization || '').toLowerCase();
      const coursesMatch = inst.courses.some(c => c.title.toLowerCase().includes(q));
      const groupsMatch = inst.groups.some(g => g.name.toLowerCase().includes(q));

      const matchesSearch = !q || name.includes(q) || email.includes(q) || spec.includes(q) || coursesMatch || groupsMatch;

      if (!matchesSearch) return false;

      if (filterType === 'has_revenue') return inst.metrics.totalRevenueGenerated > 0;
      if (filterType === 'has_groups') return inst.metrics.groupsCount > 0;
      if (filterType === 'no_groups') return inst.metrics.groupsCount === 0;

      return true;
    });
  }, [instructors, search, filterType]);

  if (loading && !summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <LoadingSpinner />
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Calcul des rémunérations et revenus des formateurs…</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--error-color)' }}>
        <p>{error}</p>
        <button onClick={() => refetch()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0.25rem 0' }}>

      {/* ── Page Header & Commission Config ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1.5rem',
        marginBottom: '2rem',
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.04) 0%, rgba(79, 70, 229, 0.06) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.6rem' }}>
            <Wallet size={14} /> Gestion Financière & Rémunérations
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 0.4rem 0' }}>
            Revenus & Rémunération des Formateurs
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Consultez le chiffre d'affaires généré par chaque formateur (calculé selon les <strong>étudiants qu'il encadre dans ses groupes</strong>), le montant exact à lui verser (Payout) et la part de commission conservée par la plateforme.
          </p>
        </div>

        {/* Live Instant Commission Slider (0ms latency) */}
        <div style={{
          background: 'var(--surface-color, #fff)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minWidth: '300px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Percent size={15} style={{ color: 'var(--primary)' }} /> Taux de Reversement Formateur
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="number"
                min="0"
                max="100"
                value={sharePercentage}
                onChange={(e) => setSharePercentage(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                style={{
                  width: '56px',
                  padding: '3px 6px',
                  borderRadius: '6px',
                  border: '1.5px solid var(--primary)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: 'var(--primary)',
                  textAlign: 'center',
                }}
              />
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>%</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={sharePercentage}
              onChange={(e) => setSharePercentage(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'space-between' }}>
            {[50, 60, 70, 80, 90, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setSharePercentage(pct)}
                style={{
                  flex: 1,
                  padding: '3px 0',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: sharePercentage === pct ? 'var(--primary)' : 'var(--border-color)',
                  background: sharePercentage === pct ? 'var(--primary)' : 'rgba(0,0,0,0.02)',
                  color: sharePercentage === pct ? '#fff' : 'var(--secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--secondary)', paddingTop: '0.35rem', borderTop: '1px solid var(--border-color)' }}>
            <span>Formateur : <strong style={{ color: '#059669' }}>{sharePercentage}%</strong></span>
            <span>Plateforme : <strong style={{ color: 'var(--primary)' }}>{100 - sharePercentage}%</strong></span>
          </div>

          {/* Persist the rate globally so analytics/earnings pages update live */}
          <button
            type="button"
            onClick={persistShare}
            disabled={savingRate || sharePercentage === savedShare}
            style={{
              marginTop: '0.15rem',
              padding: '7px 0',
              borderRadius: '8px',
              border: 'none',
              background: sharePercentage === savedShare ? 'rgba(0,0,0,0.06)' : 'var(--primary)',
              color: sharePercentage === savedShare ? 'var(--secondary)' : '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: savingRate || sharePercentage === savedShare ? 'default' : 'pointer',
            }}
          >
            {savingRate
              ? 'Enregistrement…'
              : sharePercentage === savedShare
                ? `Taux global : ${savedShare}%`
                : 'Enregistrer le taux global'}
          </button>
        </div>
      </div>

      {/* ── Top Summary KPIs ── */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          {/* Card 1: Total Revenue Generated */}
          <div style={{
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: '1.5rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(30, 41, 59, 0.2)',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', marginBottom: '0.75rem' }}>
              <DollarSign size={20} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {summary.totalRevenueGenerated.toLocaleString()} {summary.currency}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem', opacity: 0.95 }}>
              CA Total Formateurs
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.2rem' }}>
              Paiements confirmés (étudiants encadrés)
            </div>
          </div>

          {/* Card 2: Total Payout to Pay Instructors */}
          <div style={{
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            padding: '1.5rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', marginBottom: '0.75rem' }}>
              <Wallet size={20} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {summary.totalPayoutDue.toLocaleString()} {summary.currency}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem', opacity: 0.95 }}>
              À Verser aux Formateurs
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.2rem' }}>
              Reversement calculé à {sharePercentage}%
            </div>
          </div>

          {/* Card 3: Platform Retained Fee */}
          <div style={{
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            padding: '1.5rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(79, 70, 229, 0.25)',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', marginBottom: '0.75rem' }}>
              <TrendingUp size={20} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {summary.totalPlatformRetention.toLocaleString()} {summary.currency}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem', opacity: 0.95 }}>
              Marge Nette Plateforme
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.2rem' }}>
              Commission retenue ({100 - sharePercentage}%)
            </div>
          </div>

          {/* Card 4: Students Taught & Instructors Count */}
          <div style={{
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            padding: '1.5rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(6, 182, 212, 0.2)',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', marginBottom: '0.75rem' }}>
              <Users size={20} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {summary.totalStudentsTaught}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem', opacity: 0.95 }}>
              Apprenants Formés
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.2rem' }}>
              Répartis sur {summary.totalInstructors} formateur(s)
            </div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '400px' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, cours, groupe…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color, #fff)',
              fontSize: '0.88rem',
              color: 'var(--text-color)',
              outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `Tous (${instructors.length})` },
            { key: 'has_revenue', label: 'Avec revenus générés' },
            { key: 'has_groups', label: 'Avec groupes attribués' },
            { key: 'no_groups', label: 'Sans groupes' },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterType(f.key)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: filterType === f.key ? 'var(--primary)' : 'var(--border-color)',
                background: filterType === f.key ? 'rgba(79, 70, 229, 0.08)' : 'var(--surface-color, #fff)',
                color: filterType === f.key ? 'var(--primary)' : 'var(--secondary)',
                fontSize: '0.82rem',
                fontWeight: filterType === f.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => refetch()}
            title="Rafraîchir les données"
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color, #fff)',
              color: 'var(--secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
            }}
          >
            <RotateCcw size={14} /> Rafraîchir
          </button>
        </div>
      </div>

      {/* ── Instructors Financial Table / Cards ── */}
      {filteredInstructors.length === 0 ? (
        <div style={{
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          background: 'var(--surface-color, #fff)',
          borderRadius: '18px',
          border: '1px dashed var(--border-color)',
        }}>
          <Users size={40} style={{ color: 'var(--secondary)', opacity: 0.4, marginBottom: '0.75rem' }} />
          <h3 style={{ margin: '0 0 0.35rem', color: 'var(--text-color)', fontSize: '1.1rem' }}>
            Aucun formateur trouvé
          </h3>
          <p style={{ color: 'var(--secondary)', fontSize: '0.88rem', margin: 0 }}>
            Aucun formateur ne correspond à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface-color, #fff)',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color, #f8fafc)', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Formateur</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Enseignement</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Étudiants Formés</th>
                  <th style={{ padding: '1rem 1.25rem' }}>CA Total Généré</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Rémunération ({sharePercentage}%)</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Part Plateforme</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.map((item, idx) => {
                  const inst = item.instructor;
                  const m = item.metrics;
                  const isTop = idx === 0 && m.totalRevenueGenerated > 0;

                  return (
                    <tr
                      key={inst.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.015)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Instructor Info */}
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          {inst.avatar ? (
                            <img
                              src={inst.avatar}
                              alt={`${inst.firstName} ${inst.lastName}`}
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                            />
                          ) : (
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              flexShrink: 0,
                            }}>
                              {(inst.firstName?.[0] || 'F').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {inst.firstName} {inst.lastName}
                              {isTop && (
                                <span title="Formateur n°1 en chiffre d'affaires" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '6px', fontWeight: 800 }}>
                                  🏆 N°1
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '0.15rem' }}>
                              {inst.email}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                              {inst.specialization || 'Formateur'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Teaching Scope */}
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                            {m.groupsCount} groupe(s)
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>
                            {m.coursesCount} cours associé(s)
                          </span>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            width: 'fit-content',
                            background: item.teachingScope === 'group_students' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: item.teachingScope === 'group_students' ? '#059669' : '#2563eb',
                          }}>
                            {item.teachingScope === 'group_students' ? '👥 Par Groupes' : '📚 Par Cours'}
                          </span>
                        </div>
                      </td>

                      {/* Students Count */}
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-color)' }}>
                            {m.studentsCount}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>étudiant(s)</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--secondary)', marginTop: '0.1rem' }}>
                          {m.paidTransactionsCount} vente(s) validée(s)
                        </div>
                      </td>

                      {/* Total Revenue Generated */}
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-color)' }}>
                          {m.totalRevenueGenerated.toLocaleString()} {m.currency}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>
                          Chiffre d'affaires brut
                        </div>
                      </td>

                      {/* Instructor Payout Due */}
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '10px',
                          background: m.instructorPayoutDue > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.04)',
                          color: m.instructorPayoutDue > 0 ? '#059669' : 'var(--secondary)',
                          fontWeight: 800,
                          fontSize: '1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}>
                          <Wallet size={15} />
                          {m.instructorPayoutDue.toLocaleString()} {m.currency}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                          Montant à payer au formateur
                        </div>
                      </td>

                      {/* Platform Retention */}
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{
                          fontWeight: 700,
                          color: 'var(--primary)',
                          fontSize: '0.95rem',
                        }}>
                          +{m.platformRetention.toLocaleString()} {m.currency}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>
                          Commission retenue ({100 - sharePercentage}%)
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedInstructorId(item.instructor.id)}
                          style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--surface-color, #fff)',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-color, #fff)'; e.currentTarget.style.color = 'var(--primary)'; }}
                        >
                          Détails <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detailed Financial Breakdown Modal ── */}
      {selectedInstructor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 1000,
        }}
          onClick={() => setSelectedInstructorId(null)}
        >
          <div
            style={{
              background: 'var(--surface-color, #fff)',
              borderRadius: '24px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {selectedInstructor.instructor.avatar ? (
                  <img
                    src={selectedInstructor.instructor.avatar}
                    alt=""
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                ) : (
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.3rem',
                  }}>
                    {(selectedInstructor.instructor.firstName?.[0] || 'F').toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-color)' }}>
                    {selectedInstructor.instructor.firstName} {selectedInstructor.instructor.lastName}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.82rem', color: 'var(--secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Mail size={13} /> {selectedInstructor.instructor.email}
                    </span>
                    {selectedInstructor.instructor.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={13} /> {selectedInstructor.instructor.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedInstructorId(null)}
                style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Payout Statement Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.12) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  💰 Montant Total à Reverser (Payout)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#047857', marginTop: '0.2rem' }}>
                  {selectedInstructor.metrics.instructorPayoutDue.toLocaleString()} {selectedInstructor.metrics.currency}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#065f46', marginTop: '0.15rem' }}>
                  Calculé sur un chiffre d'affaires brut de <strong>{selectedInstructor.metrics.totalRevenueGenerated.toLocaleString()} {selectedInstructor.metrics.currency}</strong> ({sharePercentage}% au formateur)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Part Plateforme Retenue :</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {selectedInstructor.metrics.platformRetention.toLocaleString()} {selectedInstructor.metrics.currency} ({100 - sharePercentage}%)
                </div>
              </div>
            </div>

            {/* Teaching Overview: Groups & Courses */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={17} style={{ color: 'var(--primary)' }} /> Groupes de Classe Encadrés ({selectedInstructor.groups.length})
              </h4>
              {selectedInstructor.groups.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontStyle: 'italic' }}>
                  Aucun groupe de classe assigné pour le moment.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {selectedInstructor.groups.map((g) => (
                    <div key={g.id} style={{ padding: '0.85rem', borderRadius: '12px', background: 'var(--bg-color, #f8fafc)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)' }}>
                        💬 {g.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>
                        Cours: {g.courseTitle}
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', marginTop: '0.35rem' }}>
                        👥 {g.studentsCount} étudiant(s) inscrits
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Courses Breakdown */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={17} style={{ color: 'var(--primary)' }} /> Ventilation par Formation
              </h4>
              {selectedInstructor.courses.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontStyle: 'italic' }}>
                  Aucune formation associée.
                </p>
              ) : (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-color, #f8fafc)', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Cours</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Prix</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Ventes</th>
                        <th style={{ padding: '0.75rem 1rem' }}>CA Généré</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Part Formateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInstructor.courses.map((c) => (
                        <tr key={c.courseId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-color)' }}>{c.title}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--secondary)' }}>{c.price} MAD</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.paymentsCount}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-color)' }}>{c.revenueGenerated} MAD</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#059669', textAlign: 'right' }}>{c.instructorEarnings} MAD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Payments Breakdown */}
            {selectedInstructor.recentPayments.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={17} style={{ color: 'var(--primary)' }} /> Dernières Ventes Enregistrées
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedInstructor.recentPayments.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', borderRadius: '10px', background: 'var(--bg-color, #f8fafc)', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>{p.studentName}</span>
                        <span style={{ color: 'var(--secondary)', marginLeft: '0.5rem' }}>({p.courseTitle})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{p.amount} {p.currency}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : 'Confirmé'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
