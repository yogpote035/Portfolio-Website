import { useState } from 'react';
import SectionTitle from './SectionTitle.jsx';
import { apiBase } from '../utils/apiClient.js';
import { parseValidationErrors } from '../utils/errorHelpers.js';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function ContactForm() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setStatus('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required.';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Sending message...');
    setFieldErrors({});

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus('Please complete the required fields marked with * and try again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('Message sent successfully!');
        setFormData(initialForm);
        setFieldErrors({});
      } else {
        const errorBody = await response.json().catch(() => null);
        const error = new Error(errorBody?.message || 'Failed to send message. Please try again.');
        error.errors = errorBody?.errors || null;
        const validation = parseValidationErrors(error);

        setFieldErrors(validation.fieldErrors || {});
        setStatus(validation.message || error.message);
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      const validation = parseValidationErrors(error);
      setFieldErrors(validation.fieldErrors || {});
      setStatus(validation.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <form onSubmit={handleSubmit} className="contact-form" data-reveal>
        <SectionTitle accent="Developer">Contact</SectionTitle>
        <div className="contact-form-grid">
          <div className="contact-input-wrapper">
            <label htmlFor="name">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="name"
              aria-label="Full name"
              name="name"
              onChange={updateField}
              placeholder="Enter your full name"
              required
              type="text"
              value={formData.name}
              className={fieldErrors.name ? 'input-error' : ''}
            />
            {fieldErrors.name && <span className="form-field-error">{fieldErrors.name}</span>}
          </div>

          <div className="contact-input-wrapper">
            <label htmlFor="email">
              Email <span className="required-star">*</span>
            </label>
            <input
              id="email"
              aria-label="Email"
              name="email"
              onChange={updateField}
              placeholder="Enter your email"
              required
              type="email"
              value={formData.email}
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="form-field-error">{fieldErrors.email}</span>}
          </div>

          <div className="contact-input-wrapper">
            <label htmlFor="phone">Mobile Number</label>
            <input
              id="phone"
              aria-label="Mobile number"
              name="phone"
              onChange={updateField}
              placeholder="Mobile Number (optional)"
              type="tel"
              value={formData.phone}
              className={`removeUpDownNumberInput ${fieldErrors.phone ? 'input-error' : ''}`.trim()}
            />
            {fieldErrors.phone && <span className="form-field-error">{fieldErrors.phone}</span>}
          </div>

          <div className="contact-input-wrapper">
            <label htmlFor="subject">
              Subject <span className="required-star">*</span>
            </label>
            <input
              id="subject"
              aria-label="Email subject"
              name="subject"
              onChange={updateField}
              placeholder="Enter a subject"
              required
              type="text"
              value={formData.subject}
              className={fieldErrors.subject ? 'input-error' : ''}
            />
            {fieldErrors.subject && <span className="form-field-error">{fieldErrors.subject}</span>}
          </div>
        </div>

        <div className="contact-input-wrapper contact-message-wrapper">
          <label htmlFor="message">
            Message <span className="required-star">*</span>
          </label>
          <textarea
            id="message"
            aria-label="Message"
            name="message"
            onChange={updateField}
            placeholder="Please enter your message"
            required
            rows="8"
            value={formData.message}
            className={fieldErrors.message ? 'input-error' : ''}
          />
          {fieldErrors.message && <span className="form-field-error">{fieldErrors.message}</span>}
        </div>

        <div className="contact-form-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Sending message...' : 'Send Message'}
          </button>
          {status && <p className="form-status">{status}</p>}
        </div>
      </form>
    </section>
  );
}

export default ContactForm;
