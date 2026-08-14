import { useState } from 'react';
import {
  Award, GraduationCap, Languages as LanguagesIcon, Sparkles, Link2,
  Globe, Briefcase, Code2, AtSign, Plus, X, Upload, FileText, Loader,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { uploadToCloudinary } from '../services/upload';

const LEVELS = [
  { value: '', label: 'Niveau' },
  { value: 'basic', label: 'Basique' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'fluent', label: 'Courant' },
  { value: 'native', label: 'Natif' },
];
const LEVEL_LABEL = { basic: 'Basique', intermediate: 'Intermédiaire', fluent: 'Courant', native: 'Natif' };

const SOCIAL = [
  { key: 'linkedin', label: 'LinkedIn', icon: Briefcase, placeholder: 'https://linkedin.com/in/…' },
  { key: 'github', label: 'GitHub', icon: Code2, placeholder: 'https://github.com/…' },
  { key: 'website', label: 'Site web', icon: Globe, placeholder: 'https://…' },
  { key: 'twitter', label: 'Twitter / X', icon: AtSign, placeholder: 'https://x.com/…' },
];

const cardStyle = {
  background: 'var(--surface-color, #ffffff)',
  borderRadius: '16px',
  padding: '2rem',
  marginBottom: '1.5rem',
  border: '1px solid var(--border-color, #e2e8f0)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};
const headingStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const subStyle = { fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '1.25rem' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.35rem' };
const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: '1px solid var(--border-color, #e2e8f0)', outline: 'none',
  background: '#ffffff', fontSize: '0.92rem', color: 'var(--text-color)',
};
const chip = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.35rem 0.7rem', borderRadius: '999px',
  background: 'var(--bg-color, #f1f5f9)', color: 'var(--text-color)',
  fontSize: '0.85rem', fontWeight: 500,
};
const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
  border: '1px dashed var(--primary)', background: 'transparent',
  color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem',
};
const iconBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
  border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--error-color, #dc2626)',
};
const rowWrap = { display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'flex-end', marginBottom: '0.75rem' };
const muted = { color: 'var(--secondary)', fontSize: '0.9rem' };

export default function PortfolioEditor({ value, isEditing, onChange }) {
  const { showError, showSuccess } = useToast();
  const [skillDraft, setSkillDraft] = useState('');
  const [uploading, setUploading] = useState(null); // `${listKey}:${index}` while a file uploads

  const v = {
    skills: value?.skills || [],
    languages: value?.languages || [],
    certifications: value?.certifications || [],
    diplomas: value?.diplomas || [],
    socialLinks: value?.socialLinks || {},
  };
  const patch = (p) => onChange({ ...v, ...p });

  // ── Skills ─────────────────────────────────────────────────────────────────
  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s) return;
    if (v.skills.includes(s)) { setSkillDraft(''); return; }
    patch({ skills: [...v.skills, s] });
    setSkillDraft('');
  };
  const removeSkill = (i) => patch({ skills: v.skills.filter((_, idx) => idx !== i) });

  // ── Generic list helpers (languages, certifications, diplomas) ──────────────
  const addRow = (key, blank) => patch({ [key]: [...v[key], blank] });
  const updateRow = (key, i, field, val) =>
    patch({ [key]: v[key].map((row, idx) => (idx === i ? { ...row, [field]: val } : row)) });
  const removeRow = (key, i) => patch({ [key]: v[key].filter((_, idx) => idx !== i) });

  const handleFile = async (key, i, file) => {
    if (!file) return;
    setUploading(`${key}:${i}`);
    try {
      const url = await uploadToCloudinary(file);
      updateRow(key, i, 'fileUrl', url);
      showSuccess('Fichier téléversé.');
    } catch (err) {
      showError(err.message || 'Échec du téléversement.');
    } finally {
      setUploading(null);
    }
  };

  // ── Credential card (shared by certifications & diplomas) ────────────────────
  // A render function (not a component) so inputs keep focus while typing.
  const renderCredential = ({ listKey, title, subtitle, icon: Icon, orgField, orgLabel }) => (
    <div style={cardStyle}>
      <h3 style={headingStyle}><Icon size={20} style={{ color: 'var(--primary)' }} /> {title}</h3>
      <p style={subStyle}>{subtitle}</p>

      {v[listKey].length === 0 && !isEditing && <p style={muted}>Aucun élément.</p>}

      {v[listKey].map((row, i) => (
        isEditing ? (
          <div key={i} style={rowWrap}>
            <div style={{ flex: '2 1 180px' }}>
              <label style={labelStyle}>Titre</label>
              <input style={inputStyle} value={row.title || ''} placeholder="ex: AWS Certified Developer"
                onChange={(e) => updateRow(listKey, i, 'title', e.target.value)} />
            </div>
            <div style={{ flex: '2 1 160px' }}>
              <label style={labelStyle}>{orgLabel}</label>
              <input style={inputStyle} value={row[orgField] || ''} placeholder={orgLabel}
                onChange={(e) => updateRow(listKey, i, orgField, e.target.value)} />
            </div>
            <div style={{ flex: '0 1 90px' }}>
              <label style={labelStyle}>Année</label>
              <input style={inputStyle} type="number" value={row.year || ''} placeholder="2024"
                onChange={(e) => updateRow(listKey, i, 'year', e.target.value)} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={labelStyle}>Fichier</label>
              <label style={{ ...ghostBtn, width: '100%', justifyContent: 'center' }}>
                {uploading === `${listKey}:${i}`
                  ? <><Loader size={15} className="spin" /> …</>
                  : row.fileUrl ? <><FileText size={15} /> Remplacer</> : <><Upload size={15} /> Téléverser</>}
                <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                  onChange={(e) => handleFile(listKey, i, e.target.files?.[0])} />
              </label>
            </div>
            <button type="button" style={iconBtn} aria-label="Supprimer" onClick={() => removeRow(listKey, i)}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <Icon size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{row.title}</span>
            <span style={muted}>
              {[row[orgField], row.year].filter(Boolean).join(' · ')}
            </span>
            {row.fileUrl && (
              <a href={row.fileUrl} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                <FileText size={15} /> Voir le fichier
              </a>
            )}
          </div>
        )
      ))}

      {isEditing && (
        <button type="button" style={{ ...ghostBtn, marginTop: '0.5rem' }}
          onClick={() => addRow(listKey, { title: '', [orgField]: '', year: '', fileUrl: '' })}>
          <Plus size={16} /> Ajouter
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Skills */}
      <div style={cardStyle}>
        <h3 style={headingStyle}><Sparkles size={20} style={{ color: 'var(--primary)' }} /> Compétences</h3>
        <p style={subStyle}>Vos savoir-faire techniques et personnels.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {v.skills.length === 0 && <span style={muted}>Aucune compétence.</span>}
          {v.skills.map((s, i) => (
            <span key={`${s}-${i}`} style={chip}>
              {s}
              {isEditing && (
                <button type="button" onClick={() => removeSkill(i)} aria-label={`Retirer ${s}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </span>
          ))}
        </div>
        {isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem' }}>
            <input style={{ ...inputStyle, maxWidth: '260px' }} value={skillDraft} placeholder="ex: React"
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
            <button type="button" style={ghostBtn} onClick={addSkill}><Plus size={16} /> Ajouter</button>
          </div>
        )}
      </div>

      {/* Languages */}
      <div style={cardStyle}>
        <h3 style={headingStyle}><LanguagesIcon size={20} style={{ color: 'var(--primary)' }} /> Langues</h3>
        <p style={subStyle}>Les langues que vous parlez et votre niveau.</p>
        {v.languages.length === 0 && !isEditing && <p style={muted}>Aucune langue.</p>}
        {v.languages.map((lang, i) => (
          isEditing ? (
            <div key={i} style={rowWrap}>
              <div style={{ flex: '2 1 180px' }}>
                <label style={labelStyle}>Langue</label>
                <input style={inputStyle} value={lang.name || ''} placeholder="ex: Français"
                  onChange={(e) => updateRow('languages', i, 'name', e.target.value)} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Niveau</label>
                <select style={inputStyle} value={lang.level || ''}
                  onChange={(e) => updateRow('languages', i, 'level', e.target.value)}>
                  {LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button type="button" style={iconBtn} aria-label="Supprimer" onClick={() => removeRow('languages', i)}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.35rem 0' }}>
              <span style={{ fontWeight: 600 }}>{lang.name}</span>
              {lang.level && <span style={muted}>— {LEVEL_LABEL[lang.level] || lang.level}</span>}
            </div>
          )
        ))}
        {isEditing && (
          <button type="button" style={{ ...ghostBtn, marginTop: '0.5rem' }}
            onClick={() => addRow('languages', { name: '', level: '' })}>
            <Plus size={16} /> Ajouter une langue
          </button>
        )}
      </div>

      {renderCredential({
        listKey: 'certifications', title: 'Certificats', icon: Award,
        orgField: 'issuer', orgLabel: 'Organisme',
        subtitle: 'Vos certifications (avec le fichier PDF ou image).',
      })}

      {renderCredential({
        listKey: 'diplomas', title: 'Diplômes', icon: GraduationCap,
        orgField: 'institution', orgLabel: 'Établissement',
        subtitle: 'Vos diplômes (avec le fichier PDF ou image).',
      })}

      {/* Social links */}
      <div style={cardStyle}>
        <h3 style={headingStyle}><Link2 size={20} style={{ color: 'var(--primary)' }} /> Liens</h3>
        <p style={subStyle}>Vos réseaux et votre portfolio en ligne.</p>
        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {SOCIAL.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Icon size={15} /> {label}
                </label>
                <input style={inputStyle} type="url" value={v.socialLinks[key] || ''} placeholder={placeholder}
                  onChange={(e) => patch({ socialLinks: { ...v.socialLinks, [key]: e.target.value } })} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {SOCIAL.filter(({ key }) => v.socialLinks[key]).length === 0 && <span style={muted}>Aucun lien.</span>}
            {SOCIAL.filter(({ key }) => v.socialLinks[key]).map(({ key, label, icon: Icon }) => (
              <a key={key} href={v.socialLinks[key]} target="_blank" rel="noopener noreferrer" style={{ ...chip, textDecoration: 'none', color: 'var(--primary)' }}>
                <Icon size={16} /> {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
