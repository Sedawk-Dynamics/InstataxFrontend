
import React, { useState } from "react";
import "./ServiceDetail.css";

const ServiceDetail = ({ title, subtitle, price, illustration }) => {
  const [formData, setFormData] = useState({
    prefix: "",
    fullName: "",
    email: "",
    mobile: "",
    city: "",
    whatsappUpdates: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleToggle = () => {
    setFormData({
      ...formData,
      whatsappUpdates: !formData.whatsappUpdates,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Quote request submitted:", formData);
    // Here you would typically send this data to your backend
    alert("Quote request submitted successfully!");
  };

  return (
    <div className="service-detail-page">
      <div className="service-detail-container">
        <div className="quote-form-container">
          <div className="quote-form">
            <h2>Get Quote Instantly in a Minute!</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group prefix-group">
                  <input
                    type="text"
                    placeholder="Prefix"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group fullname-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email ID"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="toggle-group">
                <div
                  className={`toggle-switch ${
                    formData.whatsappUpdates ? "active" : ""
                  }`}
                  onClick={handleToggle}
                >
                  <div className="toggle-button"></div>
                </div>
                <label>Get updates through Whatsapp</label>
              </div>

              <button type="submit" className="quote-button">
                Get Quote Now
              </button>
            </form>
          </div>
        </div>

        <div className="service-detail-content">
          <div className="service-detail-info">
            <h1>{title}</h1>
            <p className="service-subtitle">{subtitle}</p>
            <p className="service-price">{price}</p>
          </div>

          <div className="service-detail-illustration">
            <img src={illustration} alt={title} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
