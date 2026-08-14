import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, BarChart3, HelpCircle, Video, Users, User,
  ChevronRight, ChevronLeft, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Single source of truth for the instructor dashboard tabs, shared by the
// dashboard and the course-management page so the sidebar never "disappears".
export const INSTRUCTOR_TABS = [
  { key: 'courses',   icon: BookOpen,  label: 'Mes cours' },
  { key: 'create',    icon: Plus,      label: 'Créer un cours' },
  { key: 'analytics', icon: BarChart3, label: 'Analytics' },
  { key: 'quizzes',   icon: HelpCircle,label: 'Quiz' },
  { key: 'meetings',  icon: Video,     label: 'Sessions Live' },
  { key: 'students',  icon: Users,     label: 'Étudiants' },
  { key: 'profile',   icon: User,      label: 'Mon profil' },
];

/**
 * Instructor sidebar.
 * @param {string|null} active - highlighted tab key (null when off-dashboard).
 * @param {(key:string)=>void} [onSelect] - when provided (on the dashboard) it
 *   switches the tab in place; otherwise clicks navigate to the dashboard with
 *   ?tab= so the sidebar works from the course-management page too.
 */
export default function InstructorSidebar({ active = null, onSelect }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  const go = (key) => {
    if (onSelect) onSelect(key);
    else navigate(`/instructor/dashboard?tab=${key}`);
  };

  return (
    <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="sidebar-toggle-btn"
        title={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="sidebar-menu">
        {INSTRUCTOR_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => go(t.key)}
              className={`sidebar-menu-btn ${active === t.key ? 'active' : ''}`}
              title={t.label}
            >
              <Icon size={18} />
              <span>{t.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="sidebar-menu-btn"
          style={{ marginTop: 'auto', color: 'var(--error-color)' }}
          title="Déconnexion"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </nav>
    </aside>
  );
}
