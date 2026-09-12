import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import ProjectCard from '../components/ProjectCard.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { projects } from '../data/projects.js';
import { useApiData } from '../hooks/useApiData.js';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { normalizeProjectList } from '../utils/apiTransform.js';
import { staggerContainer, viewport } from '../utils/animations.js';

const filters = ['All', 'Full stack', 'Frontend', 'Enterprise'];

function Projects() {
  const [filter, setFilter] = useState('All');
  const { data: projectItems, loading } = useApiData({ path: '/api/projects', fallbackData: projects, transform: (items) => normalizeProjectList(items, projects) });
  useDocumentMeta({ title: 'Projects | Yogesh Pote', description: 'Selected full-stack, React, ERP, and product engineering work by Yogesh Pote.', canonicalPath: '/projects' });
  const visibleProjects = useMemo(() => projectItems.filter((project) => {
    if (filter === 'All') return true;
    const text = `${project.title} ${project.subtitle} ${project.techStack.join(' ')}`.toLowerCase();
    if (filter === 'Enterprise') return text.includes('erp') || text.includes('enterprise');
    if (filter === 'Frontend') return text.includes('react');
    return text.includes('node') || text.includes('express') || text.includes('mern');
  }), [filter, projectItems]);
  return <PageTransition><section className="projects-page page-section">
    <header className="archive-header"><span className="eyebrow">Selected work · 2024—2026</span><h1>Products built with<br /><em>purpose and precision.</em></h1><p>A growing archive of full-stack platforms, enterprise systems, and product experiments built from interface to API.</p></header>
    <div className="project-filter" role="group" aria-label="Filter projects">{filters.map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}<span>{visibleProjects.length} projects</span></div>
    {loading ? <div className="project-card-grid">{[1,2,3].map((item) => <div className="project-skeleton" key={item} />)}</div> : <motion.div className="project-card-grid" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">{visibleProjects.map((project) => <ProjectCard key={project.slug} project={project} variant="card" />)}</motion.div>}
  </section></PageTransition>;
}
export default Projects;
