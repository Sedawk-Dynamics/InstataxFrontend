// src/components/QuoteForm.jsx
import React, { useState, useEffect } from "react";
import cityData from "../../city.json";
import "./Hero.css";

const QuoteForm = () => {
  const BASE_URL = "https://backend.instatax.ai";

  // State for form data
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

  // State for handling UI states
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch states from city.json on component mount
  useEffect(() => {
    // Get all states from the city.json data
    setStates(Object.keys(cityData));

    // Fetch services from API
    fetchServices();
  }, []);

  // Update cities when state changes
  useEffect(() => {
    if (formData.state) {
      setCities(cityData[formData.state] || []);
      setFormData((prev) => ({ ...prev, city: "" })); // Reset city when state changes
    } else {
      setCities([]);
    }
  }, [formData.state]);

  // Fetch services from API
//   const fetchServices = async () => {
//     try {
//       const response = await fetch(`${baseUrl}/services?fields[0]=name`);
//       if (!response.ok) throw new Error("Failed to fetch services");

//       const data = await response.json();
//       // Assuming the API returns an array of service objects with a name property
//       setServices(data.data || []);
//     } catch (error) {
//       console.error("Error fetching services:", error);
//       setNotification({
//         show: true,
//         message: "Failed to load services. Please refresh the page.",
//         type: "error",
//       });
//     }
//   };
const fetchServices = async () => {
  try {
    console.log(
      "Fetching services from:",
      `${BASE_URL}/services?fields[0]=name`
    );
    const response = await fetch(`${BASE_URL}/services?fields[0]=name`);

    // Log raw response for debugging
    console.log("Raw response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Response data:", responseData);

    // Check data structure
    if (responseData && responseData.data && Array.isArray(responseData.data)) {
      console.log("Services array:", responseData.data);
      setServices(responseData.data);
    } else {
      console.error("Unexpected API response format:", responseData);
      setServices([]);
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    setServices([]);
  }
};
// Call the function to test it
fetchServices();
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

     try {
       console.log("Submitting form to:", `${BASE_URL}/web-enquiries`);

       // Log form data being sent
       const submitData = {
         name: `${formData.prefix} ${formData.fullName}`,
         email: formData.email,
         phone: formData.phone,
         state: formData.state,
         city: formData.city,
         service: formData.service,
         whatsappUpdates: formData.whatsappUpdates,
       };

       console.log("Form data being submitted:", submitData);

       const response = await fetch(`${BASE_URL}/web-enquiries`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify(submitData),
       });
 console.log("Submission response status:", response.status);
       if (!response.ok) throw new Error("Failed to submit form");

       // Reset form after successful submission
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

       setNotification({
         show: true,
         message: "Your quote request has been submitted successfully!",
         type: "success",
       });

       // Hide notification after 5 seconds
       setTimeout(() => {
         setNotification({ show: false, message: "", type: "" });
       }, 5000);
     } catch (error) {
       console.error("Error submitting form:", error);
       setNotification({
         show: true,
         message: "Failed to submit your request. Please try again.",
         type: "error",
       });
     } finally {
       setIsSubmitting(false);
     }
  };

  // Prefix options
  const prefixOptions = ["Mr", "Ms", "Mrs"];

  return (
    <div
      className="quote-form"
      style={{ backgroundColor: "#EDEFF2", borderRadius: "35px" }}
    >
      <h2>Get Quote Instantly in a Minute!</h2>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <select
            name="prefix"
            value={formData.prefix}
            onChange={handleChange}
            className="prefix-input"
            required
          >
            <option value="" disabled>
              Prefix
            </option>
            {prefixOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
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
         {services && services.length > 0 ? (
  services.map((service) => {
    console.log("Rendering service:", service);
    return (
      <option key={service.id} value={service.name}>
        {service.name}
      </option>
    );
  })
) : (
  <option value="" disabled>
    Loading services... ({services.length} services found)
  </option>
)}
        </select>

        <div className="form-toggle">
          <label className="toggle">
            <input
              type="checkbox"
              name="whatsappUpdates"
              checked={formData.whatsappUpdates}
              onChange={handleChange}
            />
            <span className="slider round"></span>
          </label>
          <span>Get updates through Whatsapp</span>
        </div>

        <button type="submit" className="quote-btn" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Get Quote Now"}
        </button>
      </form>
    </div>
  );
};

export default QuoteForm;
