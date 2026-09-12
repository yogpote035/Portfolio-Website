import { motion } from 'framer-motion';
import { skillGroups } from '../data/resume.js';
import { useApiData } from '../hooks/useApiData.js';
import { normalizeSkillGroups } from '../utils/apiTransform.js';
import { fadeUp, staggerContainer, viewport } from '../utils/animations.js';
import SectionTitle from './SectionTitle.jsx';

function SkillsSection() {
  const { data: skills } = useApiData({
    path: '/api/skills',
    fallbackData: skillGroups,
    transform: normalizeSkillGroups,
  });

  return (
    <section className="skills-section" id="skills">
      <div className="section-intro">
        <SectionTitle accent="capabilities" index="02">Technical</SectionTitle>
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
        {skills.map((group) => (
          <motion.article className="skill-card" key={group.category} variants={fadeUp}>
            <div className="skill-heading"><i className={`bx ${group.icon}`} /><h3>{group.category}</h3><span>{String(group.skills.length).padStart(2, '0')}</span></div>
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
