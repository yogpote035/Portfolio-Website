import {
  PageHeader,
  ErrorState,
  EmptyState,
  StatusBadge,
  Icon,
  useConfirm,
  useToast,
} from "../components/ui.jsx";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchApiAuth } from "../utils/authClient.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

const labels = {
  profile: "Profile",
  project: "Project",
  skill: "Skill",
  experience: "Experience",
  education: "Education",
};

function AdminContentHistory({ entityType, backTo }) {
  const notify = useToast();
  const confirm = useConfirm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [entityId, setEntityId] = useState(
    entityType === "profile" ? null : id,
  );
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (entityType !== "profile") {
      setEntityId(id);
      return;
    }
    fetchApiAuth("/api/profile")
      .then((profile) => {
        setEntityId(profile?.id ? String(profile.id) : null);
        if (!profile?.id) setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to resolve profile history.");
        setLoading(false);
      });
  }, [entityType, id]);

  const loadVersions = async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApiAuth(
        `/api/admin/content-versions?entityType=${entityType}&entityId=${entityId}`,
      );
      setVersions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load content history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [entityId, entityType]);

  const restore = async (version) => {
    if (
      !(await confirm(
        `Restore version ${version.versionNumber}? Your current content will be saved as a new version first.`,
      ))
    )
      return;
    setRestoringId(version.id);
    setError(null);
    try {
      await fetchApiAuth(`/api/admin/content-versions/${version.id}/restore`, {
        method: "POST",
      });
      notify("Version restored successfully.");
      navigate(backTo);
    } catch (err) {
      setError(err.message || "Failed to restore this version.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading content history..." />}
      {restoringId && (
        <LoadingOverlay message="Restoring selected version..." />
      )}
      <PageHeader>
        <div>
          <h1>{labels[entityType]} History</h1>
          <p>
            Restore any saved version. The current content is preserved first.
          </p>
        </div>
        <Link className="secondary-button" to={backTo}>
          Back
        </Link>
      </PageHeader>
      {error && <ErrorState message={error} onRetry={loadVersions} />}
      <div className="cms-panel" style={{ marginBottom: 16 }}>
        <h2>Current content</h2>
        <p className="admin-help-text">
          View the live entry from the Back link. Saved snapshots below may
          differ after a restore.
        </p>
      </div>
      {!loading && !entityId && !error && (
        <EmptyState
          title="No profile history available"
          description="Save your profile to begin its version history."
        />
      )}
      <div className="admin-history-list">
        {!loading &&
          entityId &&
          (versions.length === 0 ? (
            <EmptyState
              title="No saved versions yet"
              description="Versions are created whenever content is saved."
            />
          ) : (
            versions.map((version, index) => (
              <article
                className="dashboard-card admin-history-card"
                key={version.id}
              >
                <div>
                  <h2>
                    <Icon name="activity" />
                    Version {version.versionNumber}
                    {index === 0 && (
                      <StatusBadge tone="primary">Latest snapshot</StatusBadge>
                    )}
                  </h2>
                  <p>{version.summary || "Content saved"}</p>
                  <p>
                    {new Date(version.createdAt).toLocaleString()}
                    {version.createdBy ? ` · Admin #${version.createdBy}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={restoringId === version.id}
                  onClick={() => restore(version)}
                >
                  {restoringId === version.id
                    ? "Restoring..."
                    : "Restore this version"}
                </button>
              </article>
            ))
          ))}
      </div>
    </section>
  );
}

export default AdminContentHistory;
