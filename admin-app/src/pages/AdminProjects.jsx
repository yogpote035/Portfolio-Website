import {
  PageHeader,
  FormField,
  FormSection,
  ErrorState,
  EmptyState,
  DataTable,
  StatusBadge,
  formatDate,
  useConfirm,
  useToast,
} from "../components/ui.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import { parseValidationErrors } from "../utils/errorHelpers.js";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import ImageDropZone from "../components/ImageDropZone.jsx";
import SearchableSelect from "../components/SearchableSelect.jsx";
import { getNextDisplayOrder } from "../utils/displayOrder.js";

const portfolioBaseUrl =
  import.meta.env.VITE_PORTFOLIO_URL || "http://localhost:5173";

const initialForm = {
  name: "",
  slug: "",
  subtitle: "",
  role: "",
  short_description: "",
  full_description: "",
  github_url: "",
  live_url: "",
  featured: false,
  project_type: "personal",
  status: "planned",
  completion_date: "",
  display_order: 1,
  cover_media_id: null,
  technologyIds: [],
  featuresText: "",
  responsibilitiesText: "",
  challengesText: "",
  futureImprovementsText: "",
};

const statusLabels = {
  completed: "Completed",
  in_progress: "In progress",
  planned: "Planned",
  archived: "Archived",
};

const projectTypeOptions = [
  { value: "personal", label: "Personal project" },
  { value: "company", label: "Enterprise project" },
  { value: "freelance", label: "Freelance project" },
];

const projectTypeLabels = Object.fromEntries(
  projectTypeOptions.map((option) => [option.value, option.label]),
);

function listToText(value) {
  if (!value) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
}

function textToList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDateInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function isValidSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
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
    altText: item.altText || item.alt_text || "",
    displayOrder: item.displayOrder ?? item.display_order ?? index + 1,
    url: item.url || item.mediaUrl || "",
    originalName: item.originalName || item.original_name || "",
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

  return (
    imageSources.find((value) => typeof value === "string" && value.trim()) ||
    ""
  );
}

function ProjectCoverImage({ project }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = getProjectImageUrl(project);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (!imageUrl || hasImageError) {
    return (
      <div
        className="project-card-fallback"
        aria-label={`${project?.name || "Project"} cover unavailable`}
      >
        {project?.name?.charAt(0).toUpperCase() || "P"}
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
  const notify = useToast();
  const confirm = useConfirm();
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const coverBlobUrlRef = useRef("");
  const galleryBlobUrlsRef = useRef([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeProjectId } = useParams();
  const routeMode = location.pathname.endsWith("/new")
    ? "create"
    : location.pathname.endsWith("/edit")
      ? "edit"
      : routeProjectId
        ? "view"
        : "list";

  const clearCoverBlobUrl = () => {
    if (coverBlobUrlRef.current) {
      URL.revokeObjectURL(coverBlobUrlRef.current);
      coverBlobUrlRef.current = "";
    }
  };

  const clearGalleryBlobUrls = () => {
    galleryBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    galleryBlobUrlsRef.current = [];
  };

  useEffect(
    () => () => {
      clearCoverBlobUrl();
      clearGalleryBlobUrls();
    },
    [],
  );

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    loadProjects();
    loadSkills();
  }, [navigate]);

  useEffect(() => {
    if (
      routeMode !== "edit" ||
      !routeProjectId ||
      loading ||
      projects.length === 0
    ) {
      return;
    }

    const project = projects.find(
      (item) => String(item.id) === String(routeProjectId),
    );
    if (project) {
      startEditingProject(project);
    }
  }, [routeMode, routeProjectId, loading, projects]);

  useEffect(() => {
    if (routeMode === "create") {
      clearCoverBlobUrl();
      clearGalleryBlobUrls();
      setEditingProjectId(null);
      setForm(initialForm);
      setSlugManuallyEdited(false);
      setCoverFile(null);
      setGalleryFiles([]);
      setCoverPreview("");
      setGalleryItems([]);
      setGalleryPreviews([]);
    }
  }, [routeMode]);

  useEffect(() => {
    if (routeMode === "create" && !loading) {
      setForm((current) => ({
        ...current,
        display_order: getNextDisplayOrder(projects),
      }));
    }
  }, [routeMode, loading, projects]);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const projectsData = await fetchApiAuth("/api/admin/projects");
      setProjects(projectsData || []);
    } catch (err) {
      const message = err.message || "Failed to load projects";
      setError(message);
      if (
        message.toLowerCase().includes("unauthor") ||
        message.toLowerCase().includes("authentication")
      ) {
        clearAuthTokens();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadSkills() {
    try {
      const skillsData = await fetchApiAuth("/api/admin/skills");
      setSkills(skillsData || []);
    } catch {
      setSkills([]);
    }
  }

  const selectedProject = useMemo(() => {
    if (!routeProjectId) {
      return null;
    }

    return (
      projects.find((item) => String(item.id) === String(routeProjectId)) ||
      null
    );
  }, [projects, routeProjectId]);

  const handleFieldChange = (field) => (event) => {
    const value =
      field === "featured"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: field === "display_order" ? Number(value) : value,
    }));

    setValidationErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    setError(null);
  };

  const handleNameChange = (event) => {
    const name = event.target.value;
    setForm((current) => ({
      ...current,
      name,
      slug: slugManuallyEdited ? current.slug : normalizeSlug(name),
    }));
    setValidationErrors((current) => ({
      ...current,
      name: undefined,
      ...(!slugManuallyEdited ? { slug: undefined } : {}),
    }));
    setError(null);
  };

  const handleSlugChange = (event) => {
    setSlugManuallyEdited(true);
    setForm((current) => ({ ...current, slug: event.target.value }));
    setValidationErrors((current) => ({ ...current, slug: undefined }));
    setError(null);
  };

  const regenerateSlug = () => {
    setSlugManuallyEdited(false);
    setForm((current) => ({ ...current, slug: normalizeSlug(current.name) }));
    setValidationErrors((current) => ({ ...current, slug: undefined }));
    setError(null);
  };

  const isImageFile = (file) =>
    file && typeof file.type === "string" && file.type.startsWith("image/");

  const handleCoverFiles = (files) => {
    const file = files?.[0] || null;
    setError(null);

    if (file && !isImageFile(file)) {
      setCoverFile(null);
      setCoverPreview(form.cover_url || "");
      setError("Only image files are allowed for project cover images.");
      return;
    }

    clearCoverBlobUrl();
    setCoverFile(file);
    if (file) {
      coverBlobUrlRef.current = URL.createObjectURL(file);
    }
    setCoverPreview(coverBlobUrlRef.current || form.cover_url || "");
  };

  const handleTechnologyChange = (values) => {
    const selected = values.map(Number);
    setForm((current) => ({ ...current, technologyIds: selected }));
  };

  const startEditingProject = (project) => {
    clearCoverBlobUrl();
    clearGalleryBlobUrls();
    setEditingProjectId(project.id);
    setSlugManuallyEdited(true);
    setForm({
      name: project.name || "",
      slug: project.slug || "",
      subtitle: project.subtitle || "",
      role: project.role || "",
      short_description: project.short_description || "",
      full_description: project.full_description || "",
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      featured: Boolean(project.featured),
      project_type:
        project.project_type || (project.company_project ? "company" : "personal"),
      status: project.status || "planned",
      completion_date: formatDateInput(project.completion_date),
      display_order: project.display_order ?? 1,
      cover_media_id: project.cover_media_id || null,
      technologyIds: (project.technologies || [])
        .map((tech) => tech.id)
        .filter(Boolean),
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
    clearCoverBlobUrl();
    clearGalleryBlobUrls();
    setEditingProjectId(null);
    setForm(initialForm);
    setSlugManuallyEdited(false);
    setCoverFile(null);
    setGalleryFiles([]);
    setCoverPreview("");
    setGalleryItems([]);
    setGalleryPreviews([]);
    if (routeProjectId) {
      navigate("/projects");
    }
  };

  const handleGalleryFiles = (files) => {
    const selectedFiles = Array.from(files || []);
    setError(null);

    const invalidFiles = selectedFiles.filter((file) => !isImageFile(file));
    if (invalidFiles.length > 0) {
      setError("Only image files are allowed for gallery uploads.");
    }

    const validFiles = selectedFiles.filter(isImageFile);
    const previewUrls = validFiles.map((file) => URL.createObjectURL(file));
    galleryBlobUrlsRef.current.push(...previewUrls);
    setGalleryFiles((current) => [...current, ...validFiles]);
    setGalleryPreviews((current) => [...current, ...previewUrls]);
  };

  const moveGalleryItem = (index, direction) => {
    setGalleryItems((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const updated = [...current];
      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];
      return updated.map((item, order) => ({
        ...item,
        displayOrder: order + 1,
      }));
    });
  };

  const removeGalleryItem = (index) => {
    setGalleryItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const movePendingGalleryItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= galleryFiles.length) return;

    setGalleryFiles((current) => {
      const updated = [...current];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
    setGalleryPreviews((current) => {
      const updated = [...current];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      galleryBlobUrlsRef.current = updated;
      return updated;
    });
  };

  const removePendingGalleryItem = (index) => {
    const previewUrl = galleryPreviews[index];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setGalleryFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setGalleryPreviews((current) => {
      const updated = current.filter((_, itemIndex) => itemIndex !== index);
      galleryBlobUrlsRef.current = updated;
      return updated;
    });
  };

  const uploadImageFile = async (file) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();
    formData.append("image", file);
    const media = await fetchApiAuth("/api/admin/projects/image", {
      method: "POST",
      body: formData,
    });
    return media;
  };

  const validateProjectForm = (values) => {
    const errors = {};
    const normalizedSlug = normalizeSlug(values.slug);

    if (!values.name?.trim()) {
      errors.name = "Name is required.";
    }

    if (!normalizedSlug) {
      errors.slug =
        "Slug is required and must contain letters, numbers, or hyphens.";
    } else if (!isValidSlug(normalizedSlug)) {
      errors.slug =
        "Slug can only use lowercase letters, numbers, and hyphens.";
    }

    if (!values.short_description?.trim()) {
      errors.short_description = "Short description is required.";
    }

    if (!values.full_description?.trim()) {
      errors.full_description = "Full description is required.";
    }

    if (!projectTypeLabels[values.project_type]) {
      errors.project_type = "Select a valid project type.";
    }

    if (values.github_url && !isValidUrl(values.github_url)) {
      errors.github_url = "GitHub URL must be a valid URL.";
    }

    if (values.live_url && !isValidUrl(values.live_url)) {
      errors.live_url = "Live URL must be a valid URL.";
    }

    if (!isValidPositiveOrder(values.display_order)) {
      errors.display_order = "Display order must be a positive integer.";
    }

    if (!isValidDate(values.completion_date)) {
      errors.completion_date = "Completion date must be in YYYY-MM-DD format.";
    }

    return { errors, normalizedSlug };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setValidationErrors({});

    const uploadedMediaIds = [];
    let projectSaved = false;

    try {
      const requestBody = { ...form };
      const { errors, normalizedSlug } = validateProjectForm(requestBody);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError("Please fix the highlighted fields before saving.");
        setSaving(false);
        return;
      }

      requestBody.slug = normalizedSlug;
      requestBody.featured = Boolean(requestBody.featured);
      requestBody.project_type = requestBody.project_type || "personal";
      requestBody.subtitle = requestBody.subtitle?.trim() || null;
      requestBody.role = requestBody.role?.trim() || null;
      requestBody.github_url = requestBody.github_url || null;
      requestBody.live_url = requestBody.live_url || null;
      requestBody.completion_date = requestBody.completion_date || null;

      if (coverFile) {
        const coverMedia = await uploadImageFile(coverFile);
        if (coverMedia?.id) uploadedMediaIds.push(coverMedia.id);
        requestBody.cover_media_id = coverMedia?.id ?? null;
      }

      let galleryImages = galleryItems.map((item, index) => ({
        mediaId: item.mediaId,
        altText: item.altText || `${requestBody.name} screenshot ${index + 1}`,
        displayOrder: index + 1,
      }));

      if (galleryFiles.length) {
        const galleryMedia = [];
        for (const file of galleryFiles) {
          const media = await uploadImageFile(file);
          if (media?.id) uploadedMediaIds.push(media.id);
          galleryMedia.push(media);
        }
        galleryImages = [
          ...galleryImages,
          ...galleryMedia.filter(Boolean).map((media, index) => ({
            mediaId: media.id,
            altText: `${requestBody.name} screenshot ${galleryImages.length + index + 1}`,
            displayOrder: galleryImages.length + index + 1,
          })),
        ];
      }

      requestBody.galleryImages = galleryImages;

      requestBody.features = textToList(requestBody.featuresText || "");
      requestBody.responsibilities = textToList(
        requestBody.responsibilitiesText || "",
      );
      requestBody.challenges = textToList(requestBody.challengesText || "");
      requestBody.future_improvements = textToList(
        requestBody.futureImprovementsText || "",
      );
      delete requestBody.featuresText;
      delete requestBody.responsibilitiesText;
      delete requestBody.challengesText;
      delete requestBody.futureImprovementsText;

      if (editingProjectId) {
        await fetchApiAuth(`/api/admin/projects/${editingProjectId}`, {
          method: "PUT",
          body: JSON.stringify(requestBody),
        });
        notify("Project saved successfully.");
      } else {
        await fetchApiAuth("/api/admin/projects", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });
        notify("Project saved successfully.");
      }
      projectSaved = true;

      clearCoverBlobUrl();
      clearGalleryBlobUrls();
      setForm(initialForm);
      setSlugManuallyEdited(false);
      setCoverFile(null);
      setGalleryFiles([]);
      setCoverPreview("");
      setGalleryItems([]);
      setGalleryPreviews([]);
      setEditingProjectId(null);
      await loadProjects();
      navigate("/projects");
    } catch (err) {
      if (!projectSaved && uploadedMediaIds.length) {
        await Promise.allSettled(
          uploadedMediaIds.map((mediaId) =>
            fetchApiAuth(`/api/admin/media/${mediaId}`, { method: "DELETE" }),
          ),
        );
      }
      const validation = parseValidationErrors(err);
      if (Object.keys(validation.fieldErrors).length > 0) {
        setValidationErrors(validation.fieldErrors);
        setError(
          validation.message ||
            "Please fix the highlighted fields before saving.",
        );
      } else {
        setError(
          err.message ||
            (editingProjectId
              ? "Failed to update project"
              : "Failed to create project"),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (
      !(await confirm("Delete this project? This action cannot be undone."))
    ) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
      });
      notify("Project deleted successfully.");
      await loadProjects();
    } catch (err) {
      setError(err.message || "Failed to delete project");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading projects..." />}
      {!loading && saving && (
        <LoadingOverlay message="Saving project changes..." />
      )}
      {!loading && actionLoading && (
        <LoadingOverlay message="Updating projects..." />
      )}
      <PageHeader>
        <div>
          <h1>
            {routeMode === "create"
              ? "Create Project"
              : routeMode === "edit"
                ? "Edit Project"
                : routeMode === "view"
                  ? "Project Details"
                  : "Project Management"}
          </h1>
          <p>
            Manage project content, cover images, gallery sequence,
            technologies, and case-study details.
          </p>
        </div>
        <div className="admin-header-actions">
          {routeMode !== "list" && (
            <Link className="secondary-button" to="/projects">
              Back to projects
            </Link>
          )}
          {routeMode === "list" && (
            <Link className="admin-link-button" to="/projects/new">
              New project
            </Link>
          )}
        </div>
      </PageHeader>
      {!loading && !error && routeProjectId && !selectedProject && (
        <EmptyState
          title="Content not found"
          description="This entry may have been removed or is not in the loaded results."
          to="/projects"
          action="Back to projects"
        />
      )}

      {error && <ErrorState message={error} onRetry={loadProjects} />}

      {routeMode === "view" && selectedProject && (
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
              <Link
                className="secondary-button"
                to={`/projects/${selectedProject.id}/history`}
              >
                History
              </Link>
              <Link
                className="secondary-button"
                to={`/projects/${selectedProject.id}/edit`}
              >
                Edit
              </Link>
              {selectedProject.slug && (
                <a
                  className="admin-link-button"
                  href={`${portfolioBaseUrl}/projects/${selectedProject.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View public
                </a>
              )}
            </div>
          </div>
          <div className="admin-detail-grid">
            <div>
              <h3>Full description</h3>
              <p>
                {selectedProject.full_description ||
                  "No full description added."}
              </p>
            </div>
            <div>
              <h3>Meta</h3>
              <p>
                Status:{" "}
                {statusLabels[selectedProject.status] || selectedProject.status}
              </p>
              <p>Slug: {selectedProject.slug}</p>
              <p>Role: {selectedProject.role || "Not added"}</p>
              <p>Display order: {selectedProject.display_order ?? 1}</p>
              <p>
                {projectTypeLabels[
                  selectedProject.project_type ||
                    (selectedProject.company_project ? "company" : "personal")
                ] || "Personal project"}
              </p>
            </div>
          </div>
          <div className="project-card-meta">
            {(selectedProject.technologies || []).map((technology) => (
              <span
                className="admin-chip"
                key={technology.id || technology.name}
              >
                {technology.name}
              </span>
            ))}
          </div>
          {selectedProject.gallery?.length > 0 && (
            <div className="project-image-previews">
              {selectedProject.gallery.map((item, index) => (
                <div
                  className="project-image-preview"
                  key={`${item.media_id || item.mediaId}-${index}`}
                >
                  <span>Gallery {index + 1}</span>
                  <img
                    src={item.url || item.mediaUrl}
                    alt={
                      item.alt_text ||
                      `${selectedProject.name} screenshot ${index + 1}`
                    }
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </article>
      )}

      {(routeMode === "create" || routeMode === "edit") && (
        <div className="admin-login-card admin-form-card project-form-card">
          <form onSubmit={handleSubmit} className="admin-form project-form">
            <FormSection
              title="Basic information"
              description="Give your project a clear identity."
            >
              <div className="form-grid-2 project-form-section">
                <FormField>
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleNameChange}
                    required
                  />
                  {validationErrors.name && (
                    <span className="admin-field-error">
                      {validationErrors.name}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Slug
                  <input
                    type="text"
                    value={form.slug}
                    onChange={handleSlugChange}
                    onBlur={(event) => {
                      const slug = normalizeSlug(event.target.value);
                      setForm((current) => ({ ...current, slug }));
                    }}
                    placeholder="project-name"
                    required
                  />
                  <span className="cms-field-help-row">
                    <span className="admin-help-text">
                      Suggested from the name. You can enter a custom slug.
                    </span>
                    <button
                      type="button"
                      className="cms-inline-action"
                      onClick={regenerateSlug}
                      disabled={!form.name.trim()}
                    >
                      Regenerate
                    </button>
                  </span>
                  {validationErrors.slug && (
                    <span className="admin-field-error">
                      {validationErrors.slug}
                    </span>
                  )}
                </FormField>
              </div>
              <div className="form-grid-2">
                <FormField>
                  Subtitle
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={handleFieldChange("subtitle")}
                  />
                  {validationErrors.subtitle && (
                    <span className="admin-field-error">
                      {validationErrors.subtitle}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Role
                  <input
                    type="text"
                    value={form.role}
                    onChange={handleFieldChange("role")}
                    placeholder="e.g. Full-stack Developer"
                    maxLength="180"
                  />
                  <span className="admin-help-text">
                    Your role on this project, shown in the public case study.
                  </span>
                  {validationErrors.role && (
                    <span className="admin-field-error">
                      {validationErrors.role}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Short description
                  <textarea
                    value={form.short_description}
                    onChange={handleFieldChange("short_description")}
                    rows="4"
                    required
                  />
                  {validationErrors.short_description && (
                    <span className="admin-field-error">
                      {validationErrors.short_description}
                    </span>
                  )}
                </FormField>
              </div>
              <FormField>
                Status
                <SearchableSelect ariaLabel="Project status" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} />
                {validationErrors.status && (
                  <span className="admin-field-error">
                    {validationErrors.status}
                  </span>
                )}
              </FormField>
              <div className="form-grid-2">
                <FormField className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={handleFieldChange("featured")}
                  />
                  Featured
                  {validationErrors.featured && (
                    <span className="admin-field-error">
                      {validationErrors.featured}
                    </span>
                  )}
                </FormField>
                <FormField required>
                  Project type
                  <SearchableSelect
                    required
                    invalid={Boolean(validationErrors.project_type)}
                    ariaLabel="Project type"
                    value={form.project_type || "personal"}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        project_type: value,
                      }));
                      setValidationErrors((current) => ({
                        ...current,
                        project_type: undefined,
                      }));
                    }}
                    options={projectTypeOptions}
                    searchPlaceholder="Search project types..."
                  />
                  {validationErrors.project_type && (
                    <span className="admin-field-error">
                      {validationErrors.project_type}
                    </span>
                  )}
                </FormField>
              </div>
            </FormSection>
            <FormSection
              title="Project links"
              description="Connect visitors to the source code and live project."
            >
              <div className="form-grid-2">
                <FormField>
                  GitHub URL
                  <input
                    type="url"
                    value={form.github_url}
                    onChange={handleFieldChange("github_url")}
                  />
                  {validationErrors.github_url && (
                    <span className="admin-field-error">
                      {validationErrors.github_url}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Live URL
                  <input
                    type="url"
                    value={form.live_url}
                    onChange={handleFieldChange("live_url")}
                  />
                  {validationErrors.live_url && (
                    <span className="admin-field-error">
                      {validationErrors.live_url}
                    </span>
                  )}
                </FormField>
              </div>
            </FormSection>
            <FormSection
              title="Media"
              description="Upload a cover and arrange the gallery. Use Up and Down to change image order."
            >
              <ImageDropZone
                label="Project cover image"
                onFiles={handleCoverFiles}
                onRejected={(message) => setError(message)}
                helperText="One image · Dropping or pasting another image replaces the pending cover."
              />
              {coverPreview && (
                <div className="project-image-previews project-cover-preview">
                  <div className="project-image-preview">
                    <span>Project cover</span>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
              <ImageDropZone
                label="Gallery images"
                multiple
                onFiles={handleGalleryFiles}
                onRejected={(message) => setError(message)}
                helperText="Add one or several images. New drops and pastes are appended to the pending gallery."
              />
              {(galleryItems.length > 0 || galleryPreviews.length > 0) && (
                <div className="project-image-previews project-gallery-preview">
                  {galleryItems.map((item, index) => (
                    <div
                      className="project-image-preview"
                      key={`${item.mediaId}-${index}`}
                    >
                      <span>Gallery {index + 1}</span>
                      {item.url && (
                        <img
                          src={item.url}
                          alt={item.altText || `Gallery image ${index + 1}`}
                          loading="lazy"
                        />
                      )}
                      <div className="gallery-order-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => moveGalleryItem(index, -1)}
                          disabled={index === 0}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => moveGalleryItem(index, 1)}
                          disabled={index === galleryItems.length - 1}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => removeGalleryItem(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {galleryPreviews.map((preview, index) => (
                    <div className="project-image-preview" key={preview}>
                      <span>New gallery {index + 1}</span>
                      <img
                        src={preview}
                        alt={`Gallery preview ${index + 1}`}
                        loading="lazy"
                      />
                      <div className="gallery-order-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => movePendingGalleryItem(index, -1)}
                          disabled={index === 0}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => movePendingGalleryItem(index, 1)}
                          disabled={index === galleryPreviews.length - 1}
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => removePendingGalleryItem(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>
            <FormSection
              title="Technology"
              description="Select the skills used to build this project."
            >
              <FormField>
                Technologies used
                <SearchableSelect multiple ariaLabel="Technologies used" placeholder="Select technologies" searchPlaceholder="Search technologies..." value={form.technologyIds} onChange={handleTechnologyChange} options={skills.map((skill) => ({ value: skill.id, label: `${skill.name} (${skill.category})` }))} />
              </FormField>
            </FormSection>
            <FormSection
              title="Content"
              description="Tell the story behind the work. Separate list items with commas."
            >
              <FormField>
                Full description
                <textarea
                  value={form.full_description}
                  onChange={handleFieldChange("full_description")}
                  rows="4"
                  required
                />
                {validationErrors.full_description && (
                  <span className="admin-field-error">
                    {validationErrors.full_description}
                  </span>
                )}
              </FormField>
              <FormField>
                Features
                <textarea
                  className="admin-array-textarea"
                  value={form.featuresText}
                  onChange={handleFieldChange("featuresText")}
                  rows="3"
                  placeholder="Comma separated feature cards"
                />
                {validationErrors.featuresText && (
                  <span className="admin-field-error">
                    {validationErrors.featuresText}
                  </span>
                )}
              </FormField>
              <FormField>
                Responsibilities
                <textarea
                  className="admin-array-textarea"
                  value={form.responsibilitiesText}
                  onChange={handleFieldChange("responsibilitiesText")}
                  rows="3"
                  placeholder="Comma separated role contributions"
                />
                {validationErrors.responsibilitiesText && (
                  <span className="admin-field-error">
                    {validationErrors.responsibilitiesText}
                  </span>
                )}
              </FormField>
              <div className="form-grid-2">
                <FormField>
                  Challenges
                  <textarea
                    className="admin-array-textarea"
                    value={form.challengesText}
                    onChange={handleFieldChange("challengesText")}
                    rows="3"
                    placeholder="Comma separated challenges"
                  />
                  {validationErrors.challengesText && (
                    <span className="admin-field-error">
                      {validationErrors.challengesText}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Future improvements
                  <textarea
                    className="admin-array-textarea"
                    value={form.futureImprovementsText}
                    onChange={handleFieldChange("futureImprovementsText")}
                    rows="3"
                    placeholder="Comma separated improvements"
                  />
                  {validationErrors.futureImprovementsText && (
                    <span className="admin-field-error">
                      {validationErrors.futureImprovementsText}
                    </span>
                  )}
                </FormField>
              </div>
            </FormSection>
            <FormSection
              title="Display"
              description="Set the completion date and position in your portfolio."
            >
              <div className="form-grid-2">
                <FormField>
                  Completion date
                  <input
                    type="date"
                    value={form.completion_date}
                    onChange={handleFieldChange("completion_date")}
                  />
                  {validationErrors.completion_date && (
                    <span className="admin-field-error">
                      {validationErrors.completion_date}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Display order
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={handleFieldChange("display_order")}
                  />
                  {validationErrors.display_order && (
                    <span className="admin-field-error">
                      {validationErrors.display_order}
                    </span>
                  )}
                </FormField>
              </div>
            </FormSection>
            <div className="form-actions-row">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingProjectId
                    ? "Update project"
                    : "Create project"}
              </button>
              {editingProjectId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEdit}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {routeMode === "list" && (
        <DataTable
          loading={loading}
          label="Projects"
          rows={projects}
          empty={
            <EmptyState
              title="No projects yet"
              description="Add your first project to start building your portfolio."
              to="/projects/new"
              action="Create project"
            />
          }
          columns={[
            {
              key: "name",
              label: "Project",
              render: (p) => (
                <Link className="cms-table-identity" to={`/projects/${p.id}`}>
                  <ProjectCoverImage project={p} />
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.slug}</small>
                  </span>
                </Link>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (p) => (
                <StatusBadge
                  tone={
                    p.status === "completed"
                      ? "success"
                      : p.status === "in_progress"
                        ? "info"
                        : "neutral"
                  }
                >
                  {statusLabels[p.status] || p.status}
                </StatusBadge>
              ),
            },
            {
              key: "featured",
              label: "Featured",
              render: (p) =>
                p.featured ? (
                  <StatusBadge tone="primary">Featured</StatusBadge>
                ) : (
                  <span>—</span>
                ),
            },
            {
              key: "technologies",
              label: "Technologies",
              search: (p) =>
                (p.technologies || []).map((t) => t.name).join(" "),
              render: (p) => (
                <div className="cms-tech-list">
                  {(p.technologies || []).map((t) => (
                    <StatusBadge key={t.id || t.name}>{t.name}</StatusBadge>
                  ))}
                </div>
              ),
            },
            { key: "display_order", label: "Order" },
            {
              key: "updated_at",
              label: "Updated",
              render: (p) => formatDate(p.updated_at || p.updatedAt),
            },
            {
              key: "actions",
              label: "Actions",
              render: (p) => (
                <div className="cms-table-actions">
                  <Link className="admin-link" to={`/projects/${p.id}`}>
                    View
                  </Link>
                  <Link
                    className="secondary-button"
                    to={`/projects/${p.id}/edit`}
                  >
                    Edit
                  </Link>
                  <details>
                    <summary aria-label="More actions">More</summary>
                    <div>
                      <Link
                        className="admin-link"
                        to={`/projects/${p.id}/history`}
                      >
                        Version history
                      </Link>
                      {p.slug && (
                        <a
                          className="admin-link"
                          href={`${portfolioBaseUrl}/projects/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Public project
                        </a>
                      )}
                      <button
                        type="button"
                        className="secondary-button danger-button"
                        disabled={actionLoading}
                        onClick={() => deleteProject(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </details>
                </div>
              ),
            },
          ]}
        />
      )}
    </section>
  );
}

export default AdminProjects;
