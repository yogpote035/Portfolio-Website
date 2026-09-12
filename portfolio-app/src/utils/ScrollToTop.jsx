import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (hash) {
      const target = document.querySelector(hash);
      target?.scrollIntoView({ behavior });
      return;
    }

    window.scrollTo({ top: 0, behavior });
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
