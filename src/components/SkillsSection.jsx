import { motion } from 'framer-motion';
import { skillGroups } from '../data/resume.js';
import { fadeUp, staggerContainer, viewport } from '../utils/animations.js';
import SectionTitle from './SectionTitle.jsx';

function SkillsSection() {
  return (
    <section className="skills-section" id="skills">
      <div className="section-intro">
        <SectionTitle accent="Skills">Technical</SectionTitle>
        <p>
          A practical MERN-focused toolkit across frontend engineering, backend APIs,
          databases, authentication, and deployment platforms.
        </p>
      </div>
      <motion.div
        className="skills-grid"
        initial="hidden"
        variants={staggerContainer}
        viewport={viewport}
        whileInView="visible"
      >
        {skillGroups.map((group) => (
          <motion.article className="skill-card" key={group.category} variants={fadeUp} whileHover={{ y: -8 }}>
            <i className={`bx ${group.icon}`} />
            <h3>{group.category}</h3>
            <div className="skill-tags">
              {group.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

export default SkillsSection;
