import { motion } from 'framer-motion';
import { education } from '../data/resume.js';
import { fadeUp, viewport } from '../utils/animations.js';
import SectionTitle from './SectionTitle.jsx';

function EducationSection() {
  return (
    <section className="education-section" id="education">
      <div className="section-intro">
        <SectionTitle accent="Education">Academic</SectionTitle>
      </div>
      <motion.div className="education-card" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <div>
          <span className="eyebrow">{education.duration}</span>
          <h3>{education.degree}</h3>
          <p>{education.college}</p>
          <span>{education.location}</span>
        </div>
        <div className="cgpa-card">
          <strong>{education.cgpa}</strong>
          <span>CGPA</span>
        </div>
        <div className="coursework">
          {education.coursework.map((course) => (
            <span key={course}>{course}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default EducationSection;
