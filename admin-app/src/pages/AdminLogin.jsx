import { FormField, ErrorState } from "../components/ui.jsx";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../utils/authClient.js";
import { fetchApi } from "../utils/apiClient.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  useEffect(() => {
    let active = true;
    fetchApi("/api/profile")
      .then((data) => {
        if (active) setHeroImageUrl(data?.coverPhotoUrl || "");
      })
      .catch(() => {
        if (active) setHeroImageUrl("");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-section">
      {loading && <LoadingOverlay message="Signing you in..." />}
      <div className="admin-login-card">
        <div className="cms-login-brand">
          <span className="admin-brand-mark">
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt="Yogesh Pote"
                onError={() => setHeroImageUrl("")}
              />
            ) : (
              <>p<span>·</span></>
            )}
          </span>
          Portfolio CMS
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to manage your portfolio content.</p>
        <form onSubmit={handleSubmit}>
          <FormField>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>
          {error && <ErrorState message={error} />}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="cms-login-note">
          Your content. Your story. Your workspace.
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;
