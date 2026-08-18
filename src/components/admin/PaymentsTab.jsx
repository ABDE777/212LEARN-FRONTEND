import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { XCircle, Wallet, Loader, Download, Clock, CheckCircle, Building2, Search, RotateCcw, Printer, X } from 'lucide-react';
import { useWafacash } from '../../hooks/useWafacash';
import { useTransfer } from '../../hooks/useTransfer';
import LoadingSpinner from '../LoadingSpinner';

export default function PaymentsTab() {
  // Both payment methods share this one page. Each row is tagged with its
  // `method` ('wafacash' | 'transfer') so a single detail modal + verify flow
  // can route to the right API.
  const { getPendingPayments, verifyPayment } = useWafacash();
  const { getPendingTransfers, verifyTransferPayment } = useTransfer();

  const [wafaRows, setWafaRows] = useState([]);
  const [transferRows, setTransferRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Advanced filters (all client-side).
  const [methodFilter, setMethodFilter] = useState('all'); // all | wafacash | transfer
  const [statusFilter, setStatusFilter] = useState('all');  // all | pending | PAID | REJECTED
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [verifyLoading, setVerifyLoading] = useState(null);
  const [notes, setNotes] = useState({});
  const [actionMsg, setActionMsg] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null); // detail drawer (carries .method)
  const [selectedReceipt, setSelectedReceipt] = useState(null); // receipt zoom

  const extractList = (res) => {
    const list = res?.payments || res?.data?.payments || (Array.isArray(res) ? res : []);
    return Array.isArray(list) ? list : [];
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [w, t] = await Promise.all([
        getPendingPayments('all').catch(() => null),
        getPendingTransfers('all').catch(() => null),
      ]);
      setWafaRows(extractList(w).map((p) => ({ ...p, method: 'wafacash' })));
      setTransferRows(extractList(t).map((p) => ({ ...p, method: 'transfer' })));
    } catch {
      setLoadError('Impossible de charger les paiements.');
    } finally {
      setLoading(false);
    }
  }, [getPendingPayments, getPendingTransfers]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const matchesFilters = useCallback((p) => {
    if (statusFilter === 'pending' && !['WAITING_VERIFICATION', 'PENDING'].includes(p.status)) return false;
    if (statusFilter === 'PAID' && p.status !== 'PAID') return false;
    if (statusFilter === 'REJECTED' && p.status !== 'REJECTED') return false;

    const q = search.trim().toLowerCase();
    if (q) {
      const student = p.enrollment?.user || p.user || p.student;
      const hay = [
        student?.firstName, student?.lastName, student?.email,
        p.enrollment?.course?.title || p.course?.title,
        p.transactionReference, p.paymentReference, p.reference, p.mtcn, p.rib,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }

    const d = p.paidAt || p.enrollment?.enrolledAt;
    if (dateFrom) {
      if (!d || new Date(d) < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const end = new Date(dateTo); end.setHours(23, 59, 59, 999);
      if (!d || new Date(d) > end) return false;
    }
    return true;
  }, [statusFilter, search, dateFrom, dateTo]);

  const wafaFiltered = useMemo(() => wafaRows.filter(matchesFilters), [wafaRows, matchesFilters]);
  const transferFiltered = useMemo(() => transferRows.filter(matchesFilters), [transferRows, matchesFilters]);

  const handleVerify = async (p, action) => {
    setVerifyLoading(p.id + action);
    setActionMsg(null);
    try {
      if (p.method === 'wafacash') await verifyPayment(p.id, action, notes[p.id] || '');
      else await verifyTransferPayment(p.id, action, notes[p.id] || '');
      setActionMsg({
        type: 'success',
        text: action === 'approve' ? "Paiement approuvé ! L'accès au cours est activé." : 'Paiement rejeté.',
      });
      setSelectedPayment(null);
      await loadAll();
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.error?.message || err.response?.data?.message || 'Impossible de traiter cette action.',
      });
    } finally {
      setVerifyLoading(null);
    }
  };

  const handleDownloadReceipt = async (receiptUrl, refCode, method) => {
    if (!receiptUrl) return;
    const label = method === 'transfer' ? 'Virement' : 'Wafacash';
    try {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recu_${label}_${refCode || 'paiement'}.png`;
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
    const invoiceDateSource = p.paidAt || p.enrollment?.enrolledAt;
    const invoiceDate = invoiceDateSource ? new Date(invoiceDateSource).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email : 'Étudiant';
    const studentEmail = student?.email || '—';
    const courseTitle = course?.title || 'Inscription Cours 212 Learn';
    const amountStr = `${p.amount || 0} ${currencyStr}`;
    const methodLabel = p.method === 'transfer' ? 'VIREMENT' : 'WAFACASH';

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
      const L = 48;            // left margin
      const R = 547;           // right edge
      const dark = '#1e293b';
      const gray = '#64748b';
      const light = '#94a3b8';
      const isPaid = p.status === 'PAID';

      // ── Header band ───────────────────────────────────────────
      doc.setFillColor(27, 75, 90); // primary teal
      doc.rect(0, 0, 595, 96, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor('#ffffff');
      doc.text('212 Learn', L, 46);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(210, 224, 228);
      doc.text("Plateforme d'apprentissage en ligne", L, 64);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor('#ffffff');
      doc.text('FACTURE', R, 50, { align: 'right' });

      // ── Meta (ref / date / method) ────────────────────────────
      let y = 140;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(light);
      doc.text('RÉFÉRENCE', R - 150, y);
      doc.text('DATE', R - 150, y + 34);
      doc.text('MÉTHODE', R - 150, y + 68);
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(dark);
      doc.text(String(refCode), R, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceDate, R, y + 34, { align: 'right' });
      doc.text(methodLabel === 'VIREMENT' ? 'Virement bancaire' : 'Wafacash', R, y + 68, { align: 'right' });

      // ── Billed to ─────────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(light);
      doc.text('FACTURÉ À', L, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(dark);
      doc.text(studentName, L, y + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(gray);
      doc.text(studentEmail, L, y + 40);

      // ── Line items table ──────────────────────────────────────
      y = 268;
      doc.setFillColor(27, 75, 90);
      doc.rect(L, y, R - L, 30, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor('#ffffff');
      doc.text('DESCRIPTION', L + 14, y + 19);
      doc.text('MONTANT', R - 14, y + 19, { align: 'right' });

      y += 30;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(dark);
      doc.text(courseTitle.length > 60 ? courseTitle.slice(0, 60) + '…' : courseTitle, L + 14, y + 24);
      doc.setFont('helvetica', 'bold');
      doc.text(amountStr, R - 14, y + 24, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(L, y + 40, R, y + 40);

      // ── Total box ─────────────────────────────────────────────
      y += 56;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(R - 250, y, 250, 44, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(gray);
      doc.text('TOTAL', R - 235, y + 27);
      doc.setFontSize(15);
      doc.setTextColor(27, 75, 90);
      doc.text(amountStr, R - 14, y + 28, { align: 'right' });

      // ── Status badge ──────────────────────────────────────────
      y += 74;
      if (isPaid) {
        doc.setFillColor(232, 245, 233);
        doc.roundedRect(L, y, 210, 30, 15, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(46, 125, 50);
        doc.text(`PAYÉ VIA ${methodLabel}`, L + 105, y + 20, { align: 'center' });
      } else {
        doc.setFillColor(255, 248, 225);
        doc.roundedRect(L, y, 210, 30, 15, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(178, 106, 0);
        doc.text('EN ATTENTE DE VALIDATION', L + 105, y + 20, { align: 'center' });
      }

      // ── Footer ────────────────────────────────────────────────
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(L, 780, R, 780);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(light);
      doc.text('212 Learn — support@212learn.com', L, 800);
      doc.text('Merci de votre confiance.', R, 800, { align: 'right' });

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

  const methodChip = (method) => {
    const isW = method === 'wafacash';
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, background: isW ? 'rgba(27,75,90,0.1)' : 'rgba(232,163,61,0.15)', color: isW ? 'var(--secondary)' : '#9a6b12' }}>
        {isW ? <Wallet size={12} /> : <Building2 size={12} />}{isW ? 'Wafacash' : 'Virement'}
      </span>
    );
  };

  const renderSection = (method, rows) => {
    const isW = method === 'wafacash';
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
          {isW ? <Wallet size={20} color="var(--secondary)" /> : <Building2 size={20} color="#9a6b12" />}
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-color)' }}>
            {isW ? 'Wafacash' : 'Virements'}
          </h3>
          <span style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>
            {rows.length}
          </span>
        </div>

        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 2rem', background: '#fff', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--secondary)', margin: 0 }}>Aucun paiement ne correspond à ce filtre.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
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
                  {rows.map((p) => {
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
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-color)' }}>
                            {student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Étudiant' : 'Étudiant'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', marginTop: '2px' }}>{student?.email || '—'}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-color)', maxWidth: '200px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course?.title || '—'}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--text-color)', fontWeight: 700 }}>
                          {refCode}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {statusBadge(p.status)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--secondary)', textAlign: 'right', fontSize: '1.1rem' }}>
                          ›
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const pillStyle = (active) => ({
    padding: '0.5rem 1.15rem', borderRadius: '99px',
    border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
    background: active ? 'var(--primary)' : '#fff',
    color: active ? '#fff' : 'var(--text-color)',
    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
    boxShadow: active ? '0 4px 12px rgba(27,75,90,0.2)' : 'none', transition: 'all 0.15s ease',
  });
  const dateInputStyle = { padding: '0.5rem 0.7rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-color)' };

  const showWafa = methodFilter === 'all' || methodFilter === 'wafacash';
  const showTransfer = methodFilter === 'all' || methodFilter === 'transfer';

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
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Reçu {selectedPayment?.method === 'transfer' ? 'Virement' : 'Wafacash'}</h3>
              <button onClick={() => setSelectedReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}><X size={22} /></button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', textAlign: 'center', background: '#f8fafc' }}>
              <img src={selectedReceipt} alt="Reçu" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => handleDownloadReceipt(selectedReceipt, selectedPayment?.transactionReference || 'recu', selectedPayment?.method)}
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
        // Virement proofs are stored in transferReceiptUrl; Wafacash in receiptUrl.
        const proofUrl = p.transferReceiptUrl || p.receiptUrl;
        const providerRow = p.method === 'wafacash'
          ? { label: 'MTCN', value: p.mtcn || '—', mono: true }
          : { label: 'RIB Client', value: p.rib || '—', mono: true };

        return createPortal(
          <div
            onClick={() => setSelectedPayment(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '520px', height: '100%', background: '#fff', boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}
            >
              {/* Drawer Header */}
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(27,75,90,0.04), rgba(193,101,47,0.04))' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>Détails du paiement</h2>
                    {methodChip(p.method)}
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--secondary)' }}>Référence : <strong style={{ fontFamily: 'monospace' }}>{refCode}</strong></p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                    providerRow,
                    { label: 'Référence', value: refCode, mono: true },
                    { label: 'Statut', value: null, badge: statusBadge(p.status) },
                    { label: 'Fournisseur', value: p.provider || '—' },
                    { label: 'Date de paiement', value: (p.paidAt || p.enrollment?.enrolledAt) ? new Date(p.paidAt || p.enrollment.enrolledAt).toLocaleString('fr-FR') : '—' },
                    { label: 'Vérifié le', value: p.verifiedAt ? new Date(p.verifiedAt).toLocaleString('fr-FR') : '—' },
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

                {/* Notes */}
                {p.notes && (
                  <div style={{ marginBottom: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Notes</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>{p.notes}</div>
                  </div>
                )}

                {/* Coupon Info */}
                {p.coupon && (
                  <div style={{ marginBottom: '1.5rem', background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      🎟️ Coupon de réduction utilisé
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#2e7d32', marginBottom: '0.25rem' }}>Code</div>
                        <div style={{ fontWeight: 600, color: '#1b5e20', fontFamily: 'monospace' }}>{p.coupon.code}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#2e7d32', marginBottom: '0.25rem' }}>Réduction</div>
                        <div style={{ fontWeight: 600, color: '#1b5e20' }}>{p.coupon.discount}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents & Downloads */}
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    📄 Documents & Téléchargements
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(p)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
                    >
                      <Printer size={16} /> Télécharger la facture (PDF)
                    </button>

                    {proofUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(proofUrl, refCode, p.method)}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: '#fff', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
                      >
                        <Download size={16} /> Télécharger le justificatif
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

                {/* Proof preview (click to zoom) */}
                {proofUrl && (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.5rem' }}>Justificatif de paiement (aperçu)</div>
                    <div
                      onClick={() => setSelectedReceipt(proofUrl)}
                      style={{ cursor: 'zoom-in', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--border-color)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', maxHeight: '200px' }}
                    >
                      <img src={proofUrl} alt="Justificatif" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                    </div>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--secondary)', textAlign: 'center' }}>Cliquer pour agrandir</p>
                  </div>
                )}
                {!proofUrl && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontStyle: 'italic' }}>Aucun justificatif téléversé pour ce paiement.</p>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', background: '#fafafa', display: 'flex', gap: '0.75rem' }}>
                {isPending ? (
                  <>
                    <button
                      onClick={() => handleVerify(p, 'approve')}
                      disabled={!!verifyLoading}
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' }}
                    >
                      {verifyLoading === p.id + 'approve' ? <Loader size={15} className="spin" /> : <CheckCircle size={16} />}
                      Approuver
                    </button>
                    <button
                      onClick={() => handleVerify(p, 'reject')}
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
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Paiements</h2>
          <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.92rem' }}>
            Wafacash et virements réunis. Filtrez, puis approuvez ou rejetez les demandes.
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--surface-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-color)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
        >
          <RotateCcw size={16} /> Actualiser
        </button>
      </div>

      {/* ── Advanced filter bar ────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem 1.15rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* Méthode */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '70px' }}>Méthode</span>
          {[{ id: 'all', label: '🌐 Toutes' }, { id: 'wafacash', label: '💳 Wafacash' }, { id: 'transfer', label: '🏦 Virement' }].map((m) => (
            <button key={m.id} onClick={() => setMethodFilter(m.id)} style={pillStyle(methodFilter === m.id)}>{m.label}</button>
          ))}
        </div>
        {/* Statut */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '70px' }}>Statut</span>
          {[{ id: 'all', label: '🌐 Tous' }, { id: 'pending', label: '⏳ En attente' }, { id: 'PAID', label: '✅ Payés' }, { id: 'REJECTED', label: '❌ Rejetés' }].map((s) => (
            <button key={s.id} onClick={() => setStatusFilter(s.id)} style={pillStyle(statusFilter === s.id)}>{s.label}</button>
          ))}
        </div>
        {/* Recherche + dates */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (étudiant, cours, référence, MTCN/RIB)…"
              style={{ width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.2rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.88rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>Du</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={dateInputStyle} />
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>Au</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={dateInputStyle} />
          </div>
          {(search || dateFrom || dateTo || methodFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setMethodFilter('all'); setStatusFilter('all'); }}
              style={{ padding: '0.5rem 0.9rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: 'var(--secondary)' }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', background: actionMsg.type === 'success' ? '#e8f5e9' : '#ffebee', color: actionMsg.type === 'success' ? '#2e7d32' : '#c62828', border: `1px solid ${actionMsg.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`, fontWeight: 500 }}>
          {actionMsg.text}
        </div>
      )}

      {loadError && <p style={{ color: 'var(--error-color)', marginBottom: '1rem', fontWeight: 500 }}>{loadError}</p>}

      {loading && wafaRows.length === 0 && transferRows.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          {showWafa && renderSection('wafacash', wafaFiltered)}
          {showTransfer && renderSection('transfer', transferFiltered)}
        </>
      )}

    </div>
  );
}
