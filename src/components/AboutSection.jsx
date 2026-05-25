import { motion } from 'framer-motion';
import { useState } from 'react';
import aboutImage from '../assets/About.jpg';
import { fadeUp, viewport } from '../utils/animations.js';
import Button from './Button.jsx';
import SectionTitle from './SectionTitle.jsx';

function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="about" id="about">
      <motion.div className="about-img" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <img src={aboutImage} alt="Yogesh Pote profile" loading="lazy" />
      </motion.div>
      <motion.div className="about-content" initial="hidden" variants={fadeUp} viewport={viewport} whileInView="visible">
        <SectionTitle accent="YOGESH">About</SectionTitle>
        <h3>MERN Stack Developer</h3>
        <p>
          I am a Computer Science student and MERN Stack Developer Intern based in
          Pune, focused on building modern web applications with React.js, Redux
          Toolkit, Node.js, Express.js, MongoDB, and secure authentication workflows.
          My experience includes Manufacturing ERP modules, HRMS platforms, role-based
          access control, API integration, and responsive interfaces that stay fast and
          usable across devices.
        </p>

        {expanded && (
          <div className="extra-content is-visible">
            <h3>
              <span>My Education And Skills</span>
            </h3>
            <h3>
              <span>Education</span>
            </h3>
            <p>
              I am currently pursuing a 3-year Bachelor's degree in Computer Science
              from Modern College of Arts, Science, and Commerce, Pune.
            </p>
            <h3>
              <span>Skills</span>
            </h3>
            <ul>
              <li><b>Frontend</b> - React.js, JavaScript, Tailwind CSS, Bootstrap, Material UI, and responsive UI systems.</li>
              <li><b>Backend</b> - Node.js, Express.js, Java Servlets, RESTful APIs, validation, and structured error handling.</li>
              <li><b>Authentication</b> - JWT, JWE, Firebase Auth, Context API, Redux Toolkit, and RBAC.</li>
              <li><b>Databases</b> - MongoDB, PostgreSQL, and MySQL for application data and workflow storage.</li>
              <li><b>Tools</b> - Git, GitHub, Vercel, Render, VS Code, and Hoppscotch.</li>
            </ul>
          </div>
        )}

        <p>&nbsp;Let's build something great together!</p>
        <Button className="read-more" onClick={() => setExpanded((current) => !current)}>
          {expanded ? 'Read Less' : 'Read More'}
        </Button>
      </motion.div>
    </section>
  );
}

export default AboutSection;
