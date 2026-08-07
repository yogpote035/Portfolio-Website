import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchApiAuth } from '../utils/authClient.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

const labels = { profile: 'Profile', project: 'Project', skill: 'Skill', experience: 'Experience', education: 'Education' };

function AdminContentHistory({ entityType, backTo }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [entityId, setEntityId] = useState(entityType === 'profile' ? null : id);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (entityType !== 'profile') {
            setEntityId(id);
            return;
        }
        fetchApiAuth('/api/profile')
            .then((profile) => setEntityId(profile?.id ? String(profile.id) : null))
            .catch((err) => setError(err.message || 'Failed to resolve profile history.'));
    }, [entityType, id]);

    const loadVersions = async () => {
        if (!entityId) return;
        setLoading(true);
        try {
            const data = await fetchApiAuth(`/api/admin/content-versions?entityType=${entityType}&entityId=${entityId}`);
            setVersions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load content history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadVersions(); }, [entityId, entityType]);

    const restore = async (version) => {
        if (!window.confirm(`Restore version ${version.versionNumber}? Your current content will be saved as a new version first.`)) return;
        setRestoringId(version.id);
        setError(null);
        try {
            await fetchApiAuth(`/api/admin/content-versions/${version.id}/restore`, { method: 'POST' });
            navigate(backTo);
        } catch (err) {
            setError(err.message || 'Failed to restore this version.');
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <section className="admin-dashboard-section">
            {loading && <LoadingOverlay message="Loading content history..." />}
            {restoringId && <LoadingOverlay message="Restoring selected version..." />}
            <div className="admin-dashboard-header">
                <div><h1>{labels[entityType]} History</h1><p>Restore any saved version. The current content is preserved first.</p></div>
                <Link className="secondary-button" to={backTo}>Back</Link>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="admin-history-list">
                {!loading && entityId && (versions.length === 0 ? <p>No versions yet. Versions are created whenever content is saved.</p> : versions.map((version) => (
                    <article className="dashboard-card admin-history-card" key={version.id}>
                        <div><h2>Version {version.versionNumber}</h2><p>{version.summary || 'Content saved'}</p><p>{new Date(version.createdAt).toLocaleString()}</p></div>
                        <button type="button" className="secondary-button" disabled={restoringId === version.id} onClick={() => restore(version)}>{restoringId === version.id ? 'Restoring...' : 'Restore this version'}</button>
                    </article>
                )))}
            </div>
        </section>
    );
}

export default AdminContentHistory;
