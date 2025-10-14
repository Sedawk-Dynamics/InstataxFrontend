import React, { useState, useEffect } from "react";
import "./ServiceList.css";
import servicesIllustration from "../../assets/StartBusiness1.png";
import { useNavigate } from "react-router-dom";

const ServiceList = ({ categoryId }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = "https://backend.instatax.ai";
        // Try multiple API endpoint patterns for categories
        const endpoints = [
          "/categories?populate=*",
          "/api/categories?populate=*",
          "/api/categories",
          "/categories",
        ];

        let response = null;
        let successEndpoint = "";

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${baseUrl}${endpoint}`);
            const tempResponse = await fetch(`${baseUrl}${endpoint}`, {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            if (tempResponse.ok) {
              response = tempResponse;
              successEndpoint = endpoint;
              break;
            }
          } catch (endpointErr) {
            console.log(`Endpoint ${endpoint} failed:`, endpointErr.message);
          }
        }

        // If all endpoints failed
        if (!response) {
          console.error("All category endpoints failed");
          setError("Failed to load categories");
          return;
        }

        console.log(`Successful endpoint: ${baseUrl}${successEndpoint}`);
        const data = await response.json();
        console.log("Categories API Response:", data);

        if (data?.data?.length) {
          setCategories(data.data);

          // Find the category that matches the categoryId from URL
          // Check if categoryId matches slug or documentId
          if (categoryId) {
            const matchedCategory = data.data.find(
              (cat) => cat.slug === categoryId || cat.documentId === categoryId
            );

            if (matchedCategory) {
              console.log("Matched category:", matchedCategory);
              setCurrentCategory(matchedCategory);
              setSelectedCategory(matchedCategory.id.toString());
            } else {
              console.warn(`No category found matching: ${categoryId}`);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
      }
    };

    fetchCategories();
  }, [categoryId]);

  // Fetch services when a category is selected
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const baseUrl = "https://backend.instatax.ai";

        // Try different API endpoints for services
        let endpoints = [];

        if (selectedCategory) {
          // If a category is selected
          endpoints = [
            `/api/services?filters[category][id][$eq]=${selectedCategory}`,
            `/services?filters[category][id][$eq]=${selectedCategory}`,
            `/api/categories/${selectedCategory}?populate=services`,
            `/categories/${selectedCategory}?populate=services`,
          ];
        } else {
          // Fetch all services if no category is selected
          endpoints = ["/api/services", "/services"];
        }

        let response = null;
        let successEndpoint = "";
        let isNestedResponse = false;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying services endpoint: ${baseUrl}${endpoint}`);
            const tempResponse = await fetch(`${baseUrl}${endpoint}`, {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });

            if (tempResponse.ok) {
              response = tempResponse;
              successEndpoint = endpoint;
              // Check if this is a nested response (category with services)
              isNestedResponse = endpoint.includes("?populate=services");
              break;
            }
          } catch (endpointErr) {
            console.log(`Endpoint ${endpoint} failed:`, endpointErr.message);
          }
        }

        // If all endpoints failed
        if (!response) {
          // If we have a current category with services, use that instead
          if (currentCategory && currentCategory.services?.length > 0) {
            console.log(
              "Using services from current category:",
              currentCategory.services
            );
            setServices(currentCategory.services);
            setLoading(false);
            return;
          }

          console.error("All service endpoints failed");
          setError("Failed to load services");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Services API Response:", data);

        if (isNestedResponse && data?.data?.attributes?.services?.data) {
          // Handle nested response format (category with services)
          setServices(data.data.attributes.services.data);
        } else if (data?.data) {
          // Handle direct services response
          setServices(data.data);
        } else {
          console.warn("Unexpected API response format:", data);
          setServices([]);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory || !categoryId) {
      fetchServices();
    } else if (currentCategory && currentCategory.services?.length > 0) {
      // If we already have services from the category
      setServices(currentCategory.services);
      setLoading(false);
    }
  }, [selectedCategory, currentCategory, categoryId]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/service-quote/${serviceId}`);
  };

  return (
    <div className="services-page">
      <div className="services-container">
        <div className="services-list">
          <h1>{currentCategory ? ` Services` : "All Services"}</h1>

          {/* Category selector - uncomment if needed */}
          {!categoryId && (
            <div className="category-selector">
              <label htmlFor="category-select">Select Category: </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading && <p>Loading services...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && services.length === 0 && (
            <p>No services available for this category</p>
          )}

          {!loading &&
            !error &&
            services.map((service) => (
              <div
                className="service-card"
                key={service.id}
                onClick={() => handleServiceClick(service.documentId)}
              >
                <div className="service-info">
                  <h2>{service.name}</h2>
                  <p className="service-description">
                    {service.short_description}
                  </p>
                </div>
                <div className="service-arrow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 8 16 12 12 16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
              </div>
            ))}
        </div>

        <div className="services-illustration">
          <img src={servicesIllustration} alt="Services" />
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
