import { motion } from 'framer-motion';
import ProjectCard from '../components/ProjectCard.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import { projects } from '../data/projects.js';
import { useApiData } from '../hooks/useApiData.js';
import { normalizeProjectList } from '../utils/apiTransform.js';
import { staggerContainer, viewport } from '../utils/animations.js';

function Projects() {
  const { data: projectItems } = useApiData({
    path: '/api/projects',
    fallbackData: projects,
    transform: (projectsFromApi) => normalizeProjectList(projectsFromApi, projects),
  });

  return (
    <section className="projects-page page-section">
      <div className="page-title">
        <SectionTitle accent="Projects">All</SectionTitle>
        <p>
          Full-stack portfolio projects built around realistic product workflows,
          secure authentication, role-based access, reusable React components, and
          scalable API integration.
        </p>
      </div>

      <motion.div className="project-card-grid" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">
        {projectItems.map((project) => (
          <ProjectCard key={project.slug} project={project} variant="card" />
        ))}
      </motion.div>
    </section>
  );
}

export default Projects;
