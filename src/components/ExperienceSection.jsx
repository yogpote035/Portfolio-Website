import { motion } from 'framer-motion';
import { experiences } from '../data/resume.js';
import { fadeUp, staggerContainer, viewport } from '../utils/animations.js';
import SectionTitle from './SectionTitle.jsx';

function ExperienceSection() {
  return (
    <section className="experience-section" id="experience">
      <div className="section-intro">
        <SectionTitle accent="Experience">Professional</SectionTitle>
        <p>
          Internship experience building real-world ERP and HRMS modules with React,
          Redux Toolkit, secure authentication, REST APIs, and collaborative delivery.
        </p>
      </div>
      <motion.div className="experience-timeline" initial="hidden" variants={staggerContainer} viewport={viewport} whileInView="visible">
        {experiences.map((item) => (
          <motion.article className="experience-card" key={item.company} variants={fadeUp}>
            <div className="timeline-dot" />
            <div className="experience-meta">
              <span>{item.duration}</span>
              <span>{item.location}</span>
            </div>
            <h3>{item.role}</h3>
            <h4>{item.company}</h4>
            <ul>
              {item.responsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

export default ExperienceSection;
