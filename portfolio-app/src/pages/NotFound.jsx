import Button from '../components/Button.jsx';
import PageTransition from '../components/PageTransition.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';

function NotFound() {
  useDocumentMeta({ title: 'Page Not Found | Yogesh Pote' });
  return (
    <PageTransition><section className="page-section not-found"><span>404 / Lost in the interface</span><strong>404</strong><h1>This page took<br />a different route.</h1><p>Nothing lives at this address, but the work is one click away.</p><Button to="/">Return home <i className="bx bx-right-arrow-alt" /></Button></section></PageTransition>
  );
}

export default NotFound;
