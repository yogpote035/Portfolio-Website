import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (hash) {
      const targetId = decodeURIComponent(hash.slice(1));
      let frameId;
      let attempts = 0;

      const scrollToTarget = () => {
        const target = document.getElementById(targetId);

        if (target) {
          target.scrollIntoView({ behavior, block: 'start' });
          return;
        }

        attempts += 1;
        if (attempts < 90) frameId = window.requestAnimationFrame(scrollToTarget);
      };

      frameId = window.requestAnimationFrame(scrollToTarget);
      return () => window.cancelAnimationFrame(frameId);
    }

    window.scrollTo({ top: 0, behavior });
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
