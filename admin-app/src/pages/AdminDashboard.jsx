import { useEffect, useState } from "react";
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import { useNavigate, Link } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay.jsx";
import {
  PageHeader,
  StatCard,
  SectionHeader,
  EmptyState,
  ErrorState,
  Icon,
  formatDate,
} from "../components/ui.jsx";
export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const profileData = await fetchApiAuth("/api/profile");
        setProfile(profileData);
        const dashboardData = await fetchApiAuth("/api/admin/dashboard");
        setData(dashboardData);
        const resumeData = await fetchApiAuth("/api/resume?redirect=false");
        setResumeUrl(resumeData?.url || null);
      } catch (err) {
        const message = err?.message || "Failed to load dashboard";
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
    loadDashboard();
  }, [navigate, attempt]);
  const totals = data?.totals;
  const metrics = [
    ["Projects", "projects", "projects", "Non-archived projects", "/projects"],
    ["Skills", "skills", "skills", "Active skills", "/skills"],
    [
      "Experience",
      "experiences",
      "experience",
      "Career entries",
      "/experience",
    ],
    ["Education", "education", "education", "Education entries", "/education"],
    ["Contacts", "contacts", "contacts", "All messages", "/contacts"],
    [
      "Unread messages",
      "unreadContacts",
      "contacts",
      "Awaiting your attention",
      "/contacts",
    ],
    [
      "Resume downloads",
      "resumeDownloads",
      "resumes",
      "Across all versions",
      "/resumes",
    ],
  ];
  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading dashboard..." />}
      <PageHeader
        title={
          profile?.name
            ? `Welcome back, ${profile.name.split(" ")[0]}`
            : "Your portfolio, at a glance"
        }
        description="A clear view of your content, conversations, and latest updates."
        actions={
          <Link className="admin-link-button" to="/projects/new">
            <Icon name="plus" size={16} />
            New project
          </Link>
        }
      />
      {error && (
        <ErrorState message={error} onRetry={() => setAttempt((a) => a + 1)} />
      )}
      <div className="cms-stat-grid">
        {metrics.map(([label, key, icon, context, to]) => (
          <StatCard
            key={key}
            label={label}
            value={totals?.[key]}
            icon={icon}
            context={context}
            to={to}
          />
        ))}
        <StatCard
          label="Recent activity"
          value={data?.recentActivity?.length}
          icon="activity"
          context="Latest recorded events"
          to="/#recent-activity"
        />
      </div>
      <div className="cms-dashboard-columns">
        <section className="cms-panel" id="recent-activity">
          <SectionHeader
            title="Recent activity"
            description="The latest changes to your portfolio."
          />
          {data?.recentActivity?.length ? (
            <ol className="cms-activity-list">
              {data.recentActivity.map((item) => (
                <li key={item.id}>
                  <span className="cms-activity-icon">
                    <Icon name="activity" size={15} />
                  </span>
                  <div>
                    <strong>
                      {item.description ||
                        item.action?.replaceAll("_", " ") ||
                        "Content updated"}
                    </strong>
                    <p>
                      {[
                        item.entityType,
                        item.entityId ? `#${item.entityId}` : null,
                        item.adminName,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <time dateTime={item.createdAt}>
                      {formatDate(item.createdAt)} ·{" "}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title={data ? "No activity yet" : "Activity unavailable"}
              description={
                data
                  ? "Saved changes will appear here."
                  : "Your activity will appear when the dashboard loads."
              }
            />
          )}
        </section>
        <aside className="cms-dashboard-aside">
          <section className="cms-panel">
            <SectionHeader
              title="Quick actions"
              description="Keep your portfolio up to date."
            />
            <div className="cms-quick-links">
              <Link to="/profile/edit">
                <Icon name="profile" />
                <span>
                  Edit profile<small>Refine your introduction</small>
                </span>
                <Icon name="arrow" size={16} />
              </Link>
              <Link to="/projects/new">
                <Icon name="projects" />
                <span>
                  Add a project<small>Share your latest work</small>
                </span>
                <Icon name="arrow" size={16} />
              </Link>
              <Link to="/resumes">
                <Icon name="resumes" />
                <span>
                  Manage resumes<small>Keep your experience current</small>
                </span>
                <Icon name="arrow" size={16} />
              </Link>
            </div>
            <div className="cms-resume-summary">
              <h3>Active resume</h3>
              <p>
                {resumeUrl
                  ? "Your current resume is available to preview."
                  : "No active resume available."}
              </p>
              {resumeUrl && (
                <a
                  className="admin-link"
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview resume <Icon name="arrow" size={14} />
                </a>
              )}
            </div>
          </section>
          <section className="cms-panel">
            <SectionHeader
              title="Latest messages"
              actions={
                <Link className="admin-link" to="/contacts">
                  View inbox
                </Link>
              }
            />
            {data?.recentContacts?.length ? (
              <div className="cms-quick-links">
                {data.recentContacts.map((contact) => (
                  <Link key={contact.id} to={`/contacts/${contact.id}`}>
                    <Icon name="contacts" />
                    <span>
                      {contact.name}
                      <small>{contact.subject || "No subject"}</small>
                    </span>
                    <Icon name="arrow" size={14} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent messages"
                description="New conversations will appear here."
              />
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
