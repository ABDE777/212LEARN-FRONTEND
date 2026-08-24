import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import api from '../services/api';
import { initialsAvatar } from '../utils/avatarPlaceholder';

// Custom inline SVG icons for guaranteed cross-platform compatibility
const LinkedinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const ADMIN_FOUNDER_MEMBERS = [
  {
    id: 'admin-1',
    name: 'Ibrahim Challal',
    role: 'FONDATEUR & ADMINISTRATEUR PRINCIPAL',
    image: initialsAvatar('Ibrahim Challal'),
    social: { linkedin: 'https://linkedin.com', twitter: 'https://twitter.com' },
  },
  {
    id: 'admin-2',
    name: 'Abdel Monim Mazguora',
    role: 'CO-FONDATEUR & DIRECTEUR TECHNIQUE',
    image: initialsAvatar('Abdel Monim Mazguora'),
    social: { linkedin: 'https://linkedin.com', website: 'https://212learn.com' },
  },
];

export default function TeamShowcase({ members: propMembers }) {
  const [dbAdmins, setDbAdmins] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (propMembers) return;
    async function fetchAdmins() {
      try {
        const res = await api.get('/stats/admins', { validateStatus: (status) => status < 400 });
        if (res.status === 200) {
          const list = res.data?.data || res.data || [];
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map((a) => ({
              id: a.id,
              name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Admin 212',
              role: a.bio || 'ADMINISTRATEUR PLATEFORME 212LEARN',
              image: a.avatar || initialsAvatar(`${a.firstName || ''} ${a.lastName || ''}`),
              social: a.socialLinks || { linkedin: 'https://linkedin.com' },
            }));
            setDbAdmins(mapped);
          }
        }
      } catch {
        // Fallback to static admin list
      }
    }
    fetchAdmins();
  }, [propMembers]);

  const members = propMembers || (dbAdmins.length > 0 ? dbAdmins : ADMIN_FOUNDER_MEMBERS);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="team-showcase-container">
      {/* ── Left: Photo Columns Grid ── */}
      <div className="team-photo-grid">
        {/* Column 1 */}
        <div className="team-photo-col col-1">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="photo-card-lg"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 (Offset Top) */}
        <div className="team-photo-col col-2">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="photo-card-xl"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 3 (Slight Offset Top) */}
        <div className="team-photo-col col-3">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="photo-card-md"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* ── Right: Member Rows List ── */}
      <div className="team-members-list">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Photo Card Component
───────────────────────────────────────── */
function PhotoCard({ member, className, hoveredId, onHover }) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={`team-photo-card ${className} ${isDimmed ? 'dimmed' : ''} ${isActive ? 'active' : ''}`}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className="team-photo-img"
        style={{
          filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.75)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Member Row Component
───────────────────────────────────────── */
function MemberRow({ member, hoveredId, onHover }) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial = member.social?.twitter || member.social?.linkedin || member.social?.instagram || member.social?.website;

  return (
    <div
      className={`team-member-row ${isDimmed ? 'dimmed' : ''} ${isActive ? 'active' : ''}`}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Name + Indicator + Social */}
      <div className="member-row-header">
        <span className={`member-indicator ${isActive ? 'active' : ''}`} />
        <span className={`member-name ${isActive ? 'active' : ''}`}>
          {member.name}
        </span>

        {/* Social Icons */}
        {hasSocial && (
          <div className={`member-social-group ${isActive ? 'active' : ''}`}>
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="social-link"
                title="LinkedIn"
              >
                <LinkedinIcon />
              </a>
            )}
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="social-link"
                title="Twitter / X"
              >
                <TwitterIcon />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="social-link"
                title="Instagram"
              >
                <InstagramIcon />
              </a>
            )}
            {member.social?.website && (
              <a
                href={member.social.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="social-link"
                title="Site Web"
              >
                <Globe size={13} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Role */}
      <p className="member-role">{member.role}</p>
    </div>
  );
}
