import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-text">
        <p>
          Copyright &copy; 2024 by <span>Yogesh Pote</span> | All Rights Reserved
        </p>
      </div>
      <div className="footer-iconTop">
        <Link aria-label="Back to home" to="/#home">
          <i className="bx bx-up-arrow-alt" />
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
