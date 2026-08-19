import { useState, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCoupons } from '../../hooks/useCoupons';
import LoadingSpinner from '../LoadingSpinner';

export default function CouponsTab({ courses }) {
  const { coupons, loading, error, createCoupon, deleteCoupon, refetch } = useCoupons();
  const emptyForm = { code: '', discount: '', expirationDate: '', maxUsage: 100, courseId: '' };
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const submitLock = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    if (!form.courseId) { setFormError('Veuillez choisir un cours pour ce coupon.'); return; }
    submitLock.current = true;
    setSaving(true);
    setFormError(null);
    try {
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        discount: parseFloat(form.discount),
        expirationDate: new Date(form.expirationDate).toISOString(),
        maxUsage: parseInt(form.maxUsage, 10),
        isActive: true,
        courseId: form.courseId,
      });
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de créer le coupon.');
    } finally {
      setSaving(false);
      submitLock.current = false;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCoupon(id);
      await refetch();
    } catch {
      // no-op: the list simply won't change
    }
  };

  const courseTitle = (id) => courses.find(c => c.id === id)?.title || '—';
  const inputStyle = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.4rem' };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Mes coupons</h2>
        <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
          Créez des codes de réduction valables uniquement pour l'un de vos cours.
        </p>
      </div>

      {courses.length === 0 ? (
        <p style={{ color: 'var(--secondary)' }}>Vous devez d'abord créer un cours pour pouvoir créer un coupon.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
          {formError && (
            <div style={{ color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
              {formError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Code *</label>
              <input type="text" required placeholder="EX: PROMO20" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                style={{ ...inputStyle, textTransform: 'uppercase' }} />
            </div>
            <div>
              <label style={labelStyle}>Cours *</label>
              <select required value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })} style={inputStyle}>
                <option value="">Choisir un cours…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Réduction (%) *</label>
              <input type="number" required min="1" max="100" placeholder="20" value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date d'expiration *</label>
              <input type="date" required value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Utilisations max</label>
              <input type="number" min="1" value={form.maxUsage}
                onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
              <Plus size={16} /> {saving ? 'Création…' : 'Créer le coupon'}
            </button>
          </div>
        </form>
      )}

      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
      {loading ? (
        <LoadingSpinner />
      ) : coupons.length === 0 ? (
        <p style={{ color: 'var(--secondary)' }}>Aucun coupon pour le moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {coupons.map(c => {
            const expired = c.isExpired || new Date(c.expirationDate) < new Date();
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{c.code}</span>
                    <span style={{ background: 'rgba(193,101,47,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>-{Number(c.discount)}%</span>
                    {(!c.isActive || expired) && (
                      <span style={{ background: '#f3f4f6', color: 'var(--secondary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                        {expired ? 'Expiré' : 'Inactif'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--secondary)', marginTop: '0.3rem' }}>
                    {c.course?.title || courseTitle(c.courseId)} · {c.currentUsage}/{c.maxUsage} utilisé(s) · expire le {new Date(c.expirationDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} title="Supprimer" aria-label="Supprimer le coupon"
                  className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--error-color)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
