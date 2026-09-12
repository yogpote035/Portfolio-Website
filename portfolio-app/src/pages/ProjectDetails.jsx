import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import PageTransition from '../components/PageTransition.jsx';
import SmartImage from '../components/SmartImage.jsx';
import ImageGallery from '../components/ImageGallery.jsx';
import { getProjectBySlug, projects } from '../data/projects.js';
import { useApiData } from '../hooks/useApiData.js';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { normalizeProjectDetail } from '../utils/apiTransform.js';
import { fadeUp, viewport } from '../utils/animations.js';

function ProjectDetails() {
  const { slug } = useParams();
  const fallbackProject = getProjectBySlug(slug);
  const { data: project } = useApiData({ path: `/api/projects/${slug}`, fallbackData: fallbackProject, transform: (item) => normalizeProjectDetail(item, fallbackProject) || fallbackProject });
  const index = Math.max(0, projects.findIndex((item) => item.slug === slug));
  const nextProject = projects[(index + 1) % projects.length];
  useDocumentMeta({
    title: `${project?.title || 'Project'} | Yogesh Pote`,
    description: project?.shortDescription || 'Project case study by Yogesh Pote.',
    image: project?.image,
    canonicalPath: `/projects/${slug}`,
    structuredData: project ? {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: project.title,
      description: project.shortDescription, applicationCategory: 'WebApplication',
      author: { '@type': 'Person', name: 'Yogesh Pote' },
      url: project.liveUrl || window.location.href,
    } : null,
  });
  if (!project) return <PageTransition><section className="page-section not-found"><span>404 / Project</span><h1>This case study isn&apos;t here.</h1><Button to="/projects">Back to projects</Button></section></PageTransition>;
  const responsibilities = project.responsibilities?.length ? project.responsibilities : project.features?.slice(0, 3);
  return <PageTransition><article className="project-detail page-section">
    <header className="case-hero"><Link className="text-link" to="/projects"><i className="bx bx-left-arrow-alt" /> Project archive</Link><span className="eyebrow">Case study · {String(index + 1).padStart(2, '0')}</span><h1>{project.title}</h1><p>{project.shortDescription}</p><div className="case-meta">{project.role && <span><small>Role</small>{project.role}</span>}{project.duration && <span><small>Timeline</small>{project.duration}</span>}{project.techStack.length > 0 && <span><small>Stack</small>{project.techStack.slice(0,3).join(', ')}</span>}</div></header>
    <motion.div className="case-cover" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible"><SmartImage src={project.image} alt={`${project.title} product interface`} eager fallbackText={project.title} /></motion.div>
    <section className="case-section case-overview"><div><span className="section-index">01</span><h2>The overview</h2></div><p>{project.description}</p></section>
    <section className="case-section"><div><span className="section-index">02</span><h2>What I delivered</h2></div><ol className="feature-list">{project.features.map((feature, i) => <li key={feature}><span>{String(i + 1).padStart(2,'0')}</span>{feature}</li>)}</ol></section>
    <section className="case-section split-case"><div><span className="section-index">03</span><h2>Responsibilities</h2><ul>{responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span className="section-index">04</span><h2>Technical challenges</h2><ul>{project.challenges.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
    <section className="case-stack"><span className="eyebrow">Technology</span><div className="tech-stack large">{project.techStack.map((tech) => <span key={tech}>{tech}</span>)}</div></section>
    {project.screenshots?.length > 0 && <section className="gallery-section"><div className="section-heading-row"><div><span className="section-index">05</span><h2>Interface gallery</h2></div><p>{project.screenshots.length} selected screens · Click to explore</p></div><ImageGallery images={project.screenshots} title={project.title} /></section>}
    <section className="case-section future-panel"><div><span className="section-index">06</span><h2>What comes next</h2></div><ul>{project.futureImprovements.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <div className="detail-actions">{project.githubUrl && <Button href={project.githubUrl} target="_blank" rel="noreferrer">GitHub <i className="bx bxl-github" /></Button>}{project.liveUrl && <Button className="btn-outline" href={project.liveUrl} target="_blank" rel="noreferrer">Live product <i className="bx bx-link-external" /></Button>}</div>
    {project.note && <p className="project-note">{project.note}</p>}
    <Link className="next-project" to={`/projects/${nextProject.slug}`}><span>Next case study</span><strong>{nextProject.title}</strong><i className="bx bx-right-arrow-alt" /></Link>
  </article></PageTransition>;
}
export default ProjectDetails;
