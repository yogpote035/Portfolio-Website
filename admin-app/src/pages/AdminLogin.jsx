import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login } from '../utils/authClient.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login({ email, password });
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="admin-login-section">
            {loading && <LoadingOverlay message="Signing you in..." />}
            <div className="admin-login-card">
                <h1>Admin Login</h1>
                <p>Sign in to manage your portfolio content.</p>
                <form onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>
                    {error && <div className="form-error">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default AdminLogin;
