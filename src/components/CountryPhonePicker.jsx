import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Comprehensive default country dataset with flags and international dial codes
export const DEFAULT_COUNTRIES = [
  { code: '+212', flag: '🇲🇦', name: 'Maroc', iso: 'MA' },
  { code: '+33', flag: '🇫🇷', name: 'France', iso: 'FR' },
  { code: '+34', flag: '🇪🇸', name: 'Espagne', iso: 'ES' },
  { code: '+32', flag: '🇧🇪', name: 'Belgique', iso: 'BE' },
  { code: '+1', flag: '🇨🇦', name: 'Canada', iso: 'CA' },
  { code: '+1', flag: '🇺🇸', name: 'États-Unis', iso: 'US' },
  { code: '+49', flag: '🇩🇪', name: 'Allemagne', iso: 'DE' },
  { code: '+44', flag: '🇬🇧', name: 'Royaume-Uni', iso: 'GB' },
  { code: '+39', flag: '🇮🇹', name: 'Italie', iso: 'IT' },
  { code: '+41', flag: '🇨🇭', name: 'Suisse', iso: 'CH' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal', iso: 'PT' },
  { code: '+31', flag: '🇳🇱', name: 'Pays-Bas', iso: 'NL' },
  { code: '+966', flag: '🇸🇦', name: 'Arabie Saoudite', iso: 'SA' },
  { code: '+971', flag: '🇦🇪', name: 'Émirats arabes unis', iso: 'AE' },
  { code: '+965', flag: '🇰🇼', name: 'Koweït', iso: 'KW' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar', iso: 'QA' },
  { code: '+968', flag: '🇴🇲', name: 'Oman', iso: 'OM' },
  { code: '+961', flag: '🇱🇧', name: 'Liban', iso: 'LB' },
  { code: '+962', flag: '🇯🇴', name: 'Jordanie', iso: 'JO' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie', iso: 'DZ' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie', iso: 'TN' },
  { code: '+20', flag: '🇪🇬', name: 'Égypte', iso: 'EG' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal', iso: 'SN' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", iso: 'CI' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun', iso: 'CM' },
  { code: '+242', flag: '🇨🇬', name: 'Congo', iso: 'CG' },
  { code: '+243', flag: '🇨🇩', name: 'RDC', iso: 'CD' },
  { code: '+223', flag: '🇲🇱', name: 'Mali', iso: 'ML' },
  { code: '+228', flag: '🇹🇬', name: 'Togo', iso: 'TG' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin', iso: 'BJ' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', iso: 'BF' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritanie', iso: 'MR' },
  { code: '+218', flag: '🇱🇾', name: 'Libye', iso: 'LY' },
  { code: '+249', flag: '🇸🇩', name: 'Soudan', iso: 'SD' },
  { code: '+90', flag: '🇹🇷', name: 'Turquie', iso: 'TR' },
  { code: '+86', flag: '🇨🇳', name: 'Chine', iso: 'CN' },
  { code: '+91', flag: '🇮🇳', name: 'Inde', iso: 'IN' },
  { code: '+81', flag: '🇯🇵', name: 'Japon', iso: 'JP' },
  { code: '+82', flag: '🇰🇷', name: 'Corée du Sud', iso: 'KR' },
  { code: '+61', flag: '🇦🇺', name: 'Australie', iso: 'AU' },
  { code: '+55', flag: '🇧🇷', name: 'Brésil', iso: 'BR' },
  { code: '+52', flag: '🇲🇽', name: 'Mexique', iso: 'MX' },
];

function getFlagEmoji(isoCode) {
  if (!isoCode || isoCode.length !== 2) return '🏳️';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function CountryFlagImage({ iso, fallbackEmoji }) {
  const [hasError, setHasError] = useState(false);

  if (iso && typeof iso === 'string' && !hasError) {
    const code = iso.toLowerCase();
    return (
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
        alt={iso}
        onError={() => setHasError(true)}
        style={{
          width: '20px',
          height: '14px',
          objectFit: 'cover',
          borderRadius: '2px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }

  return <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{fallbackEmoji || '🏳️'}</span>;
}

export default function CountryPhonePicker({ selectedCountry, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch full countries dataset from country-code.com API on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchCountriesFromAPI() {
      try {
        const res = await fetch('https://country-code.com/api/countries');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !Array.isArray(data)) return;

        const parsed = data
          .map((item) => {
            const dialCode = item.code?.trim();
            if (!dialCode) return null;
            return {
              code: dialCode,
              flag: getFlagEmoji(item.iso),
              name: item.name || '',
              iso: item.iso || '',
              flagUrl: item.flag ? `https://country-code.com${item.flag}` : undefined,
            };
          })
          .filter(Boolean);

        if (parsed.length > 0) {
          // Sort with Morocco (MA) first, then alphabetical by name
          const sorted = parsed.sort((a, b) => {
            if (a.iso === 'MA') return -1;
            if (b.iso === 'MA') return 1;
            return a.name.localeCompare(b.name, 'fr');
          });
          setCountries(sorted);
        }
      } catch {
        // Fallback to DEFAULT_COUNTRIES silently if API fails or offline
      }
    }
    fetchCountriesFromAPI();
    return () => { isMounted = false; };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredCountries = countries.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const activeCountry = selectedCountry || DEFAULT_COUNTRIES[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Country Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.55rem 0.65rem',
          fontSize: '0.88rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color, #cbd5e1)',
          background: '#ffffff',
          fontWeight: 600,
          cursor: 'pointer',
          color: 'var(--text-color, #1A1A2E)',
          minWidth: '96px',
          justifyContent: 'space-between',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <CountryFlagImage iso={activeCountry.iso} fallbackEmoji={activeCountry.flag} />
          <span>{activeCountry.code}</span>
        </span>
        <ChevronDown size={14} style={{ opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Popover Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 999,
              width: '280px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 12px 32px rgba(27, 75, 90, 0.16)',
              border: '1px solid rgba(27, 75, 90, 0.12)',
              overflow: 'hidden',
            }}
          >
            {/* Search Input Box */}
            <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.6rem', color: 'var(--secondary, #1B4B5A)', opacity: 0.6 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher pays ou code (+212)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem 0.45rem 2rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
              </div>
            </div>

            {/* Scrollable Country List */}
            <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '0.35rem 0' }}>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c, idx) => {
                  const isSelected = activeCountry.code === c.code && activeCountry.name === c.name;
                  return (
                    <button
                      key={`${c.iso}-${c.code}-${idx}`}
                      type="button"
                      onClick={() => {
                        onChange(c);
                        setIsOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.83rem',
                        border: 'none',
                        background: isSelected ? 'rgba(193, 101, 47, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-color, #1A1A2E)',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden' }}>
                        <CountryFlagImage iso={c.iso} fallbackEmoji={c.flag} />
                        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary, #C1652F)' }}>
                          {c.code}
                        </span>
                        {isSelected && <Check size={14} style={{ color: 'var(--primary, #C1652F)' }} />}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--secondary, #1B4B5A)' }}>
                  Aucun pays trouvé
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
