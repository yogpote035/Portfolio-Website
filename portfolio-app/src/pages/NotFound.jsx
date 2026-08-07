import Button from '../components/Button.jsx';

function NotFound() {
  return (
    <section className="page-section not-found">
      <h1>Page not found</h1>
      <p>This route is not available in the portfolio yet.</p>
      <Button to="/">Go Home</Button>
    </section>
  );
}

export default NotFound;
