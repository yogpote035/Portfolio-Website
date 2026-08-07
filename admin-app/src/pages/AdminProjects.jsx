import { useEffect, useMemo, useState } from 'react';
import { fetchApiAuth, getAccessToken, clearAuthTokens } from '../utils/authClient.js';
import { parseValidationErrors } from '../utils/errorHelpers.js';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

const initialForm = {
    name: '',
    slug: '',
    subtitle: '',
    short_description: '',
    full_description: '',
    github_url: '',
    live_url: '',
    featured: false,
    company_project: false,
    status: 'planned',
    completion_date: '',
    display_order: 1,
    cover_media_id: null,
    technologyIds: [],
    featuresText: '',
    responsibilitiesText: '',
    challengesText: '',
    futureImprovementsText: '',
};

const statusLabels = {
    completed: 'Completed',
    in_progress: 'In progress',
    planned: 'Planned',
    archived: 'Archived',
};

const statusOrder = ['completed', 'in_progress', 'planned', 'archived'];

function listToText(value) {
    if (!value) {
        return '';
    }
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return String(value);
}

function textToList(value) {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function formatDateInput(value) {
    if (!value) {
        return '';
    }

    return String(value).slice(0, 10);
}

function normalizeSlug(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-');
}

function isValidSlug(value) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));
}

function isValidUrl(value) {
    if (!value) return true;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function isValidPositiveOrder(value) {
    return Number.isInteger(value) && value >= 1;
}

function isValidDate(value) {
    if (!value) return true;
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
}

function normalizeGalleryItem(item, index = 0) {
    return {
        mediaId: item.mediaId || item.media_id,
        altText: item.altText || item.alt_text || '',
        displayOrder: item.displayOrder ?? item.display_order ?? index + 1,
        url: item.url || item.mediaUrl || '',
        originalName: item.originalName || item.original_name || '',
    };
}

function getProjectImageUrl(project) {
    const imageSources = [
        project?.cover_url,
        project?.coverUrl,
        project?.cover_media_url,
        project?.cover?.url,
        project?.thumbnail_url,
        project?.thumbnailUrl,
        project?.thumbnail_media_url,
        project?.thumbnail?.url,
    ];

    return imageSources.find((value) => typeof value === 'string' && value.trim()) || '';
}

function ProjectCoverImage({ project }) {
    const [hasImageError, setHasImageError] = useState(false);
    const imageUrl = getProjectImageUrl(project);

    useEffect(() => {
        setHasImageError(false);
    }, [imageUrl]);

    if (!imageUrl || hasImageError) {
        return (
            <div className="project-card-fallback" aria-label={`${project?.name || 'Project'} cover unavailable`}>
                {project?.name?.charAt(0).toUpperCase() || 'P'}
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={`${project.name} cover`}
            loading="lazy"
            onError={() => setHasImageError(true)}
        />
    );
}

function AdminProjects() {
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [coverFile, setCoverFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [coverPreview, setCoverPreview] = useState('');
    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const { id: routeProjectId } = useParams();
    const routeMode = location.pathname.endsWith('/new')
        ? 'create'
        : location.pathname.endsWith('/edit')
            ? 'edit'
            : routeProjectId
                ? 'view'
                : 'list';

    useEffect(() => {
        if (!getAccessToken()) {
            navigate('/login');
            return;
        }

        loadProjects();
        loadSkills();
    }, [navigate]);

    useEffect(() => {
        if (routeMode !== 'edit' || !routeProjectId || loading || projects.length === 0) {
            return;
        }

        const project = projects.find((item) => String(item.id) === String(routeProjectId));
        if (project) {
            startEditingProject(project);
        }
    }, [routeMode, routeProjectId, loading, projects]);

    useEffect(() => {
        if (routeMode === 'create') {
            setEditingProjectId(null);
            setForm(initialForm);
            setCoverFile(null);
            setGalleryFiles([]);
            setCoverPreview('');
            setGalleryItems([]);
            setGalleryPreviews([]);
        }
    }, [routeMode]);

    async function loadProjects() {
        setLoading(true);
        setError(null);

        try {
            const projectsData = await fetchApiAuth('/api/admin/projects');
            setProjects(projectsData || []);
        } catch (err) {
            const message = err.message || 'Failed to load projects';
            setError(message);
            if (message.toLowerCase().includes('unauthor') || message.toLowerCase().includes('authentication')) {
                clearAuthTokens();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }

    async function loadSkills() {
        try {
            const skillsData = await fetchApiAuth('/api/admin/skills');
            setSkills(skillsData || []);
        } catch {
            setSkills([]);
        }
    }

    const featuredProjects = useMemo(() => projects.filter((project) => project.featured), [projects]);
    const selectedProject = useMemo(() => {
        if (!routeProjectId) {
            return null;
        }

        return projects.find((item) => String(item.id) === String(routeProjectId)) || null;
    }, [projects, routeProjectId]);
    const groupedByStatus = useMemo(() => {
        return projects.reduce((groups, project) => {
            const status = project.status || 'planned';
            if (!groups[status]) groups[status] = [];
            groups[status].push(project);
            return groups;
        }, {});
    }, [projects]);

    const handleFieldChange = (field) => (event) => {
        const value = field === 'featured' || field === 'company_project'
            ? event.target.checked
            : event.target.value;

        setForm((current) => ({
            ...current,
            [field]: field === 'display_order' ? Number(value) : value,
        }));

        setValidationErrors((current) => ({
            ...current,
            [field]: undefined,
        }));
        setError(null);
    };

    const isImageFile = (file) => file && typeof file.type === 'string' && file.type.startsWith('image/');

    const handleCoverFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setError(null);

        if (file && !isImageFile(file)) {
            setCoverFile(null);
            setCoverPreview(form.cover_url || '');
            setError('Only image files are allowed for project cover images.');
            return;
        }

        setCoverFile(file);
        setCoverPreview(file ? URL.createObjectURL(file) : form.cover_url || '');
    };

    const handleTechnologyChange = (event) => {
        const selected = Array.from(event.target.selectedOptions).map((option) => Number(option.value));
        setForm((current) => ({ ...current, technologyIds: selected }));
    };

    const startEditingProject = (project) => {
        setEditingProjectId(project.id);
        setForm({
            name: project.name || '',
            slug: project.slug || '',
            subtitle: project.subtitle || '',
            short_description: project.short_description || '',
            full_description: project.full_description || '',
            github_url: project.github_url || '',
            live_url: project.live_url || '',
            featured: Boolean(project.featured),
            company_project: Boolean(project.company_project),
            status: project.status || 'planned',
            completion_date: formatDateInput(project.completion_date),
            display_order: project.display_order ?? 1,
            cover_media_id: project.cover_media_id || null,
            technologyIds: (project.technologies || []).map((tech) => tech.id).filter(Boolean),
            featuresText: listToText(project.features),
            responsibilitiesText: listToText(project.responsibilities),
            challengesText: listToText(project.challenges),
            futureImprovementsText: listToText(project.future_improvements),
        });
        setCoverFile(null);
        setGalleryFiles([]);
        setCoverPreview(getProjectImageUrl(project));
        setGalleryItems((project.gallery || []).map(normalizeGalleryItem));
        setGalleryPreviews([]);
    };

    const cancelEdit = () => {
        setEditingProjectId(null);
        setForm(initialForm);
        setCoverFile(null);
        setGalleryFiles([]);
        setCoverPreview('');
        setGalleryItems([]);
        setGalleryPreviews([]);
        if (routeProjectId) {
            navigate('/projects');
        }
    };

    const handleGalleryFilesChange = (event) => {
        const files = Array.from(event.target.files || []);
        setError(null);

        const invalidFiles = files.filter((file) => !isImageFile(file));
        if (invalidFiles.length > 0) {
            setError('Only image files are allowed for gallery uploads.');
        }

        const validFiles = files.filter(isImageFile);
        setGalleryFiles(validFiles);
        setGalleryPreviews(validFiles.map((file) => URL.createObjectURL(file)));
    };

    const moveGalleryItem = (index, direction) => {
        setGalleryItems((current) => {
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= current.length) {
                return current;
            }

            const updated = [...current];
            [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
            return updated.map((item, order) => ({ ...item, displayOrder: order + 1 }));
        });
    };

    const removeGalleryItem = (index) => {
        setGalleryItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    };

    const uploadImageFile = async (file) => {
        if (!file) {
            return null;
        }

        const formData = new FormData();
        formData.append('image', file);
        const media = await fetchApiAuth('/api/admin/projects/image', {
            method: 'POST',
            body: formData,
        });
        return media;
    };

    const validateProjectForm = (values) => {
        const errors = {};
        const normalizedSlug = normalizeSlug(values.slug);

        if (!values.name?.trim()) {
            errors.name = 'Name is required.';
        }

        if (!normalizedSlug) {
            errors.slug = 'Slug is required and must contain letters, numbers, or hyphens.';
        } else if (!isValidSlug(normalizedSlug)) {
            errors.slug = 'Slug can only use lowercase letters, numbers, and hyphens.';
        }

        if (!values.short_description?.trim()) {
            errors.short_description = 'Short description is required.';
        }

        if (!values.full_description?.trim()) {
            errors.full_description = 'Full description is required.';
        }

        if (values.github_url && !isValidUrl(values.github_url)) {
            errors.github_url = 'GitHub URL must be a valid URL.';
        }

        if (values.live_url && !isValidUrl(values.live_url)) {
            errors.live_url = 'Live URL must be a valid URL.';
        }

        if (!isValidPositiveOrder(values.display_order)) {
            errors.display_order = 'Display order must be a positive integer.';
        }

        if (!isValidDate(values.completion_date)) {
            errors.completion_date = 'Completion date must be in YYYY-MM-DD format.';
        }

        return { errors, normalizedSlug };
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setValidationErrors({});

        try {
            const requestBody = { ...form };
            const { errors, normalizedSlug } = validateProjectForm(requestBody);
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                setError('Please fix the highlighted fields before saving.');
                setSaving(false);
                return;
            }

            requestBody.slug = normalizedSlug;
            requestBody.featured = Boolean(requestBody.featured);
            requestBody.company_project = Boolean(requestBody.company_project);
            requestBody.subtitle = requestBody.subtitle?.trim() || null;
            requestBody.github_url = requestBody.github_url || null;
            requestBody.live_url = requestBody.live_url || null;
            requestBody.completion_date = requestBody.completion_date || null;

            if (coverFile) {
                const coverMedia = await uploadImageFile(coverFile);
                requestBody.cover_media_id = coverMedia?.id ?? null;
            }

            let galleryImages = galleryItems.map((item, index) => ({
                mediaId: item.mediaId,
                altText: item.altText || `${requestBody.name} screenshot ${index + 1}`,
                displayOrder: index + 1,
            }));

            if (galleryFiles.length) {
                const galleryMedia = await Promise.all(galleryFiles.map((file) => uploadImageFile(file)));
                galleryImages = [
                    ...galleryImages,
                    ...galleryMedia
                        .filter(Boolean)
                        .map((media, index) => ({
                            mediaId: media.id,
                            altText: `${requestBody.name} screenshot ${galleryImages.length + index + 1}`,
                            displayOrder: galleryImages.length + index + 1,
                        })),
                ];
            }

            requestBody.galleryImages = galleryImages;

            requestBody.features = textToList(requestBody.featuresText || '');
            requestBody.responsibilities = textToList(requestBody.responsibilitiesText || '');
            requestBody.challenges = textToList(requestBody.challengesText || '');
            requestBody.future_improvements = textToList(requestBody.futureImprovementsText || '');
            delete requestBody.featuresText;
            delete requestBody.responsibilitiesText;
            delete requestBody.challengesText;
            delete requestBody.futureImprovementsText;

            if (editingProjectId) {
                await fetchApiAuth(`/api/admin/projects/${editingProjectId}`, {
                    method: 'PUT',
                    body: JSON.stringify(requestBody),
                });
            } else {
                await fetchApiAuth('/api/admin/projects', {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                });
            }

            setForm(initialForm);
            setCoverFile(null);
            setGalleryFiles([]);
            setCoverPreview('');
            setGalleryItems([]);
            setGalleryPreviews([]);
            setEditingProjectId(null);
            await loadProjects();
            navigate('/projects');
        } catch (err) {
            const validation = parseValidationErrors(err);
            if (Object.keys(validation.fieldErrors).length > 0) {
                setValidationErrors(validation.fieldErrors);
                setError(validation.message || 'Please fix the highlighted fields before saving.');
            } else {
                setError(err.message || (editingProjectId ? 'Failed to update project' : 'Failed to create project'));
            }
        } finally {
            setSaving(false);
        }
    };

    const deleteProject = async (projectId) => {
        if (!window.confirm('Delete this project? This action cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        setError(null);

        try {
            await fetchApiAuth(`/api/admin/projects/${projectId}`, {
                method: 'DELETE',
            });
            await loadProjects();
        } catch (err) {
            setError(err.message || 'Failed to delete project');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <section className="admin-dashboard-section">
            {loading && <LoadingOverlay message="Loading projects..." />}
            {!loading && saving && <LoadingOverlay message="Saving project changes..." />}
            {!loading && actionLoading && <LoadingOverlay message="Updating projects..." />}
            <div className="admin-dashboard-header">
                <div>
                    <h1>
                        {routeMode === 'create'
                            ? 'Create Project'
                            : routeMode === 'edit'
                                ? 'Edit Project'
                                : routeMode === 'view'
                                    ? 'Project Details'
                                    : 'Project Management'}
                    </h1>
                    <p>Manage project content, cover images, gallery sequence, technologies, and case-study details.</p>
                </div>
                <div className="admin-header-actions">
                    {routeMode !== 'list' && (
                        <Link className="secondary-button" to="/projects">
                            Back to projects
                        </Link>
                    )}
                    {routeMode === 'list' && (
                        <Link className="admin-link-button" to="/projects/new">
                            New project
                        </Link>
                    )}
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {routeMode === 'view' && selectedProject && (
                <article className="admin-login-card admin-form-card admin-detail-card">
                    <div className="project-detail-hero">
                        <ProjectCoverImage project={selectedProject} />
                    </div>
                    <div className="admin-detail-header">
                        <div>
                            <h2>{selectedProject.name}</h2>
                            <p>{selectedProject.short_description}</p>
                        </div>
                        <div className="admin-actions">
                            <Link className="secondary-button" to={`/projects/${selectedProject.id}/history`}>
                                History
                            </Link>
                            <Link className="secondary-button" to={`/projects/${selectedProject.id}/edit`}>
                                Edit
                            </Link>
                            {selectedProject.slug && (
                                <a className="admin-link-button" href={`http://localhost:5173/projects/${selectedProject.slug}`} target="_blank" rel="noreferrer">
                                    View public
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="admin-detail-grid">
                        <div>
                            <h3>Full description</h3>
                            <p>{selectedProject.full_description || 'No full description added.'}</p>
                        </div>
                        <div>
                            <h3>Meta</h3>
                            <p>Status: {statusLabels[selectedProject.status] || selectedProject.status}</p>
                            <p>Slug: {selectedProject.slug}</p>
                            <p>Display order: {selectedProject.display_order ?? 1}</p>
                            <p>{selectedProject.company_project ? 'Company project' : 'Personal project'}</p>
                        </div>
                    </div>
                    <div className="project-card-meta">
                        {(selectedProject.technologies || []).map((technology) => (
                            <span className="admin-chip" key={technology.id || technology.name}>
                                {technology.name}
                            </span>
                        ))}
                    </div>
                    {selectedProject.gallery?.length > 0 && (
                        <div className="project-image-previews">
                            {selectedProject.gallery.map((item, index) => (
                                <div className="project-image-preview" key={`${item.media_id || item.mediaId}-${index}`}>
                                    <span>Gallery {index + 1}</span>
                                    <img src={item.url || item.mediaUrl} alt={item.alt_text || `${selectedProject.name} screenshot ${index + 1}`} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            )}

            {(routeMode === 'create' || routeMode === 'edit') && (
                <div className="admin-login-card admin-form-card project-form-card">
                    <form onSubmit={handleSubmit} className="admin-form project-form">
                        <div className="project-form-header">
                            <div>
                                <p className="admin-project-form-tag">{routeMode === 'create' ? 'Create project' : 'Edit project'}</p>
                                <h2>{routeMode === 'create' ? 'New project details' : 'Update project details'}</h2>
                                <p className="admin-form-description">Fill in the key project summary, gallery, technologies, and roadmap details that display on the public portfolio page.</p>
                            </div>
                        </div>
                        <div className="form-grid-2 project-form-section">
                            <label>
                                Name
                                <input type="text" value={form.name} onChange={handleFieldChange('name')} required />
                                {validationErrors.name && <span className="admin-field-error">{validationErrors.name}</span>}
                            </label>
                            <label>
                                Slug
                                <input type="text" value={form.slug} onChange={handleFieldChange('slug')} required />
                                {validationErrors.slug && <span className="admin-field-error">{validationErrors.slug}</span>}
                            </label>
                        </div>
                        <div className="form-grid-2">
                            <label>
                                Subtitle
                                <input type="text" value={form.subtitle} onChange={handleFieldChange('subtitle')} />
                            </label>
                            <label>
                                Short description
                                <textarea value={form.short_description} onChange={handleFieldChange('short_description')} rows="4" required />
                                {validationErrors.short_description && <span className="admin-field-error">{validationErrors.short_description}</span>}
                            </label>
                        </div>
                        <label>
                            Full description
                            <textarea value={form.full_description} onChange={handleFieldChange('full_description')} rows="4" required />
                            {validationErrors.full_description && <span className="admin-field-error">{validationErrors.full_description}</span>}
                        </label>
                        <div className="form-grid-2">
                            <label>
                                Status
                                <select value={form.status} onChange={handleFieldChange('status')}>
                                    {Object.entries(statusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Technologies used
                                <select multiple value={form.technologyIds.map(String)} onChange={handleTechnologyChange}>
                                    {skills.map((skill) => (
                                        <option key={skill.id} value={skill.id}>
                                            {skill.name} ({skill.category})
                                        </option>
                                    ))}
                                </select>
                                <span className="admin-help-text">Hold Ctrl or Cmd to select multiple technologies.</span>
                            </label>
                        </div>
                        <label>
                            Features
                            <textarea
                                className="admin-array-textarea"
                                value={form.featuresText}
                                onChange={handleFieldChange('featuresText')}
                                rows="3"
                                placeholder="Comma separated feature cards"
                            />
                        </label>
                        <label>
                            Responsibilities
                            <textarea
                                className="admin-array-textarea"
                                value={form.responsibilitiesText}
                                onChange={handleFieldChange('responsibilitiesText')}
                                rows="3"
                                placeholder="Comma separated role contributions"
                            />
                        </label>
                        <div className="form-grid-2">
                            <label>
                                Challenges
                                <textarea
                                    className="admin-array-textarea"
                                    value={form.challengesText}
                                    onChange={handleFieldChange('challengesText')}
                                    rows="3"
                                    placeholder="Comma separated challenges"
                                />
                            </label>
                            <label>
                                Future improvements
                                <textarea
                                    className="admin-array-textarea"
                                    value={form.futureImprovementsText}
                                    onChange={handleFieldChange('futureImprovementsText')}
                                    rows="3"
                                    placeholder="Comma separated improvements"
                                />
                            </label>
                        </div>
                        <div className="form-grid-2">
                            <label>
                                GitHub URL
                                <input type="url" value={form.github_url} onChange={handleFieldChange('github_url')} />
                                {validationErrors.github_url && <span className="admin-field-error">{validationErrors.github_url}</span>}
                            </label>
                            <label>
                                Live URL
                                <input type="url" value={form.live_url} onChange={handleFieldChange('live_url')} />
                                {validationErrors.live_url && <span className="admin-field-error">{validationErrors.live_url}</span>}
                            </label>
                        </div>
                        <div className="form-grid-2">
                            <label>
                                Completion date
                                <input type="date" value={form.completion_date} onChange={handleFieldChange('completion_date')} />
                                {validationErrors.completion_date && <span className="admin-field-error">{validationErrors.completion_date}</span>}
                            </label>
                            <label>
                                Display order
                                <input type="number" min="1" value={form.display_order} onChange={handleFieldChange('display_order')} />
                                {validationErrors.display_order && <span className="admin-field-error">{validationErrors.display_order}</span>}
                            </label>
                        </div>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={form.featured} onChange={handleFieldChange('featured')} />
                            Featured
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={form.company_project} onChange={handleFieldChange('company_project')} />
                            Company project
                        </label>
                        <label>
                            Project cover image
                            <input type="file" accept="image/*" onChange={handleCoverFileChange} />
                        </label>
                        {coverPreview && (
                            <div className="project-image-previews project-cover-preview">
                                <div className="project-image-preview">
                                    <span>Project cover</span>
                                    <img src={coverPreview} alt="Cover preview" loading="lazy" />
                                </div>
                            </div>
                        )}
                        <label>
                            Gallery images
                            <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} />
                        </label>
                        {(galleryItems.length > 0 || galleryPreviews.length > 0) && (
                            <div className="project-image-previews project-gallery-preview">
                                {galleryItems.map((item, index) => (
                                    <div className="project-image-preview" key={`${item.mediaId}-${index}`}>
                                        <span>Gallery {index + 1}</span>
                                        {item.url && <img src={item.url} alt={item.altText || `Gallery image ${index + 1}`} loading="lazy" />}
                                        <div className="gallery-order-actions">
                                            <button type="button" className="secondary-button" onClick={() => moveGalleryItem(index, -1)} disabled={index === 0}>
                                                Up
                                            </button>
                                            <button type="button" className="secondary-button" onClick={() => moveGalleryItem(index, 1)} disabled={index === galleryItems.length - 1}>
                                                Down
                                            </button>
                                            <button type="button" className="secondary-button" onClick={() => removeGalleryItem(index)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {galleryPreviews.map((preview, index) => (
                                    <div className="project-image-preview" key={preview}>
                                        <span>New gallery {index + 1}</span>
                                        <img src={preview} alt={`Gallery preview ${index + 1}`} loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="form-actions-row">
                            <button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : editingProjectId ? 'Update project' : 'Create project'}
                            </button>
                            {editingProjectId && (
                                <button type="button" className="secondary-button" onClick={cancelEdit}>
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </form>
                </div >
            )
            }

            {
                routeMode === 'list' && (
                    <div className="admin-list-section">
                        {!loading && (projects.length === 0 ? (
                            <p>No projects found yet.</p>
                        ) : (
                            <>
                                {featuredProjects.length > 0 && (
                                    <div className="admin-list-section-group">
                                        <div className="admin-list-section-header">
                                            <h2>Featured Projects</h2>
                                            <p>{featuredProjects.length} featured project{featuredProjects.length === 1 ? '' : 's'}</p>
                                        </div>
                                        <div className="admin-card-grid">
                                            {featuredProjects.map((project) => (
                                                <article key={project.id} className="dashboard-card project-card admin-list-card">
                                                    <div className="admin-card-media">
                                                        <ProjectCoverImage project={project} />
                                                    </div>
                                                    <div className="admin-card-content">
                                                        <h3>{project.name}</h3>
                                                        <p>{project.short_description}</p>
                                                        <div className="project-card-meta">
                                                            <span className="admin-chip featured-chip">Featured</span>
                                                            <span className="admin-chip">{project.company_project ? 'Company' : 'Personal'}</span>
                                                            <span className="admin-chip">{statusLabels[project.status] || project.status}</span>
                                                        </div>
                                                        <p className="project-detail">Slug: {project.slug}</p>
                                                    </div>
                                                    <div className="admin-actions">
                                                        <Link className="admin-link" to={`/projects/${project.id}`}>
                                                            View
                                                        </Link>
                                                        <Link className="secondary-button" to={`/projects/${project.id}/edit`}>
                                                            Edit
                                                        </Link>
                                                        {project.slug && (
                                                            <a className="admin-link" href={`http://localhost:5173/projects/${project.slug}`} target="_blank" rel="noreferrer">
                                                                Public
                                                            </a>
                                                        )}
                                                        <button type="button" className="secondary-button" disabled={actionLoading} onClick={() => deleteProject(project.id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {statusOrder.map((status) => {
                                    const projectsForStatus = groupedByStatus[status] || [];
                                    if (!projectsForStatus.length) {
                                        return null;
                                    }

                                    return (
                                        <div key={status} className="admin-list-section-group">
                                            <div className="admin-list-section-header">
                                                <h2>{statusLabels[status] || status}</h2>
                                                <p>{projectsForStatus.length} project{projectsForStatus.length === 1 ? '' : 's'}</p>
                                            </div>
                                            <div className="admin-card-grid">
                                                {projectsForStatus.map((project) => (
                                                    <article key={project.id} className="dashboard-card project-card admin-list-card">
                                                        <div className="admin-card-media">
                                                            <ProjectCoverImage project={project} />
                                                        </div>
                                                        <div className="admin-card-content">
                                                            <h3>{project.name}</h3>
                                                            <p>{project.short_description}</p>
                                                            <div className="project-card-meta">
                                                                {project.featured && <span className="admin-chip featured-chip">Featured</span>}
                                                                <span className="admin-chip">{project.company_project ? 'Company' : 'Personal'}</span>
                                                                <span className="admin-chip">{statusLabels[project.status] || project.status}</span>
                                                            </div>
                                                            <p className="project-detail">Slug: {project.slug}</p>
                                                        </div>
                                                        <div className="admin-actions">
                                                            <Link className="admin-link" to={`/projects/${project.id}`}>
                                                                View
                                                            </Link>
                                                            <Link className="secondary-button" to={`/projects/${project.id}/edit`}>
                                                                Edit
                                                            </Link>
                                                            {project.slug && (
                                                                <a className="admin-link" href={`http://localhost:5173/projects/${project.slug}`} target="_blank" rel="noreferrer">
                                                                    Public
                                                                </a>
                                                            )}
                                                            <button type="button" className="secondary-button" disabled={actionLoading} onClick={() => deleteProject(project.id)}>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                )
            }
        </section >
    );
}

export default AdminProjects;
