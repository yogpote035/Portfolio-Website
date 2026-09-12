import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import NotFound from './pages/NotFound.jsx';
import ScrollToTop from './utils/ScrollToTop.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';

function App() {
  const location = useLocation();

  return (
    <ProfileProvider>
      <ScrollToTop />
      <Navbar />
      <main id="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </ProfileProvider>
  );
}

export default App;
