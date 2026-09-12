import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import ProjectCard from '../components/ProjectCard.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { projects } from '../data/projects.js';
import { useApiData } from '../hooks/useApiData.js';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { normalizeProjectList } from '../utils/apiTransform.js';
import { staggerContainer, viewport } from '../utils/animations.js';

const filterDefinitions = [
  {
    label: 'Enterprise',
    matches: (project) => project.projectType === 'company',
  },
  {
    label: 'Freelance',
    matches: (project) => project.projectType === 'freelance',
  },
  {
    label: 'Personal',
    matches: (project) => project.projectType === 'personal',
  },
];

function Projects() {
  const [filter, setFilter] = useState('All');
  const [technology, setTechnology] = useState('All technologies');
  const [technologyQuery, setTechnologyQuery] = useState('');
  const technologyMenuRef = useRef(null);

  useEffect(() => {
    const closeTechnologyMenu = (event) => {
      const menu = technologyMenuRef.current;
      if (!menu?.open) return;

      if (event.type === 'keydown' && event.key === 'Escape') {
        menu.open = false;
        menu.querySelector('summary')?.focus();
        return;
      }

      if (event.type === 'pointerdown' && !menu.contains(event.target)) {
        menu.open = false;
      }
    };

    document.addEventListener('pointerdown', closeTechnologyMenu);
    document.addEventListener('keydown', closeTechnologyMenu);
    return () => {
      document.removeEventListener('pointerdown', closeTechnologyMenu);
      document.removeEventListener('keydown', closeTechnologyMenu);
    };
  }, []);

  const { data: projectItems, loading } = useApiData({
    path: '/api/projects',
    fallbackData: projects,
    transform: (items) => normalizeProjectList(items, projects),
  });

  useDocumentMeta({
    title: 'Projects | Yogesh Pote',
    description: 'Selected full-stack, React, ERP, and product engineering work by Yogesh Pote.',
    canonicalPath: '/projects',
  });

  const availableFilters = useMemo(() => [
    'All',
    ...filterDefinitions
      .filter((definition) => projectItems.some(definition.matches))
      .map((definition) => definition.label),
  ], [projectItems]);

  const technologies = useMemo(() => Array.from(
    new Set(projectItems.flatMap((project) => project.techStack || []).filter(Boolean)),
  ).sort((first, second) => first.localeCompare(second)), [projectItems]);

  const searchedTechnologies = useMemo(() => {
    const query = technologyQuery.trim().toLowerCase();
    return query
      ? technologies.filter((item) => item.toLowerCase().includes(query))
      : technologies;
  }, [technologies, technologyQuery]);

  const visibleProjects = useMemo(() => projectItems.filter((project) => {
    const matchesType = filter === 'All'
      || (filterDefinitions.find((definition) => definition.label === filter)?.matches(project) ?? true);
    const matchesTechnology = technology === 'All technologies'
      || project.techStack?.some((item) => item.toLowerCase() === technology.toLowerCase());
    return matchesType && matchesTechnology;
  }), [filter, projectItems, technology]);

  const selectTechnology = (value) => {
    setTechnology(value);
    setTechnologyQuery('');
    if (technologyMenuRef.current) technologyMenuRef.current.open = false;
  };

  return (
    <PageTransition>
      <section className="projects-page page-section">
        <header className="archive-header">
          <span className="eyebrow">Selected work · 2024—2026</span>
          <h1>Products built with<br /><em>purpose and precision.</em></h1>
          <p>A growing archive of full-stack platforms, enterprise systems, and product experiments built from interface to API.</p>
        </header>

        <div className="project-filter-bar">
          <div className="project-filter" role="group" aria-label="Filter projects by type">
            {availableFilters.map((item) => (
              <button
                className={filter === item ? 'active' : ''}
                key={item}
                onClick={() => setFilter(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <details className="technology-filter" ref={technologyMenuRef}>
            <summary aria-label={`Filter by technology. Current selection: ${technology}`}>
              <i className="bx bx-filter-alt" aria-hidden="true" />
              <span>{technology}</span>
              <i className="bx bx-chevron-down" aria-hidden="true" />
            </summary>
            <div className="technology-filter-menu">
              <label htmlFor="technology-search">Search technology</label>
              <div className="technology-search-field">
                <i className="bx bx-search" aria-hidden="true" />
                <input
                  id="technology-search"
                  type="search"
                  value={technologyQuery}
                  onChange={(event) => setTechnologyQuery(event.target.value)}
                  placeholder="React, Node.js, MongoDB..."
                  autoComplete="off"
                />
              </div>
              <div className="technology-options" role="listbox" aria-label="Technologies">
                <button
                  type="button"
                  role="option"
                  aria-selected={technology === 'All technologies'}
                  className={technology === 'All technologies' ? 'selected' : ''}
                  onClick={() => selectTechnology('All technologies')}
                >
                  All technologies
                </button>
                {searchedTechnologies.map((item) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={technology === item}
                    className={technology === item ? 'selected' : ''}
                    key={item}
                    onClick={() => selectTechnology(item)}
                  >
                    {item}
                  </button>
                ))}
                {searchedTechnologies.length === 0 && (
                  <span className="technology-empty">No matching technology</span>
                )}
              </div>
            </div>
          </details>

          <span className="project-result-count" aria-live="polite">
            {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {loading ? (
          <div className="project-card-grid">
            {[1, 2, 3].map((item) => <div className="project-skeleton" key={item} />)}
          </div>
        ) : (
          <motion.div
            className="project-card-grid"
            initial="hidden"
            variants={staggerContainer}
            viewport={viewport}
            whileInView="visible"
          >
            {visibleProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} variant="card" />
            ))}
          </motion.div>
        )}
      </section>
    </PageTransition>
  );
}

export default Projects;