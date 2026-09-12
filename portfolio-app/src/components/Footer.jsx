import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext.jsx';
import SocialLinks from './SocialLinks.jsx';

function Footer() {
  const { profileData } = useProfile();
  return (
    <footer className="footer" id="footer">
      <div className="footer-brand"><strong>YP</strong><p>{profileData.designation || profileData.title}<br />{profileData.location || 'Pune, India'}</p></div>
      <div className="footer-socials">
        <SocialLinks socials={profileData.socials || []} />
      </div>
      <div className="footer-text"><p>&copy; {new Date().getFullYear()} {profileData.name}. Built with React.</p></div>
      <div className="footer-iconTop">
        <Link aria-label="Back to home" to="/#home">
          <i className="bx bx-up-arrow-alt" />
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
