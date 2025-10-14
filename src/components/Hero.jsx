// src/components/Hero.jsx
import React, { useState, useEffect } from "react";
import "./Hero.css";
import statesCitiesData from "../../city.json"; // Adjust the path to your JSON file

const Hero = () => {
  // States for form data
  const [formData, setFormData] = useState({
    prefix: "",
    fullName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    service: "",
    whatsappUpdates: false,
  });

  // States for API data and UI control
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load states from JSON file on component mount
  useEffect(() => {
    // Extract state names from the JSON
    setStates(Object.keys(statesCitiesData));

    // Fetch services from API
    fetchServices();
  }, []);

  // Update cities when state changes
  useEffect(() => {
    if (formData.state) {
      setCities(statesCitiesData[formData.state] || []);
      setFormData((prev) => ({ ...prev, city: "" })); // Reset city when state changes
    } else {
      setCities([]);
    }
  }, [formData.state]);

  // Fetch services from API
  const fetchServices = async () => {
    try {
      const baseUrl = "https://backend.instatax.ai";
      const response = await fetch(`${baseUrl}/api/services?fields[0]=name`);

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        setServices([]);
        return;
      }

      const data = await response.json();
      console.log("Categories data:", data.data);

      // Since data.data is the array of categories
      setServices(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setServices([]);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const baseUrl = "https://backend.instatax.ai";

      // Log the service ID being used
      console.log("Selected service ID:", formData.service);

      // Format data according to Strapi's expected structure
      const submitData = {
        data: {
          name: `${formData.prefix} ${formData.fullName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          state: formData.state,
          city: formData.city,
          // Strapi v4 connect format
          service: {
            connect: [formData.service],
          },
        },
      };

      console.log("Submitting data:", submitData);

      const response = await fetch(`${baseUrl}/api/web-enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        // Success handling
        setMessage({
          text: "Your quote request has been submitted successfully! Our Team Will reach Out to you Shortly!",
          type: "success",
        });
        // Reset form
        setFormData({
          prefix: "",
          fullName: "",
          email: "",
          phone: "",
          state: "",
          city: "",
          service: "",
          whatsappUpdates: false,
        });
      } else {
        setMessage({
          text: `Error: ${
            responseData.error?.message || "Something went wrong"
          }`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage({
        text: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="quote-form">
          <h2>Get Quote Instantly in a Minute!</h2>

          {message.text && (
            <div className={`form-message ${message.type}`}>{message.text}</div>
          )}

          {/* <form onSubmit={handleSubmit}> */}
          <form onSubmit={handleSubmit} className="form-inner-padding">
            <div className="form-row">
              <select
                name="prefix"
                value={formData.prefix}
                onChange={handleChange}
                className="prefix-input"
                required
              >
                <option value="" disabled>
                  Mr
                </option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
              </select>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="fullname-input"
                required
              />
            </div>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-mail ID"
              required
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
            />

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select State
              </option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              disabled={!formData.state}
            >
              <option value="" disabled>
                Select City
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select Service
              </option>
              {services.map((category) => (
                <option key={category.documentId} value={category.documentId}>
                  {category.attributes?.name || category.name}
                </option>
              ))}
            </select>

            <button type="submit" className="quote-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Get Quote Now"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
