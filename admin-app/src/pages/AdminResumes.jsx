import {
  PageHeader,
  ErrorState,
  EmptyState,
  DataTable,
  StatusBadge,
  Icon,
  formatDate,
  useConfirm,
  useToast,
} from "../components/ui.jsx";
import { useEffect, useMemo, useState } from "react";
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiBase } from "../utils/apiClient.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import DocumentDropZone from "../components/DocumentDropZone.jsx";

function AdminResumes() {
  const notify = useToast();
  const confirm = useConfirm();
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
      navigate("/login");
      return;
    }

    loadResumes();
  }, [navigate]);

  async function loadResumes() {
    setLoading(true);
    try {
      const resumesData = await fetchApiAuth("/api/admin/resumes");
      setResumes(
        Array.isArray(resumesData) ? resumesData : resumesData?.data || [],
      );
    } catch (err) {
      const message = err.message || "Failed to load resumes";
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

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a resume file to upload.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      await fetchApiAuth("/api/admin/resumes", {
        method: "POST",
        body: formData,
      });
      notify("Resume uploaded successfully.");
      setFile(null);
      await loadResumes();
    } catch (err) {
      setError(err.message || "Resume upload failed");
    } finally {
      setUploading(false);
    }
  };

  const setActiveResume = async (resumeId) => {
    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/resumes/${resumeId}/activate`, {
        method: "PUT",
      });
      notify("Resume activated.");
      await loadResumes();
    } catch (err) {
      setError(err.message || "Failed to activate resume");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteResume = async (resumeId) => {
    if (!(await confirm("Delete this resume? This cannot be undone."))) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/resumes/${resumeId}`, {
        method: "DELETE",
      });
      notify("Resume deleted successfully.");
      await loadResumes();
    } catch (err) {
      setError(err.message || "Failed to delete resume");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedResume = useMemo(() => {
    if (!routeResumeId) {
      return null;
    }

    return (
      resumes.find((resume) => String(resume.id) === String(routeResumeId)) ||
      null
    );
  }, [resumes, routeResumeId]);

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading resumes..." />}
      {!loading && uploading && (
        <LoadingOverlay message="Uploading resume..." />
      )}
      {!loading && actionLoading && (
        <LoadingOverlay message="Updating resume..." />
      )}
      <PageHeader>
        <div>
          <h1>{routeResumeId ? "Resume Details" : "Resume Management"}</h1>
          <p>
            Upload, preview, activate, download, and delete portfolio resumes.
          </p>
        </div>
        <div className="admin-header-actions">
          {routeResumeId && (
            <Link className="secondary-button" to="/resumes">
              Back to resumes
            </Link>
          )}
        </div>
      </PageHeader>
      {!loading && !error && routeResumeId && !selectedResume && (
        <EmptyState
          title="Content not found"
          description="This entry may have been removed or is not in the loaded results."
          to="/resumes"
          action="Back to resumes"
        />
      )}

      {error && <ErrorState message={error} onRetry={loadResumes} />}

      {routeResumeId && selectedResume && (
        <article className="admin-login-card admin-detail-card">
          <div className="admin-detail-header">
            <div>
              <h2>
                {selectedResume.original_name || selectedResume.storage_path}
              </h2>
              <p>Status: {selectedResume.is_active ? "Active" : "Inactive"}</p>
              <p>Version: {selectedResume.version ?? "N/A"}</p>
              <p>Downloads: {selectedResume.download_count ?? 0}</p>
              <p>Type: {selectedResume.mime_type || "N/A"}</p>
              <p>
                Size:{" "}
                {selectedResume.file_size
                  ? `${Math.round(selectedResume.file_size / 1024)} KB`
                  : "N/A"}
              </p>
            </div>
            <div className="admin-actions">
              {(selectedResume.preview_url || selectedResume.file_url) && (
                <a
                  className="admin-link-button"
                  href={selectedResume.preview_url || selectedResume.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </a>
              )}
              {!selectedResume.preview_available && (
                <span className="admin-chip">Preview unavailable</span>
              )}
              {!selectedResume.is_active && (
                <button
                  type="button"
                  className="secondary-button"
                  disabled={actionLoading}
                  onClick={() => setActiveResume(selectedResume.id)}
                >
                  Set active
                </button>
              )}
              <button
                type="button"
                className="secondary-button danger-button"
                disabled={actionLoading}
                onClick={() => deleteResume(selectedResume.id)}
              >
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
                <p className="admin-form-description">
                  Add a new resume file for your public portfolio and manage
                  active versions from this dashboard.
                </p>
              </div>
            </div>
            <form
              onSubmit={handleUpload}
              className="admin-form admin-resume-form"
            >
              <DocumentDropZone
                file={file}
                disabled={uploading}
                onFile={(selectedFile) => {
                  setFile(selectedFile);
                  setError(null);
                }}
                onRejected={(message) => setError(message || null)}
              />
              <div className="form-actions-row admin-resume-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload resume"}
                </button>
              </div>
            </form>
          </div>

          <DataTable
            loading={loading}
            label="Resume library"
            rows={resumes}
            rowClassName={(r) => (r.is_active ? "cms-active-resume" : "")}
            empty={
              <EmptyState
                title="No resumes uploaded"
                description="Choose a document above to add your first resume."
              />
            }
            columns={[
              {
                key: "original_name",
                label: "Document",
                render: (r) => (
                  <Link className="cms-table-identity" to={`/resumes/${r.id}`}>
                    <Icon name="resumes" size={24} />
                    <span>
                      <strong>{r.original_name || r.storage_path}</strong>
                      <small>{r.mime_type || "Resume file"}</small>
                    </span>
                  </Link>
                ),
              },
              { key: "version", label: "Version" },
              {
                key: "created_at",
                label: "Uploaded",
                render: (r) => formatDate(r.created_at),
              },
              {
                key: "file_size",
                label: "Size",
                render: (r) =>
                  r.file_size ? `${Math.round(r.file_size / 1024)} KB` : "—",
              },
              {
                key: "is_active",
                label: "Status",
                render: (r) => (
                  <StatusBadge tone={r.is_active ? "success" : "neutral"}>
                    {r.is_active ? "Active" : "Inactive"}
                  </StatusBadge>
                ),
              },
              { key: "download_count", label: "Downloads" },
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="cms-table-actions">
                    {r.preview_url || r.file_url ? (
                      <a
                        className="secondary-button"
                        href={r.preview_url || r.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Preview
                      </a>
                    ) : (
                      <StatusBadge>Preview unavailable</StatusBadge>
                    )}
                    <details>
                      <summary aria-label="Resume actions">More</summary>
                      <div>
                        <Link className="admin-link" to={`/resumes/${r.id}`}>
                          View details
                        </Link>
                        {r.is_active ? (
                          <a
                            className="admin-link"
                            href={`${apiBase}/api/resume`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download active
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={actionLoading}
                            onClick={() => setActiveResume(r.id)}
                          >
                            Set active
                          </button>
                        )}
                        <button
                          type="button"
                          className="secondary-button danger-button"
                          disabled={actionLoading}
                          onClick={() => deleteResume(r.id)}
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
        </>
      )}
    </section>
  );
}

export default AdminResumes;
