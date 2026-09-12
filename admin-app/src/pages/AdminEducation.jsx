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
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import { parseValidationErrors } from "../utils/errorHelpers.js";

const initialForm = {
  degree: "",
  college: "",
  university: "",
  cgpa: "",
  percentage: "",
  start_date: "",
  end_date: "",
  description: "",
  coursework: "",
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

function AdminEducation() {
  const notify = useToast();
  const confirm = useConfirm();
  const [educationEntries, setEducationEntries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeEducationId } = useParams();
  const routeMode = location.pathname.endsWith("/new")
    ? "create"
    : location.pathname.endsWith("/edit")
      ? "edit"
      : routeEducationId
        ? "view"
        : "list";

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    loadEducation();
  }, [navigate]);

  const selectedEducation = useMemo(() => {
    if (!routeEducationId) return null;
    return (
      educationEntries.find(
        (entry) => String(entry.id) === String(routeEducationId),
      ) || null
    );
  }, [educationEntries, routeEducationId]);

  useEffect(() => {
    if (routeMode === "edit" && selectedEducation) {
      startEditingEducation(selectedEducation, false);
    }
  }, [routeMode, selectedEducation]);

  useEffect(() => {
    if (routeMode === "create") {
      setEditingEducationId(null);
      setForm(initialForm);
    }
  }, [routeMode]);

  async function loadEducation() {
    setLoading(true);
    setError(null);

    try {
      const educationData = await fetchApiAuth("/api/admin/education");
      setEducationEntries(educationData || []);
    } catch (err) {
      const message = err.message || "Failed to load education";
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

  const handleFieldChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]:
        field === "display_order"
          ? Number(event.target.value)
          : event.target.value,
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
      const path = editingEducationId
        ? `/api/admin/education/${editingEducationId}`
        : "/api/admin/education";
      await fetchApiAuth(path, {
        method: editingEducationId ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          coursework: textToList(form.coursework),
        }),
      });
      notify("Education saved successfully.");
      setForm(initialForm);
      setEditingEducationId(null);
      await loadEducation();
      navigate("/education");
    } catch (err) {
      const validation = parseValidationErrors(err);
      if (Object.keys(validation.fieldErrors).length > 0) {
        setValidationErrors(validation.fieldErrors);
        setError(
          validation.message ||
            (editingEducationId
              ? "Failed to update education entry"
              : "Failed to create education entry"),
        );
      } else {
        setError(
          err.message ||
            (editingEducationId
              ? "Failed to update education entry"
              : "Failed to create education entry"),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditingEducation = (entry, shouldScroll = true) => {
    setEditingEducationId(entry.id);
    setForm({
      degree: entry.degree || "",
      college: entry.college || "",
      university: entry.university || "",
      cgpa: entry.cgpa || "",
      percentage: entry.percentage || "",
      start_date: formatDateInput(entry.start_date),
      end_date: formatDateInput(entry.end_date),
      description: entry.description || "",
      coursework: listToText(entry.coursework),
      display_order: entry.display_order ?? 1,
    });

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelEdit = () => {
    setEditingEducationId(null);
    setForm(initialForm);
    navigate("/education");
  };

  const deleteEducation = async (entryId) => {
    if (!(await confirm("Delete this education entry?"))) return;

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/education/${entryId}`, {
        method: "DELETE",
      });
      notify("Education deleted successfully.");
      await loadEducation();
    } catch (err) {
      setError(err.message || "Failed to delete education");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading education entries..." />}
      {!loading && saving && (
        <LoadingOverlay message="Saving education changes..." />
      )}
      {!loading && actionLoading && (
        <LoadingOverlay message="Updating education entries..." />
      )}
      <PageHeader>
        <div>
          <h1>
            {routeMode === "create"
              ? "Create Education"
              : routeMode === "edit"
                ? "Edit Education"
                : routeMode === "view"
                  ? "Education Details"
                  : "Education Management"}
          </h1>
          <p>
            Manage degree, college, dates, scores, coursework, description, and
            display order.
          </p>
        </div>
        <div className="admin-header-actions">
          {routeMode !== "list" && (
            <Link className="secondary-button" to="/education">
              Back to education
            </Link>
          )}
          {routeMode === "list" && (
            <Link className="admin-link-button" to="/education/new">
              New education
            </Link>
          )}
        </div>
      </PageHeader>
      {!loading && !error && routeEducationId && !selectedEducation && (
        <EmptyState
          title="Content not found"
          description="This entry may have been removed or is not in the loaded results."
          to="/education"
          action="Back to education"
        />
      )}

      {error && <ErrorState message={error} onRetry={loadEducation} />}

      {routeMode === "view" && selectedEducation && (
        <article className="admin-login-card admin-detail-card">
          <div className="admin-detail-header">
            <div>
              <h2>{selectedEducation.degree}</h2>
              <p>{selectedEducation.college}</p>
              <p>{selectedEducation.university || "University not set"}</p>
              <p>
                {formatDateInput(selectedEducation.start_date) || "Start"} -{" "}
                {formatDateInput(selectedEducation.end_date) || "End"}
              </p>
            </div>
            <div className="admin-actions">
              <Link
                className="secondary-button"
                to={`/education/${selectedEducation.id}/history`}
              >
                History
              </Link>
              <Link
                className="secondary-button"
                to={`/education/${selectedEducation.id}/edit`}
              >
                Edit
              </Link>
            </div>
          </div>
          <div className="admin-detail-grid">
            <div>
              <h3>Performance</h3>
              <p>CGPA: {selectedEducation.cgpa || "Not set"}</p>
              <p>Percentage: {selectedEducation.percentage || "Not set"}</p>
              <p>Display order: {selectedEducation.display_order ?? 1}</p>
            </div>
            <div>
              <h3>Coursework</h3>
              <p>
                {listToText(selectedEducation.coursework) ||
                  "No coursework added."}
              </p>
            </div>
          </div>
          <div>
            <h3>Description</h3>
            <p>{selectedEducation.description || "No description added."}</p>
          </div>
        </article>
      )}

      {(routeMode === "create" || routeMode === "edit") && (
        <div className="admin-login-card admin-form-card">
          <form onSubmit={handleSubmit} className="admin-form">
            <FormSection
              title="Qualification"
              description="Your academic background."
            >
              <FormField>
                Degree
                <input
                  type="text"
                  value={form.degree}
                  onChange={handleFieldChange("degree")}
                  required
                />
                {validationErrors.degree && (
                  <span className="admin-field-error">
                    {validationErrors.degree}
                  </span>
                )}
              </FormField>
              <div className="form-grid-2">
                <FormField>
                  College
                  <input
                    type="text"
                    value={form.college}
                    onChange={handleFieldChange("college")}
                    required
                  />
                  {validationErrors.college && (
                    <span className="admin-field-error">
                      {validationErrors.college}
                    </span>
                  )}
                </FormField>
                <FormField>
                  University
                  <input
                    type="text"
                    value={form.university}
                    onChange={handleFieldChange("university")}
                  />
                  {validationErrors.university && (
                    <span className="admin-field-error">
                      {validationErrors.university}
                    </span>
                  )}
                </FormField>
              </div>
            </FormSection>
            <FormSection
              title="Dates & performance"
              description="Add the study period and scores where available."
            >
              <div className="form-grid-2">
                <FormField>
                  Start date
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={handleFieldChange("start_date")}
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
              <div className="form-grid-2">
                <FormField>
                  CGPA
                  <input
                    type="text"
                    value={form.cgpa}
                    onChange={handleFieldChange("cgpa")}
                  />
                  {validationErrors.cgpa && (
                    <span className="admin-field-error">
                      {validationErrors.cgpa}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Percentage
                  <input
                    type="text"
                    value={form.percentage}
                    onChange={handleFieldChange("percentage")}
                  />
                  {validationErrors.percentage && (
                    <span className="admin-field-error">
                      {validationErrors.percentage}
                    </span>
                  )}
                </FormField>
              </div>
            </FormSection>
            <FormSection
              title="Academic content"
              description="Add context and separate coursework items with commas."
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
                Coursework
                <textarea
                  rows="2"
                  value={form.coursework}
                  onChange={handleFieldChange("coursework")}
                  placeholder="Comma separated coursework"
                />
                {validationErrors.coursework && (
                  <span className="admin-field-error">
                    {validationErrors.coursework}
                  </span>
                )}
              </FormField>
            </FormSection>
            <FormSection
              title="Display"
              description="Choose where this qualification appears."
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
                  : editingEducationId
                    ? "Update education entry"
                    : "Create education entry"}
              </button>
              {editingEducationId && (
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
          label="Education"
          rows={educationEntries}
          empty={
            <EmptyState
              title="No education yet"
              description="Add your academic background and achievements."
              to="/education/new"
              action="Add education"
            />
          }
          columns={[
            {
              key: "degree",
              label: "Qualification",
              render: (item) => (
                <Link
                  className="cms-table-identity"
                  to={`/education/${item.id}`}
                >
                  <span>
                    <strong>{item.degree}</strong>
                    <small>{item.college}</small>
                  </span>
                </Link>
              ),
            },
            { key: "university", label: "University" },
            {
              key: "start_date",
              label: "Period",
              render: (item) => (
                <span>
                  {formatDate(item.start_date)}
                  <small>{formatDate(item.end_date)}</small>
                </span>
              ),
            },
            { key: "cgpa", label: "CGPA" },
            { key: "display_order", label: "Order" },
            {
              key: "actions",
              label: "Actions",
              render: (item) => (
                <div className="cms-table-actions">
                  <Link className="admin-link" to={`/education/${item.id}`}>
                    View
                  </Link>
                  <Link
                    className="secondary-button"
                    to={`/education/${item.id}/edit`}
                  >
                    Edit
                  </Link>
                  <details>
                    <summary aria-label="More actions">More</summary>
                    <div>
                      <Link
                        className="admin-link"
                        to={`/education/${item.id}/history`}
                      >
                        Version history
                      </Link>
                      <button
                        type="button"
                        className="secondary-button danger-button"
                        disabled={actionLoading}
                        onClick={() => deleteEducation(item.id)}
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

export default AdminEducation;
