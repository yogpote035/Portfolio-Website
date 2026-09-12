import { motion } from 'framer-motion';
import { profile } from '../data/profile.js';
import { fadeUp, viewport } from '../utils/animations.js';
import SectionTitle from './SectionTitle.jsx';
import SmartImage from './SmartImage.jsx';
import { useProfile } from '../context/ProfileContext.jsx';

function AboutSection() {
  const { profileData } = useProfile();

  return (
    <section className="about" id="about">
      <motion.div className="about-img" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <SmartImage src={profileData.aboutImage || profile.aboutImage} alt={`${profileData.name} working`} />
        <span className="about-caption">Based in Pune · Building for the web</span>
      </motion.div>
      <motion.div className="about-content" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <SectionTitle accent="the developer" index="01">Beyond</SectionTitle>
        <h3>Curious by nature.<br />Intentional by design.</h3>
        <p>
          {profileData.about ||
            'I am a Computer Science student and MERN Stack Developer based in Pune, focused on building modern web applications with React.js, Redux Toolkit, Node.js, Express.js, MongoDB, and secure authentication workflows. My experience includes Manufacturing ERP modules, HRMS platforms, role-based access control, API integration, and responsive interfaces that stay fast and usable across devices.'}
        </p>

        <div className="about-principles"><span>01 Product thinking</span><span>02 Reliable systems</span><span>03 Thoughtful interfaces</span></div>
      </motion.div>
    </section>
  );
}

export default AboutSection;
