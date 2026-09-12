import {
  PageHeader,
  FormField,
  ErrorState,
  useToast,
} from "../components/ui.jsx";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import { parseValidationErrors } from "../utils/errorHelpers.js";
import ImageUploadField from "../components/ImageUploadField.jsx";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const initialProfile = {
  name: "",
  designation: "",
  cover_photo_media_id: null,
  about_image_media_id: null,
  about: "",
  email: "",
  phone: "",
  location: "",
  coverPhotoUrl: "",
  aboutImageUrl: "",
};

function AdminProfile() {
  const notify = useToast();
  const [profile, setProfile] = useState(initialProfile);
  const [socials, setSocials] = useState([]);
  const [typingRoles, setTypingRoles] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.endsWith("/edit");

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchApiAuth("/api/profile");
        setProfile({
          name: data.name || "",
          designation: data.designation || "",
          cover_photo_media_id: data.coverPhotoMediaId || null,
          about_image_media_id: data.aboutImageMediaId || null,
          about: data.about || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          coverPhotoUrl: data.coverPhotoUrl || "",
          aboutImageUrl: data.aboutImageUrl || "",
        });
        setSocials(data.socials || []);
        setTypingRoles(data.typingRoles || []);
        setStats(data.stats || []);
      } catch (err) {
        const message = err.message || "Failed to load profile";
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

    loadProfile();
  }, [navigate]);

  const handleFieldChange = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
    setError(null);
  };

  const handleListChange = (setter, index, field) => (event) => {
    setter((current) => {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        [field]:
          field === "display_order"
            ? Number(event.target.value)
            : event.target.value,
      };
      return updated;
    });
  };

  const handleTypingRoleChange = (index) => (event) => {
    setTypingRoles((current) => {
      const updated = [...current];
      updated[index] = event.target.value;
      return updated;
    });
  };

  const addTypingRole = () => {
    setTypingRoles((current) => [...current, ""]);
  };

  const removeTypingRole = (index) => {
    setTypingRoles((current) => current.filter((_, idx) => idx !== index));
  };

  const addSocialLink = () => {
    setSocials((current) => [
      ...current,
      { label: "", icon: "", url: "", display_order: current.length + 1 },
    ]);
  };

  const removeSocialLink = (index) => {
    setSocials((current) => current.filter((_, idx) => idx !== index));
  };

  const addStat = () => {
    setStats((current) => [
      ...current,
      { label: "", value: "", display_order: current.length + 1 },
    ]);
  };

  const removeStat = (index) => {
    setStats((current) => current.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const profilePayload = { ...profile };
      delete profilePayload.coverPhotoUrl;
      delete profilePayload.aboutImageUrl;
      await fetchApiAuth("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...profilePayload,
          socials,
          typingRoles,
          stats,
        }),
      });
      notify("Profile saved successfully.");
      navigate("/profile");
    } catch (err) {
      const validation = parseValidationErrors(err);
      if (Object.keys(validation.fieldErrors).length > 0) {
        setValidationErrors(validation.fieldErrors);
        setError(
          validation.message ||
            "Please fix the highlighted fields before saving.",
        );
      } else {
        setError(err.message || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading profile..." />}
      {!loading && saving && (
        <LoadingOverlay message="Saving profile changes..." />
      )}
      <PageHeader>
        <div>
          <h1>{isEditMode ? "Edit Profile" : "Profile Overview"}</h1>
          <p>
            Manage your main introduction, hero image, social links, roles, and
            portfolio stats.
          </p>
        </div>
        <div className="admin-header-actions">
          {isEditMode ? (
            <Link className="secondary-button" to="/profile">
              Back to profile
            </Link>
          ) : (
            <>
              <Link className="secondary-button" to="/profile/history">
                History
              </Link>
              <Link className="admin-link-button" to="/profile/edit">
                Edit profile
              </Link>
            </>
          )}
        </div>
      </PageHeader>

      {error && <ErrorState message={error} />}

      {!isEditMode && !loading && (
        <article className="admin-login-card admin-detail-card admin-profile-card">
          {profile.coverPhotoUrl && (
            <div className="admin-profile-hero">
              <img
                src={profile.coverPhotoUrl}
                alt="Hero cover"
                loading="lazy"
              />
              <div className="admin-profile-hero-overlay">
                <div>
                  <p className="admin-profile-tag">Profile Overview</p>
                  <h2>{profile.name || "Profile name not set"}</h2>
                  <p className="admin-profile-title">
                    {profile.designation || "Designation not set"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="admin-profile-grid">
            <div className="admin-profile-summary">
              <div className="admin-profile-summary-row">
                <span className="admin-profile-label">Location</span>
                <span>{profile.location || "Not specified"}</span>
              </div>
              <div className="admin-profile-summary-row">
                <span className="admin-profile-label">Email</span>
                <span>{profile.email || "Not specified"}</span>
              </div>
              <div className="admin-profile-summary-row">
                <span className="admin-profile-label">Phone</span>
                <span>{profile.phone || "Not specified"}</span>
              </div>
            </div>

            <div className="admin-profile-actions-panel">
              <div className="admin-profile-stats">
                <h3>Portfolio stats</h3>
                <div className="project-card-meta admin-profile-stat-list">
                  {stats.length > 0 ? (
                    stats.map((stat, index) => (
                      <span
                        className="admin-chip"
                        key={`${stat.label}-${index}`}
                      >
                        <strong>{stat.value}</strong> {stat.label}
                      </span>
                    ))
                  ) : (
                    <p className="admin-muted-text">No stats defined yet.</p>
                  )}
                </div>
              </div>

              <div className="admin-profile-socials">
                <h3>Social links</h3>
                <div className="project-card-meta admin-profile-social-list">
                  {socials.length > 0 ? (
                    socials.map((social, index) => (
                      <a
                        className="admin-chip admin-chip-secondary"
                        key={`${social.label}-${index}`}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {social.label}
                      </a>
                    ))
                  ) : (
                    <p className="admin-muted-text">No social links yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-profile-about admin-profile-section">
            <h3>About</h3>
            {profile.aboutImageUrl && (
              <div className="admin-upload-preview">
                <img
                  src={profile.aboutImageUrl}
                  alt="About section"
                  loading="lazy"
                />
              </div>
            )}
            <p>{profile.about || "No about content added."}</p>
          </div>

          <div className="admin-profile-section">
            <h3>Typing Roles</h3>
            <div className="admin-profile-role-list">
              {typingRoles.filter(Boolean).length > 0 ? (
                typingRoles.filter(Boolean).map((role, index) => (
                  <span className="admin-chip" key={`role-${index}`}>
                    {role}
                  </span>
                ))
              ) : (
                <p className="admin-muted-text">No roles added.</p>
              )}
            </div>
          </div>
        </article>
      )}

      {isEditMode && (
        <div className="admin-login-card admin-form-card admin-profile-edit-card">
          {!loading && (
            <form
              onSubmit={handleSubmit}
              className="admin-form admin-profile-form"
            >
              <div className="admin-form-header">
                <div>
                  <p className="admin-profile-form-tag">Profile settings</p>
                  <h2>Edit profile details</h2>
                  <p className="admin-form-description">
                    Keep your introduction and contact information up to date.
                  </p>
                </div>
                <button
                  type="submit"
                  className="primary-button admin-form-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>

              <div className="admin-profile-form-grid">
                <section className="admin-profile-section-card">
                  <h3>Identity & images</h3>
                  <FormField>
                    Name
                    <input
                      type="text"
                      value={profile.name}
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
                    Designation
                    <input
                      type="text"
                      value={profile.designation}
                      onChange={handleFieldChange("designation")}
                      required
                    />
                    {validationErrors.designation && (
                      <span className="admin-field-error">
                        {validationErrors.designation}
                      </span>
                    )}
                  </FormField>
                  <ImageUploadField
                    label="Main hero image"
                    folder="hero"
                    valueUrl={profile.coverPhotoUrl}
                    previewAlt="Main hero image preview"
                    onUploaded={(media) =>
                      setProfile((current) => ({
                        ...current,
                        cover_photo_media_id: media.id,
                        coverPhotoUrl: media.url,
                      }))
                    }
                  />
                  <ImageUploadField
                    label="About section image"
                    folder="profile"
                    valueUrl={profile.aboutImageUrl}
                    previewAlt="About section image preview"
                    onUploaded={(media) =>
                      setProfile((current) => ({
                        ...current,
                        about_image_media_id: media.id,
                        aboutImageUrl: media.url,
                      }))
                    }
                  />
                </section>

                <section className="admin-profile-section-card">
                  <h3>Contact details</h3>
                  <FormField>
                    Email
                    <input
                      type="email"
                      value={profile.email}
                      onChange={handleFieldChange("email")}
                    />
                    {validationErrors.email && (
                      <span className="admin-field-error">
                        {validationErrors.email}
                      </span>
                    )}
                  </FormField>
                  <FormField>
                    Phone
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={handleFieldChange("phone")}
                    />
                    {validationErrors.phone && (
                      <span className="admin-field-error">
                        {validationErrors.phone}
                      </span>
                    )}
                  </FormField>
                  <FormField>
                    Location
                    <input
                      type="text"
                      value={profile.location}
                      onChange={handleFieldChange("location")}
                    />
                    {validationErrors.location && (
                      <span className="admin-field-error">
                        {validationErrors.location}
                      </span>
                    )}
                  </FormField>
                </section>
              </div>

              <section className="admin-profile-section-card admin-profile-section-card-full">
                <h3>About content</h3>
                <FormField>
                  About
                  <textarea
                    rows="6"
                    value={profile.about}
                    onChange={handleFieldChange("about")}
                  />
                  {validationErrors.about && (
                    <span className="admin-field-error">
                      {validationErrors.about}
                    </span>
                  )}
                </FormField>
              </section>

              <section className="admin-profile-section-card admin-profile-section-card-full">
                <div className="admin-array-header admin-array-header-spaced">
                  <div>
                    <h3>Typing roles</h3>
                    <p className="admin-form-description">
                      Add the role titles shown in your hero section.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addTypingRole}
                  >
                    Add Role
                  </button>
                </div>
                {typingRoles.length === 0 ? (
                  <p className="admin-muted-text">No hero roles defined yet.</p>
                ) : (
                  <div className="admin-array-grid">
                    {typingRoles.map((role, index) => (
                      <div
                        key={`role-${index}`}
                        className="admin-array-item admin-array-item-grid"
                      >
                        <input
                          type="text"
                          value={role}
                          onChange={handleTypingRoleChange(index)}
                          placeholder={`Role ${index + 1}`}
                          aria-label={`Hero role ${index + 1}`}
                          required
                        />
                        <button
                          type="button"
                          className="secondary-button secondary-button-sm"
                          onClick={() => removeTypingRole(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-profile-section-card admin-profile-section-card-full">
                <div className="admin-array-header admin-array-header-spaced">
                  <div>
                    <h3>Social links</h3>
                    <p className="admin-form-description">
                      Add social channels for your portfolio profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addSocialLink}
                  >
                    Add Social Link
                  </button>
                </div>
                {socials.length === 0 ? (
                  <p className="admin-muted-text">
                    No social links defined yet.
                  </p>
                ) : (
                  <div className="admin-array-grid admin-array-grid-columns-2">
                    {socials.map((social, index) => (
                      <div
                        key={`social-${index}`}
                        className="admin-array-item admin-array-item-grid"
                      >
                        <input
                          type="text"
                          value={social.label}
                          onChange={handleListChange(
                            setSocials,
                            index,
                            "label",
                          )}
                          placeholder="Label"
                          aria-label="Label"
                          required
                        />
                        <input
                          type="text"
                          value={social.icon}
                          onChange={handleListChange(setSocials, index, "icon")}
                          placeholder="Icon class"
                          aria-label="Social icon class"
                        />
                        <input
                          type="url"
                          value={social.url}
                          onChange={handleListChange(setSocials, index, "url")}
                          placeholder="URL"
                          aria-label="Social URL"
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          value={
                            social.display_order ??
                            social.displayOrder ??
                            index + 1
                          }
                          onChange={handleListChange(
                            setSocials,
                            index,
                            "display_order",
                          )}
                          aria-label={`Social link ${index + 1} display order`}
                        />
                        <button
                          type="button"
                          className="secondary-button secondary-button-sm"
                          onClick={() => removeSocialLink(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-profile-section-card admin-profile-section-card-full">
                <div className="admin-array-header admin-array-header-spaced">
                  <div>
                    <h3>Stats</h3>
                    <p className="admin-form-description">
                      Highlight your achievements with portfolio stats.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addStat}
                  >
                    Add Stat
                  </button>
                </div>
                {stats.length === 0 ? (
                  <p className="admin-muted-text">No stats defined yet.</p>
                ) : (
                  <div className="admin-array-grid admin-array-grid-columns-2">
                    {stats.map((stat, index) => (
                      <div
                        key={`stat-${index}`}
                        className="admin-array-item admin-array-item-grid"
                      >
                        <input
                          type="text"
                          value={stat.label}
                          onChange={handleListChange(setStats, index, "label")}
                          placeholder="Label"
                          aria-label="Label"
                          required
                        />
                        <input
                          type="text"
                          value={stat.value}
                          onChange={handleListChange(setStats, index, "value")}
                          placeholder="Value"
                          aria-label="Statistic value"
                          required
                        />
                        <input
                          type="number"
                          min="1"
                          value={
                            stat.display_order ?? stat.displayOrder ?? index + 1
                          }
                          onChange={handleListChange(
                            setStats,
                            index,
                            "display_order",
                          )}
                          aria-label={`Portfolio stat ${index + 1} display order`}
                        />
                        <button
                          type="button"
                          className="secondary-button secondary-button-sm"
                          onClick={() => removeStat(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="admin-form-actions-row">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
                {validationErrors &&
                  Object.keys(validationErrors).length > 0 && (
                    <span className="admin-form-note">
                      Please fix the highlighted fields before saving.
                    </span>
                  )}
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

export default AdminProfile;
