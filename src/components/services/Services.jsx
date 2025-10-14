// src/components/Services.jsx
import React, { useState, useEffect } from "react";
import "./Services.css";
import serviceImage from "../../assets/Services11.png";
import axios from "axios";

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Define baseUrl at component level so it's accessible throughout
  const baseUrl = "https://backend.instatax.ai";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Updated URL with /api prefix which is standard for Strapi v4
        const endpoint = "/api/categories?populate=icon&sort=order&filters[isActive][$eq]=true";
        const url = baseUrl + endpoint;
        
        console.log("Fetching from:", url); // Debug log
        
        const response = await axios.get(url);
        console.log("API response:", response.data); // Debug log
        
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        } else {
          throw new Error("Invalid response format");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error details:", err); // More detailed error logging
        setError(`Failed to fetch categories: ${err.message}`);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fallback data in case API fails
  const fallbackCategories = [
    { id: 1, name: "Business Registration", slug: "start_business" },
    { id: 2, name: "Tax Filing & Advisory", slug: "category" },
    { id: 3, name: "Accounting Services", slug: "manage_business" },
    { id: 4, name: "Compliance & Legal Support", slug: "grow_business" },
    { id: 5, name: "Certification & Licenses", slug: "certificate-licenses" }
  ];

  // Use fallback data if API fails
  const displayCategories = categories.length > 0 ? categories : (error ? fallbackCategories : []);

  return (
    <section className="services">
      <div className="services-container">
        <div className="services-content">
          {/* Left Section: Title, Paragraph, Services */}
          <div className="services-text">
            <div className="services-header">
              <h2>Our Services</h2>
              <p>
                Starting a business is exciting, but navigating legal
                complexities can be overwhelming. We simplify the process with
                expert guidance and seamless execution, so you can focus on what
                matters—growing your startup.
              </p>
            </div>

            <div className="service-categories">
              {loading && <p>Loading services...</p>}
              
              {displayCategories.map((category) => (
                <div className="service-category" key={category.id}>
                  <div className={`category-icon ${category.slug}-icon`}>
                    {/* If API fails, use emoji fallbacks */}
                    {!error && category.icon ? (
                      <img 
                        src={`${category.icon.url.startsWith('http') ? '' : baseUrl}${category.icon.url}`} 
                        alt={category.name} 
                        style={{ width: '24px', height: '24px' }}
                      />
                    ) : (
                      getIconFallback(category.slug)
                    )}
                  </div>
                  <span>{category.name}</span>
                </div>
              ))}
              
              {error && (
                <p className="error-message" style={{ fontSize: '0.8rem', color: '#ff6b6b', marginTop: '10px' }}>
                  {error} - Using fallback data
                </p>
              )}
            </div>
          </div>

          {/* Right Section: Image */}
          <div className="services-image">
            <img src={serviceImage} alt="Services illustration" />
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="chat-widget">
        <button className="chat-btn">
          <span>Chat with Us!</span>
        </button>
      </div>
    </section>
  );
};

// Fallback icons for when API fails
const getIconFallback = (slug) => {
  const icons = {
    'start_business': '⚙️', 
    'category': '🔒',
    'manage_business': '📈',
    'grow_business': '📊',
    'certificate-licenses': '📃',
    'default': '📋'
  };
  
  return icons[slug] || icons.default;
};

export default Services;