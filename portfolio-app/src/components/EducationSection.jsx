import { motion } from 'framer-motion';
import { education } from '../data/resume.js';
import { useApiData } from '../hooks/useApiData.js';
import { normalizeEducationEntries } from '../utils/apiTransform.js';
import { fadeUp, viewport } from '../utils/animations.js';
import SectionTitle from './SectionTitle.jsx';

function EducationSection() {
  const { data: educationData } = useApiData({
    path: '/api/education',
    fallbackData: education,
    transform: (entries) => normalizeEducationEntries(entries) || education,
  });

  return (
    <section className="education-section" id="education">
      <div className="section-intro">
        <SectionTitle accent="foundation" index="04">Academic</SectionTitle>
      </div>
      <motion.div className="education-card" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <span className="education-number">BSC / CS</span>
        <div>
          <span className="eyebrow">{educationData.duration}</span>
          <h3>{educationData.degree}</h3>
          <p>{educationData.college}</p>
          <span>{educationData.location}</span>
        </div>
        <div className="cgpa-card">
          <strong>{educationData.cgpa}</strong>
          <span>CGPA</span>
        </div>
        <div className="coursework">
          {(educationData.coursework || []).map((course) => (
            <span key={course}>{course}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default EducationSection;
