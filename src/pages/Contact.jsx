import React, { useState } from "react";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Contact submit", formData);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-container">
          <h1>Get in touch</h1>
          <p>Questions, partnerships, or support — we’re here to help.</p>
        </div>
      </section>

      <section className="contact-content">
        <div className="contact-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" type="text" placeholder="Your name" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" placeholder="Optional" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={6} placeholder="Tell us a bit about what you need" required value={formData.message} onChange={handleChange} />
            </div>
            <button type="submit" className="contact-submit">Send message</button>
            <div className="form-disclaimer">By submitting, you agree to our Privacy Policy.</div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;


