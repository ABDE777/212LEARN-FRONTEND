import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Plus, Pencil, Trash2, X, Check, Wallet, DollarSign, Loader, RotateCcw } from 'lucide-react';
import { usePacks, usePackActions, useRevenueShares } from '../../hooks/usePacks';
import api, { unwrap } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';

const money = (n, c = 'MAD') => `${Number(n || 0).toFixed(2)} ${c}`;

const instructorsOf = (course) =>
  (Array.isArray(course?.instructors) ? course.instructors : [])
    .map((i) => i.user)
    .filter(Boolean);

const instructorName = (u) => u ? (`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Formateur') : '';

/* ─── Pack create/edit drawer ───────────────────────────────────────────── */
function PackForm({ pack, courses, onClose, onSaved }) {
  const { createPack, updatePack, loading, error } = usePackActions();
  const [title, setTitle] = useState(pack?.title || '');
  const [description, setDescription] = useState(pack?.description || '');
  const [thumbnail, setThumbnail] = useState(pack?.thumbnail || '');
  const [price, setPrice] = useState(pack?.price ?? '');
  const [launchPrice, setLaunchPrice] = useState(pack?.launchPrice ?? '');
  const [launchSeats, setLaunchSeats] = useState(pack?.launchSeats ?? '');
  const [status, setStatus] = useState(pack?.status || 'draft');
  const [localError, setLocalError] = useState('');

  // Map courseId → chosen instructorId. Pre-fill from an existing pack.
  const [selected, setSelected] = useState(() => {
    const m = {};
    (pack?.courses || []).forEach((pc) => { m[pc.courseId] = pc.instructorId; });
    return m;
  });

  const toggleCourse = (course) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (course.id in next) {
        delete next[course.id];
      } else {
        const insts = instructorsOf(course);
        next[course.id] = insts.length === 1 ? insts[0].id : ''; // auto-select single
      }
      return next;
    });
  };

  const setInstructor = (courseId, instructorId) =>
    setSelected((prev) => ({ ...prev, [courseId]: instructorId }));

  const handleSave = async () => {
    setLocalError('');
    if (!title.trim()) {
      setLocalError('Le titre est obligatoire.');
      return;
    }
    // The normal price (charged after the launch seats run out) is mandatory —
    // a pack can be a simple fixed price with no launch offer at all.
    const normalPrice = Number(price);
    if (price === '' || !Number.isFinite(normalPrice) || normalPrice < 0) {
      setLocalError('Le prix normal est obligatoire (prix payé après les premières places).');
      return;
    }
    // The launch offer is optional, but its two fields go together: either both
    // a launch price AND a number of launch seats, or neither.
    const hasLaunchPrice = launchPrice !== '' && launchPrice != null;
    const hasLaunchSeats = launchSeats !== '' && launchSeats != null && Number(launchSeats) > 0;
    if (hasLaunchPrice !== hasLaunchSeats) {
      setLocalError('Offre de lancement incomplète : renseignez le prix de lancement ET le nombre de places, ou laissez les deux vides.');
      return;
    }
    if (hasLaunchPrice) {
      const lp = Number(launchPrice);
      if (!Number.isFinite(lp) || lp < 0) {
        setLocalError('Prix de lancement invalide.');
        return;
      }
      if (lp > normalPrice) {
        setLocalError('Le prix de lancement doit être inférieur ou égal au prix normal.');
        return;
      }
    }
    const courseEntries = Object.entries(selected);
    if (courseEntries.length === 0) {
      setLocalError('Sélectionnez au moins un cours.');
      return;
    }
    for (const [courseId, instructorId] of courseEntries) {
      if (!instructorId) {
        const c = courses.find((x) => x.id === courseId);
        setLocalError(`Choisissez un formateur pour « ${c?.title || 'un cours'} ».`);
        return;
      }
    }
    const payload = {
      title, description, thumbnail,
      price: Number(price),
      launchPrice: launchPrice === '' ? null : Number(launchPrice),
      launchSeats: launchSeats === '' ? 0 : Number(launchSeats),
      status,
      courses: courseEntries.map(([courseId, instructorId]) => ({ courseId, instructorId })),
    };
    try {
      if (pack) await updatePack(pack.id, payload);
      else await createPack(payload);
      onSaved();
    } catch { /* error surfaced below */ }
  };

  const inputStyle = { width: '100%', padding: 10, border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-color)', color: 'var(--text-color)', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 4, fontWeight: 500, color: 'var(--secondary)', fontSize: '0.9rem' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: 'min(560px, 100%)', height: '100%', background: '#fff', overflowY: 'auto', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={22} /> {pack ? 'Modifier le pack' : 'Nouveau pack'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
        </div>

        {(error || localError) && (
          <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#c33', fontSize: '0.9rem' }}>
            {error || localError}
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div><label style={labelStyle}>Titre</label><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: 70 }} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><label style={labelStyle}>Image (URL)</label><input style={inputStyle} value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://…" /></div>
          <div><label style={labelStyle}>Prix normal (obligatoire) — payé après les places de lancement</label>
            <input style={inputStyle} type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ex : 549" /></div>
          <div style={{ padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              Offre de lancement (optionnelle) — les premières places à prix réduit. Laissez vide pour un pack à prix fixe.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '0.75rem' }}>
              <div><label style={labelStyle}>Prix de lancement</label><input style={inputStyle} type="number" min="0" value={launchPrice} onChange={(e) => setLaunchPrice(e.target.value)} placeholder="ex : 499" /></div>
              <div><label style={labelStyle}>Nombre de places</label><input style={inputStyle} type="number" min="0" value={launchSeats} onChange={(e) => setLaunchSeats(e.target.value)} placeholder="ex : 5" /></div>
            </div>
          </div>
          <div><label style={labelStyle}>Statut</label>
            <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Cours du pack — un formateur par cours</label>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, maxHeight: 280, overflowY: 'auto' }}>
              {courses.length === 0 && <p style={{ padding: '1rem', color: 'var(--secondary)', margin: 0 }}>Aucun cours publié.</p>}
              {courses.map((course) => {
                const checked = course.id in selected;
                const insts = instructorsOf(course);
                return (
                  <div key={course.id} style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleCourse(course)} />
                      <span style={{ fontWeight: 500, color: 'var(--text-color)' }}>{course.title}</span>
                    </label>
                    {checked && (
                      <div style={{ marginTop: 6, paddingLeft: 26 }}>
                        {insts.length === 0 ? (
                          <span style={{ color: 'var(--error-color)', fontSize: '0.85rem' }}>⚠ Aucun formateur assigné à ce cours.</span>
                        ) : insts.length === 1 ? (
                          <span style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Formateur : {instructorName(insts[0])} (auto)</span>
                        ) : (
                          <select style={{ ...inputStyle, padding: 6 }} value={selected[course.id] || ''} onChange={(e) => setInstructor(course.id, e.target.value)}>
                            <option value="">— choisir un formateur —</option>
                            {insts.map((u) => <option key={u.id} value={u.id}>{instructorName(u)}</option>)}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', position: 'sticky', bottom: 0, background: '#fff', paddingTop: '1rem', paddingBottom: '0.25rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <Loader size={16} className="spin" /> : <Check size={16} />} Enregistrer
          </button>
          <button onClick={onClose} style={{ padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Packs list + CRUD ─────────────────────────────────────────────────── */
function PacksList() {
  const { packs, loading, error, refetch } = usePacks();
  const { deletePack } = usePackActions();
  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState(null); // pack | 'new' | null

  useEffect(() => {
    api.get('/courses?status=published&limit=200', { skipCache: true })
      .then((res) => setCourses(unwrap(res)?.courses || unwrap(res) || []))
      .catch(() => setCourses([]));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce pack ?')) return;
    try { await deletePack(id); refetch(); } catch { /* ignore */ }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0 }}>Packs ({packs.length})</h3>
        <button onClick={() => setEditing('new')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> Nouveau pack
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
      {!loading && !error && packs.length === 0 && <p style={{ color: 'var(--secondary)' }}>Aucun pack. Créez-en un.</p>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {packs.map((pack) => (
          <div key={pack.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: pack.thumbnail ? `url(${pack.thumbnail}) center/cover` : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!pack.thumbnail && <Package size={20} color="#fff" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ color: 'var(--text-color)' }}>{pack.title}</strong>
                <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: 999, background: pack.status === 'published' ? '#e8f5e9' : '#f1f5f9', color: pack.status === 'published' ? '#2e7d32' : '#64748b' }}>{pack.status}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                {pack.courses?.length || 0} cours · {money(pack.pricing?.currentPrice, pack.currency)}
                {pack.launchPrice != null && ` · lancement ${money(pack.launchPrice, pack.currency)} (${pack.pricing?.seatsLeft ?? 0}/${pack.launchSeats} places)`}
              </div>
            </div>
            <button onClick={() => setEditing(pack)} title="Modifier" style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8, cursor: 'pointer' }}><Pencil size={15} /></button>
            <button onClick={() => handleDelete(pack.id)} title="Supprimer" style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--error-color)' }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      {editing && (
        <PackForm
          pack={editing === 'new' ? null : editing}
          courses={courses}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refetch(); }}
        />
      )}
    </div>
  );
}

/* ─── Pending pack purchases (approve / reject) ─────────────────────────── */
function PurchasesList() {
  const { getPendingPurchases, verifyPurchase } = usePackActions();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows((await getPendingPurchases('all'))?.purchases || []); }
    catch { setRows([]); }
    finally { setLoading(false); }
  }, [getPendingPurchases]);

  useEffect(() => { load(); }, [load]);

  const act = async (purchase, action) => {
    setBusy(purchase.id + action);
    setMsg(null);
    try {
      await verifyPurchase(purchase.id, action);
      setMsg({ type: 'ok', text: action === 'approve' ? 'Achat validé — cours débloqués.' : 'Achat refusé.' });
      await load();
    } catch (e) {
      setMsg({ type: 'err', text: e.response?.data?.error?.message || 'Échec.' });
    } finally { setBusy(null); }
  };

  const statusPill = (s) => {
    const map = { PAID: ['#e8f5e9', '#2e7d32'], REJECTED: ['#fdecea', '#c0392b'], WAITING_VERIFICATION: ['#fff4e5', '#b26a00'], PENDING: ['#f1f5f9', '#64748b'] };
    const [bg, fg] = map[s] || ['#f1f5f9', '#64748b'];
    return <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: 999, background: bg, color: fg }}>{s}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Achats de packs ({rows.length})</h3>
        <button onClick={load} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }}><RotateCcw size={14} /> Actualiser</button>
      </div>

      {msg && <div style={{ padding: '0.6rem 1rem', borderRadius: 8, marginBottom: '1rem', background: msg.type === 'ok' ? '#e8f5e9' : '#fdecea', color: msg.type === 'ok' ? '#2e7d32' : '#c0392b' }}>{msg.text}</div>}

      {rows.length === 0 && <p style={{ color: 'var(--secondary)' }}>Aucun achat de pack.</p>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {rows.map((p) => {
          const isPending = ['WAITING_VERIFICATION', 'PENDING'].includes(p.status);
          return (
            <div key={p.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong style={{ color: 'var(--text-color)' }}>{p.pack?.title || 'Pack'}</strong>
                    {statusPill(p.status)}
                    {p.isLaunchPrice && <span style={{ fontSize: '0.72rem', color: '#b26a00' }}>🔥 lancement</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                    {p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''} · ${p.user.email}` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                    {money(p.amount, p.currency)} · {p.provider === 'transfer' ? 'Virement' : 'Wafacash'} · réf {p.transactionReference}
                    {p.mtcn ? ` · MTCN ${p.mtcn}` : ''}{p.rib ? ` · RIB ${p.rib}` : ''}
                  </div>
                  {(p.receiptUrl || p.transferReceiptUrl) && (
                    <a href={p.receiptUrl || p.transferReceiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Voir le reçu</a>
                  )}
                </div>
                {isPending && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => act(p, 'approve')} disabled={busy === p.id + 'approve'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.5rem 0.8rem', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}><Check size={15} /> Valider</button>
                    <button onClick={() => act(p, 'reject')} disabled={busy === p.id + 'reject'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.5rem 0.8rem', background: 'transparent', color: '#c0392b', border: '1px solid #c0392b', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}><X size={15} /> Refuser</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Revenue payout report ─────────────────────────────────────────────── */
function RevenueReport() {
  const { totals, instructors, loading, error, refetch, markPaidOut } = useRevenueShares();
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);

  const pay = async (instructorId) => {
    if (!window.confirm('Marquer toutes les parts en attente de ce formateur comme payées ?')) return;
    setBusy(instructorId);
    setMsg(null);
    try {
      const r = await markPaidOut({ instructorId });
      setMsg(`${r?.updated ?? 0} part(s) marquée(s) payée(s).`);
      await refetch();
    } catch { setMsg('Échec du paiement.'); }
    finally { setBusy(null); }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Revenus des packs par formateur</h3>
        <button onClick={() => refetch()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }}><RotateCcw size={14} /> Actualiser</button>
      </div>

      {totals && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <StatCard label="Total net formateurs" value={money(totals.totalEarned, totals.currency)} />
          <StatCard label="En attente" value={money(totals.pendingAmount, totals.currency)} color="#b26a00" />
          <StatCard label="Déjà payé" value={money(totals.paidOutAmount, totals.currency)} color="#2e7d32" />
          <StatCard label="Ventes de parts" value={totals.salesCount} />
        </div>
      )}

      {msg && <div style={{ padding: '0.6rem 1rem', borderRadius: 8, marginBottom: '1rem', background: '#e8f5e9', color: '#2e7d32' }}>{msg}</div>}

      {instructors.length === 0 && <p style={{ color: 'var(--secondary)' }}>Aucune part de revenu enregistrée.</p>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {instructors.map(({ instructor, summary }) => (
          <div key={instructor?.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--text-color)' }}>{instructorName(instructor)}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                Net {money(summary.totalEarned, summary.currency)} · en attente <span style={{ color: '#b26a00' }}>{money(summary.pendingAmount, summary.currency)}</span> · payé {money(summary.paidOutAmount, summary.currency)}
              </div>
            </div>
            <button onClick={() => pay(instructor?.id)} disabled={busy === instructor?.id || summary.pendingAmount <= 0}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', background: summary.pendingAmount > 0 ? 'var(--primary)' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, cursor: summary.pendingAmount > 0 ? 'pointer' : 'default', fontWeight: 600 }}>
              <DollarSign size={15} /> Marquer payé
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '0.9rem 1rem' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: color || 'var(--text-color)' }}>{value}</div>
    </div>
  );
}

/* ─── Main tab with sub-navigation ──────────────────────────────────────── */
export default function AdminPacksTab() {
  const [sub, setSub] = useState('packs');
  const subs = useMemo(() => ([
    { key: 'packs', label: 'Packs', Icon: Package },
    { key: 'purchases', label: 'Achats', Icon: Wallet },
    { key: 'revenue', label: 'Revenus', Icon: DollarSign },
  ]), []);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {subs.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setSub(key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 999, border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 600, background: sub === key ? 'var(--primary)' : 'transparent', color: sub === key ? '#fff' : 'var(--secondary)' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {sub === 'packs' && <PacksList />}
      {sub === 'purchases' && <PurchasesList />}
      {sub === 'revenue' && <RevenueReport />}
    </div>
  );
}
