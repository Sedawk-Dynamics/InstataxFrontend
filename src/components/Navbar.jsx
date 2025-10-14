import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo-02.jpg";
import AuthPopup from "./AuthPopup";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Adding Dynamic categories from API
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Reset mobile dropdown when menu is closed
    if (menuOpen) {
      setMobileServicesDropdownOpen(false);
    }
  };

  // Custom logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/"); // Redirect to home
  };

  // Function to handle blog navigation
  const handleBlogClick = (e) => {
    e.preventDefault();
    window.location.href = "https://blogs.instatax.ai/";
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try multiple API endpoint patterns
        const baseUrl = "https://backend.instatax.ai";
        const endpoints = [
          "/categories?populate=*", // Original endpoint
          // Try with /api prefix
          "/api/categories?populate=*",
          "/api/categories", // Simplified endpoint
          "/categories", // Basic endpoint
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
                // If you have auth headers, add them here
                // 'Authorization': 'Bearer YOUR_TOKEN'
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
          // Fallback to mock data from your file
          console.log("All endpoints failed. Using sample data from file");

          // This is the sample data from your paste.txt
          const mockData = {
            data: [
              {
                id: 1,
                documentId: "rfrdwj2y6i9nr6baq5kr3yln",
                name: " Business",
                slug: "start_business",
                order: 1,
                isActive: true,
              },
              {
                id: 2,
                documentId: "at7wq3rkjxmznmigbif1sh3s",
                name: "Protect Business",
                slug: "category",
                order: 3,
                isActive: true,
              },
              {
                id: 3,
                documentId: "rk357w69ra98d5f7fop1j77c",
                name: "Manage Business",
                slug: "manage_business",
                order: 2,
                isActive: true,
              },
              {
                id: 4,
                documentId: "surdei9t59mnszrkgjqledn7",
                name: "Grow Business",
                slug: "grow_business",
                order: 4,
                isActive: true,
              },
            ],
          };

          // Sort categories by their order property
          const sortedCategories = [...mockData.data].sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );

          setCategories(sortedCategories);
          setLoading(false);
          return;
        }

        console.log(`Successful endpoint: ${baseUrl}${successEndpoint}`);
        const data = await response.json();
        console.log("API Response:", data);

        if (data && data.data && Array.isArray(data.data)) {
          // Sort categories by their order property if it exists
          const sortedCategories = [...data.data]
            .filter((cat) => cat.isActive) // Only include active categories
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          setCategories(sortedCategories);
        } else {
          console.warn("Unexpected API response format:", data);
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message || "Failed to load categories");

        // Fallback to hardcoded categories in case of error
        const hardcodedCategories = [
          { id: 1, name: "Start Business", slug: "start_business" },
          { id: 2, name: "Manage Business", slug: "manage_business" },
          { id: 3, name: "Protect Business", slug: "protect_business" },
          { id: 4, name: "Grow Business", slug: "grow_business" },
        ];

        setCategories(hardcodedCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Separate states for desktop and mobile dropdowns
  const [desktopServicesDropdownOpen, setDesktopServicesDropdownOpen] =
    useState(false);
  const [mobileServicesDropdownOpen, setMobileServicesDropdownOpen] =
    useState(false);

  // Refs for click-away functionality
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const toggleDesktopServicesDropdown = () => {
    setDesktopServicesDropdownOpen(!desktopServicesDropdownOpen);
  };

  const toggleMobileServicesDropdown = () => {
    setMobileServicesDropdownOpen(!mobileServicesDropdownOpen);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  const handleVerifySuccess = () => {
    navigate("/"); // Redirect to home page after verification
  };

  // Click-away functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle desktop dropdown click-away
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target) &&
        desktopServicesDropdownOpen
      ) {
        setDesktopServicesDropdownOpen(false);
      }

      // Handle mobile dropdown click-away
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target) &&
        mobileServicesDropdownOpen
      ) {
        setMobileServicesDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopServicesDropdownOpen, mobileServicesDropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="InstaTax.ai" className="navbar-logo-img" />
          </Link>
        </div>

        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="navbar-menu">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Home
          </Link>
          <div className="dropdown" ref={desktopDropdownRef}>
            <Link
              to="#"
              className={
                location.pathname.includes("/services") ? "active" : ""
              }
              onClick={(e) => {
                e.preventDefault();
                toggleDesktopServicesDropdown();
              }}
            >
              Services <span className="dropdown-arrow">▼</span>
            </Link>
            {desktopServicesDropdownOpen && (
              <div className="dropdown-content">
                {loading && <p>Loading categories...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && categories.length === 0 && (
                  <p>No categories available</p>
                )}

                {!loading &&
                  !error &&
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/services/${category.slug || category.documentId}`}
                      onClick={() => {
                        setMenuOpen(false);
                        setDesktopServicesDropdownOpen(false);
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Changed from target="_blank" to regular link */}
          <a
            href="https://blogs.instatax.ai/"
            onClick={handleBlogClick}
            className={location.pathname === "/blogs" ? "active" : ""}
          >
            Blog
          </a>

          <Link
            to="/about-us"
            className={location.pathname === "/about-us" ? "active" : ""}
          >
            About Us
          </Link>
          <Link
            to="/payment"
            className={location.pathname === "/payment" ? "active" : ""}
          >
            Payment
          </Link>
        </div>

        {/* User Authentication */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {user?.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="user-btn" onClick={() => setPopupOpen(true)}>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
        {/* Services in mobile menu */}
        <div className="mobile-dropdown" ref={mobileDropdownRef}>
          <div
            className="mobile-dropdown-title"
            onClick={toggleMobileServicesDropdown}
          >
            Services{" "}
            <span
              className={`dropdown-arrow ${
                mobileServicesDropdownOpen ? "open" : ""
              }`}
            >
              ▼
            </span>
          </div>
          {mobileServicesDropdownOpen && (
            <div className="mobile-dropdown-content">
              {loading ? (
                <p>Loading categories...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/services/${category.slug || category.documentId}`}
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileServicesDropdownOpen(false);
                    }}
                  >
                    {category.name}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Changed to use <a> with onClick handler in mobile menu too */}
        <a
          href="https://blogs.instatax.ai/"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "https://blogs.instatax.ai/";
            setMenuOpen(false);
          }}
          className={location.pathname === "/blogs" ? "active" : ""}
        >
          Blog
        </a>

        <Link
          to="/about-us"
          className={location.pathname === "/about-us" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          About Us
        </Link>
        <Link
          to="/payment"
          className={location.pathname === "/payment" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Payment
        </Link>
      </div>

      {/* Keep only one AuthPopup component */}
      <AuthPopup
        isOpen={popupOpen}
        onClose={closePopup}
        onVerifySuccess={handleVerifySuccess}
      />
    </nav>
  );
};

export default Navbar;
