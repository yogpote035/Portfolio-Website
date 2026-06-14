import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeUp } from "../utils/animations.js";

function ProjectCard({ project, variant = "overlay" }) {
  if (variant === "card") {
    return (
      <motion.article
        className="project-card premium-project-card"
        variants={fadeUp}
        whileHover={{ y: -10 }}
      >
        <img
          src={project.image}
          alt={`${project.title} preview`}
          loading="lazy"
        />
        <div className="project-card-body">
          <span className="eyebrow">{project.subtitle}</span>
          <h3>{project.title}</h3>
          <p>{project.shortDescription}</p>
          <div className="tech-stack">
            {project.techStack.slice(0, 6).map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
          <div className="project-actions">
            <Link className="btn compact-btn" to={`/projects/${project.slug}`}>
              View Details
            </Link>
           {project && project.githubUrl && project.githubUrl.length > 0 && (
              <a href={project.githubUrl} rel="noreferrer" target="_blank">
                GitHub
              </a>
            )}
            {project && project.liveUrl && project.liveUrl.length > 0 && (
              <a href={project.liveUrl} rel="noreferrer" target="_blank">
                Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="portfolio-box"
      variants={fadeUp}
      whileHover={{ y: -8 }}
    >
      <img
        src={project.image}
        alt={`${project.title} preview`}
        loading="lazy"
      />
      <div className="portfolio-layer">
        <h4>{project.title}</h4>
        <span>{project.subtitle}</span>
        <p>{project.shortDescription}</p>
        <div className="portfolio-actions">
          <Link
            aria-label={`View ${project.title} details`}
            to={`/projects/${project.slug}`}
          >
            <i className="bx bx-detail" />
          </Link>
          <a
            aria-label={`Open ${project.title} live demo`}
            href={project.liveUrl}
            rel="noreferrer"
            target="_blank"
          >
            <i className="bx bx-link-external" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export default ProjectCard;
