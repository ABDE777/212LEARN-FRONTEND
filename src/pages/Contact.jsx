import React, { useState, useEffect } from 'react';
import { Mail, Phone, Send, CheckCircle, AlertCircle, MessageSquare, HelpCircle, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import CountryPhonePicker, { DEFAULT_COUNTRIES } from '../components/CountryPhonePicker';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { user } = useAuth();
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  // A signed-in non-admin sends from their own account: identity fields are
  // filled from their profile and locked so the message is attributable.
  const lockIdentity = !!user && !isAdmin;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Information cours',
    message: '',
  });

  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRIES[0]);
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  // Prefill (and keep in sync) the identity fields from the signed-in profile.
  useEffect(() => {
    if (!lockIdentity) return;
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    setFormData((prev) => ({
      ...prev,
      name: fullName || prev.name,
      email: user?.email || prev.email,
      phone: user?.phone || prev.phone,
    }));
  }, [lockIdentity, user?.firstName, user?.lastName, user?.email, user?.phone]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Visual treatment for identity fields that are filled from the profile and
  // can't be edited by a signed-in user.
  const lockedStyle = { background: '#f1f5f9', color: '#475569', cursor: 'not-allowed' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin) {
      setStatus({ loading: false, success: null, error: "En tant qu'administrateur, vous ne pouvez pas envoyer de message de contact." });
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ loading: false, success: null, error: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    setStatus({ loading: true, success: null, error: null });

    // Signed-in users send their stored profile phone as-is; anonymous visitors
    // compose it from the country picker + typed digits.
    const fullPhone = lockIdentity
      ? (user?.phone || '')
      : (formData.phone ? `${selectedCountry.code} ${formData.phone.trim()}` : '');

    try {
      const res = await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        subject: formData.subject,
        message: formData.message,
      });

      const data = res.data;
      setStatus({
        loading: false,
        success: data?.message || 'Votre message a été envoyé avec succès ! Nous vous contacterons bientôt.',
        error: null,
      });
      setFormData({ name: '', email: '', phone: '', subject: 'Information cours', message: '' });
    } catch (err) {
      setStatus({
        loading: false,
        success: null,
        error:
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Impossible d'envoyer votre message pour le moment. Veuillez réessayer.",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg-color, #F4EFE6)', minHeight: '100vh', padding: '2.5rem 1rem 5rem 1rem' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Header Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              background: 'rgba(193, 101, 47, 0.1)',
              color: 'var(--primary, #C1652F)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '0.85rem',
            }}
          >
            <Sparkles size={16} /> Contact & Support 212Learn
          </div>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--text-color, #1A1A2E)', marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
            Contactez notre équipe
          </h1>
          <p style={{ color: 'var(--secondary, #1B4B5A)', maxWdith: '600px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.5 }}>
            Une question sur nos cours, un besoin de support ou un partenariat ? Écrivez-nous et notre équipe vous répondra rapidement.
          </p>
        </motion.div>

        {/* 3 Contact Info Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}
        >
          <motion.div
            whileHover={{ y: -4 }}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(27, 75, 90, 0.1)',
              boxShadow: '0 8px 24px rgba(27, 75, 90, 0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(27, 75, 90, 0.1)',
                color: 'var(--secondary, #1B4B5A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Phone size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', color: 'var(--text-color, #1A1A2E)' }}>Téléphone</h3>
              <p style={{ margin: 0, color: 'var(--secondary, #1B4B5A)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <a href="tel:+212605713171" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>+212 605-713171</a><br />
                <a href="tel:+212631883412" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>+212 631-883412</a>
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(27, 75, 90, 0.1)',
              boxShadow: '0 8px 24px rgba(27, 75, 90, 0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mail size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', color: 'var(--text-color, #1A1A2E)' }}>Email & Support</h3>
              <p style={{ margin: 0, color: 'var(--secondary, #1B4B5A)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <a href="mailto:212learn.support@gmail.com" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 600 }}>
                  212learn.support@gmail.com
                </a><br />
                Support 7j/7 – Réponse sous 24h
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Grid: Contact Form + FAQ Side Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(27, 75, 90, 0.12)',
              boxShadow: '0 12px 32px rgba(27, 75, 90, 0.08)',
            }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--primary, #C1652F)' }}>
              Envoyez-nous un message
            </h2>

            {isAdmin ? (
              <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={22} style={{ color: 'var(--primary, #C1652F)', flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-color)' }}>Compte administrateur</p>
                  <p style={{ margin: '0.35rem 0 0 0', color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    En tant qu'administrateur, vous <strong>recevez</strong> les messages de contact des utilisateurs — vous ne pouvez pas en envoyer. Retrouvez-les dans votre tableau de bord, onglet « Contact ».
                  </p>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit}>
              {lockIdentity && (
                <div style={{ padding: '0.7rem 0.95rem', background: 'rgba(193, 101, 47, 0.07)', border: '1px solid rgba(193, 101, 47, 0.2)', borderRadius: '10px', marginBottom: '1.1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.83rem', color: 'var(--secondary)' }}>
                  <Lock size={15} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                  Vos coordonnées sont reprises de votre profil. Pour les modifier, mettez à jour votre profil.
                </div>
              )}
              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  Nom complet <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  readOnly={lockIdentity}
                  placeholder="Ex: Abdel Mazgoura"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', ...(lockIdentity ? lockedStyle : {}) }}
                />
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  Adresse Email <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  readOnly={lockIdentity}
                  placeholder="exemple@domaine.com"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', ...(lockIdentity ? lockedStyle : {}) }}
                />
              </div>

              {/* Phone Number with Flag Picker */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  Numéro de téléphone
                </label>
                {lockIdentity ? (
                  <input
                    type="tel"
                    name="phone"
                    readOnly
                    placeholder="Non renseigné"
                    className="form-control"
                    value={formData.phone}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', ...lockedStyle }}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <CountryPhonePicker selectedCountry={selectedCountry} onChange={setSelectedCountry} />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="06 12 34 56 78"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  Sujet de votre demande <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  name="subject"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Information cours">Renseignements sur les cours</option>
                  <option value="Support technique">Support technique / Problème de compte</option>
                  <option value="Devenir formateur">Devenir Formateur / Enseignant</option>
                  <option value="Partenariat">Partenariat & Entreprises</option>
                  <option value="Autre">Autre demande</option>
                </select>
              </div>

              {/* Message */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  Votre Message <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Décrivez votre besoin en quelques phrases..."
                  className="form-control"
                  value={formData.message}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              {/* Error Message Alert */}
              {status.error && (
                <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <AlertCircle size={18} /> {status.error}
                </div>
              )}

              {/* Success Alert */}
              {status.success && (
                <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <CheckCircle size={18} /> {status.success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--primary, #C1652F)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: status.loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(193, 101, 47, 0.3)',
                }}
              >
                <Send size={18} /> {status.loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
            )}
          </motion.div>

          {/* Right Side: FAQ Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* FAQ Accordion Box */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '2rem',
                border: '1px solid rgba(27, 75, 90, 0.12)',
                boxShadow: '0 12px 32px rgba(27, 75, 90, 0.08)',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--secondary, #1B4B5A)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={20} style={{ color: 'var(--primary)' }} /> Questions Fréquentes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 700, color: 'var(--text-color)' }}>Combien de temps faut-il pour recevoir une réponse ?</h4>
                  <p style={{ margin: 0, color: 'var(--secondary)', lineHeight: 1.4, fontSize: '0.85rem' }}>
                    Notre équipe répond à toutes les demandes sous 24 à 48 heures ouvrées.
                  </p>
                </div>

                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 700, color: 'var(--text-color)' }}>Comment s'inscrire en tant que Formateur ?</h4>
                  <p style={{ margin: 0, color: 'var(--secondary)', lineHeight: 1.4, fontSize: '0.85rem' }}>
                    Lors de votre inscription, choisissez le profil <strong>Formateur</strong> ou sélectionnez ce sujet dans le formulaire ci-contre.
                  </p>
                </div>

                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontWeight: 700, color: 'var(--text-color)' }}>Où se déroulent les cours en présentiel ?</h4>
                  <p style={{ margin: 0, color: 'var(--secondary)', lineHeight: 1.4, fontSize: '0.85rem' }}>
                    Les sessions se déroulent dans nos centres partenaires ou directement au Technopark Casablanca.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Support Highlight Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--secondary, #1B4B5A) 0%, #0d2830 100%)',
                color: '#ffffff',
                borderRadius: '24px',
                padding: '1.75rem',
                boxShadow: '0 12px 32px rgba(27, 75, 90, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
                <MessageSquare size={22} style={{ color: 'var(--primary, #C1652F)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff' }}>Assistance en direct</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.9, lineHeight: 1.5, marginBottom: '1rem' }}>
                Besoin d'aide immédiate pour votre inscription ou l'accès à vos cours ? Rejoignez nos chargés d'accompagnement par WhatsApp.
              </p>
              <a
                href="https://wa.me/212605713171"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                Discuter sur WhatsApp
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
