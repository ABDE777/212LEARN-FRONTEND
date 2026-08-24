import { useState, useEffect } from 'react';
import { Loader, CheckCircle, ShieldCheck, Server } from 'lucide-react';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminSettingsTab() {
  const { settings: loaded, loading, error, saving, save } = useAdminSettings();
  const [settings, setSettings] = useState(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Mirror the loaded settings into local editable state once fetched.
  useEffect(() => { if (loaded) setSettings(loaded); }, [loaded]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!settings) return;
    setSaveError(null);
    try {
      await save({
        requireKyc: settings.requireKyc,
        allowRegistrations: settings.allowRegistrations,
        maintenanceMode: settings.maintenanceMode,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    }
  };

  if (loading || !settings) {
    return <div style={{ padding: '2rem' }}><LoadingSpinner /></div>;
  }

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
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '10px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader size={16} className="spin" /> : <CheckCircle size={16} />}
          {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>

      {savedMsg && (
        <div style={{ padding: '1rem 1.25rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ Paramètres enregistrés avec succès !
        </div>
      )}

      {(saveError || error) && (
        <div style={{ padding: '1rem 1.25rem', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {saveError || error}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '1.5rem' }}>
        {/* Section: Sécurité & Accès */}
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
