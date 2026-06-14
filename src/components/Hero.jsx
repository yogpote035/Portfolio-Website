import { motion } from 'framer-motion';
import heroImage from '../assets/Pavellion-Mall.jpg';
import { profile } from '../data/profile.js';
import { stats } from '../data/resume.js';
import useTypedText from '../hooks/useTypedText.js';
import { fadeUp, staggerContainer, viewport } from '../utils/animations.js';
import Button from './Button.jsx';
import SocialLinks from './SocialLinks.jsx';

function Hero() {
  const typedText = useTypedText(profile.typedRoles);

  return (
    <section className="home" id="home">
      <motion.div
        className="home-content"
        initial="hidden"
        variants={staggerContainer}
        viewport={viewport}
        whileInView="visible"
      >
        <motion.span className="eyebrow" variants={fadeUp}>
          MERN Stack Developer
        </motion.span>
        <motion.h3 variants={fadeUp}>Hello, I Am</motion.h3>
        <h1>{profile.name}</h1>
        <motion.h3 variants={fadeUp}>
          And I'm a <span className="multiple-text">{typedText}</span>
          <span className="typing-cursor" aria-hidden="true">
            |
          </span>
        </motion.h3>
        <motion.p variants={fadeUp}>
          MERN Stack Developer focused on React.js, Redux Toolkit, Node.js, secure
          authentication, and scalable full-stack applications. I build responsive,
          production-ready interfaces for ERP, HRMS, hiring, rental, and travel
          workflows.
        </motion.p>
        <motion.div className="hero-actions" variants={fadeUp}>
          <Button download="Yogesh_Pote_Resume" href={profile.resume}>
            Download CV
          </Button>
          <Button className="btn-outline" to="/projects">
            View Projects
          </Button>
        </motion.div>
        <motion.div variants={fadeUp}>
          <SocialLinks socials={profile.socials} />
        </motion.div>
        <motion.div className="stats-grid" variants={staggerContainer}>
          {stats.map((stat) => (
            <motion.div className="stat-card" key={stat.label} variants={fadeUp}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      <motion.div
        animate={{ y: [0, -18, 0] }}
        className="home-img hero-visual"
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hero-glass-card">
          <span>Available for MERN roles</span>
          <strong>React + Node.js</strong>
        </div>
        <img src={heroImage} alt="Yogesh Pote" loading="eager" />
      </motion.div>
    </section>
  );
}

export default Hero;
