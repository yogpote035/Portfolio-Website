import { useEffect, useState } from 'react';

function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const handleScroll = () => {
      const current = sectionIds.find((id) => {
        const section = document.getElementById(id);
        if (!section) return false;

        const offset = section.offsetTop - 160;
        return window.scrollY >= offset && window.scrollY < offset + section.offsetHeight;
      });

      if (current) {
        setActiveSection(current);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  return activeSection;
}

export default useActiveSection;
