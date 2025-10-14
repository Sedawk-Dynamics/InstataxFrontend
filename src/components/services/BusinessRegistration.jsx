import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ServicePage.css";

const BusinessRegistration = () => {
  // Get categoryId from URL parameters directly
  const { categoryId } = useParams();
  console.log("Component loaded with categoryId from URL:", categoryId);

  const [formData, setFormData] = useState({
    prefix: "",
    fullName: "",
    email: "",
    phone: "",
    service: "",
    whatsappUpdates: false,
  });

  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear services when categoryId changes
  useEffect(() => {
    console.log("CategoryId changed, clearing services");
    setServices([]);
    setLoading(true);
  }, [categoryId]);

  // Fetch services when currentCategory changes
  useEffect(() => {
    if (currentCategory?.documentId) {
      console.log(
        "Current category changed, fetching services for:",
        currentCategory.documentId
      );
      fetchServices(currentCategory.documentId);
    }
  }, [currentCategory]);

  // Fetch the category details based on categoryId
  useEffect(() => {
    console.log("useEffect triggered with categoryId:", categoryId);
    const fetchCategoryDetails = async () => {
      if (!categoryId) {
        console.log("No categoryId provided, using default");
        setCurrentCategory({ name: "Start your Business" });
        setLoading(false);
        return;
      }

      try {
        const baseUrl = "https://backend.instatax.ai";
        const endpoints = [
          "/categories?populate=*",
          "/api/categories?populate=*",
          "/api/categories",
          "/categories",
        ];

        let response = null;

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
              console.log(`Successfully fetched from: ${baseUrl}${endpoint}`);
              break;
            }
          } catch (endpointErr) {
            console.log(`Endpoint ${endpoint} failed:`, endpointErr.message);
          }
        }

        if (!response) {
          console.log("All API endpoints failed, using fallback categories");
          // Fallback to predefined categories if API fails
          const fallbackCategories = [
            {
              slug: "start_business",
              documentId: "rfrdwj2y6i9nr6baq5kr3yln",
              name: "Start your Business",
            },
            {
              slug: "protect_business",
              documentId: "at7wq3rkjxmznmigbif1sh3s",
              name: "Protect your Business",
            },
            {
              slug: "manage_business",
              documentId: "rk357w69ra98d5f7fop1j77c",
              name: "Manage your Business",
            },
            {
              slug: "grow_business",
              documentId: "surdei9t59mnszrkgjqledn7",
              name: "Grow your Business",
            },
          ];

          console.log(
            "Looking for match in fallback categories for:",
            categoryId
          );
          const matchedCategory = fallbackCategories.find(
            (cat) => cat.slug === categoryId || cat.documentId === categoryId
          );

          if (matchedCategory) {
            console.log("Found matching fallback category:", matchedCategory);
            setCurrentCategory(matchedCategory);
          } else {
            console.log(
              "No matching category found in fallbacks, using default"
            );
            setCurrentCategory({ name: "Start your Business" });
          }

          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Categories API Response:", data);

        if (data?.data?.length) {
          // Find the category that matches the categoryId
          console.log("Looking for category match with ID:", categoryId);
          console.log(
            "Available categories:",
            data.data.map((cat) => ({
              slug: cat.slug,
              id: cat.id,
              documentId: cat.documentId,
              name: cat.name,
            }))
          );

          const matchedCategory = data.data.find(
            (cat) => cat.slug === categoryId || cat.documentId === categoryId
          );

          if (matchedCategory) {
            console.log("Found matching category:", matchedCategory);
            // Format the heading based on category name
            const categoryName = matchedCategory.name;
            const headingText = formatHeading(categoryName);

            const category = {
              ...matchedCategory,
              formattedName: headingText,
            };

            setCurrentCategory(category);
          } else {
            console.log(
              "No matching category found in API response, using default"
            );
            setCurrentCategory({ name: "Start your Business" });
          }
        } else {
          console.log("No categories returned from API, using default");
          setCurrentCategory({ name: "Start your Business" });
        }
      } catch (err) {
        console.error("Error fetching category details:", err);
        setCurrentCategory({ name: "Start your Business" }); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [categoryId]);

  // Fetch services from API filtered by category
  const fetchServices = async (catDocId) => {
    if (!catDocId) {
      console.log("No category document ID provided for service filtering");
      setServices([]);
      return;
    }

    console.log(`Fetching services for category document ID: ${catDocId}`);

    try {
      const baseUrl = "https://backend.instatax.ai";

      // Try different URL structures to fetch services
      const endpoints = [
        `/api/services?filters[category][documentId][$eq]=${catDocId}`,
        `/api/services?filters[category][$eq]=${catDocId}`,
        `/categories/${catDocId}?populate=services`,
      ];

      let servicesData = [];

      // First, try the API endpoints
      for (const endpoint of endpoints) {
        try {
          const url = `${baseUrl}${endpoint}`;
          console.log("Trying service endpoint:", url);

          const response = await fetch(url, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            console.log(
              `Endpoint ${endpoint} returned status ${response.status}`
            );
            continue;
          }

          const data = await response.json();
          console.log(`Services API response for ${endpoint}:`, data);

          // Handle different response structures
          if (data?.data?.length) {
            servicesData = data.data;
            break;
          } else if (data?.data?.services?.data?.length) {
            servicesData = data.data.services.data;
            break;
          } else if (data?.services?.length) {
            servicesData = data.services;
            break;
          }
        } catch (endpointErr) {
          console.log(
            `Service endpoint ${endpoint} failed:`,
            endpointErr.message
          );
        }
      }

      // As a fallback, provide hardcoded services for known categories
      if (servicesData.length === 0) {
        console.log("Using hardcoded services for category:", catDocId);

        // Hardcoded services based on category
        const hardcodedServices = {
          // Start Business category
          rfrdwj2y6i9nr6baq5kr3yln: [
            {
              id: 32,
              documentId: "x9sguvl7fwk32is1j30gwqe",
              name: "Private Limited Company Registration",
              short_description: "Start your Pvt Ltd in 15 days.",
            },
            {
              id: 34,
              documentId: "mc3x3dnp07dmt75wxo335g7c",
              name: "One Person Company",
              short_description: "Start your Pvt Ltd in 15 days.",
            },
            {
              id: 36,
              documentId: "lyoo9fcz2aq2j9nfl78qnkt0",
              name: "Startup Incorporation",
              short_description: "Start your Pvt Ltd in 15 days.",
            },
          ],
          // Protect Business category example (add real data when available)
          at7wq3rkjxmznmigbif1sh3s: [
            {
              id: 40,
              documentId: "trademark1",
              name: "Trademark Registration",
              short_description: "Protect your brand in 3-6 months.",
            },
            {
              id: 41,
              documentId: "copyright1",
              name: "Copyright Registration",
              short_description: "Secure your creative works.",
            },
            {
              id: 42,
              documentId: "patent1",
              name: "Patent Filing",
              short_description: "Protect your inventions.",
            },
          ],
          // Add other categories as needed
        };

        if (hardcodedServices[catDocId]) {
          servicesData = hardcodedServices[catDocId];
        }
      }

      console.log(
        `Found ${servicesData.length} services for category:`,
        servicesData
      );
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  // Helper function to format category name into heading
  const formatHeading = (categoryName) => {
    if (!categoryName) return "Start your Business";

    // For categories like "Start Business", "Protect Business", etc.
    if (categoryName.includes("Business")) {
      // Extract the action verb
      const verb = categoryName.split(" ")[0];
      return `${verb} your Business`;
    }

    return categoryName;
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

  // Get description text based on category
  const getCategoryDescription = () => {
    if (!currentCategory) return "";

    const categoryName = currentCategory.name || "";

    if (categoryName.includes("Start")) {
      return "From private limited companies to LLPs and sole proprietorships, we help you choose the right structure and handle all legal formalities.";
    } else if (categoryName.includes("Protect")) {
      return "Safeguard your intellectual property and business assets with our comprehensive protection services including trademark, copyright, and patent registration.";
    } else if (categoryName.includes("Manage")) {
      return "Streamline your operations with our business management services including accounting, compliance, and regulatory filings.";
    } else if (categoryName.includes("Grow")) {
      return "Expand your business horizons with our growth services including marketing strategies, funding assistance, and business consulting.";
    }

    return "We provide comprehensive business services tailored to your specific needs.";
  };

  if (loading) {
    return <div className="service-page">Loading...</div>;
  }

  return (
    <div className="service-page">
      <div className="service-container">
        <div className="service-illustration">{/* Image placeholder */}</div>

        <div className="service-info">
          <h1>
            {currentCategory?.formattedName ||
              currentCategory?.name ||
              "Start your Business"}
          </h1>
          <p>{getCategoryDescription()}</p>
        </div>

        <div className="quote-form-container">
          <div className="quote-form">
            <h2>Get Quote Instantly in a Minute!</h2>

            {message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}

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
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Service
                </option>
                {services.length > 0 ? (
                  services.map((service) => (
                    <option
                      key={service.id || service.documentId}
                      value={service.id || service.documentId}
                    >
                      {service.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    {loading
                      ? "Loading services..."
                      : "No services available for this category"}
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
                Get updates through Whatsapp
              </div>

              <button
                type="submit"
                className="quote-btn-service"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Get Quote Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegistration;
