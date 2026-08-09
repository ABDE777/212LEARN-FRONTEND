import { useMemo, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, BookOpen, Folder, Settings, User, LogOut, FileText, Pencil, Trash2, BarChart3, TrendingUp, DollarSign, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight, RotateCcw, Lock, Plus, Mail, X, Loader, Wallet, CheckCircle, XCircle, Clock, Activity, Server, Search, Award, Download, Printer } from 'lucide-react';
import { useWafacash } from '../hooks/useWafacash';
import {
  useAdminUsers,
  useAdminCourses,
  useAdminInstructors,
  useAdminCreateCourse,
  useAdminUpdateCourse,
  useAdminDeleteCourse,
  usePublishCourse,
  usePendingKyc,
} from '../hooks/useAdminData';
import { useCategories } from '../hooks/useCategories';
import { useAdminStats } from '../hooks/useAdminStats';
import { useAdminAuditLogs, useSystemDiagnostics } from '../hooks/useAdminAudit';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import CloudinaryImageUpload from '../components/CloudinaryImageUpload';
import Modal from '../components/Modal';

function AdminStatsTab() {
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
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: <Users size={20} />,
    },
    {
      label: 'Cours publiés',
      value: stats.activeCourses ?? 0,
      sub: `${stats.draftCourses ?? 0} en brouillon`,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      icon: <BookOpen size={20} />,
    },
    {
      label: 'Instructeurs',
      value: stats.instructors ?? 0,
      sub: `${stats.admins ?? 0} admin(s)`,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      icon: <TrendingUp size={20} />,
    },
    {
      label: 'Catégories',
      value: stats.totalCategories ?? 0,
      sub: 'Toutes actives',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      icon: <Folder size={20} />,
    },
    {
      label: 'Revenu total',
      value: `${(stats.totalRevenue ?? 0).toLocaleString()} MAD`,
      sub: 'Paiements confirmés',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      icon: <DollarSign size={20} />,
    },
  ];

  const roles = [
    { label: 'Étudiants', count: stats.students ?? 0, color: '#667eea' },
    { label: 'Instructeurs', count: stats.instructors ?? 0, color: '#f5576c' },
    { label: 'Administrateurs', count: stats.admins ?? 0, color: '#43e97b' },
  ];

  const courseBreakdown = [
    { label: 'Publiés', count: stats.activeCourses ?? 0, color: '#43e97b' },
    { label: 'Brouillons', count: stats.draftCourses ?? 0, color: '#fa709a' },
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Users breakdown */}
        <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
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
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#f093fb,#f5576c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>

        <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', borderRadius: '18px', padding: '1.75rem', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(102,126,234,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(250,112,154,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', position: 'relative' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(250,225,64,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} style={{ color: '#fee140' }} />
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
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#43e97b,#38f9d7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Activity size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>Santé de la plateforme</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--secondary)' }}>Indicateurs clés</p>
            </div>
          </div>

          {[
            { label: 'Taux de publication', pct: totalCourses > 0 ? ((stats.activeCourses ?? 0) / totalCourses) * 100 : 0, color: '#43e97b' },
            { label: 'Part étudiants', pct: ((stats.students ?? 0) / total) * 100, color: '#667eea' },
            { label: 'Catégories utilisées', pct: Math.min(100, ((stats.totalCategories ?? 0) / 20) * 100), color: '#f5576c' },
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
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#43e97b' }}>{stats.activeCourses ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Publiés</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#667eea' }}>{stats.totalUsers ?? 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Membres</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


function flattenCategories(categories, level = 0, parentName = '') {
  return categories.flatMap((cat) => {
    const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(level);
    const prefix = level > 0 ? `${indent}└─ ` : '📁 ';
    return [
      {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        parentId: cat.parentId,
        parentName,
        level,
        children: cat.children || [],
        label: level > 0 ? `${cat.name} (${parentName})` : cat.name,
        selectLabel: `${prefix}${cat.name}`,
      },
      ...(cat.children ? flattenCategories(cat.children, level + 1, cat.name) : []),
    ];
  });
}

function getAssignedInstructor(course) {
  if (course.formateur) return course.formateur;

  const instructors = Array.isArray(course.instructors) ? course.instructors : [];

  const preferredInstructor =
    instructors.find((item) => {
      const role = (item.role || '').toLowerCase();
      return role === 'lead_instructor' || role === 'assistant_instructor' || role === 'instructor';
    }) ||
    instructors.find((item) => (item.role || '').toLowerCase() !== 'owner') ||
    instructors[0];

  if (preferredInstructor?.user) return preferredInstructor.user;
  if (course.instructor) return course.instructor;
  if (course.formateurId) return { id: course.formateurId };
  return null;
}

function getCourseInstructorLabel(course) {
  const assigned = getAssignedInstructor(course);
  if (!assigned) return 'Non assigné';
  return `${assigned.firstName || ''} ${assigned.lastName || ''}`.trim() || assigned.email || 'Instructeur';
}

function normalizeCourseForm(course) {
  return {
    title: course.title || '',
    description: course.description || '',
    thumbnail: course.thumbnail || course.imageUrl || '',
    categoryId: course.categoryId || course.category?.id || '',
    price: course.price ?? '',
    level: course.level || '',
    status: course.status || 'draft',
    instructorId: getAssignedInstructor(course)?.id || '',
  };
}

function normalizeCategoryForm(category) {
  return {
    name: category.name || '',
    description: category.description || '',
    parentId: category.parentId || '',
  };
}

function AdminCreateCourseDrawer({
  isOpen,
  onClose,
  flatCategories,
  instructors,
  instructorsLoading,
  onSave,
  saveLoading,
  saveError,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState('');
  const [instructorId, setInstructorId] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setThumbnail('');
    setCategoryId('');
    setPrice('');
    setLevel('');
    setInstructorId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      categoryId,
      price: parseFloat(price),
      instructorId,
    };
    if (description.trim()) payload.description = description.trim();
    if (thumbnail.trim()) payload.thumbnail = thumbnail.trim();
    if (level) payload.level = level;

    await onSave(payload);
    handleClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#fff',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary)', fontWeight: 700 }}>
              Créer un nouveau cours
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Ajoutez un cours au catalogue 212Learn
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--secondary)',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {saveError && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {saveError}
            </div>
          )}

          <form id="admin-create-course-drawer-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Titre du cours *</label>
              <input
                type="text"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                placeholder="Ex: React from Zero to Hero"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Description détaillée du cours..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Image Miniature</label>
              <CloudinaryImageUpload
                value={thumbnail}
                onChange={(url) => setThumbnail(url)}
                placeholder="Glissez ou cliquez pour uploader la miniature du cours"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Prix (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                  required
                  placeholder="0 pour Gratuit"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Niveau</label>
                <select
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">-- Optionnel --</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Catégorie *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.selectLabel || cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Instructeur *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                required
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                disabled={instructorsLoading}
              >
                <option value="">
                  {instructorsLoading ? 'Chargement...' : '-- Sélectionner un instructeur --'}
                </option>
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.firstName} {inst.lastName} ({inst.email})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '1rem',
            background: '#fafafa',
          }}
        >
          <button
            type="submit"
            form="admin-create-course-drawer-form"
            disabled={saveLoading || instructorsLoading || !instructorId}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {saveLoading ? <Loader size={16} className="spin" /> : null}
            {saveLoading ? 'Création en cours...' : 'Créer le cours'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.92rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--secondary)',
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminUserFormDrawer({
  isOpen,
  onClose,
  editingUser,
  formData,
  setFormData,
  onSubmit,
  loading,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#fff',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary)', fontWeight: 700 }}>
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              {editingUser ? `Édition du compte de ${editingUser.firstName || editingUser.email}` : 'Ajouter un nouveau compte à 212Learn'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--secondary)',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form id="admin-user-drawer-form" onSubmit={onSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Prénom *</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                  required
                  placeholder="Ex: Yassine"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Nom *</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                  required
                  placeholder="Ex: El Amrani"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Email *</label>
              <input
                type="email"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Rôle *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
              </label>
              <input
                type="password"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required={!editingUser}
                placeholder={editingUser ? '••••••••' : 'Minimum 8 caractères'}
                autoComplete={editingUser ? 'new-password' : 'new-password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Bio</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Courte présentation de l'utilisateur"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '1rem',
            background: '#fafafa',
          }}
        >
          <button
            type="submit"
            form="admin-user-drawer-form"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: loading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading && <Loader size={16} className="spin" />}
            {loading ? 'Enregistrement...' : (editingUser ? 'Enregistrer les modifications' : 'Créer l\'utilisateur')}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.92rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--secondary)',
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminCategoryDrawer({
  isOpen,
  onClose,
  editingCategory,
  parentCategoryId,
  flatCategories,
  onSave,
  saveLoading,
  saveError,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [isSubcategory, setIsSubcategory] = useState(false);

  // Top-level categories only (for parent dropdown)
  const parentOptions = flatCategories.filter((cat) => !cat.parentId);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || '');
      setDescription(editingCategory.description || '');
      const pid = editingCategory.parentId || '';
      setParentId(pid);
      setIsSubcategory(!!pid);
    } else {
      setName('');
      setDescription('');
      const pid = parentCategoryId || '';
      setParentId(pid);
      setIsSubcategory(!!pid);
    }
  }, [editingCategory, parentCategoryId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      parentId: isSubcategory ? (parentId || null) : null,
    };
    try {
      await onSave(editingCategory ? editingCategory.id : null, payload);
    } catch {
      // Error is displayed via saveError prop - stay open
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#fff',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary)', fontWeight: 700 }}>
              {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              {editingCategory ? editingCategory.name : 'Ajoutez une nouvelle catégorie au catalogue'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--secondary)',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {saveError && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {saveError}
            </div>
          )}

          <form id="admin-category-drawer-form" onSubmit={handleSubmit}>

            {/* Type Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.88rem' }}>
                Type de catégorie *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: false, icon: '📁', label: 'Catégorie principale', sublabel: 'Niveau racine', activeBg: 'rgba(27,75,90,0.08)', activeBorder: 'var(--primary)', activeColor: 'var(--primary)' },
                  { value: true,  icon: '📄', label: 'Sous-catégorie',       sublabel: 'Appartient à une catégorie', activeBg: 'rgba(193,101,47,0.08)', activeBorder: 'var(--accent)', activeColor: 'var(--accent)' },
                ].map(({ value, icon, label, sublabel, activeBg, activeBorder, activeColor }) => {
                  const isActive = isSubcategory === value;
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => { setIsSubcategory(value); if (!value) setParentId(''); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                        padding: '1rem 0.75rem', borderRadius: '12px',
                        border: `2px solid ${isActive ? activeBorder : 'var(--border-color)'}`,
                        background: isActive ? activeBg : '#fafafa',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 0 0 3px ${activeBorder}22` : 'none',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isActive ? activeColor : 'var(--text-color)' }}>{label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parent dropdown — only when subcategory selected */}
            {isSubcategory && (
              <div className="form-group" style={{ marginBottom: '1.25rem', animation: 'fadeIn 0.2s ease' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>
                  Catégorie parente *
                </label>
                {parentOptions.length === 0 ? (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: '#fff8e1', border: '1px solid #ffe082', fontSize: '0.85rem', color: '#856404' }}>
                    ⚠️ Aucune catégorie principale disponible. Créez d&apos;abord une catégorie principale.
                  </div>
                ) : (
                  <select
                    className="form-control"
                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                    required
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                  >
                    <option value="">-- Choisir une catégorie parente --</option>
                    {parentOptions
                      .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
                      ))}
                  </select>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Nom *</label>
              <input
                type="text"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                placeholder={isSubcategory ? 'Ex: React, TensorFlow...' : 'Ex: Développement Web, IA...'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Description optionnelle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '1rem',
            background: '#fafafa',
          }}
        >
          <button
            type="submit"
            form="admin-category-drawer-form"
            disabled={saveLoading}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: saveLoading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {saveLoading && <Loader size={16} className="spin" />}
            {saveLoading ? 'Enregistrement...' : (editingCategory ? 'Enregistrer les modifications' : 'Créer la catégorie')}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.92rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--secondary)',
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminEditCourseDrawer({
  course,
  onClose,
  flatCategories,
  instructors,
  instructorsLoading,
  onSave,
  saveLoading,
  saveError,
}) {
  const [form, setForm] = useState(() => normalizeCourseForm(course));

  useEffect(() => {
    if (course) {
      setForm(normalizeCourseForm(course));
    }
  }, [course]);

  if (!course) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(course.id, form);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#fff',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary)', fontWeight: 700 }}>
              Modifier le cours
            </h2>
            <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
              {course.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--secondary)',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {saveError && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              {saveError}
            </div>
          )}

          <form id="admin-edit-course-drawer-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Titre du cours *</label>
              <input
                type="text"
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Description</label>
              <textarea
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                rows={3}
                placeholder="Description détaillée du cours..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Image Miniature</label>
              <CloudinaryImageUpload
                value={form.thumbnail}
                onChange={(url) => setForm((prev) => ({ ...prev, thumbnail: url }))}
                placeholder="Glissez ou cliquez pour uploader une nouvelle miniature"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Prix (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                  required
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Niveau</label>
                <select
                  className="form-control"
                  style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                  value={form.level}
                  onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                >
                  <option value="">-- Optionnel --</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
            </div>

            {/* Status Field */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600, fontSize: '0.88rem' }}>Statut de publication</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { value: 'published', label: '✅ Publié', bg: 'rgba(40,167,69,0.08)', border: 'rgba(40,167,69,0.3)', color: '#155724', activeBg: '#d4edda', activeBorder: '#28a745' },
                  { value: 'draft', label: '📝 Brouillon', bg: 'rgba(232,163,61,0.08)', border: 'rgba(232,163,61,0.3)', color: '#856404', activeBg: '#fff3cd', activeBorder: '#e8a33d' },
                  { value: 'archived', label: '🗃️ Archivé', bg: 'rgba(108,117,125,0.08)', border: 'rgba(108,117,125,0.3)', color: '#495057', activeBg: '#e9ecef', activeBorder: '#6c757d' },
                ].map(({ value, label, bg, border, color, activeBg, activeBorder }) => {
                  const isActive = form.status === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, status: value }))}
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.5rem',
                        borderRadius: '10px',
                        border: `2px solid ${isActive ? activeBorder : border}`,
                        background: isActive ? activeBg : bg,
                        color,
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 0 0 3px ${activeBorder}33` : 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Catégorie *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                required
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.selectLabel || cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.88rem' }}>Instructeur *</label>
              <select
                className="form-control"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                value={form.instructorId}
                onChange={(e) => setForm((prev) => ({ ...prev, instructorId: e.target.value }))}
                disabled={instructorsLoading}
              >
                <option value="">
                  {instructorsLoading ? 'Chargement...' : '-- Sélectionner un instructeur --'}
                </option>
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.firstName} {inst.lastName} ({inst.email})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '1rem',
            background: '#fafafa',
          }}
        >
          <button
            type="submit"
            form="admin-edit-course-drawer-form"
            disabled={saveLoading}
            className="btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.92rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {saveLoading ? <Loader size={16} className="spin" /> : null}
            {saveLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.92rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--secondary)',
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminCourseCard({
  course,
  flatCategories,
  instructors,
  instructorsLoading,
  onPublish,
  publishLoading,
  onEdit,
  onDelete,
  deleteLoading,
  isDraft = false,
}) {
  const isPublished = course.status === 'published';
  const levelLabel = course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : course.level === 'advanced' ? 'Avancé' : (course.level || 'Général');


  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: 'var(--neu-shadow-raised)',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--neu-shadow-raised)';
      }}
    >
      {/* Course Banner Top */}
      <div
        style={{
          height: '110px',
          background: course.thumbnail || course.imageUrl
            ? `url(${course.thumbnail || course.imageUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #1B4B5A 0%, #2A6F84 50%, #C1652F 100%)',
          position: 'relative',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Price Tag */}
        <span
          style={{
            background: 'rgba(27, 75, 90, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '0.3rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {course.price ? `${course.price} MAD` : 'GRATUIT'}
        </span>

        {/* Status Badge */}
        {(() => {
          const statusLower = (course.status || 'draft').toLowerCase();
          const badgeBg = statusLower === 'published'
            ? 'rgba(40, 167, 69, 0.9)'
            : statusLower === 'archived'
            ? 'rgba(108, 117, 125, 0.9)'
            : 'rgba(232, 163, 61, 0.9)';
          const badgeLabel = statusLower === 'published'
            ? 'Publié'
            : statusLower === 'archived'
            ? 'Archivé'
            : 'Brouillon';

          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: badgeBg,
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              {badgeLabel}
            </span>
          );
        })()}
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.4rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category & Level Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.65rem',
              borderRadius: '8px',
              background: 'rgba(193, 101, 47, 0.08)',
              color: 'var(--primary)',
            }}
          >
            <Folder size={12} />
            {course.category?.name || 'Général'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.65rem',
              borderRadius: '8px',
              background: 'rgba(27, 75, 90, 0.08)',
              color: 'var(--secondary)',
            }}
          >
            <Award size={12} />
            {levelLabel}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--secondary)',
            marginBottom: '0.5rem',
            lineHeight: 1.35,
          }}
        >
          {course.title}
        </h3>

        {/* Description Excerpt */}
        {course.description && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-color)',
              opacity: 0.75,
              marginBottom: '1rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description}
          </p>
        )}

        {/* Instructor Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-color)',
            borderRadius: '12px',
            boxShadow: 'var(--neu-shadow-inset-sm)',
            marginBottom: '1.25rem',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            <User size={14} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getCourseInstructorLabel(course)}
          </span>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(43, 38, 34, 0.06)' }}>
          {isDraft && (
            <button
              type="button"
              onClick={() => onPublish(course.id)}
              disabled={publishLoading}
              className="btn-primary"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                fontSize: '0.82rem',
              }}
            >
              {publishLoading ? <Loader size={14} className="spin" /> : <ShieldCheck size={14} />}
              Publier
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(course)}
            style={{
              flex: isDraft ? '0 0 auto' : 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              background: 'var(--bg-color)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: 'var(--neu-shadow-raised-sm)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'var(--secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            <Pencil size={14} />
            Modifier
          </button>

            <button
              type="button"
              onClick={() => onDelete(course.id, course.title)}
              disabled={deleteLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(220, 53, 69, 0.08)',
                color: '#dc3545',
                border: '1px solid rgba(220, 53, 69, 0.2)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={14} />
              {deleteLoading ? '...' : ''}
            </button>
          </div>
      </div>
    </div>
  );
}

function AdminSubcategoryItem({
  subcategory,
  onEdit,
  onDelete,
  deleteLoading,
}) {
  return (
    <div style={{ padding: '0.75rem 1rem', background: '#fff', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>└─ 📄</span>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-color)' }}>{subcategory.name}</span>
            {subcategory.description && (
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginLeft: '0.5rem' }}>
                — {subcategory.description}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(subcategory)}
            style={{ padding: '0.35rem 0.68rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-color)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Pencil size={12} /> Éditer
          </button>
          <button
            type="button"
            onClick={() => onDelete(subcategory.id, subcategory.name)}
            disabled={deleteLoading}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(220,53,69,0.2)', background: 'rgba(220,53,69,0.08)', color: '#dc3545', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminCategoryCard({
  category,
  onEdit,
  onDelete,
  deleteLoading,
  onAddSubcategory,
}) {
  const subcategories = category.children || [];

  return (
    <div
      style={{
        borderRadius: '16px',
        background: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: 'var(--neu-shadow-raised)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Category Card Header */}
      <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(27,75,90,0.03), rgba(193,101,47,0.03))', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.1rem', flexShrink: 0,
            }}>
              📁
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                {category.name}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600 }}>
                {subcategories.length} {subcategories.length === 1 ? 'sous-catégorie' : 'sous-catégories'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onAddSubcategory(category.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(27,75,90,0.08)', color: 'var(--primary)', border: '1px solid rgba(27,75,90,0.2)',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <Plus size={14} /> Sous-catégorie
            </button>
            <button
              type="button"
              onClick={() => onEdit(category)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: 'var(--bg-color)', color: 'var(--text-color)',
                border: '1px solid var(--border-color)', cursor: 'pointer',
              }}
            >
              <Pencil size={13} /> Modifier
            </button>
            <button
              type="button"
              onClick={() => onDelete(category.id, category.name)}
              disabled={deleteLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(220,53,69,0.08)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.2)',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {category.description && (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', color: 'var(--secondary)', lineHeight: 1.4 }}>
            {category.description}
          </p>
        )}
      </div>

      {/* Subcategories Section */}
      <div style={{ padding: '1.25rem 1.5rem', flex: 1, background: '#fafafa' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Sous-catégories ({subcategories.length})
        </div>

        {subcategories.length === 0 ? (
          <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '10px', textAlign: 'center', background: '#fff' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Aucune sous-catégorie. </span>
            <button
              type="button"
              onClick={() => onAddSubcategory(category.id)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              + En ajouter une
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {subcategories.map((sub) => (
              <AdminSubcategoryItem
                key={sub.id}
                subcategory={sub}
                onEdit={onEdit}
                onDelete={onDelete}
                deleteLoading={deleteLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WafacashTab() {
  const { getPendingPayments, verifyPayment, loading, error } = useWafacash();
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'PAID' | 'REJECTED'
  const [verifyLoading, setVerifyLoading] = useState(null);
  const [notes, setNotes] = useState({});
  const [actionMsg, setActionMsg] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null); // detail modal
  const [selectedReceipt, setSelectedReceipt] = useState(null); // receipt zoom modal

  const loadPayments = useCallback(async (filterOverride) => {
    const targetFilter = filterOverride !== undefined ? filterOverride : statusFilter;
    try {
      const resData = await getPendingPayments(targetFilter);
      const rawPayments = resData?.payments || resData?.data?.payments || resData || [];
      setPayments(Array.isArray(rawPayments) ? rawPayments : []);
    } catch (err) {
      console.error('Failed to load payments', err);
    }
  }, [getPendingPayments, statusFilter]);

  useEffect(() => {
    loadPayments(statusFilter);
  }, [loadPayments, statusFilter]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'pending') {
      return payments.filter(p => ['WAITING_VERIFICATION', 'PENDING'].includes(p.status));
    }
    if (statusFilter === 'PAID') {
      return payments.filter(p => p.status === 'PAID');
    }
    if (statusFilter === 'REJECTED') {
      return payments.filter(p => p.status === 'REJECTED');
    }
    return payments;
  }, [payments, statusFilter]);

  const handleVerify = async (paymentId, action) => {
    setVerifyLoading(paymentId + action);
    setActionMsg(null);
    try {
      await verifyPayment(paymentId, action, notes[paymentId] || '');
      setActionMsg({
        type: 'success',
        text: action === 'approve' ? 'Paiement approuvé ! L\'accès au cours est activé.' : 'Paiement rejeté.',
      });
      setSelectedPayment(null);
      await loadPayments();
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de traiter cette action.',
      });
    } finally {
      setVerifyLoading(null);
    }
  };

  const handleDownloadReceipt = async (receiptUrl, refCode) => {
    if (!receiptUrl) return;
    try {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recu_Wafacash_${refCode || 'paiement'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(receiptUrl, '_blank');
    }
  };

  const handleDownloadInvoice = async (p) => {
    const student = p.enrollment?.user || p.user || p.student;
    const course = p.enrollment?.course || p.course;
    const refCode = p.transactionReference || p.paymentReference || p.reference || '—';
    const currencyStr = p.currency || 'MAD';
    const invoiceDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email : 'Étudiant';
    const studentEmail = student?.email || '—';
    const courseTitle = course?.title || 'Inscription Cours 212 Learn';
    const amountStr = `${p.amount || 0} ${currencyStr}`;

    try {
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      // Colors
      const primary = '#1B4B5A';
      const dark = '#1e293b';
      const gray = '#64748b';

      // Header logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(primary);
      doc.text('212 Learn', 40, 55);

      // Title & Invoice Ref
      doc.setFontSize(22);
      doc.setTextColor(dark);
      doc.text('FACTURE', 555, 50, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont('courier', 'bold');
      doc.setTextColor(gray);
      doc.text(`N° ${refCode}`, 555, 68, { align: 'right' });

      // Divider line
      doc.setDrawColor(27, 75, 90);
      doc.setLineWidth(2);
      doc.line(40, 85, 555, 85);

      // Info Boxes
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.roundedRect(40, 105, 245, 80, 8, 8, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(gray);
      doc.text('FACTURE À', 55, 125);
      doc.setFontSize(12);
      doc.setTextColor(dark);
      doc.text(studentName, 55, 145);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(gray);
      doc.text(studentEmail, 55, 163);

      doc.roundedRect(310, 105, 245, 80, 8, 8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(gray);
      doc.text('DÉTAILS DU PAIEMENT', 325, 125);
      doc.setFontSize(10);
      doc.setTextColor(dark);
      doc.text(`Date : ${invoiceDate}`, 325, 143);
      doc.text(`Méthode : Wafacash`, 325, 158);
      doc.text(`MTCN : ${p.mtcn || '—'}`, 325, 173);

      // Table Header
      doc.setFillColor(27, 75, 90);
      doc.roundedRect(40, 210, 515, 30, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor('#ffffff');
      doc.text('DESCRIPTION', 55, 229);
      doc.text('RÉFÉRENCE', 300, 229);
      doc.text('MONTANT', 540, 229, { align: 'right' });

      // Table Row
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(dark);
      doc.text(courseTitle, 55, 260);
      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      doc.text(refCode, 300, 260);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(amountStr, 540, 260, { align: 'right' });

      // Divider
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(1);
      doc.line(40, 275, 555, 275);

      // Total Row
      doc.setFillColor(248, 250, 252);
      doc.rect(40, 280, 515, 35, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(primary);
      doc.text('TOTAL REGLÉ :', 400, 302, { align: 'right' });
      doc.setFontSize(13);
      doc.text(amountStr, 540, 302, { align: 'right' });

      // Status Badge
      doc.setFillColor(232, 245, 233);
      doc.setDrawColor(200, 230, 201);
      doc.roundedRect(40, 340, 160, 26, 13, 13, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(46, 125, 50);
      doc.text('✓ REGLÉ VIA WAFACASH', 120, 356, { align: 'center' });

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(gray);
      doc.text("212 Learn — Plateforme d'apprentissage en ligne • support@212learn.com", 297, 420, { align: 'center' });

      // Save PDF automatically!
      doc.save(`Facture_${refCode}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      WAITING_VERIFICATION: { bg: '#fff8e1', color: '#b26a00', icon: <Clock size={13} />, label: 'En attente' },
      PENDING:              { bg: '#e8f4fd', color: '#2D8CFF', icon: <Clock size={13} />, label: 'Pending' },
      PAID:                 { bg: '#e8f5e9', color: '#27ae60', icon: <CheckCircle size={13} />, label: 'Payé' },
      REJECTED:             { bg: '#ffebee', color: '#c62828', icon: <XCircle size={13} />, label: 'Rejeté' },
    };
    const s = styles[status] || { bg: '#f5f5f5', color: '#666', icon: null, label: status };
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 11px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, background: s.bg, color: s.color }}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div style={{ width: '100%' }}>

      {/* ── Receipt zoom modal ─────────────────────────────── */}
      {selectedReceipt && createPortal(
        <div
          onClick={() => setSelectedReceipt(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1.5rem' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', background: '#fff', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Reçu Wafacash</h3>
              <button onClick={() => setSelectedReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}><X size={22} /></button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', textAlign: 'center', background: '#f8fafc' }}>
              <img src={selectedReceipt} alt="Reçu" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => handleDownloadReceipt(selectedReceipt, selectedPayment?.transactionReference || 'recu')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
              >
                <Download size={16} /> Télécharger le reçu
              </button>
              <button onClick={() => setSelectedReceipt(null)} style={{ padding: '9px 18px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600, color: 'var(--secondary)' }}>Fermer</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Payment detail slide-over drawer ─────────────────── */}
      {selectedPayment && (() => {
        const p = selectedPayment;
        const student = p.enrollment?.user || p.user || p.student;
        const course = p.enrollment?.course || p.course;
        const refCode = p.transactionReference || p.paymentReference || p.reference || '—';
        const currencyStr = p.currency || 'MAD';
        const isPending = ['WAITING_VERIFICATION', 'PENDING'].includes(p.status);

        return createPortal(
          <div
            onClick={() => setSelectedPayment(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              justifyContent: 'flex-end',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '520px',
                height: '100%',
                background: '#fff',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '1.5rem 2rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))',
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>Détails du paiement</h2>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--secondary)' }}>Référence : <strong style={{ fontFamily: 'monospace' }}>{refCode}</strong></p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--secondary)',
                    padding: '0.4rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Étudiant', value: student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email : '—' },
                    { label: 'Email', value: student?.email || '—' },
                    { label: 'Cours', value: course?.title || '—' },
                    { label: 'Montant', value: p.amount ? `${p.amount} ${currencyStr}` : '—', highlight: true },
                    { label: 'MTCN', value: p.mtcn || '—', mono: true },
                    { label: 'Référence', value: refCode, mono: true },
                    { label: 'Statut', value: null, badge: statusBadge(p.status) },
                    { label: 'Date', value: p.createdAt ? new Date(p.createdAt).toLocaleString('fr-FR') : '—' },
                  ].map(({ label, value, highlight, mono, badge }) => (
                    <div key={label} style={{ background: 'var(--bg-color)', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
                      {badge || (
                        <div style={{ fontSize: '0.92rem', fontWeight: highlight ? 800 : 600, color: highlight ? 'var(--primary)' : 'var(--text-color)', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
                          {value}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Documents & Downloads Section */}
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    📄 Documents & Téléchargements
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(p)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '10px 16px', background: 'var(--primary)', color: '#fff',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem'
                      }}
                    >
                      <Printer size={16} /> Télécharger la facture (PDF)
                    </button>

                    {p.receiptUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(p.receiptUrl, refCode)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '10px 16px', background: '#fff', color: 'var(--text-color)',
                          border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem'
                        }}
                      >
                        <Download size={16} /> Télécharger le reçu
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes field */}
                {isPending && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>Notes (optionnel)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Raison du rejet, remarques..."
                      value={notes[p.id] || ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                    />
                  </div>
                )}

                {/* Receipt Preview */}
                {p.receiptUrl && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.5rem' }}>Preuve de paiement (Aperçu du reçu)</div>
                    <div
                      onClick={() => setSelectedReceipt(p.receiptUrl)}
                      style={{ cursor: 'zoom-in', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--border-color)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', maxHeight: '200px' }}
                    >
                      <img src={p.receiptUrl} alt="Reçu" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                    </div>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--secondary)', textAlign: 'center' }}>Cliquer pour agrandir</p>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', background: '#fafafa', display: 'flex', gap: '0.75rem' }}>
                {isPending ? (
                  <>
                    <button
                      onClick={() => handleVerify(p.id, 'approve')}
                      disabled={!!verifyLoading}
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' }}
                    >
                      {verifyLoading === p.id + 'approve' ? <Loader size={15} className="spin" /> : <CheckCircle size={16} />}
                      Approuver
                    </button>
                    <button
                      onClick={() => handleVerify(p.id, 'reject')}
                      disabled={!!verifyLoading}
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' }}
                    >
                      {verifyLoading === p.id + 'reject' ? <Loader size={15} className="spin" /> : <XCircle size={16} />}
                      Rejeter
                    </button>
                  </>
                ) : (
                  <button onClick={() => setSelectedPayment(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer', fontWeight: 600, color: 'var(--secondary)', fontSize: '0.92rem' }}>
                    Fermer
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* ── Page header ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Paiements Wafacash</h2>
          <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.92rem' }}>
            Consultez tous les paiements, filtrez par statut et approuvez ou rejetez les demandes.
          </p>
        </div>
        <button
          onClick={() => loadPayments(statusFilter)}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--surface-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-color)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
        >
          <RotateCcw size={16} /> Actualiser
        </button>
      </div>

      {/* ── Filter Pills (Tous, En attente, Payés, Rejetés) ──── */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: '🌐 Tous' },
          { id: 'pending', label: '⏳ En attente' },
          { id: 'PAID', label: '✅ Payés' },
          { id: 'REJECTED', label: '❌ Rejetés' },
        ].map((tab) => {
          const active = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                loadPayments(tab.id);
              }}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '99px',
                border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
                background: active ? 'var(--primary)' : '#fff',
                color: active ? '#fff' : 'var(--text-color)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: active ? '0 4px 12px rgba(27,75,90,0.2)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {actionMsg && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', background: actionMsg.type === 'success' ? '#e8f5e9' : '#ffebee', color: actionMsg.type === 'success' ? '#2e7d32' : '#c62828', border: `1px solid ${actionMsg.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`, fontWeight: 500 }}>
          {actionMsg.text}
        </div>
      )}

      {error && <p style={{ color: 'var(--error-color)', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}

      {loading && payments.length === 0 ? (
        <LoadingSpinner />
      ) : filteredPayments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4.5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <CheckCircle size={52} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Aucun paiement trouvé</h3>
          <p style={{ color: 'var(--secondary)' }}>Aucune transaction ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color, #f8fafc)', borderBottom: '2px solid var(--border-color)' }}>
                {['Étudiant', 'Cours', 'Référence', 'Statut', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => {
                const student = p.enrollment?.user || p.user || p.student;
                const course = p.enrollment?.course || p.course;
                const refCode = p.transactionReference || p.paymentReference || p.reference || '—';

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPayment(p)}
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Étudiant */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-color)' }}>
                        {student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Étudiant' : 'Étudiant'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '2px' }}>{student?.email || '—'}</div>
                    </td>
                    {/* Cours */}
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-color)', maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course?.title || '—'}</div>
                    </td>
                    {/* Référence */}
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--text-color)', fontWeight: 700 }}>
                      {refCode}
                    </td>
                    {/* Statut */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {statusBadge(p.status)}
                    </td>
                    {/* Chevron hint */}
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--secondary)', textAlign: 'right', fontSize: '1.1rem' }}>
                      ›
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

function AuditLogsTab() {
  const [page, setPage] = useState(1);
  const { logs, pagination, loading, error, refreshAuditLogs } = useAdminAuditLogs(page, 15);

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    let bg = '#ede7f6', color = '#5e35b1';
    if (act.includes('DELETE')) { bg = '#ffebee'; color = '#c62828'; }
    else if (act.includes('RESTORE')) { bg = '#e3f2fd'; color = '#1565c0'; }
    else if (act.includes('VERIFY') || act.includes('CREATE')) { bg = '#e8f5e9'; color = '#2e7d32'; }
    else if (act.includes('UPDATE') || act.includes('RESET')) { bg = '#fff3cd'; color = '#856404'; }

    return (
      <span style={{
        display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: '9999px',
        fontSize: '0.78rem', fontWeight: 700, background: bg, color: color,
        fontFamily: 'monospace',
      }}>
        {action}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>Journal d'audit administratif</h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Historique complet des actions administratives effectuées sur la plateforme.
          </p>
        </div>
        <button
          onClick={() => refreshAuditLogs(page)}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.88rem' }}
        >
          <RotateCcw size={15} /> Actualiser
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
          <FileText size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
          <p style={{ color: 'var(--secondary)' }}>Aucun journal d'audit enregistré pour le moment.</p>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Date & Heure</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Administrateur</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Cible</th>
                  <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        {[log.user?.firstName, log.user?.lastName].filter(Boolean).join(' ') || 'Système'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{log.user?.email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{log.entity}</span>
                      {log.entityId && (
                        <code style={{ display: 'block', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                          ID: {log.entityId.slice(0, 8)}...
                        </code>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                      {log.metadata ? (
                        <pre style={{ margin: 0, fontSize: '0.75rem', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', maxWidth: '240px', overflowX: 'auto' }}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} entrées)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminSettingsTab() {
  const [settings, setSettings] = useState({
    siteName: '212 Learn',
    supportEmail: 'support@212learn.com',
    currency: 'MAD',
    wafacashAutoApprove: false,
    requireKyc: true,
    allowRegistrations: true,
    maintenanceMode: false,
    emailNotifications: true,
  });
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Paramètres de la plateforme</h2>
          <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.92rem' }}>
            Gérez la configuration globale, la sécurité, les modes de paiement et la maintenance.
          </p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.9rem', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
          }}
        >
          <CheckCircle size={16} /> Enregistrer les modifications
        </button>
      </div>

      {savedMsg && (
        <div style={{ padding: '1rem 1.25rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ Paramètres enregistrés avec succès !
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Section 1: Informations Générales */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <Settings size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Informations Générales</h3>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Nom de la plateforme</label>
            <input
              type="text"
              className="form-control"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              style={{ width: '100%', padding: '9px 14px', borderRadius: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Email de support</label>
            <input
              type="email"
              className="form-control"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              style={{ width: '100%', padding: '9px 14px', borderRadius: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>Devise par défaut</label>
            <select
              className="form-control"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              style={{ width: '100%', padding: '9px 14px', borderRadius: '8px' }}
            >
              <option value="MAD">MAD (Dirham Marocain)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Paiements & Wafacash */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <Wallet size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Configuration Wafacash</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Auto-Approbation Démo</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Valider automatiquement les reçus Wafacash en dev</div>
            </div>
            <input
              type="checkbox"
              checked={settings.wafacashAutoApprove}
              onChange={(e) => setSettings({ ...settings, wafacashAutoApprove: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications de paiement</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Alerter l'admin lors d'une nouvelle preuve reçue</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Section 3: Sécurité & Accès */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Sécurité & Utilisateurs</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>KYC Obligatoire pour Instructeurs</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Exiger la validation des pièces d'identité</div>
            </div>
            <input
              type="checkbox"
              checked={settings.requireKyc}
              onChange={(e) => setSettings({ ...settings, requireKyc: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Inscriptions Ouvertes</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Autoriser la création de nouveaux comptes</div>
            </div>
            <input
              type="checkbox"
              checked={settings.allowRegistrations}
              onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Section 4: Maintenance */}
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <Server size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Maintenance Système</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: settings.maintenanceMode ? '#ffebee' : '#f8fafc', borderRadius: '10px', border: `1px solid ${settings.maintenanceMode ? '#ffcdd2' : 'var(--border-color)'}` }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: settings.maintenanceMode ? '#c62828' : 'inherit' }}>Mode Maintenance</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>Restreindre l'accès aux administrateurs uniquement</div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

function SystemHealthTab() {
  const { diagnostics, loading, error, refreshDiagnostics } = useSystemDiagnostics();

  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-color)' }}>Santé & Diagnostics Système</h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--secondary)', fontSize: '0.92rem' }}>
            Surveillance en temps réel de la connectivité BDD, métriques d'exécution et volumes de données.
          </p>
        </div>
        <button
          onClick={refreshDiagnostics}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}
        >
          <RotateCcw size={15} /> Rafraîchir
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}

      {!loading && !error && diagnostics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px', padding: '1.5rem 2rem', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 10px 25px rgba(16,185,129,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#6ee7b7',
                boxShadow: '0 0 12px #6ee7b7', animation: 'pulse 1.5s infinite',
              }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>Base de données connectée</h3>
                <p style={{ margin: '0.2rem 0 0', opacity: 0.9, fontSize: '0.88rem' }}>
                  PostgreSQL Neon Cloud • Temps de réponse DB : <strong>{diagnostics.database?.latencyMs} ms</strong>
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut Global</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>OK • OPÉRATIONNEL</div>
            </div>
          </div>

          {/* Table Row Counters Grid */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '1rem' }}>Volume des données en base (Row Counts)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Utilisateurs', count: diagnostics.database?.counts?.users, icon: <Users size={20} color="#3b82f6" />, bg: '#eff6ff' },
                { label: 'Cours', count: diagnostics.database?.counts?.courses, icon: <BookOpen size={20} color="#8b5cf6" />, bg: '#f5f3ff' },
                { label: 'Inscriptions', count: diagnostics.database?.counts?.enrollments, icon: <CheckCircle size={20} color="#10b981" />, bg: '#ecfdf5' },
                { label: 'Paiements', count: diagnostics.database?.counts?.payments, icon: <Wallet size={20} color="#f59e0b" />, bg: '#fffbeb' },
                { label: 'Journal Audit', count: diagnostics.database?.counts?.auditLogs, icon: <FileText size={20} color="#ec4899" />, bg: '#fdf2f8' },
                { label: 'Catégories', count: diagnostics.database?.counts?.categories, icon: <Folder size={20} color="#06b6d4" />, bg: '#ecfeff' },
              ].map((c, i) => (
                <div key={i} style={{ background: c.bg, padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>{c.label}</span>
                    {c.icon}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
                    {c.count ?? '0'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System & Process Metrics */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '1rem' }}>Métriques du serveur Node.js</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Temps de fonctionnement (Uptime)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {formatUptime(diagnostics.system?.uptimeSeconds)}
                </div>
              </div>
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Mémoire Heap Usée / Totale</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                  {diagnostics.system?.memoryUsage?.heapUsedMb} MB / {diagnostics.system?.memoryUsage?.heapTotalMb} MB
                </div>
              </div>
              <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Version Node.js</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>
                  {diagnostics.system?.nodeVersion} ({diagnostics.system?.environment})
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const USERS_PER_PAGE = 10;
  const [activeTab, setActiveTabState] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) return tabFromUrl;
    const tabFromStorage = localStorage.getItem('admin_active_tab');
    if (tabFromStorage) return tabFromStorage;
    return 'users';
  });

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    localStorage.setItem('admin_active_tab', newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [userSubTab, setUserSubTab] = useState('active');
  const [profileSubTab, setProfileSubTab] = useState('all'); // 'all' | 'profile' | 'security'
  const [userPage, setUserPage] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(null);
  const [userActionMsg, setUserActionMsg] = useState(null);
  const [adminConfirmModal, setAdminConfirmModal] = useState(null);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (userActionMsg) {
      const timer = setTimeout(() => setUserActionMsg(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [userActionMsg]);

  const {
    users,
    loading: usersLoading,
    error: usersError,
    refreshUsers,
    verifyInstructor,
    verifyStudent,
    restoreUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  } = useAdminUsers();
  const {
    users: pendingKycUsers,
    loading: pendingKycLoading,
    error: pendingKycError,
    refreshPendingKyc,
  } = usePendingKyc();
  const { courses, loading: coursesLoading, error: coursesError, refreshCourses } = useAdminCourses();
  const { instructors, loading: instructorsLoading, error: instructorsError } = useAdminInstructors();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const { createCourse, loading: createCourseLoading } = useAdminCreateCourse();
  const { updateCourse, loading: updateCourseLoading, error: updateCourseError } = useAdminUpdateCourse();
  const { deleteCourse, loading: deleteCourseLoading, error: deleteCourseError } = useAdminDeleteCourse();
  const { publishCourse, loading: publishLoading, error: publishError } = usePublishCourse();
  const { user, logout } = useAuth();

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const deletedUsers = useMemo(() => users.filter(u => u.deletedAt), [users]);
  const activeUsers = useMemo(() => users.filter(u => !u.deletedAt), [users]);
  const unverifiedUsers = useMemo(() => activeUsers.filter(u => !u.isVerified), [activeUsers]);

  const baseSubTabUsers = userSubTab === 'deleted' ? deletedUsers
    : userSubTab === 'unverified' ? unverifiedUsers
    : userSubTab === 'kyc' ? pendingKycUsers
    : activeUsers;

  const listLoading = userSubTab === 'kyc' ? pendingKycLoading : usersLoading;
  const listError = userSubTab === 'kyc' ? pendingKycError : usersError;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = userSearch.trim().toLowerCase();

    return baseSubTabUsers.filter((listedUser) => {
      const matchesRole = userRoleFilter === 'all' || (listedUser.role || '').toLowerCase() === userRoleFilter;
      const fullName = `${listedUser.firstName || ''} ${listedUser.lastName || ''}`.trim().toLowerCase();
      const email = (listedUser.email || '').toLowerCase();
      const id = (listedUser.id || '').toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        id.includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [baseSubTabUsers, userRoleFilter, userSearch]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, userPage]);

  const [adminCourseSearch, setAdminCourseSearch] = useState('');
  const [adminCourseCategoryFilter, setAdminCourseCategoryFilter] = useState('');
  const [adminCourseStatusFilter, setAdminCourseStatusFilter] = useState('all');

  const filteredAllCourses = useMemo(() => {
    return courses.filter((c) => {
      const titleMatch = (c.title || '').toLowerCase().includes(adminCourseSearch.toLowerCase());
      const instructorLabel = getCourseInstructorLabel(c).toLowerCase();
      const instructorMatch = instructorLabel.includes(adminCourseSearch.toLowerCase());
      const categoryMatch = !adminCourseCategoryFilter || c.categoryId === adminCourseCategoryFilter || c.category?.id === adminCourseCategoryFilter;
      
      const currentStatus = (c.status || 'draft').toLowerCase();
      const statusMatch = adminCourseStatusFilter === 'all' || currentStatus === adminCourseStatusFilter.toLowerCase();

      return (titleMatch || instructorMatch) && categoryMatch && statusMatch;
    });
  }, [courses, adminCourseSearch, adminCourseCategoryFilter, adminCourseStatusFilter]);

  const draftCourses = useMemo(
    () => filteredAllCourses.filter((course) => (course.status || '').toLowerCase() === 'draft'),
    [filteredAllCourses]
  );
  const publishedCourses = useMemo(
    () => filteredAllCourses.filter((course) => (course.status || '').toLowerCase() !== 'draft'),
    [filteredAllCourses]
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState(null);
  const [categorySuccess, setCategorySuccess] = useState('');

  // Category Drawer state
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState(null);
  const [drawerCategoryParentId, setDrawerCategoryParentId] = useState('');
  const [categoryDrawerLoading, setCategoryDrawerLoading] = useState(false);
  const [categoryDrawerError, setCategoryDrawerError] = useState(null);

  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const [showCreateCourseDrawer, setShowCreateCourseDrawer] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseCategoryId, setCourseCategoryId] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseLevel, setCourseLevel] = useState('');
  const [courseInstructorId, setCourseInstructorId] = useState('');
  const [createCourseError, setCreateCourseError] = useState(null);
  const [createCourseSuccess, setCreateCourseSuccess] = useState(false);
  const [courseActionSuccess, setCourseActionSuccess] = useState('');

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    bio: '',
  });
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState(null);

  const handleVerifyUser = async (userId, role, isVerified = true) => {
    setUserActionLoading(userId);
    setUserActionMsg(null);
    try {
      const effectiveRole = (role || '').toLowerCase() || (userSubTab === 'kyc' ? 'instructor' : 'student');
      if (effectiveRole === 'instructor') {
        await verifyInstructor(userId, isVerified);
      } else {
        await verifyStudent(userId, isVerified);
      }
      await refreshUsers();
      await refreshPendingKyc();
      setUserActionMsg({ type: 'success', text: isVerified ? 'Utilisateur vérifié avec succès.' : 'Vérification retirée.' });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserActionMsg({ type: 'error', text: 'Endpoint de vérification non disponible. Vérifiez que le backend implémente les routes PATCH /admin/users/:id/verify et PATCH /admin/users/:id/verify-student.' });
      } else {
        setUserActionMsg({ type: 'error', text: msg || 'Impossible de vérifier cet utilisateur.' });
      }
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleCreateUserClick = () => {
    setEditingUser(null);
    setUserFormData({ firstName: '', lastName: '', email: '', password: '', role: 'student', bio: '' });
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleEditUserClick = (listedUser) => {
    setEditingUser(listedUser);
    setUserFormData({
      firstName: listedUser.firstName || '',
      lastName: listedUser.lastName || '',
      email: listedUser.email || '',
      password: '',
      role: listedUser.role || 'student',
      bio: listedUser.bio || '',
    });
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserFormError(null);
    try {
      const payload = {
        firstName: userFormData.firstName.trim(),
        lastName: userFormData.lastName.trim(),
        email: userFormData.email.trim(),
        role: userFormData.role,
        bio: userFormData.bio.trim(),
      };

      if (editingUser) {
        if (userFormData.password.trim()) payload.password = userFormData.password.trim();
        await updateUser(editingUser.id, payload);
        setUserActionMsg({ type: 'success', text: 'Utilisateur mis à jour avec succès.' });
      } else {
        payload.password = userFormData.password.trim();
        await createUser(payload);
        setUserActionMsg({ type: 'success', text: 'Utilisateur créé avec succès.' });
      }
      await refreshUsers();
      await refreshPendingKyc();
      setShowUserForm(false);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.response?.data?.message;
      if (status === 404) {
        setUserFormError(editingUser
          ? 'Endpoint de mise à jour non disponible. Implémentez PATCH /admin/users/:userId côté backend.'
          : 'Endpoint de création non disponible. Implémentez POST /admin/users côté backend.');
      } else {
        setUserFormError(msg || 'Erreur lors de l\'enregistrement de l\'utilisateur.');
      }
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setAdminConfirmModal({
      type: 'delete',
      title: 'Supprimer l\'utilisateur',
      description: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ? Son compte sera immédiatement désactivé.`,
      icon: <Trash2 size={24} color="#dc2626" />,
      btnColor: '#dc2626',
      btnText: 'Oui, supprimer',
      onConfirm: async () => {
        setUserActionLoading(userId);
        setUserActionMsg(null);
        try {
          await deleteUser(userId);
          await refreshUsers();
          await refreshPendingKyc();
          setUserActionMsg({ type: 'success', text: `Le compte de "${userName}" a été supprimé avec succès.` });
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message;
          setUserActionMsg({ type: 'error', text: msg || 'Impossible de supprimer cet utilisateur.' });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleResetPassword = (userId, userName) => {
    setAdminConfirmModal({
      type: 'resetPassword',
      title: 'Réinitialiser le mot de passe',
      description: `Voulez-vous envoyer un e-mail de réinitialisation de mot de passe à "${userName}" ? Un lien sécurisé valable 5 minutes lui sera immédiatement envoyé.`,
      icon: <Mail size={24} color="var(--primary)" />,
      btnColor: 'var(--primary)',
      btnText: 'Envoyer l\'e-mail',
      onConfirm: async () => {
        setUserActionLoading(userId);
        setUserActionMsg(null);
        try {
          await resetPassword(userId);
          setUserActionMsg({ type: 'success', text: `E-mail de réinitialisation envoyé avec succès à "${userName}".` });
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message;
          setUserActionMsg({ type: 'error', text: msg || 'Impossible d\'envoyer l\'e-mail de réinitialisation.' });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleRestoreUser = (userId, userName) => {
    setAdminConfirmModal({
      type: 'restore',
      title: 'Restaurer le compte utilisateur',
      description: `Voulez-vous restaurer le compte de "${userName}" ? L'utilisateur retrouvera immédiatement l'accès à son compte.`,
      icon: <RotateCcw size={24} color="#1565c0" />,
      btnColor: '#1565c0',
      btnText: 'Restaurer le compte',
      onConfirm: async () => {
        setUserActionLoading(userId);
        setUserActionMsg(null);
        try {
          await restoreUser(userId);
          await refreshUsers();
          setUserActionMsg({ type: 'success', text: `Le compte de "${userName}" a été restauré avec succès.` });
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.response?.data?.message;
          setUserActionMsg({ type: 'error', text: msg || 'Impossible de restaurer cet utilisateur.' });
        } finally {
          setUserActionLoading(null);
          setAdminConfirmModal(null);
        }
      },
    });
  };

  const handleUserSubTabChange = (tab) => {
    setUserSubTab(tab);
    setUserPage(1);
    setUserSearch('');
    setUserRoleFilter('all');
    setUserActionMsg(null);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);
    setCategorySuccess('');
    try {
      const payload = { name: catName.trim() };
      if (catDesc.trim()) payload.description = catDesc.trim();
      if (catParentId) payload.parentId = catParentId;
      await createCategory(payload);
      setCreateSuccess(true);
      setCategorySuccess('Catégorie créée avec succès.');
      setCatName('');
      setCatDesc('');
      setCatParentId('');
      setTimeout(() => {
        setShowAddForm(false);
        setCreateSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCreateError(err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de la création de la catégorie.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId, form) => {
    setCategoryActionError(null);
    setCategorySuccess('');
    try {
      const payload = { name: form.name.trim() };
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.parentId) payload.parentId = form.parentId;
      await updateCategory(categoryId, payload);
      setCategorySuccess('Catégorie mise à jour avec succès.');
    } catch (err) {
      setCategoryActionError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la mise à jour de la catégorie.'
      );
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const confirmed = window.confirm(`Supprimer la catégorie "${categoryName}" ?`);
    if (!confirmed) return;

    setCategoryActionError(null);
    setCategorySuccess('');
    try {
      await deleteCategory(categoryId);
      setCategorySuccess('Catégorie supprimée avec succès.');
    } catch (err) {
      setCategoryActionError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la suppression de la catégorie.'
      );
    }
  };

  const handleOpenCreateCategoryDrawer = () => {
    setEditingCategoryData(null);
    setDrawerCategoryParentId('');
    setCategoryDrawerError(null);
    setShowCategoryDrawer(true);
  };

  const handleOpenEditCategoryDrawer = (category) => {
    setEditingCategoryData(category);
    setDrawerCategoryParentId(category.parentId || '');
    setCategoryDrawerError(null);
    setShowCategoryDrawer(true);
  };

  const handleOpenAddSubcategoryDrawer = (parentId) => {
    setEditingCategoryData(null);
    setDrawerCategoryParentId(parentId);
    setCategoryDrawerError(null);
    setShowCategoryDrawer(true);
  };

  const handleCategoryDrawerSave = async (categoryId, payload) => {
    setCategoryDrawerLoading(true);
    setCategoryDrawerError(null);
    try {
      if (categoryId) {
        await updateCategory(categoryId, payload);
        setCategorySuccess('Catégorie mise à jour avec succès.');
      } else {
        await createCategory(payload);
        setCategorySuccess('Catégorie créée avec succès.');
      }
      await refreshCategories();
      setShowCategoryDrawer(false);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Erreur lors de l\'enregistrement.';
      setCategoryDrawerError(msg);
      throw err;
    } finally {
      setCategoryDrawerLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateCourseError(null);
    setCreateCourseSuccess(false);
    setCourseActionSuccess('');
    try {
      const payload = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        categoryId: courseCategoryId,
        price: parseFloat(coursePrice),
        instructorId: courseInstructorId,
      };
      if (courseThumbnail.trim()) payload.thumbnail = courseThumbnail.trim();
      if (courseLevel) payload.level = courseLevel;

      await createCourse(payload);
      setCreateCourseSuccess(true);
      setCourseActionSuccess('Cours créé avec succès.');
      setCourseTitle('');
      setCourseDescription('');
      setCourseThumbnail('');
      setCourseCategoryId('');
      setCoursePrice('');
      setCourseLevel('');
      setCourseInstructorId('');
      await refreshCourses();
      setTimeout(() => {
        setShowCreateCourseModal(false);
        setCreateCourseSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setCreateCourseError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Erreur lors de la création du cours.'
      );
    }
  };

  const handleOpenCreateCourseModal = () => {
    setShowCreateCourseDrawer(true);
  };

  const handleOpenEditCourseModal = (course) => {
    setEditingCourse(course);
  };

  const handleCreateCourseSubmit = async (payload) => {
    await createCourse(payload);
    await refreshCourses();
    setCourseActionSuccess('Cours créé avec succès.');
  };

  const handleUpdateCourse = async (courseId, form) => {
    setCourseActionSuccess('');
    try {
      const payload = {
        title: form.title.trim(),
        categoryId: form.categoryId,
        price: parseFloat(form.price),
      };

      if (form.description.trim()) payload.description = form.description.trim();
      if (form.thumbnail.trim()) payload.thumbnail = form.thumbnail.trim();
      if (form.level) payload.level = form.level;
      if (form.status) payload.status = form.status;
      if (form.instructorId) payload.instructorId = form.instructorId;

      await updateCourse(courseId, payload);
      await refreshCourses();
      setCourseActionSuccess('Cours mis à jour avec succès.');
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = window.confirm(`Supprimer le cours "${courseTitle}" ?`);
    if (!confirmed) return;

    setCourseActionSuccess('');
    try {
      await deleteCourse(courseId);
      await refreshCourses();
      setCourseActionSuccess('Cours supprimé avec succès.');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishCourse = async (courseId) => {
    setCourseActionSuccess('');
    try {
      await publishCourse(courseId);
      await refreshCourses();
      setCourseActionSuccess('Le cours a été publié avec succès.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Navbar />

      <div className="dashboard-layout">
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle-btn"
            title={sidebarCollapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab('users')}
              className={`sidebar-menu-btn ${activeTab === 'users' ? 'active' : ''}`}
              title="Users"
            >
              <Users size={18} />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`sidebar-menu-btn ${activeTab === 'courses' ? 'active' : ''}`}
              title="Courses"
            >
              <BookOpen size={18} />
              <span>Courses</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`sidebar-menu-btn ${activeTab === 'categories' ? 'active' : ''}`}
              title="Categories"
            >
              <Folder size={18} />
              <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`sidebar-menu-btn ${activeTab === 'stats' ? 'active' : ''}`}
              title="Statistiques"
            >
              <BarChart3 size={18} />
              <span>Statistiques</span>
            </button>
            <button
              onClick={() => setActiveTab('wafacash')}
              className={`sidebar-menu-btn ${activeTab === 'wafacash' ? 'active' : ''}`}
              title="Paiements"
            >
              <Wallet size={18} />
              <span>Paiements</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`sidebar-menu-btn ${activeTab === 'audit' ? 'active' : ''}`}
              title="Journal d'audit"
            >
              <FileText size={18} />
              <span>Journal d'audit</span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`sidebar-menu-btn ${activeTab === 'health' ? 'active' : ''}`}
              title="Santé système"
            >
              <Activity size={18} />
              <span>Santé système</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`sidebar-menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
              title="Settings"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`sidebar-menu-btn ${['profile', 'security'].includes(activeTab) ? 'active' : ''}`}
              title="Mon Profil & Sécurité"
            >
              <User size={18} />
              <span>Mon Profil & Sécurité</span>
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="sidebar-menu-btn"
              style={{ marginTop: 'auto', color: 'var(--error-color)' }}
              title="Déconnexion"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        <main className="dashboard-main-content">
          <div key={activeTab} className="tab-panel" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {activeTab === 'users' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ marginBottom: '0.4rem', fontSize: '1.5rem' }}>User Management</h2>
                      <p style={{ color: 'var(--secondary)' }}>
                        Gérez les utilisateurs actifs, non vérifiés, en attente de KYC et supprimés.
                      </p>
                    </div>
                    <button
                      onClick={handleCreateUserClick}
                      className="btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      <Plus size={16} />
                      Créer un utilisateur
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[
                      { key: 'active', label: 'Actifs', icon: <Users size={15} />, count: activeUsers.length },
                      { key: 'unverified', label: 'Non vérifiés', icon: <ShieldAlert size={15} />, count: unverifiedUsers.length },
                      { key: 'kyc', label: 'KYC en attente', icon: <ShieldCheck size={15} />, count: pendingKycUsers.length },
                      { key: 'deleted', label: 'Supprimés', icon: <Trash2 size={15} />, count: deletedUsers.length },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => handleUserSubTabChange(tab.key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                          padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600,
                          cursor: 'pointer', border: '1.5px solid',
                          borderColor: userSubTab === tab.key ? 'var(--primary)' : 'var(--border-color)',
                          background: userSubTab === tab.key ? 'rgba(193,101,47,0.08)' : '#fff',
                          color: userSubTab === tab.key ? 'var(--primary)' : 'var(--secondary)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                        <span style={{
                          marginLeft: '0.15rem', padding: '0.1rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.75rem', fontWeight: 700,
                          background: userSubTab === tab.key ? 'var(--primary)' : 'var(--border-color)',
                          color: userSubTab === tab.key ? '#fff' : 'var(--secondary)',
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Action message */}
                  {userActionMsg && (
                    <div style={{
                      padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
                      background: userActionMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                      border: `1px solid ${userActionMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                      color: userActionMsg.type === 'success' ? '#155724' : '#721c24',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{userActionMsg.text}</span>
                      <button onClick={() => setUserActionMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>×</button>
                    </div>
                  )}

                  {/* Filters row - Horizontal side-by-side */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 260px', position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="Rechercher par nom, email ou ID..."
                        value={userSearch}
                        onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-body)',
                          background: 'var(--surface-color)',
                          color: 'var(--text-color)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ flex: '0 1 200px', minWidth: '160px' }}>
                      <select
                        value={userRoleFilter}
                        onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-body)',
                          background: 'var(--surface-color)',
                          color: 'var(--text-color)',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="all">Tous les rôles</option>
                        <option value="student">Étudiants</option>
                        <option value="instructor">Instructeurs</option>
                        <option value="admin">Administrateurs</option>
                      </select>
                    </div>
                    {(userSearch || userRoleFilter !== 'all') && (
                      <button
                        onClick={() => { setUserSearch(''); setUserRoleFilter('all'); setUserPage(1); }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'transparent',
                          color: 'var(--secondary)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error-color)'; e.currentTarget.style.borderColor = 'var(--error-color)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      >
                        ✕ Réinitialiser
                      </button>
                    )}
                  </div>

                  {listLoading && <LoadingSpinner />}
                  {listError && <p style={{ color: 'var(--error-color)' }}>{listError}</p>}

                  {!listLoading && !listError && filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <Users size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                        {userSubTab === 'deleted'
                          ? 'Aucun utilisateur supprimé.'
                          : userSubTab === 'unverified'
                          ? 'Tous les utilisateurs sont vérifiés.'
                          : userSubTab === 'kyc'
                          ? 'Aucune demande KYC en attente.'
                          : 'Aucun utilisateur ne correspond au filtre.'}
                      </p>
                    </div>
                  )}

                  {!listLoading && !listError && filteredUsers.length > 0 && (
                    <>
                      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-color)' }}>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Nom</th>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Email</th>
                              <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Rôle</th>
                              {userSubTab === 'deleted' && (
                                <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Supprimé le</th>
                              )}
                              {userSubTab === 'unverified' || userSubTab === 'kyc' ? (
                                <th style={{ textAlign: 'left', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Statut</th>
                              ) : null}
                              <th style={{ textAlign: 'right', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedUsers.map((listedUser) => (
                              <tr key={listedUser.id} style={userSubTab === 'deleted' ? { opacity: 0.65 } : undefined}>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    {listedUser.avatar ? (
                                      <img src={listedUser.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                                      }}>
                                        {listedUser.firstName?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                                      {[listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || '—'}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)' }}>
                                  {listedUser.email || '—'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                  {(() => {
                                    const roleVal = (listedUser.role || (userSubTab === 'kyc' ? 'instructor' : '')).toLowerCase();
                                    return (
                                      <span style={{
                                        display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '9999px',
                                        fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                                        background: roleVal === 'admin' ? '#ede7f6' : roleVal === 'instructor' ? '#e8f5e9' : '#e8f4fd',
                                        color: roleVal === 'admin' ? '#5e35b1' : roleVal === 'instructor' ? '#2e7d32' : '#1565c0',
                                      }}>
                                        {roleVal || '—'}
                                      </span>
                                    );
                                  })()}
                                </td>
                                {userSubTab === 'deleted' && (
                                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.85rem' }}>
                                    {listedUser.deletedAt
                                      ? new Date(listedUser.deletedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : '—'}
                                  </td>
                                )}
                                {userSubTab === 'unverified' || userSubTab === 'kyc' ? (
                                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                      padding: '0.2rem 0.6rem', borderRadius: '9999px',
                                      fontSize: '0.78rem', fontWeight: 600,
                                      background: '#fff3cd', color: '#856404',
                                    }}>
                                      <ShieldAlert size={12} /> Non vérifié
                                    </span>
                                  </td>
                                ) : null}
                                <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {(userSubTab === 'unverified' || userSubTab === 'kyc') && (
                                      <button
                                        onClick={() => handleVerifyUser(listedUser.id, listedUser.role, true)}
                                        disabled={userActionLoading === listedUser.id}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                          padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                                          background: userActionLoading === listedUser.id ? '#e8f5e9' : '#155724',
                                          color: '#fff', cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          border: 'none', transition: 'background 0.2s',
                                        }}
                                      >
                                        <ShieldCheck size={14} />
                                        {userActionLoading === listedUser.id ? '...' : 'Vérifier'}
                                      </button>
                                    )}
                                    {userSubTab === 'deleted' && (
                                      <button
                                        onClick={() => handleRestoreUser(listedUser.id)}
                                        disabled={userActionLoading === listedUser.id}
                                        style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                          padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                                          background: userActionLoading === listedUser.id ? '#e3f2fd' : '#1565c0',
                                          color: '#fff', cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          border: 'none', transition: 'background 0.2s',
                                        }}
                                      >
                                        <RotateCcw size={14} />
                                        {userActionLoading === listedUser.id ? '...' : 'Restaurer'}
                                      </button>
                                    )}
                                    {userSubTab === 'active' && (
                                      <>
                                        {(listedUser.role === 'instructor' || listedUser.role === 'student') && (
                                          <button
                                            onClick={() => handleVerifyUser(listedUser.id, listedUser.role, !listedUser.isVerified)}
                                            disabled={userActionLoading === listedUser.id}
                                            style={{
                                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                              padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                              border: '1px solid',
                                              borderColor: listedUser.isVerified ? '#f5c6cb' : '#c3e6cb',
                                              background: listedUser.isVerified ? '#f8d7da' : '#d4edda',
                                              color: listedUser.isVerified ? '#721c24' : '#155724',
                                              cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                            }}
                                          >
                                            {listedUser.isVerified ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                            {listedUser.isVerified ? 'Déverifier' : 'Vérifier'}
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleEditUserClick(listedUser)}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-color)',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Pencil size={13} /> Modifier
                                        </button>
                                        <button
                                          onClick={() => handleResetPassword(listedUser.id, [listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || listedUser.email)}
                                          disabled={userActionLoading === listedUser.id}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--primary)',
                                            cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          }}
                                        >
                                          <Mail size={13} /> Réinit. mdp
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(listedUser.id, [listedUser.firstName, listedUser.lastName].filter(Boolean).join(' ') || listedUser.email)}
                                          disabled={userActionLoading === listedUser.id}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                            border: '1px solid var(--border-color)', background: '#fff', color: 'var(--error-color)',
                                            cursor: userActionLoading === listedUser.id ? 'wait' : 'pointer',
                                          }}
                                        >
                                          <Trash2 size={13} /> Supprimer
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalUserPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                            {(userPage - 1) * USERS_PER_PAGE + 1}–{Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} sur {filteredUsers.length}
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => setUserPage(p => Math.max(1, p - 1))}
                              disabled={userPage === 1}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: '#fff',
                                cursor: userPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: userPage === 1 ? 0.4 : 1,
                              }}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === totalUserPages || Math.abs(p - userPage) <= 1)
                              .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                              }, [])
                              .map((p, idx) => p === '...'
                                ? <span key={`dots-${idx}`} style={{ display: 'flex', alignItems: 'center', padding: '0 0.3rem', color: 'var(--secondary)' }}>…</span>
                                : (
                                  <button
                                    key={p}
                                    onClick={() => setUserPage(p)}
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      minWidth: '36px', height: '36px', borderRadius: '8px', padding: '0 0.4rem',
                                      border: '1px solid',
                                      borderColor: userPage === p ? 'var(--primary)' : 'var(--border-color)',
                                      background: userPage === p ? 'var(--primary)' : '#fff',
                                      color: userPage === p ? '#fff' : 'var(--text-color)',
                                      fontWeight: userPage === p ? 700 : 500,
                                      fontSize: '0.85rem', cursor: 'pointer',
                                    }}
                                  >
                                    {p}
                                  </button>
                                )
                              )}
                            <button
                              onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                              disabled={userPage === totalUserPages}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', background: '#fff',
                                cursor: userPage === totalUserPages ? 'not-allowed' : 'pointer',
                                opacity: userPage === totalUserPages ? 0.4 : 1,
                              }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestion des Cours</h2>
                      <p style={{ color: 'var(--secondary)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
                        Supervisez, éditez, attribuez et gérez l'ensemble du catalogue de cours 212Learn.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCreateCourseModal}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} />
                      Créer un cours
                    </button>
                  </div>

                  {/* Course KPI Summary Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: 'var(--neu-shadow-raised-sm)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Catalogue</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', marginTop: '0.2rem' }}>{courses.length}</div>
                    </div>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(40,167,69,0.06)', border: '1px solid rgba(40,167,69,0.2)' }}>
                      <div style={{ fontSize: '0.78rem', color: '#28a745', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cours Publiés</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#28a745', marginTop: '0.2rem' }}>{courses.filter(c => (c.status || '').toLowerCase() === 'published').length}</div>
                    </div>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(232,163,61,0.06)', border: '1px solid rgba(232,163,61,0.2)' }}>
                      <div style={{ fontSize: '0.78rem', color: '#b26a00', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brouillons</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b26a00', marginTop: '0.2rem' }}>{courses.filter(c => (c.status || '').toLowerCase() === 'draft').length}</div>
                    </div>
                    <div style={{ padding: '1rem 1.2rem', borderRadius: '14px', background: 'rgba(108,117,125,0.06)', border: '1px solid rgba(108,117,125,0.2)' }}>
                      <div style={{ fontSize: '0.78rem', color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Archivés</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6c757d', marginTop: '0.2rem' }}>{courses.filter(c => (c.status || '').toLowerCase() === 'archived').length}</div>
                    </div>
                  </div>

                  {/* Search and Category Filter Bar */}
                  <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher un cours par titre ou instructeur…"
                        value={adminCourseSearch}
                        onChange={(e) => setAdminCourseSearch(e.target.value)}
                        style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.88rem' }}
                      />
                      <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none' }} />
                    </div>

                    <select
                      className="form-control"
                      value={adminCourseCategoryFilter}
                      onChange={(e) => setAdminCourseCategoryFilter(e.target.value)}
                      style={{ width: 'auto', minWidth: '200px', height: '42px', fontSize: '0.88rem' }}
                    >
                      <option value="">Toutes les catégories</option>
                      {flatCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.selectLabel || cat.label}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-control"
                      value={adminCourseStatusFilter}
                      onChange={(e) => setAdminCourseStatusFilter(e.target.value)}
                      style={{ width: 'auto', minWidth: '160px', height: '42px', fontSize: '0.88rem' }}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="published">Publiés</option>
                      <option value="draft">Brouillons</option>
                      <option value="archived">Archivés</option>
                    </select>

                    {(adminCourseSearch || adminCourseCategoryFilter || adminCourseStatusFilter !== 'all') && (
                      <button
                        onClick={() => { setAdminCourseSearch(''); setAdminCourseCategoryFilter(''); setAdminCourseStatusFilter('all'); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                      >
                        Réinitialiser filtres
                      </button>
                    )}
                  </div>

                  {courseActionSuccess && (
                    <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {courseActionSuccess}
                    </div>
                  )}
                  {publishError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {publishError}
                    </div>
                  )}
                  {deleteCourseError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {deleteCourseError}
                    </div>
                  )}

                  {coursesLoading && <LoadingSpinner />}
                  {coursesError && <p style={{ color: 'var(--error-color)' }}>{coursesError}</p>}
                  {!coursesLoading && !coursesError && filteredAllCourses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
                      <BookOpen size={36} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--secondary)' }} />
                      <p style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>
                        Aucun cours ne correspond aux filtres.
                      </p>
                    </div>
                  )}
                  {!coursesLoading && !coursesError && filteredAllCourses.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {filteredAllCourses.map((course) => (
                        <AdminCourseCard
                          key={course.id}
                          course={course}
                          flatCategories={flatCategories}
                          instructors={instructors}
                          instructorsLoading={instructorsLoading}
                          onPublish={handlePublishCourse}
                          publishLoading={publishLoading}
                          onEdit={handleOpenEditCourseModal}
                          onDelete={handleDeleteCourse}
                          deleteLoading={deleteCourseLoading}
                          isDraft={(course.status || '').toLowerCase() === 'draft'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Category Management</h2>
                      <p style={{ color: 'var(--secondary)', marginTop: '0.35rem' }}>
                        L'admin peut créer, modifier et supprimer les catégories quand il veut.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCreateCategoryDrawer}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> Ajouter une catégorie
                    </button>
                  </div>

                  {categorySuccess && (
                    <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {categorySuccess}
                    </div>
                  )}
                  {categoryActionError && (
                    <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {categoryActionError}
                    </div>
                  )}

                  {categoriesLoading && <LoadingSpinner />}
                  {categoriesError && <p style={{ color: 'var(--error-color)' }}>{categoriesError}</p>}
                  {!categoriesLoading && !categoriesError && categories.length === 0 && (
                    <p style={{ color: 'var(--secondary)' }}>No categories found.</p>
                  )}
                  {!categoriesLoading && !categoriesError && categories.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {categories.map((category) => (
                        <AdminCategoryCard
                          key={category.id}
                          category={category}
                          onEdit={handleOpenEditCategoryDrawer}
                          onDelete={handleDeleteCategory}
                          deleteLoading={categoriesLoading}
                          onAddSubcategory={handleOpenAddSubcategoryDrawer}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && <AdminSettingsTab />}

              {['profile', 'security'].includes(activeTab) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                  <ProfileEditForm />
                  <ChangePasswordForm />
                </div>
              )}

              {activeTab === 'stats' && <AdminStatsTab />}

              {activeTab === 'wafacash' && <WafacashTab />}

              {activeTab === 'audit' && <AuditLogsTab />}

              {activeTab === 'health' && <SystemHealthTab />}
            </div>
        </main>
      </div>

      {/* ── Admin Action Confirmation Modal ───────────────────────── */}
      {adminConfirmModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setAdminConfirmModal(null)}
        >
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '2rem',
            maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            position: 'relative', animation: 'fadeInUp 0.2s ease',
          }}>
            <button
              onClick={() => setAdminConfirmModal(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fafc', borderRadius: '50%', padding: '12px', display: 'flex', border: '1px solid #e2e8f0' }}>
                {adminConfirmModal.icon}
              </div>
              <h2 style={{ margin: 0, color: '#1a1a2e', fontSize: '1.25rem', fontWeight: 700 }}>
                {adminConfirmModal.title}
              </h2>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {adminConfirmModal.description}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setAdminConfirmModal(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 500, color: '#64748b' }}
              >
                Annuler
              </button>
              <button
                onClick={adminConfirmModal.onConfirm}
                disabled={userActionLoading !== null}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none',
                  background: adminConfirmModal.btnColor, color: '#fff', cursor: 'pointer',
                  fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {userActionLoading && <Loader size={16} className="spin" />}
                {userActionLoading ? 'Traitement...' : adminConfirmModal.btnText}
              </button>
            </div>
          </div>
        </div>
      )}





      {/* Edit Course Slide-Over Right Drawer Modal */}
      {editingCourse && (
        <AdminEditCourseDrawer
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          flatCategories={flatCategories}
          instructors={instructors}
          instructorsLoading={instructorsLoading}
          onSave={handleUpdateCourse}
          saveLoading={updateCourseLoading}
          saveError={updateCourseError}
        />
      )}

      {/* Create Course Slide-Over Right Drawer Modal */}
      <AdminCreateCourseDrawer
        isOpen={showCreateCourseDrawer}
        onClose={() => setShowCreateCourseDrawer(false)}
        flatCategories={flatCategories}
        instructors={instructors}
        instructorsLoading={instructorsLoading}
        onSave={handleCreateCourseSubmit}
        saveLoading={createCourseLoading}
        saveError={createCourseError}
      />

      {/* Create / Edit User Slide-Over Right Drawer Modal */}
      <AdminUserFormDrawer
        isOpen={showUserForm}
        onClose={() => { setShowUserForm(false); setEditingUser(null); setUserFormError(null); }}
        editingUser={editingUser}
        formData={userFormData}
        setFormData={setUserFormData}
        onSubmit={handleUserFormSubmit}
        loading={userFormLoading}
        error={userFormError}
      />

      {/* Create / Edit Category Slide-Over Right Drawer */}
      <AdminCategoryDrawer
        isOpen={showCategoryDrawer}
        onClose={() => { setShowCategoryDrawer(false); setEditingCategoryData(null); setCategoryDrawerError(null); }}
        editingCategory={editingCategoryData}
        parentCategoryId={drawerCategoryParentId}
        flatCategories={flatCategories}
        onSave={handleCategoryDrawerSave}
        saveLoading={categoryDrawerLoading}
        saveError={categoryDrawerError}
      />
    </div>
  );
}
