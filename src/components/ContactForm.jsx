import { useState } from 'react';
import SectionTitle from './SectionTitle.jsx';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

function ContactForm() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('Thanks for reaching out. I will connect with you soon!');
    setFormData(initialForm);
  };

  return (
    <section className="contact" id="contact">
      <form onSubmit={handleSubmit} data-reveal>
        <SectionTitle accent="Developer">Contact</SectionTitle>
        <div className="input-box">
          <input
            aria-label="Full name"
            name="name"
            onChange={updateField}
            placeholder="Full Name"
            required
            type="text"
            value={formData.name}
          />
          <input
            aria-label="Email"
            name="email"
            onChange={updateField}
            placeholder="Email"
            required
            type="email"
            value={formData.email}
          />
        </div>

        <div className="input-box">
          <input
            aria-label="Mobile number"
            className="removeUpDownNumberInput"
            name="phone"
            onChange={updateField}
            placeholder="Mobile Number (optional)"
            type="number"
            value={formData.phone}
          />
          <input
            aria-label="Email subject"
            name="subject"
            onChange={updateField}
            placeholder="Email Subject"
            required
            type="text"
            value={formData.subject}
          />
        </div>

        <textarea
          aria-label="Message"
          name="message"
          onChange={updateField}
          placeholder="Please Enter Your Message"
          required
          rows="10"
          value={formData.message}
        />
        <input className="btn" type="submit" value="Send Message" />
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}

export default ContactForm;
