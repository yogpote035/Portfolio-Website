import { useEffect, useState } from 'react';
import { fetchApiAuth, logout, getAccessToken, clearAuthTokens } from '../utils/authClient.js';
import { useNavigate, Link } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

function AdminDashboard() {
    const [profile, setProfile] = useState(null);
    const [totals, setTotals] = useState({
        skills: 0,
        projects: 0,
        experiences: 0,
        education: 0,
        contacts: 0,
        unreadContacts: 0,
        resumeDownloads: 0,
    });
    const [resumeUrl, setResumeUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!getAccessToken()) {
            navigate('/admin/login');
            return;
        }

        async function loadDashboard() {
            try {
                const profileData = await fetchApiAuth('/api/profile');
                const dashboardData = await fetchApiAuth('/api/admin/dashboard');
                const resumeData = await fetchApiAuth('/api/resume?redirect=false');

                setProfile(profileData);
                setTotals((current) => ({ ...current, ...(dashboardData?.totals || {}) }));
                setResumeUrl(resumeData?.url || null);
            } catch (err) {
                const message = err?.message || 'Failed to load dashboard';
                setError(message);
                if (message.toLowerCase().includes('unauthor') || message.toLowerCase().includes('authentication')) {
                    clearAuthTokens();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    return (
        <section className="admin-dashboard-section">
            {loading && <LoadingOverlay message="Loading dashboard..." />}
            <div className="admin-dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage profile, skills, projects, and resume content.</p>
                </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="admin-dashboard-grid">
                <article className="dashboard-card">
                    <h2>Profile</h2>
                    <p>{profile?.name || 'Not seeded yet'}</p>
                </article>
                <article className="dashboard-card">
                    <h2>Skills</h2>
                    <p>{totals.skills}</p>
                </article>
                <article className="dashboard-card">
                    <h2>Projects</h2>
                    <p>{totals.projects}</p>
                </article>
                <article className="dashboard-card">
                    <h2>Experience</h2>
                    <p>{totals.experiences}</p>
                </article>
                <article className="dashboard-card">
                    <h2>Education</h2>
                    <p>{totals.education}</p>
                </article>
                <article className="dashboard-card">
                    <h2>Contacts</h2>
                    <p>{totals.contacts}</p>
                    <p>{totals.unreadContacts} unread</p>
                </article>
                <article className="dashboard-card">
                    <h2>Downloads</h2>
                    <p>{totals.resumeDownloads}</p>
                </article>
                <article className="dashboard-card">
                    <h2>Resume</h2>
                    {resumeUrl ? (
                        <a className="admin-link" href={resumeUrl} target="_blank" rel="noreferrer">
                            View active resume
                        </a>
                    ) : (
                        <p>No active resume</p>
                    )}
                    <Link className="admin-link-button" to="/resumes">
                        Manage resumes
                    </Link>
                </article>
            </div>
        </section>
    );
}

export default AdminDashboard;
