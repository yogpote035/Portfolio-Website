import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useActiveSection from '../hooks/useActiveSection.js';

const sectionIds = ['home', 'about', 'skills', 'experience', 'portfolio', 'education', 'contact'];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection(sectionIds);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const navLinks = useMemo(
    () => [
      { label: 'Home', to: '/#home', section: 'home' },
      { label: 'About', to: '/#about', section: 'about' },
      { label: 'Skills', to: '/#skills', section: 'skills' },
      { label: 'Experience', to: '/#experience', section: 'experience' },
      { label: 'Projects', to: '/projects', section: 'portfolio' },
      { label: 'Education', to: '/#education', section: 'education' },
    ],
    [],
  );

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (link) => {
    if (location.pathname.startsWith('/projects')) return link.to === '/projects';
    return location.pathname === '/' && activeSection === link.section;
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="nav-shell">
        <Link className="logo" to="/#home" aria-label="Yogesh Pote home"><span>YP</span><small>Portfolio</small></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link className={isActive(link) ? 'active' : ''} key={link.label} to={link.to}>
              {link.label}{isActive(link) && <motion.span className="nav-indicator" layoutId="nav-indicator" />}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="icon-button" type="button" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? 'Use light theme' : 'Use dark theme'}>
            <i className={`bx ${darkMode ? 'bx-sun' : 'bx-moon'}`} />
          </button>
          <Link className="nav-cta" to="/#contact">Start a conversation <i className="bx bx-up-arrow-alt" /></Link>
          <button className="menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
            <i className={`bx ${menuOpen ? 'bx-x' : 'bx-menu-alt-right'}`} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={reduceMotion ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {navLinks.map((link, index) => (
              <motion.div key={link.label} initial={reduceMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>
                <Link className={isActive(link) ? 'active' : ''} to={link.to} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{link.label}</Link>
              </motion.div>
            ))}
            <Link className="mobile-contact-link" to="/#contact" onClick={() => setMenuOpen(false)}>Let&apos;s work together <i className="bx bx-right-arrow-alt" /></Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
