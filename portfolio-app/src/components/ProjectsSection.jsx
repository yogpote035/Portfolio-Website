import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects.js';
import { useApiData } from '../hooks/useApiData.js';
import { normalizeProjectList } from '../utils/apiTransform.js';
import { staggerContainer, viewport } from '../utils/animations.js';
import ProjectCard from './ProjectCard.jsx';
import SectionTitle from './SectionTitle.jsx';

function ProjectsSection() {
  const { data: projectItems } = useApiData({
    path: '/api/projects',
    fallbackData: projects,
    transform: (projectsFromApi) => normalizeProjectList(projectsFromApi, projects),
  });

  return (
    <section className="portfolio" id="portfolio">
      <div className="section-heading-row">
        <div>
          <SectionTitle accent="work" index="05">Selected</SectionTitle>
          <p className="section-subtitle">
            Case-study style builds focused on secure full-stack workflows,
            responsive interfaces, and production-ready React architecture.
          </p>
        </div>
        <Link className="text-link" to="/projects">
          View the archive <i className="bx bx-right-arrow-alt" />
        </Link>
      </div>
      <motion.div className="portfolio-content" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">
        {projectItems.slice(0, 4).map((project, index) => (
          <div className={`featured-project ${index % 2 ? 'is-reversed' : ''}`} key={project.slug}><span className="project-number">0{index + 1}</span><ProjectCard project={project} /></div>
        ))}
      </motion.div>
    </section>
  );
}

export default ProjectsSection;
