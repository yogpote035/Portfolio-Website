import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
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
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Sending message...');

    try {
      await emailjs.sendForm(
        'service_6ct269l',
        'template_m8q7uro',
        formRef.current,
        '6RsfewvnSG-k3-pUj',
      );

      setStatus('Message sent successfully!');
      setFormData(initialForm);
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <form ref={formRef} onSubmit={handleSubmit} data-reveal>
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
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Sending message...' : 'Send Message'}
        </button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}

export default ContactForm;
