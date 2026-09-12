import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import ProjectCard from '../components/ProjectCard.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { projects } from '../data/projects.js';
import { useApiData } from '../hooks/useApiData.js';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { normalizeProjectList } from '../utils/apiTransform.js';
import { staggerContainer, viewport } from '../utils/animations.js';

const filterDefinitions = [
  {
    label: 'Full stack',
    matches: (project) => /node|express|mern|full[ -]?stack/i.test(
      `${project.title} ${project.subtitle} ${project.techStack.join(' ')}`,
    ),
  },
  {
    label: 'Frontend',
    matches: (project) => /react|frontend|html|css|tailwind|bootstrap/i.test(
      `${project.title} ${project.subtitle} ${project.techStack.join(' ')}`,
    ),
  },
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
  const { data: projectItems, loading } = useApiData({ path: '/api/projects', fallbackData: projects, transform: (items) => normalizeProjectList(items, projects) });
  useDocumentMeta({ title: 'Projects | Yogesh Pote', description: 'Selected full-stack, React, ERP, and product engineering work by Yogesh Pote.', canonicalPath: '/projects' });
  const availableFilters = useMemo(() => [
    'All',
    ...filterDefinitions
      .filter((definition) => projectItems.some(definition.matches))
      .map((definition) => definition.label),
  ], [projectItems]);
  const visibleProjects = useMemo(() => projectItems.filter((project) => {
    if (filter === 'All') return true;
    return filterDefinitions.find((definition) => definition.label === filter)?.matches(project) ?? true;
  }), [filter, projectItems]);
  return <PageTransition><section className="projects-page page-section">
    <header className="archive-header"><span className="eyebrow">Selected work · 2024—2026</span><h1>Products built with<br /><em>purpose and precision.</em></h1><p>A growing archive of full-stack platforms, enterprise systems, and product experiments built from interface to API.</p></header>
    <div className="project-filter" role="group" aria-label="Filter projects">{availableFilters.map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}<span>{visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}</span></div>
    {loading ? <div className="project-card-grid">{[1,2,3].map((item) => <div className="project-skeleton" key={item} />)}</div> : <motion.div className="project-card-grid" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">{visibleProjects.map((project) => <ProjectCard key={project.slug} project={project} variant="card" />)}</motion.div>}
  </section></PageTransition>;
}
export default Projects;
