import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data/profile.js';
import { fetchApi } from '../utils/apiClient.js';
import useTypedText from '../hooks/useTypedText.js';
import { fadeUp, staggerContainer, viewport } from '../utils/animations.js';
import Button from './Button.jsx';
import SocialLinks from './SocialLinks.jsx';
import SmartImage from './SmartImage.jsx';
import { useProfile } from '../context/ProfileContext.jsx';

function Hero() {
  const [resumeLink, setResumeLink] = useState(profile.resume);
  const { profileData } = useProfile();
  const typedText = useTypedText(profileData.typedRoles);
  const portfolioStats = Array.isArray(profileData.stats) && profileData.stats.length > 0
    ? profileData.stats
    : [];

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
    <section className="home" id="home" aria-labelledby="hero-title">
      <motion.div
        className="home-content"
        initial="hidden"
        variants={staggerContainer}
        viewport={viewport}
        whileInView="visible"
      >
        <motion.div className="availability" variants={fadeUp}>
          <span /> Available for freelance projects &amp; full-time roles
        </motion.div>
        <motion.p className="hero-kicker" variants={fadeUp}>{profileData.title} · Pune, India</motion.p>
        <h1 id="hero-title">I build digital products<br />that <em>work beautifully.</em></h1>
        <motion.h2 variants={fadeUp}>
          <span className="multiple-text">{typedText}</span>
          <span className="typing-cursor" aria-hidden="true">
            |
          </span>
        </motion.h2>
        <motion.p variants={fadeUp}>
          {profileData.about ||
            'MERN Stack Developer focused on React.js, Redux Toolkit, Node.js, secure authentication, and scalable full-stack applications. I build responsive, production-ready interfaces for ERP, HRMS, hiring, rental, and travel workflows.'}
        </motion.p>
        <motion.div className="hero-actions" variants={fadeUp}>
          <Button to="/projects">Explore my work <i className="bx bx-right-arrow-alt" /></Button>
          <Button className="btn-text" download="Yogesh_Pote_Resume" href={resumeLink}>Download resume <i className="bx bx-download" /></Button>
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
      <motion.div className="home-img hero-visual" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .2 }}>
        <span className="image-label">01 / Portrait</span>
        <SmartImage src={profileData.heroImage || profile.heroImage} alt={profileData.name} eager />
        <div className="hero-image-note"><strong>React + Node.js</strong><span>Design-minded engineering</span></div>
      </motion.div>
    </section>
  );
}

export default Hero;
