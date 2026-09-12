import ContactForm from '../components/ContactForm.jsx';
import AboutSection from '../components/AboutSection.jsx';
import EducationSection from '../components/EducationSection.jsx';
import ExperienceSection from '../components/ExperienceSection.jsx';
import Hero from '../components/Hero.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import SkillsSection from '../components/SkillsSection.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import PageTransition from '../components/PageTransition.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';

function Home() {
  useScrollReveal();
  useDocumentMeta({ title: 'Yogesh Pote | MERN Stack Developer', description: 'Portfolio of Yogesh Pote, a MERN Stack Developer building scalable React, Node.js, ERP, and product experiences.' });

  return (
    <PageTransition>
      <Hero />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <EducationSection />
      <ProjectsSection />
      <ContactForm />
    </PageTransition>
  );
}

export default Home;
