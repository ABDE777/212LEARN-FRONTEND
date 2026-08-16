import AnimatedLogo from './AnimatedLogo';
import { Mail, Phone, ExternalLink, Globe, Share2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <AnimatedLogo size={80} />
          </div>
          <p className="footer-tagline">
            La plateforme d'e-learning ultime conçue pour votre réussite en informatique.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="GitHub" className="footer-social-btn"><Globe size={18} /></a>
            <a href="#" aria-label="Twitter" className="footer-social-btn"><Share2 size={18} /></a>
            <a href="#" aria-label="LinkedIn" className="footer-social-btn"><LinkIcon size={18} /></a>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/about">À propos</Link></li>
            <li><Link to="/courses">Cours</Link></li>
            <li><Link to="/contact">Page de Contact</Link></li>
          </ul>
        </div>

        {/* Account Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Compte</h4>
          <ul className="footer-links">
            <li><Link to="/login">Connexion</Link></li>
            <li><Link to="/signup">Inscription</Link></li>
            <li><Link to="/student/dashboard">Tableau de bord</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact</h4>
          <ul className="footer-contact-list">
            <li>
              <Mail size={16} />
              <a href="mailto:212learn.support@gmail.com">212learn.support@gmail.com</a>
            </li>
            <li>
              <Phone size={16} />
              <a href="tel:+212605713171">+212 605-713171</a>
            </li>
            <li>
              <Phone size={16} />
              <a href="tel:+212631883412">+212 631-883412</a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <span>© {currentYear} 212Learn. Tous droits réservés.</span>
        <span>Fait avec ❤️ pour les apprenants du Maroc</span>
      </div>
    </footer>
  );
}
