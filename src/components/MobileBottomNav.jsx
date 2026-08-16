import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, LayoutDashboard, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Native-app-style bottom tab bar. Rendered always, but CSS shows it only on
 * mobile (≤768px) — see `.mobile-bottom-nav` in index.css. Gives the primary
 * app sections as fixed thumb-reachable tabs, the way a real mobile app does.
 */
export default function MobileBottomNav() {
  const { user, isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  const role = user?.role?.toUpperCase();
  const dashPath =
    role === 'INSTRUCTOR' ? '/instructor/dashboard'
    : role === 'ADMIN' ? '/admin/dashboard'
    : '/student/dashboard';

  const tabs = isAuthenticated
    ? [
        { to: '/', label: 'Accueil', icon: Home },
        { to: '/courses', label: 'Cours', icon: BookOpen },
        { to: dashPath, label: 'Espace', icon: LayoutDashboard },
        { to: `${dashPath}?tab=profile`, label: 'Profil', icon: User, match: dashPath },
      ]
    : [
        { to: '/', label: 'Accueil', icon: Home },
        { to: '/courses', label: 'Cours', icon: BookOpen },
        { to: '/login', label: 'Connexion', icon: LogIn },
        { to: '/signup', label: "S'inscrire", icon: UserPlus },
      ];

  const isActive = (to) => {
    const path = to.split('?')[0];
    return path === '/' ? pathname === '/' : pathname.startsWith(path);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation principale">
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = isActive(t.to);
        return (
          <Link key={t.label} to={t.to} className={`mbn-item ${active ? 'active' : ''}`}>
            <Icon size={21} strokeWidth={active ? 2.4 : 2} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
