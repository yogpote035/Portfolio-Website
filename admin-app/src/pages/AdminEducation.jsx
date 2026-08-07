import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchApiAuth, getAccessToken, clearAuthTokens } from '../utils/authClient.js';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import { parseValidationErrors } from '../utils/errorHelpers.js';

const initialForm = {
  degree: '',
  college: '',
  university: '',
  cgpa: '',
  percentage: '',
  start_date: '',
  end_date: '',
  description: '',
  coursework: '',
  display_order: 1,
};

function formatDateInput(value) {
  return value ? String(value).slice(0, 10) : '';
}

function listToText(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(', ') : String(value);
  } catch {
    return String(value);
  }
}

function textToList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminEducation() {
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
  const routeMode = location.pathname.endsWith('/new')
    ? 'create'
    : location.pathname.endsWith('/edit')
      ? 'edit'
      : routeEducationId
        ? 'view'
        : 'list';

  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login');
      return;
    }

    loadEducation();
  }, [navigate]);

  const selectedEducation = useMemo(() => {
    if (!routeEducationId) return null;
    return educationEntries.find((entry) => String(entry.id) === String(routeEducationId)) || null;
  }, [educationEntries, routeEducationId]);

  useEffect(() => {
    if (routeMode === 'edit' && selectedEducation) {
      startEditingEducation(selectedEducation, false);
    }
  }, [routeMode, selectedEducation]);

  useEffect(() => {
    if (routeMode === 'create') {
      setEditingEducationId(null);
      setForm(initialForm);
    }
  }, [routeMode]);

  async function loadEducation() {
    setLoading(true);
    setError(null);

    try {
      const educationData = await fetchApiAuth('/api/admin/education');
      setEducationEntries(educationData || []);
    } catch (err) {
      const message = err.message || 'Failed to load education';
      setError(message);
      if (message.toLowerCase().includes('unauthor') || message.toLowerCase().includes('authentication')) {
        clearAuthTokens();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleFieldChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'display_order' ? Number(event.target.value) : event.target.value,
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
      const path = editingEducationId ? `/api/admin/education/${editingEducationId}` : '/api/admin/education';
      await fetchApiAuth(path, {
        method: editingEducationId ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...form,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          coursework: textToList(form.coursework),
        }),
      });
      setForm(initialForm);
      setEditingEducationId(null);
      await loadEducation();
      navigate('/education');
    } catch (err) {
      const validation = parseValidationErrors(err);
      if (Object.keys(validation.fieldErrors).length > 0) {
        setValidationErrors(validation.fieldErrors);
        setError(validation.message || (editingEducationId ? 'Failed to update education entry' : 'Failed to create education entry'));
      } else {
        setError(err.message || (editingEducationId ? 'Failed to update education entry' : 'Failed to create education entry'));
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditingEducation = (entry, shouldScroll = true) => {
    setEditingEducationId(entry.id);
    setForm({
      degree: entry.degree || '',
      college: entry.college || '',
      university: entry.university || '',
      cgpa: entry.cgpa || '',
      percentage: entry.percentage || '',
      start_date: formatDateInput(entry.start_date),
      end_date: formatDateInput(entry.end_date),
      description: entry.description || '',
      coursework: listToText(entry.coursework),
      display_order: entry.display_order ?? 1,
    });

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEdit = () => {
    setEditingEducationId(null);
    setForm(initialForm);
    navigate('/education');
  };

  const deleteEducation = async (entryId) => {
    if (!window.confirm('Delete this education entry?')) return;

    setActionLoading(true);
    setError(null);

    try {
      await fetchApiAuth(`/api/admin/education/${entryId}`, { method: 'DELETE' });
      await loadEducation();
    } catch (err) {
      setError(err.message || 'Failed to delete education');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="admin-dashboard-section">
      {loading && <LoadingOverlay message="Loading education entries..." />}
      {!loading && saving && <LoadingOverlay message="Saving education changes..." />}
      {!loading && actionLoading && <LoadingOverlay message="Updating education entries..." />}
      <div className="admin-dashboard-header">
        <div>
          <h1>{routeMode === 'create' ? 'Create Education' : routeMode === 'edit' ? 'Edit Education' : routeMode === 'view' ? 'Education Details' : 'Education Management'}</h1>
          <p>Manage degree, college, dates, scores, coursework, description, and display order.</p>
        </div>
        <div className="admin-header-actions">
          {routeMode !== 'list' && (
            <Link className="secondary-button" to="/education">
              Back to education
            </Link>
          )}
          {routeMode === 'list' && (
            <Link className="admin-link-button" to="/education/new">
              New education
            </Link>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {routeMode === 'view' && selectedEducation && (
        <article className="admin-login-card admin-detail-card">
          <div className="admin-detail-header">
            <div>
              <h2>{selectedEducation.degree}</h2>
              <p>{selectedEducation.college}</p>
              <p>{selectedEducation.university || 'University not set'}</p>
              <p>
                {formatDateInput(selectedEducation.start_date) || 'Start'} - {formatDateInput(selectedEducation.end_date) || 'End'}
              </p>
            </div>
            <div className="admin-actions">
              <Link className="secondary-button" to={`/education/${selectedEducation.id}/history`}>
                History
              </Link>
              <Link className="secondary-button" to={`/education/${selectedEducation.id}/edit`}>
                Edit
              </Link>
            </div>
          </div>
          <div className="admin-detail-grid">
            <div>
              <h3>Performance</h3>
              <p>CGPA: {selectedEducation.cgpa || 'Not set'}</p>
              <p>Percentage: {selectedEducation.percentage || 'Not set'}</p>
              <p>Display order: {selectedEducation.display_order ?? 1}</p>
            </div>
            <div>
              <h3>Coursework</h3>
              <p>{listToText(selectedEducation.coursework) || 'No coursework added.'}</p>
            </div>
          </div>
          <div>
            <h3>Description</h3>
            <p>{selectedEducation.description || 'No description added.'}</p>
          </div>
        </article>
      )}

      {(routeMode === 'create' || routeMode === 'edit') && (
        <div className="admin-login-card admin-form-card">
          <form onSubmit={handleSubmit} className="admin-form">
            <label>
              Degree
              <input type="text" value={form.degree} onChange={handleFieldChange('degree')} required />
              {validationErrors.degree && <span className="admin-field-error">{validationErrors.degree}</span>}
            </label>
            <label>
              College
              <input type="text" value={form.college} onChange={handleFieldChange('college')} required />
              {validationErrors.college && <span className="admin-field-error">{validationErrors.college}</span>}
            </label>
            <label>
              University
              <input type="text" value={form.university} onChange={handleFieldChange('university')} />
              {validationErrors.university && <span className="admin-field-error">{validationErrors.university}</span>}
            </label>
            <div className="form-grid-2">
              <label>
                CGPA
                <input type="text" value={form.cgpa} onChange={handleFieldChange('cgpa')} />
              </label>
              <label>
                Percentage
                <input type="text" value={form.percentage} onChange={handleFieldChange('percentage')} />
              </label>
            </div>
            <div className="form-grid-2">
              <label>
                Start date
                <input type="date" value={form.start_date} onChange={handleFieldChange('start_date')} />
              </label>
              <label>
                End date
                <input type="date" value={form.end_date} onChange={handleFieldChange('end_date')} />
              </label>
            </div>
            <label>
              Description
              <textarea rows="3" value={form.description} onChange={handleFieldChange('description')} />
              {validationErrors.description && <span className="admin-field-error">{validationErrors.description}</span>}
            </label>
            <label>
              Coursework
              <textarea rows="2" value={form.coursework} onChange={handleFieldChange('coursework')} placeholder="Comma separated coursework" />
              {validationErrors.coursework && <span className="admin-field-error">{validationErrors.coursework}</span>}
            </label>
            <label>
              Display order
              <input type="number" min="1" value={form.display_order} onChange={handleFieldChange('display_order')} />
              {validationErrors.display_order && <span className="admin-field-error">{validationErrors.display_order}</span>}
            </label>
            <div className="form-actions-row">
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingEducationId ? 'Update education entry' : 'Create education entry'}
              </button>
              {editingEducationId && (
                <button type="button" className="secondary-button" onClick={cancelEdit}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {routeMode === 'list' && (
        <div className="admin-dashboard-grid admin-list-grid" style={{ marginTop: '2rem' }}>
          {!loading && (educationEntries.length === 0 ? (
            <p>No education items found yet.</p>
          ) : (
            educationEntries.map((entry) => (
              <article key={entry.id} className="dashboard-card admin-list-card">
                <h2>{entry.degree}</h2>
                <p>{entry.college}</p>
                <p>{entry.university || ''}</p>
                <p>
                  {formatDateInput(entry.start_date) || 'Start'} - {formatDateInput(entry.end_date) || 'End'}
                </p>
                <p>{entry.description || ''}</p>
                <div className="admin-actions">
                  <Link className="admin-link" to={`/education/${entry.id}`}>
                    View
                  </Link>
                  <Link className="secondary-button" to={`/education/${entry.id}/edit`}>
                    Edit
                  </Link>
                  <button type="button" className="secondary-button" disabled={actionLoading} onClick={() => deleteEducation(entry.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminEducation;
