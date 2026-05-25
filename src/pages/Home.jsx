import AboutSection from '../components/AboutSection.jsx';
import ContactForm from '../components/ContactForm.jsx';
import EducationSection from '../components/EducationSection.jsx';
import ExperienceSection from '../components/ExperienceSection.jsx';
import Hero from '../components/Hero.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import SkillsSection from '../components/SkillsSection.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';

function Home() {
  useScrollReveal();

  return (
    <>
      <Hero />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <EducationSection />
      <ProjectsSection />
      <ContactForm />
    </>
  );
}

export default Home;
