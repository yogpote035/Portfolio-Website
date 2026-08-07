import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchApiAuth, getAccessToken, clearAuthTokens } from '../utils/authClient.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id: routeContactId } = useParams();

  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login');
      return;
    }

    loadContacts();
  }, [navigate]);

  async function loadContacts() {
    setLoading(true);
    setError(null);

    try {
      const contactsData = await fetchApiAuth('/api/admin/contacts?page=1&limit=50');
      setContacts(Array.isArray(contactsData) ? contactsData : contactsData?.data || []);
    } catch (err) {
      const message = err.message || 'Failed to load contacts';
      setError(message);
      if (message.toLowerCase().includes('unauthor') || message.toLowerCase().includes('authentication')) {
        clearAuthTokens();
        navigate('/login');
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
        method: 'PUT',
        body: JSON.stringify({
          status: updates.status ?? contact.status,
          is_starred: updates.is_starred ?? contact.is_starred,
        }),
      });
      await loadContacts();
    } catch (err) {
      setError(err.message || 'Failed to update contact');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Delete this contact message?')) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
      });
      await loadContacts();
    } catch (err) {
      setError(err.message || 'Failed to delete contact');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedContact = useMemo(() => {
    if (!routeContactId) return null;
    return contacts.find((contact) => String(contact.id) === String(routeContactId)) || null;
  }, [contacts, routeContactId]);

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading contact messages..." />}
      {!loading && actionLoading && <LoadingOverlay message="Updating contact message..." />}
      <div className="admin-dashboard-header">
        <div>
          <h1>{routeContactId ? 'Contact Details' : 'Contact Messages'}</h1>
          <p>View, star, archive, mark read, and delete incoming portfolio messages.</p>
        </div>
        <div className="admin-header-actions">
          {routeContactId ? (
            <Link className="secondary-button" to="/contacts">
              Back to contacts
            </Link>
          ) : null}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

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
                onClick={() => updateContact(selectedContact, { status: selectedContact.status === 'read' ? 'unread' : 'read' })}
              >
                Mark {selectedContact.status === 'read' ? 'unread' : 'read'}
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={actionLoading}
                onClick={() => updateContact(selectedContact, { is_starred: !selectedContact.is_starred })}
              >
                {selectedContact.is_starred ? 'Unstar' : 'Star'}
              </button>
            </div>
          </div>
          <div className="admin-detail-grid">
            <div>
              <h3>Subject</h3>
              <p>{selectedContact.subject || 'No subject'}</p>
            </div>
            <div>
              <h3>Status</h3>
              <p>{selectedContact.status || 'unread'} {selectedContact.is_starred ? '- Starred' : ''}</p>
            </div>
          </div>
          <div>
            <h3>Message</h3>
            <p>{selectedContact.message}</p>
          </div>
          <button type="button" className="secondary-button" disabled={actionLoading} onClick={() => deleteContact(selectedContact.id)}>
            Delete
          </button>
        </article>
      )}

      {!routeContactId && (
      <div className="admin-dashboard-grid admin-list-grid" style={{ marginTop: '2rem' }}>
        {!loading && (contacts.length === 0 ? (
          <p>No contact messages yet.</p>
        ) : (
          contacts.map((contact) => (
            <article key={contact.id} className="dashboard-card admin-list-card">
              <h2>{contact.name}</h2>
              <p>{contact.email}</p>
              {contact.company && <p>{contact.company}</p>}
              <p>Subject: {contact.subject}</p>
              <p>Status: {contact.status}</p>
              <p>Starred: {contact.is_starred ? 'Yes' : 'No'}</p>
              <p>{contact.message}</p>
              <div className="admin-actions">
                <Link className="admin-link" to={`/contacts/${contact.id}`}>
                  View
                </Link>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={actionLoading}
                  onClick={() => updateContact(contact, { status: contact.status === 'read' ? 'unread' : 'read' })}
                >
                  Mark {contact.status === 'read' ? 'unread' : 'read'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={actionLoading}
                  onClick={() => updateContact(contact, { is_starred: !contact.is_starred })}
                >
                  {contact.is_starred ? 'Unstar' : 'Star'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={actionLoading}
                  onClick={() => deleteContact(contact.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))))}
      </div>
      )}
    </section>
  );
}

export default AdminContacts;
