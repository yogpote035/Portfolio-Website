import {
  PageHeader,
  FormField,
  FormSection,
  ErrorState,
  EmptyState,
  DataTable,
  formatDate,
  useConfirm,
  useToast,
} from "../components/ui.jsx";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ImageUploadField from "../components/ImageUploadField.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import { fetchApi } from "../utils/apiClient.js";
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import { parseValidationErrors } from "../utils/errorHelpers.js";

const initialForm = {
  company: "",
  company_logo_media_id: null,
  companyLogoPreviewUrl: "",
  job_title: "",
  employment_type: "",
  start_date: "",
  end_date: "",
  current_company: false,
  location: "",
  description: "",
  responsibilities: "",
  technologies: "",
  display_order: 1,
};

function formatDateInput(value) {
  return value ? String(value).slice(0, 10) : "";
}

function listToText(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : String(value);
  } catch {
    return String(value);
  }
}

function textToList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminExperience() {
  const notify = useToast();
  const confirm = useConfirm();
  const [experiences, setExperiences] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeExperienceId } = useParams();
  const routeMode = location.pathname.endsWith("/new")
    ? "create"
    : location.pathname.endsWith("/edit")
      ? "edit"
      : routeExperienceId
        ? "view"
        : "list";

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    loadExperiences();
  }, [navigate]);

  const selectedExperience = useMemo(() => {
    if (!routeExperienceId) return null;
    return (
      experiences.find(
        (item) => String(item.id) === String(routeExperienceId),
      ) || null
    );
  }, [experiences, routeExperienceId]);

  useEffect(() => {
    if (routeMode === "edit" && selectedExperience) {
      startEditingExperience(selectedExperience, false);
    }
  }, [routeMode, selectedExperience]);

  useEffect(() => {
    if (routeMode === "create") {
      setEditingExperienceId(null);
      setForm(initialForm);
    }
  }, [routeMode]);

  async function loadExperiences() {
    setLoading(true);
    setError(null);

    try {
      const experiencesData = await fetchApiAuth("/api/admin/experience");
      setExperiences(experiencesData || []);
    } catch (err) {
      const message = err.message || "Failed to load experiences";
      if (
        message.toLowerCase().includes("unauthor") ||
        message.toLowerCase().includes("authentication")
      ) {
        clearAuthTokens();
        navigate("/login");
        return;
      }

      try {
        const fallbackData = await fetchApi("/api/experience");
        setExperiences(fallbackData || []);
      } catch {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleFieldChange = (field) => (event) => {
    const value =
      field === "current_company" ? event.target.checked : event.target.value;
    setForm((current) => ({
      ...current,
      [field]: field === "display_order" ? Number(value) : value,
    }));
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setValidationErrors({});

    try {
      const formPayload = { ...form };
      delete formPayload.companyLogoPreviewUrl;
      const path = editingExperienceId
        ? `/api/admin/experience/${editingExperienceId}`
        : "/api/admin/experience";
      await fetchApiAuth(path, {
        method: editingExperienceId ? "PUT" : "POST",
        body: JSON.stringify({
          ...formPayload,
          end_date: formPayload.end_date || null,
          responsibilities: textToList(form.responsibilities),
          technologies: textToList(form.technologies),
        }),
      });
      notify("Experience saved successfully.");
      setForm(initialForm);
      setEditingExperienceId(null);
      await loadExperiences();
      navigate("/experience");
    } catch (err) {
      const validation = parseValidationErrors(err);
      if (Object.keys(validation.fieldErrors).length > 0) {
        setValidationErrors(validation.fieldErrors);
        setError(
          validation.message ||
            (editingExperienceId
              ? "Failed to update experience"
              : "Failed to create experience"),
        );
      } else {
        setError(
          err.message ||
            (editingExperienceId
              ? "Failed to update experience"
              : "Failed to create experience"),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditingExperience = (item, shouldScroll = true) => {
    setEditingExperienceId(item.id);
    setForm({
      company: item.company || "",
      company_logo_media_id: item.company_logo_media_id || null,
      companyLogoPreviewUrl: item.company_logo_url || "",
      job_title: item.job_title || "",
      employment_type: item.employment_type || "",
      start_date: formatDateInput(item.start_date),
      end_date: formatDateInput(item.end_date),
      current_company: Boolean(item.current_company),
      location: item.location || "",
      description: item.description || "",
      responsibilities: listToText(item.responsibilities),
      technologies: listToText(item.technologies),
      display_order: item.display_order ?? 1,
    });

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelEdit = () => {
    setEditingExperienceId(null);
    setForm(initialForm);
    navigate("/experience");
  };

  const deleteExperience = async (experienceId) => {
    if (!(await confirm("Delete this experience entry?"))) return;

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/experience/${experienceId}`, {
        method: "DELETE",
      });
      notify("Experience deleted successfully.");
      await loadExperiences();
    } catch (err) {
      setError(err.message || "Failed to delete experience");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading experience entries..." />}
      {!loading && saving && (
        <LoadingOverlay message="Saving experience changes..." />
      )}
      {!loading && actionLoading && (
        <LoadingOverlay message="Updating experience entries..." />
      )}
      <PageHeader>
        <div>
          <h1>
            {routeMode === "create"
              ? "Create Experience"
              : routeMode === "edit"
                ? "Edit Experience"
                : routeMode === "view"
                  ? "Experience Details"
                  : "Experience Management"}
          </h1>
          <p>
            Manage company, role, dates, logo, responsibilities, technologies,
            and display order.
          </p>
        </div>
        <div className="admin-header-actions">
          {routeMode !== "list" && (
            <Link className="secondary-button" to="/experience">
              Back to experience
            </Link>
          )}
          {routeMode === "list" && (
            <Link className="admin-link-button" to="/experience/new">
              New experience
            </Link>
          )}
        </div>
      </PageHeader>
      {!loading && !error && routeExperienceId && !selectedExperience && (
        <EmptyState
          title="Content not found"
          description="This entry may have been removed or is not in the loaded results."
          to="/experience"
          action="Back to experience"
        />
      )}

      {error && <ErrorState message={error} onRetry={loadExperiences} />}

      {routeMode === "view" && selectedExperience && (
        <article className="admin-login-card admin-detail-card">
          <div className="admin-detail-header">
            <div>
              <h2>{selectedExperience.company}</h2>
              <p>{selectedExperience.job_title}</p>
              <p>{selectedExperience.location || "Location not set"}</p>
              <p>
                {formatDateInput(selectedExperience.start_date) || "Start"} -{" "}
                {selectedExperience.current_company
                  ? "Present"
                  : formatDateInput(selectedExperience.end_date) || "End"}
              </p>
            </div>
            <div className="admin-actions">
              <Link
                className="secondary-button"
                to={`/experience/${selectedExperience.id}/history`}
              >
                History
              </Link>
              <Link
                className="secondary-button"
                to={`/experience/${selectedExperience.id}/edit`}
              >
                Edit
              </Link>
            </div>
          </div>
          {selectedExperience.company_logo_url && (
            <div className="admin-upload-preview">
              <img
                src={selectedExperience.company_logo_url}
                alt={`${selectedExperience.company} logo`}
                loading="lazy"
              />
            </div>
          )}
          <div className="admin-detail-grid">
            <div>
              <h3>Description</h3>
              <p>{selectedExperience.description || "No description added."}</p>
            </div>
            <div>
              <h3>Technologies</h3>
              <p>
                {listToText(selectedExperience.technologies) ||
                  "No technologies added."}
              </p>
            </div>
          </div>
          <div>
            <h3>Responsibilities</h3>
            <p>
              {listToText(selectedExperience.responsibilities) ||
                "No responsibilities added."}
            </p>
          </div>
        </article>
      )}

      {(routeMode === "create" || routeMode === "edit") && (
        <div className="admin-login-card admin-form-card">
          <form onSubmit={handleSubmit} className="admin-form">
            <FormSection
              title="Company & role"
              description="Where you worked and the role you held."
            >
              <div className="form-grid-2">
                <FormField>
                  Company
                  <input
                    type="text"
                    value={form.company}
                    onChange={handleFieldChange("company")}
                    required
                  />
                  {validationErrors.company && (
                    <span className="admin-field-error">
                      {validationErrors.company}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Job title
                  <input
                    type="text"
                    value={form.job_title}
                    onChange={handleFieldChange("job_title")}
                    required
                  />
                  {validationErrors.job_title && (
                    <span className="admin-field-error">
                      {validationErrors.job_title}
                    </span>
                  )}
                </FormField>
              </div>
              <div className="form-grid-2">
                <FormField>
                  Employment type
                  <input
                    type="text"
                    value={form.employment_type}
                    onChange={handleFieldChange("employment_type")}
                  />
                  {validationErrors.employment_type && (
                    <span className="admin-field-error">
                      {validationErrors.employment_type}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Location
                  <input
                    type="text"
                    value={form.location}
                    onChange={handleFieldChange("location")}
                  />
                  {validationErrors.location && (
                    <span className="admin-field-error">
                      {validationErrors.location}
                    </span>
                  )}
                </FormField>
              </div>
              <ImageUploadField
                label="Company logo"
                folder="company_logos"
                valueUrl={form.companyLogoPreviewUrl}
                previewAlt="Company logo preview"
                onUploaded={(media) =>
                  setForm((current) => ({
                    ...current,
                    company_logo_media_id: media.id,
                    companyLogoPreviewUrl: media.url,
                  }))
                }
              />
            </FormSection>
            <FormSection
              title="Timeline"
              description="Define the dates and current employment status."
            >
              <div className="form-grid-2">
                <FormField>
                  Start date
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={handleFieldChange("start_date")}
                    required
                  />
                  {validationErrors.start_date && (
                    <span className="admin-field-error">
                      {validationErrors.start_date}
                    </span>
                  )}
                </FormField>
                <FormField>
                  End date
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={handleFieldChange("end_date")}
                  />
                  {validationErrors.end_date && (
                    <span className="admin-field-error">
                      {validationErrors.end_date}
                    </span>
                  )}
                </FormField>
              </div>
              <FormField className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.current_company}
                  onChange={handleFieldChange("current_company")}
                />
                Current company
                {validationErrors.current_company && (
                  <span className="admin-field-error">
                    {validationErrors.current_company}
                  </span>
                )}
              </FormField>
            </FormSection>
            <FormSection
              title="Contributions"
              description="Describe your work. Separate responsibilities and technologies with commas."
            >
              <FormField>
                Description
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={handleFieldChange("description")}
                />
                {validationErrors.description && (
                  <span className="admin-field-error">
                    {validationErrors.description}
                  </span>
                )}
              </FormField>
              <FormField>
                Responsibilities
                <textarea
                  rows="2"
                  value={form.responsibilities}
                  onChange={handleFieldChange("responsibilities")}
                  placeholder="Comma separated responsibilities"
                />
                {validationErrors.responsibilities && (
                  <span className="admin-field-error">
                    {validationErrors.responsibilities}
                  </span>
                )}
              </FormField>
              <FormField>
                Technologies
                <textarea
                  rows="2"
                  value={form.technologies}
                  onChange={handleFieldChange("technologies")}
                  placeholder="Comma separated technologies"
                />
                {validationErrors.technologies && (
                  <span className="admin-field-error">
                    {validationErrors.technologies}
                  </span>
                )}
              </FormField>
            </FormSection>
            <FormSection
              title="Display"
              description="Choose where this experience appears."
            >
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
            </FormSection>
            <div className="form-actions-row">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingExperienceId
                    ? "Update experience"
                    : "Create experience"}
              </button>
              {editingExperienceId && (
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
          label="Experience"
          rows={experiences}
          empty={
            <EmptyState
              title="No experience yet"
              description="Build a timeline of your professional work."
              to="/experience/new"
              action="Add experience"
            />
          }
          columns={[
            {
              key: "company",
              label: "Company & role",
              render: (item) => (
                <Link
                  className="cms-table-identity cms-skill-identity"
                  to={`/experience/${item.id}`}
                >
                  {item.company_logo_url && (
                    <img src={item.company_logo_url} alt="" loading="lazy" />
                  )}
                  <span>
                    <strong>{item.company}</strong>
                    <small>{item.job_title}</small>
                  </span>
                </Link>
              ),
            },
            { key: "location", label: "Location" },
            {
              key: "start_date",
              label: "Period",
              render: (item) => (
                <span>
                  {formatDate(item.start_date)}
                  <small>
                    {item.current_company
                      ? "Present"
                      : formatDate(item.end_date)}
                  </small>
                </span>
              ),
            },
            {
              key: "technologies",
              label: "Technologies",
              render: (item) => listToText(item.technologies) || "—",
            },
            { key: "display_order", label: "Order" },
            {
              key: "actions",
              label: "Actions",
              render: (item) => (
                <div className="cms-table-actions">
                  <Link className="admin-link" to={`/experience/${item.id}`}>
                    View
                  </Link>
                  <Link
                    className="secondary-button"
                    to={`/experience/${item.id}/edit`}
                  >
                    Edit
                  </Link>
                  <details>
                    <summary aria-label="More actions">More</summary>
                    <div>
                      <Link
                        className="admin-link"
                        to={`/experience/${item.id}/history`}
                      >
                        Version history
                      </Link>
                      <button
                        type="button"
                        className="secondary-button danger-button"
                        disabled={actionLoading}
                        onClick={() => deleteExperience(item.id)}
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

export default AdminExperience;
