import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useActiveSection from '../hooks/useActiveSection.js';

const sectionIds = ['home', 'about', 'skills', 'experience', 'portfolio', 'education', 'contact'];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true' ? true : false);
  const [sticky, setSticky] = useState(false);
  const activeSection = useActiveSection(sectionIds);
  const location = useLocation();

  const navLinks = useMemo(
    () => [
      { label: 'Home', to: '/#home', section: 'home' },
      { label: 'About', to: '/#about', section: 'about' },
      { label: 'Skills', to: '/#skills', section: 'skills' },
      { label: 'Experience', to: '/#experience', section: 'experience' },
      { label: 'Projects', to: '/projects', section: 'portfolio' },
      { label: 'Education', to: '/#education', section: 'education' },
      { label: 'Contact', to: '/#contact', section: 'contact' },
    ],
    [],
  );

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 100);
      setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (link) => {
    if (location.pathname === '/projects') return link.to === '/projects';
    if (location.pathname.startsWith('/projects/')) return link.to === '/projects';
    if (location.pathname === '/') return activeSection === link.section;
    return false;
  };

  return (
    <header className={`header ${sticky ? 'sticky' : ''}`}>
      <Link className="logo" to="/#home">
        Portfolio
      </Link>

      <button
        aria-label="Toggle navigation menu"
        className="menu-button"
        onClick={() => setMenuOpen((current) => !current)}
        type="button"
      >
        <i className={`bx ${menuOpen ? 'bx-x' : 'bx-menu'}`} id="menu-icon" />
      </button>

      <nav className={`navbar ${menuOpen ? 'active' : ''}`} aria-label="Primary navigation">
        {navLinks.map((link) => (
          <Link
            className={isActive(link) ? 'active' : ''}
            key={link.label}
            onClick={() => setMenuOpen(false)}
            to={link.to}
          >
            {link.label}
          </Link>
        ))}
        <button
          aria-label="Toggle dark mode"
          className="darkMode"
          onClick={() => setDarkMode((current) => !current)}
          type="button"
        >
          <i className={`bx ${darkMode ? 'bxs-moon' : 'bx-sun'}`} />
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
