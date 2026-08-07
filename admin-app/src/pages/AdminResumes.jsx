import { useEffect, useMemo, useState } from 'react';
import { fetchApiAuth, getAccessToken, clearAuthTokens } from '../utils/authClient.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiBase } from '../utils/apiClient.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

function AdminResumes() {
    const [resumes, setResumes] = useState([]);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    const { id: routeResumeId } = useParams();

    useEffect(() => {
        if (!getAccessToken()) {
            navigate('/login');
            return;
        }

        loadResumes();
    }, [navigate]);

    async function loadResumes() {
        setLoading(true);
        try {
            const resumesData = await fetchApiAuth('/api/admin/resumes');
            setResumes(Array.isArray(resumesData) ? resumesData : resumesData?.data || []);
        } catch (err) {
            const message = err.message || 'Failed to load resumes';
            setError(message);
            if (message.toLowerCase().includes('unauthor') || message.toLowerCase().includes('authentication')) {
                clearAuthTokens();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!file) {
            setError('Please select a resume file to upload.');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('resume', file);
            await fetchApiAuth('/api/admin/resumes', {
                method: 'POST',
                body: formData,
            });
            setFile(null);
            await loadResumes();
        } catch (err) {
            setError(err.message || 'Resume upload failed');
        } finally {
            setUploading(false);
        }
    };

    const setActiveResume = async (resumeId) => {
        setActionLoading(true);
        setError(null);

        try {
            await fetchApiAuth(`/api/admin/resumes/${resumeId}/activate`, {
                method: 'PUT',
            });
            await loadResumes();
        } catch (err) {
            setError(err.message || 'Failed to activate resume');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteResume = async (resumeId) => {
        if (!window.confirm('Delete this resume? This cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        setError(null);

        try {
            await fetchApiAuth(`/api/admin/resumes/${resumeId}`, {
                method: 'DELETE',
            });
            await loadResumes();
        } catch (err) {
            setError(err.message || 'Failed to delete resume');
        } finally {
            setActionLoading(false);
        }
    };

    const selectedResume = useMemo(() => {
        if (!routeResumeId) {
            return null;
        }

        return resumes.find((resume) => String(resume.id) === String(routeResumeId)) || null;
    }, [resumes, routeResumeId]);

    return (
        <section className="admin-dashboard-section">
            {loading && <LoadingOverlay message="Loading resumes..." />}
            {!loading && uploading && <LoadingOverlay message="Uploading resume..." />}
            {!loading && actionLoading && <LoadingOverlay message="Updating resume..." />}
            <div className="admin-dashboard-header">
                <div>
                    <h1>{routeResumeId ? 'Resume Details' : 'Resume Management'}</h1>
                    <p>Upload, preview, activate, download, and delete portfolio resumes.</p>
                </div>
                <div className="admin-header-actions">
                    {routeResumeId && (
                        <Link className="secondary-button" to="/resumes">
                            Back to resumes
                        </Link>
                    )}
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {routeResumeId && selectedResume && (
                <article className="admin-login-card admin-detail-card">
                    <div className="admin-detail-header">
                        <div>
                            <h2>{selectedResume.original_name || selectedResume.storage_path}</h2>
                            <p>Status: {selectedResume.is_active ? 'Active' : 'Inactive'}</p>
                            <p>Version: {selectedResume.version ?? 'N/A'}</p>
                            <p>Downloads: {selectedResume.download_count ?? 0}</p>
                            <p>Type: {selectedResume.mime_type || 'N/A'}</p>
                            <p>Size: {selectedResume.file_size ? `${Math.round(selectedResume.file_size / 1024)} KB` : 'N/A'}</p>
                        </div>
                        <div className="admin-actions">
                            {selectedResume.file_url && (
                                <a className="admin-link-button" href={selectedResume.file_url} target="_blank" rel="noreferrer">
                                    Preview
                                </a>
                            )}
                            {!selectedResume.is_active && (
                                <button type="button" className="secondary-button" disabled={actionLoading} onClick={() => setActiveResume(selectedResume.id)}>
                                    Set active
                                </button>
                            )}
                            <button type="button" className="secondary-button" disabled={actionLoading} onClick={() => deleteResume(selectedResume.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </article>
            )}

            {!routeResumeId && (
                <>
                    <div className="admin-login-card admin-form-card admin-resume-upload-card">
                        <div className="admin-form-header">
                            <div>
                                <p className="admin-project-form-tag">Resume upload</p>
                                <h2>Upload a new resume</h2>
                                <p className="admin-form-description">Add a new resume file for your public portfolio and manage active versions from this dashboard.</p>
                            </div>
                        </div>
                        <form onSubmit={handleUpload} className="admin-form admin-resume-form">
                            <label>
                                Select resume file
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </label>
                            {file && <p className="admin-resume-file-name">Selected file: {file.name}</p>}
                            <div className="form-actions-row admin-resume-actions">
                                <button type="submit" className="primary-button" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload resume'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="admin-dashboard-grid admin-resume-grid" style={{ marginTop: '2rem' }}>
                        {!loading && (resumes.length === 0 ? (
                            <p>No resumes found yet.</p>
                        ) : (
                            resumes.map((resume) => (
                                <article key={resume.id} className="dashboard-card admin-list-card admin-resume-card">
                                    <div className="admin-resume-card-header">
                                        <div>
                                            <h2>{resume.original_name || resume.storage_path}</h2>
                                            <p className="admin-resume-subtitle">{resume.mime_type || 'Resume file'}</p>
                                        </div>
                                        <span className={`admin-chip ${resume.is_active ? 'featured-chip' : ''}`}>
                                            {resume.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="admin-resume-meta">
                                        <div className="admin-resume-meta-item">
                                            <span>Version</span>
                                            <strong>{resume.version ?? 'N/A'}</strong>
                                        </div>
                                        <div className="admin-resume-meta-item">
                                            <span>Downloads</span>
                                            <strong>{resume.download_count ?? 0}</strong>
                                        </div>
                                        <div className="admin-resume-meta-item">
                                            <span>Size</span>
                                            <strong>{resume.file_size ? `${Math.round(resume.file_size / 1024)} KB` : 'N/A'}</strong>
                                        </div>
                                    </div>
                                    <div className="admin-resume-actions-row">
                                        {resume.file_url && (
                                            <a className="admin-link-button" href={resume.file_url} target="_blank" rel="noreferrer">
                                                Preview file
                                            </a>
                                        )}
                                        <Link className="admin-link" to={`/resumes/${resume.id}`}>
                                            View details
                                        </Link>
                                        {resume.is_active ? (
                                            <a className="secondary-button" href={`${apiBase}/api/resume`} target="_blank" rel="noreferrer">
                                                Download active
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                disabled={actionLoading}
                                                onClick={() => setActiveResume(resume.id)}
                                            >
                                                Set active
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            disabled={actionLoading}
                                            onClick={() => deleteResume(resume.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))))}
                    </div>
                </>
            )}
        </section>
    );
}

export default AdminResumes;
