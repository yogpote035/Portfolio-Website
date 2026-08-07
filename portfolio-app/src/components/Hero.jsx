import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import heroImage from '../assets/Pavellion-Mall.jpg';
import { profile } from '../data/profile.js';
import { stats } from '../data/resume.js';
import { fetchApi } from '../utils/apiClient.js';
import { useApiData } from '../hooks/useApiData.js';
import useTypedText from '../hooks/useTypedText.js';
import { normalizeProfile } from '../utils/apiTransform.js';
import { fadeUp, staggerContainer, viewport } from '../utils/animations.js';
import Button from './Button.jsx';
import SocialLinks from './SocialLinks.jsx';

function Hero() {
  const [resumeLink, setResumeLink] = useState(profile.resume);
  const { data: profileData } = useApiData({
    path: '/api/profile',
    fallbackData: { ...profile, stats },
    transform: (apiProfile) => normalizeProfile(apiProfile, profile, stats),
  });
  const typedText = useTypedText(profileData.typedRoles);
  const portfolioStats = Array.isArray(profileData.stats) && profileData.stats.length > 0
    ? profileData.stats
    : stats;

  useEffect(() => {
    let canceled = false;

    async function loadResumeUrl() {
      try {
        const data = await fetchApi('/api/resume?redirect=false');
        if (!canceled && data?.url) {
          setResumeLink(data.url);
        }
      } catch {
        if (!canceled) {
          setResumeLink(profile.resume);
        }
      }
    }

    loadResumeUrl();
    return () => {
      canceled = true;
    };
  }, []);

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
          {profileData.title}
        </motion.span>
        <motion.h3 variants={fadeUp}>Hello, I Am</motion.h3>
        <h1>{profileData.name}</h1>
        <motion.h3 variants={fadeUp}>
          And I'm a <span className="multiple-text">{typedText}</span>
          <span className="typing-cursor" aria-hidden="true">
            |
          </span>
        </motion.h3>
        <motion.p variants={fadeUp}>
          {profileData.about ||
            'MERN Stack Developer focused on React.js, Redux Toolkit, Node.js, secure authentication, and scalable full-stack applications. I build responsive, production-ready interfaces for ERP, HRMS, hiring, rental, and travel workflows.'}
        </motion.p>
        <motion.div className="hero-actions" variants={fadeUp}>
          <Button download="Yogesh_Pote_Resume" href={resumeLink}>
            Download CV
          </Button>
          <Button className="btn-outline" to="/projects">
            View Projects
          </Button>
        </motion.div>
        <motion.div variants={fadeUp}>
          <SocialLinks socials={profileData.socials} />
        </motion.div>
        {portfolioStats.length > 0 && (
          <div className="stats-grid">
            {portfolioStats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
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
        <img src={profileData.heroImage || heroImage} alt={profileData.name} loading="eager" />
      </motion.div>
    </section>
  );
}

export default Hero;
