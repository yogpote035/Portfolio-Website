import {
  PageHeader,
  ErrorState,
  EmptyState,
  DataTable,
  StatusBadge,
  formatDate,
  useConfirm,
  useToast,
} from "../components/ui.jsx";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchApiAuth,
  getAccessToken,
  clearAuthTokens,
} from "../utils/authClient.js";
import LoadingOverlay from "../components/LoadingOverlay.jsx";

function AdminContacts() {
  const notify = useToast();
  const confirm = useConfirm();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id: routeContactId } = useParams();

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    loadContacts();
  }, [navigate]);

  async function loadContacts() {
    setLoading(true);
    setError(null);

    try {
      const contactsData = await fetchApiAuth(
        "/api/admin/contacts?page=1&limit=50",
      );
      setContacts(
        Array.isArray(contactsData) ? contactsData : contactsData?.data || [],
      );
    } catch (err) {
      const message = err.message || "Failed to load contacts";
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

  const updateContact = async (contact, updates) => {
    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/contacts/${contact.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: updates.status ?? contact.status,
          is_starred: updates.is_starred ?? contact.is_starred,
        }),
      });
      notify("Contact saved successfully.");
      await loadContacts();
    } catch (err) {
      setError(err.message || "Failed to update contact");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteContact = async (contactId) => {
    if (!(await confirm("Delete this contact message?"))) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/contacts/${contactId}`, {
        method: "DELETE",
      });
      notify("Contact deleted successfully.");
      await loadContacts();
    } catch (err) {
      setError(err.message || "Failed to delete contact");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedContact = useMemo(() => {
    if (!routeContactId) return null;
    return (
      contacts.find(
        (contact) => String(contact.id) === String(routeContactId),
      ) || null
    );
  }, [contacts, routeContactId]);

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading contact messages..." />}
      {!loading && actionLoading && (
        <LoadingOverlay message="Updating contact message..." />
      )}
      <PageHeader>
        <div>
          <h1>{routeContactId ? "Contact Details" : "Contact Messages"}</h1>
          <p>
            View, star, archive, mark read, and delete incoming portfolio
            messages.
          </p>
        </div>
        <div className="admin-header-actions">
          {routeContactId ? (
            <Link className="secondary-button" to="/contacts">
              Back to contacts
            </Link>
          ) : null}
        </div>
      </PageHeader>
      {!loading && !error && routeContactId && !selectedContact && (
        <EmptyState
          title="Content not found"
          description="This entry may have been removed or is not in the loaded results."
          to="/contacts"
          action="Back to contacts"
        />
      )}

      {error && <ErrorState message={error} onRetry={loadContacts} />}

      {routeContactId && selectedContact && (
        <article className="admin-login-card admin-detail-card">
          <div className="admin-detail-header">
            <div>
              <h2>{selectedContact.name}</h2>
              <p>{selectedContact.email}</p>
              {selectedContact.phone && <p>{selectedContact.phone}</p>}
              {selectedContact.company && <p>{selectedContact.company}</p>}
            </div>
            <div className="admin-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={actionLoading}
                onClick={() =>
                  updateContact(selectedContact, {
                    status:
                      selectedContact.status === "read" ? "unread" : "read",
                  })
                }
              >
                Mark {selectedContact.status === "read" ? "unread" : "read"}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={actionLoading}
                onClick={() =>
                  updateContact(selectedContact, {
                    is_starred: !selectedContact.is_starred,
                  })
                }
              >
                {selectedContact.is_starred ? "Unstar" : "Star"}
              </button>
            </div>
          </div>
          <div className="admin-detail-grid">
            <div>
              <h3>Subject</h3>
              <p>{selectedContact.subject || "No subject"}</p>
            </div>
            <div>
              <h3>Received</h3>
              <p>{formatDate(selectedContact.created_at)}</p>
              <h3>Status</h3>
              <p>
                {selectedContact.status || "unread"}{" "}
                {selectedContact.is_starred ? "- Starred" : ""}
              </p>
            </div>
          </div>
          <div>
            <h3>Message</h3>
            <p>{selectedContact.message}</p>
          </div>
          <button
            type="button"
            className="secondary-button danger-button"
            disabled={actionLoading}
            onClick={() => deleteContact(selectedContact.id)}
          >
            Delete
          </button>
        </article>
      )}

      {!routeContactId && (
        <DataTable
          loading={loading}
          label="Inbox"
          rows={contacts}
          rowClassName={(c) => (c.status === "unread" ? "cms-unread" : "")}
          empty={
            <EmptyState
              title="Your inbox is clear"
              description="New messages from your portfolio will appear here."
            />
          }
          columns={[
            {
              key: "name",
              label: "Sender",
              render: (c) => (
                <Link className="cms-table-identity" to={`/contacts/${c.id}`}>
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.email}</small>
                  </span>
                </Link>
              ),
            },
            {
              key: "subject",
              label: "Message",
              search: (c) => c.subject + " " + c.message,
              render: (c) => (
                <Link to={`/contacts/${c.id}`}>
                  <strong>{c.subject || "No subject"}</strong>
                  <span className="cms-message-preview">{c.message}</span>
                </Link>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (c) => (
                <StatusBadge
                  tone={c.status === "unread" ? "primary" : "neutral"}
                >
                  {c.status || "unread"}
                </StatusBadge>
              ),
            },
            {
              key: "created_at",
              label: "Received",
              render: (c) => formatDate(c.created_at),
            },
            {
              key: "actions",
              label: "Actions",
              render: (c) => (
                <div className="cms-table-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={actionLoading}
                    onClick={() =>
                      updateContact(c, { is_starred: !c.is_starred })
                    }
                    aria-label={`${c.is_starred ? "Unstar" : "Star"} message from ${c.name}`}
                    title={c.is_starred ? "Unstar" : "Star"}
                  >
                    {c.is_starred ? "★" : "☆"}
                  </button>
                  <details>
                    <summary aria-label="Message actions">More</summary>
                    <div>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actionLoading}
                        onClick={() =>
                          updateContact(c, {
                            status: c.status === "read" ? "unread" : "read",
                          })
                        }
                      >
                        Mark {c.status === "read" ? "unread" : "read"}
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actionLoading}
                        onClick={() => updateContact(c, { status: "archived" })}
                      >
                        Archive
                      </button>
                      <button
                        type="button"
                        className="secondary-button danger-button"
                        disabled={actionLoading}
                        onClick={() => deleteContact(c.id)}
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

export default AdminContacts;
