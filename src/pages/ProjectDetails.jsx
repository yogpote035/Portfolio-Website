import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { getProjectBySlug } from '../data/projects.js';
import { fadeUp, staggerContainer, viewport } from '../utils/animations.js';

function ProjectDetails() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <section className="page-section not-found">
        <h1>Project not found</h1>
        <p>The project you are looking for does not exist yet.</p>
        <Button to="/projects">Back to Projects</Button>
      </section>
    );
  }

  return (
    <section className="project-detail page-section">
      <motion.div className="project-detail-hero" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <img src={project.image} alt={`${project.title} banner`} loading="eager" />
        <div>
          <Link className="text-link" to="/projects">
            <i className="bx bx-left-arrow-alt" /> Back to projects
          </Link>
          <span className="eyebrow2">{project.subtitle}</span>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="detail-actions">
            <Button href={project.githubUrl} rel="noreferrer" target="_blank">
              GitHub Repository
            </Button>
            <Button href={project.liveUrl} rel="noreferrer" target="_blank">
              Live Website
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div className="feature-card-grid" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">
        {project.features.map((feature) => (
          <motion.article className="feature-card" key={feature} variants={fadeUp}>
            <i className="bx bx-check-shield" />
            <p>{feature}</p>
          </motion.article>
        ))}
      </motion.div>

      <motion.div className="project-detail-grid" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">
        <motion.article className="detail-panel" variants={fadeUp}>
          <h2>Core Features</h2>
          <ul>
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </motion.article>

       <motion.article className="detail-panel" variants={fadeUp}>
          <h2>Technologies Used</h2>
          <div className="tech-stack large">
            {project.techStack.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        </motion.article>

        <motion.article className="detail-panel" variants={fadeUp}>
          <h2>Challenges Faced</h2>
          <ul>
            {project.challenges.map((challenge) => (
              <li key={challenge}>{challenge}</li>
            ))}
          </ul>
        </motion.article>


        <motion.article className="detail-panel" variants={fadeUp}>
          <h2>Project Info</h2>
          <p>
            <b>Duration:</b> {project.duration}
          </p>
          <p>
            <b>Role:</b> {project.role}
          </p>
        </motion.article>
      </motion.div>

      <motion.div className="gallery-section" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <h2>Screenshots / UI Placeholders</h2>
        <div className="gallery-grid">
          {project.screenshots.map((screenshot, index) => (
            <img
              alt={`${project.title} screenshot ${index + 1}`}
              key={`${project.slug}-${screenshot}-${index}`}
              loading="lazy"
              src={screenshot}
            />
          ))}
        </div>
      </motion.div>

      <motion.article className="detail-panel future-panel" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <h2>Future Improvements</h2>
        <ul>
          {project.futureImprovements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </motion.article>
      {project?.note && <span className="note">{project.note}</span>}

    </section>
  );
}

export default ProjectDetails;
