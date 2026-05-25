import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects.js';
import { staggerContainer, viewport } from '../utils/animations.js';
import ProjectCard from './ProjectCard.jsx';
import SectionTitle from './SectionTitle.jsx';

function ProjectsSection() {
  return (
    <section className="portfolio" id="portfolio">
      <div className="section-heading-row">
        <div>
          <SectionTitle accent="Projects">Featured</SectionTitle>
          <p className="section-subtitle">
            Case-study style builds focused on secure full-stack workflows,
            responsive interfaces, and production-ready React architecture.
          </p>
        </div>
        <Link className="text-link" to="/projects">
          View all projects
        </Link>
      </div>
      <motion.div className="portfolio-content" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </motion.div>
    </section>
  );
}

export default ProjectsSection;
