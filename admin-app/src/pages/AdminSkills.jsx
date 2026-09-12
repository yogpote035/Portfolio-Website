import {
  PageHeader,
  FormField,
  FormSection,
  ErrorState,
  EmptyState,
  DataTable,
  StatusBadge,
  useConfirm,
  useToast,
} from "../components/ui.jsx";
import { useEffect, useMemo, useState } from "react";
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import { parseValidationErrors } from "../utils/errorHelpers.js";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ImageUploadField from "../components/ImageUploadField.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const skillCategories = [
  "frontend",
  "backend",
  "database",
  "devops",
  "languages",
  "cloud",
  "tools",
  "ai",
];

const initialSkillForm = {
  name: "",
  category: "frontend",
  level: 0,
  color: "",
  display_order: 1,
  is_active: true,
  logo_media_id: null,
  logoPreviewUrl: "",
};

function AdminSkills() {
  const notify = useToast();
  const confirm = useConfirm();
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(initialSkillForm);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [categoryFilter, setCategoryFilter] = useState(
    () => location.state?.returnCategory || "all",
  );
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const { id: routeSkillId } = useParams();
  const routeMode = location.pathname.endsWith("/new")
    ? "create"
    : location.pathname.endsWith("/edit")
      ? "edit"
      : routeSkillId
        ? "view"
        : "list";

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    loadSkills();
  }, [navigate]);

  useEffect(() => {
    const { scrollY: storedScrollY, returnCategory } = location.state || {};

    if (typeof storedScrollY === "number" && !hasRestoredScroll) {
      window.scrollTo({ top: storedScrollY, behavior: "auto" });
      setHasRestoredScroll(true);
    }

    if (returnCategory) {
      setCategoryFilter(returnCategory);
    }
  }, [location.state, hasRestoredScroll]);

  useEffect(() => {
    const saveScroll = () => setScrollY(window.scrollY);

    window.addEventListener("scroll", saveScroll, { passive: true });
    return () => window.removeEventListener("scroll", saveScroll);
  }, []);

  async function loadSkills() {
    setLoading(true);
    setError(null);

    try {
      const skillsData = await fetchApiAuth("/api/admin/skills");
      setSkills(skillsData || []);
    } catch (err) {
      const message = err.message || "Failed to load skills";
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

  const groupedSkills = useMemo(() => {
    return skills.reduce((groups, skill) => {
      const category = skill.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
      return groups;
    }, {});
  }, [skills]);

  const orderedCategories = useMemo(() => {
    const dynamicCategories = Object.keys(groupedSkills).filter(
      (category) => !skillCategories.includes(category),
    );
    return [
      ...skillCategories.filter((category) => groupedSkills[category]),
      ...dynamicCategories,
    ];
  }, [groupedSkills]);

  const filteredSkills = useMemo(() => {
    if (categoryFilter === "all") {
      return skills;
    }

    return skills.filter((skill) => skill.category === categoryFilter);
  }, [skills, categoryFilter]);

  const selectedSkill = useMemo(() => {
    if (!routeSkillId) {
      return null;
    }

    return (
      skills.find((skill) => String(skill.id) === String(routeSkillId)) || null
    );
  }, [routeSkillId, skills]);

  useEffect(() => {
    if (routeMode !== "edit" || !selectedSkill) {
      return;
    }

    startEditingSkill(selectedSkill, false);
  }, [routeMode, selectedSkill]);

  useEffect(() => {
    if (routeMode === "create") {
      setEditingSkillId(null);
      setForm(initialSkillForm);
    }
  }, [routeMode]);

  const handleFieldChange = (field) => (event) => {
    const value =
      field === "is_active" ? event.target.checked : event.target.value;
    setForm((current) => ({
      ...current,
      [field]:
        field === "level" || field === "display_order" ? Number(value) : value,
    }));
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setValidationErrors({});
    setSaving(true);

    try {
      const { logoPreviewUrl, ...payload } = form;
      const path = editingSkillId
        ? `/api/admin/skills/${editingSkillId}`
        : "/api/admin/skills";
      await fetchApiAuth(path, {
        method: editingSkillId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      notify("Skill saved successfully.");
      setForm(initialSkillForm);
      setEditingSkillId(null);
      await loadSkills();
      navigate("/skills", {
        state: { scrollY, returnCategory: categoryFilter },
      });
    } catch (err) {
      const validation = parseValidationErrors(err);
      if (Object.keys(validation.fieldErrors).length > 0) {
        setValidationErrors(validation.fieldErrors);
        setError(
          validation.message || "Please fix highlighted fields before saving.",
        );
      } else {
        setError(err.message || "Failed to save skill");
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditingSkill = (skill, shouldScroll = true) => {
    setEditingSkillId(skill.id);
    setForm({
      name: skill.name || "",
      category: skill.category || "frontend",
      level: skill.level ?? 0,
      color: skill.color || "",
      display_order: skill.display_order ?? 1,
      is_active: Boolean(skill.is_active),
      logo_media_id: skill.logo_media_id || null,
      logoPreviewUrl: skill.logo_media_url || "",
    });
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const cancelEdit = () => {
    setEditingSkillId(null);
    setForm(initialSkillForm);
    navigate("/skills", { state: { scrollY, returnCategory: categoryFilter } });
  };

  const toggleActive = async (skillId, currentValue) => {
    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/skills/${skillId}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !currentValue }),
      });
      notify("Skill saved successfully.");
      await loadSkills();
    } catch (err) {
      setError(err.message || "Failed to update skill");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteSkill = async (skillId) => {
    if (!(await confirm("Delete this skill?"))) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/skills/${skillId}`, {
        method: "DELETE",
      });
      notify("Skill deleted successfully.");
      await loadSkills();
    } catch (err) {
      setError(err.message || "Failed to delete skill");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading skills..." />}
      {!loading && saving && (
        <LoadingOverlay message="Saving skill changes..." />
      )}
      {!loading && actionLoading && (
        <LoadingOverlay message="Updating skills..." />
      )}
      <PageHeader>
        <div>
          <h1>
            {routeMode === "create"
              ? "Create Skill"
              : routeMode === "edit"
                ? "Edit Skill"
                : routeMode === "view"
                  ? "Skill Details"
                  : "Skill Management"}
          </h1>
          <p>
            Manage only portfolio-ready skill fields: name, category, logo,
            level, status, and display order.
          </p>
        </div>
        <div className="admin-header-actions">
          {routeMode !== "list" && (
            <Link className="secondary-button" to="/skills">
              Back to skills
            </Link>
          )}
          {routeMode === "list" && (
            <Link className="admin-link-button" to="/skills/new">
              New skill
            </Link>
          )}
        </div>
      </PageHeader>
      {!loading && !error && routeSkillId && !selectedSkill && (
        <EmptyState
          title="Content not found"
          description="This entry may have been removed or is not in the loaded results."
          to="/skills"
          action="Back to skills"
        />
      )}

      {error && <ErrorState message={error} onRetry={loadSkills} />}

      {routeMode === "view" && selectedSkill && (
        <article className="admin-login-card admin-detail-card">
          <div className="admin-card-media">
            {selectedSkill.logo_media_url ? (
              <img
                src={selectedSkill.logo_media_url}
                alt={selectedSkill.name}
                loading="lazy"
              />
            ) : (
              <div
                className="skill-card-fallback"
                style={{ backgroundColor: selectedSkill.color || "#e0f7ff" }}
              >
                {selectedSkill.name?.charAt(0).toUpperCase() || "S"}
              </div>
            )}
          </div>
          <div className="admin-detail-header">
            <div>
              <h2>{selectedSkill.name}</h2>
              <p>Category: {selectedSkill.category}</p>
              <p>Level: {selectedSkill.level ?? 0}</p>
              <p>Display order: {selectedSkill.display_order ?? 1}</p>
            </div>
            <div className="admin-actions">
              <Link
                className="secondary-button"
                to={`/skills/${selectedSkill.id}/history`}
              >
                History
              </Link>
              <Link
                className="secondary-button"
                to={`/skills/${selectedSkill.id}/edit`}
              >
                Edit
              </Link>
            </div>
          </div>
          <span
            className={`admin-chip ${selectedSkill.is_active ? "status-active" : "status-inactive"}`}
          >
            {selectedSkill.is_active ? "Active" : "Inactive"}
          </span>
        </article>
      )}

      {(routeMode === "create" || routeMode === "edit") && (
        <div className="admin-login-card admin-form-card">
          <form onSubmit={handleSubmit} className="admin-form">
            <FormSection
              title="Skill details"
              description="Organize your expertise into clear categories."
            >
              <div className="form-grid-2">
                <FormField>
                  Skill name
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleFieldChange("name")}
                    required
                  />
                  {validationErrors.name && (
                    <span className="admin-field-error">
                      {validationErrors.name}
                    </span>
                  )}
                </FormField>
                <FormField>
                  Category
                  <select
                    value={form.category}
                    onChange={handleFieldChange("category")}
                  >
                    {skillCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <span className="admin-field-error">
                      {validationErrors.category}
                    </span>
                  )}
                </FormField>
              </div>
              <div className="form-grid-2">
                <FormField>
                  Level
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.level}
                    onChange={handleFieldChange("level")}
                  />
                  {validationErrors.level && (
                    <span className="admin-field-error">
                      {validationErrors.level}
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
              <div className="form-grid-2">
                <FormField>
                  Color
                  <input
                    type="text"
                    value={form.color}
                    onChange={handleFieldChange("color")}
                    placeholder="#12a4ff"
                  />
                  {validationErrors.color && (
                    <span className="admin-field-error">
                      {validationErrors.color}
                    </span>
                  )}
                </FormField>
                <FormField className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={handleFieldChange("is_active")}
                  />
                  Active
                  {validationErrors.is_active && (
                    <span className="admin-field-error">
                      {validationErrors.is_active}
                    </span>
                  )}
                </FormField>
              </div>
            </FormSection>
            <FormSection
              title="Visual identity"
              description="Use a recognizable logo for this skill."
            >
              <ImageUploadField
                label="Skill logo"
                folder="skill_logos"
                valueUrl={form.logoPreviewUrl}
                previewAlt="Skill logo preview"
                onUploaded={(media) =>
                  setForm((current) => ({
                    ...current,
                    logo_media_id: media.id,
                    logoPreviewUrl: media.url,
                  }))
                }
              />
            </FormSection>
            <div className="form-actions-row">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingSkillId
                    ? "Update skill"
                    : "Save skill"}
              </button>
              {editingSkillId && (
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
        <div className="admin-list-section">
          <div className="admin-filter-row">
            <FormField>
              Category
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                {orderedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <DataTable
            loading={loading}
            label="Skills"
            rows={filteredSkills}
            empty={
              <EmptyState
                title="No skills yet"
                description="Add the technologies and tools you work with."
                to="/skills/new"
                action="Add skill"
              />
            }
            columns={[
              {
                key: "name",
                label: "Skill",
                render: (s) => (
                  <Link
                    className="cms-table-identity cms-skill-identity"
                    to={`/skills/${s.id}`}
                  >
                    {s.logo_media_url ? (
                      <img src={s.logo_media_url} alt="" loading="lazy" />
                    ) : (
                      <span className="skill-card-fallback">{s.name?.[0]}</span>
                    )}
                    <strong>{s.name}</strong>
                  </Link>
                ),
              },
              { key: "category", label: "Category" },
              {
                key: "level",
                label: "Level",
                render: (s) =>
                  s.level != null ? (
                    <div className="cms-level">
                      {s.level}/100
                      <progress
                        max="100"
                        value={s.level}
                        aria-label={`${s.name} level`}
                      />
                    </div>
                  ) : (
                    "—"
                  ),
              },
              {
                key: "color",
                label: "Color",
                render: (s) => <span>{s.color || "—"}</span>,
              },
              {
                key: "is_active",
                label: "Status",
                render: (s) => (
                  <StatusBadge tone={s.is_active ? "success" : "neutral"}>
                    {s.is_active ? "Active" : "Inactive"}
                  </StatusBadge>
                ),
              },
              { key: "display_order", label: "Order" },
              {
                key: "actions",
                label: "Actions",
                render: (s) => (
                  <div className="cms-table-actions">
                    <Link className="admin-link" to={`/skills/${s.id}`}>
                      View
                    </Link>
                    <Link
                      className="secondary-button"
                      to={`/skills/${s.id}/edit`}
                    >
                      Edit
                    </Link>
                    <details>
                      <summary aria-label="More actions">More</summary>
                      <div>
                        <Link
                          className="admin-link"
                          to={`/skills/${s.id}/history`}
                        >
                          Version history
                        </Link>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={actionLoading}
                          onClick={() => toggleActive(s.id, s.is_active)}
                        >
                          {s.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="secondary-button danger-button"
                          disabled={actionLoading}
                          onClick={() => deleteSkill(s.id)}
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
        </div>
      )}
    </section>
  );
}

export default AdminSkills;
