import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/authClient.js';

const navItems = [
    { label: 'Dashboard', to: '/', end: true },
    { label: 'Profile', to: '/profile' },
    { label: 'Projects', to: '/projects' },
    { label: 'Skills', to: '/skills' },
    { label: 'Experience', to: '/experience' },
    { label: 'Education', to: '/education' },
    { label: 'Contacts', to: '/contacts' },
    { label: 'Resume', to: '/resumes' },
];

const crumbLabels = {
    profile: 'Profile',
    projects: 'Projects',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    contacts: 'Contacts',
    resumes: 'Resume',
    new: 'Create',
    edit: 'Edit',
};

function buildBreadcrumbs(pathname) {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
        return ['Dashboard'];
    }

    return segments.map((segment) => crumbLabels[segment] || 'View');
}

function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const breadcrumbs = buildBreadcrumbs(location.pathname);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span className="admin-brand-mark">CMS</span>
                    <div>
                        <strong>Portfolio Admin</strong>
                        <small>Content management</small>
                    </div>
                </div>

                <nav className="admin-sidebar-nav" aria-label="Admin navigation">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            end={item.end}
                            to={item.to}
                            className={({ isActive }) => (isActive ? 'admin-sidebar-link active' : 'admin-sidebar-link')}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="admin-main">
                <header className="admin-main-header">
                    <div>
                        <p className="admin-eyebrow">Admin Panel</p>
                        <h1>{breadcrumbs[breadcrumbs.length - 1]}</h1>
                    </div>
                    <button type="button" className="secondary-button" onClick={handleLogout}>
                        Logout
                    </button>
                </header>

                <div className="admin-breadcrumbs" aria-label="Breadcrumb">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={`${crumb}-${index}`}>
                            {index > 0 && <span className="admin-breadcrumb-separator">/</span>}
                            {crumb}
                        </span>
                    ))}
                </div>

                <main className="admin-page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
