import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo-02.jpg";
import AuthPopup from "./AuthPopup";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";

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

  // Check for authentication on component mount and listen for changes
  const checkAuthState = () => {
    // Check for backend auth
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Check for Firebase auth
    const firebaseToken = localStorage.getItem("firebaseToken");
    const firebaseUserData = localStorage.getItem("firebaseUser");

    if (token && userData) {
      // Backend user exists - prioritize this as it has the most complete data
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else if (firebaseToken && firebaseUserData) {
      // Firebase user exists (even if backend sync failed)
      const parsedFirebaseUser = JSON.parse(firebaseUserData);
      
      // Try to get name from backend user data first (if it exists)
      let userName = null;
      if (userData) {
        try {
          const parsedBackendUser = JSON.parse(userData);
          userName = parsedBackendUser.name;
        } catch (e) {
          // Ignore parse error
        }
      }
      
      // Fallback to Firebase displayName, but never use phone number as name
      if (!userName) {
        userName = parsedFirebaseUser.displayName || null;
      }
      
      setUser({
        name: userName || "User",
        phone: parsedFirebaseUser.phoneNumber?.replace("+91", "") || "",
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthState();

    // Listen for storage changes (when login happens in another tab or after AuthPopup updates localStorage)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user" || e.key === "firebaseToken" || e.key === "firebaseUser") {
        checkAuthState();
      }
    };

    // Listen for custom event dispatched after successful login
    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
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
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error("Firebase sign out error:", error);
    }

    // Clear all auth data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("firebaseUser");

    // Update state
    setUser(null);
    setIsAuthenticated(false);

    // Redirect to home
    navigate("/");
  };

  // Function to handle blog navigation
  const handleBlogClick = (e) => {
    e.preventDefault();
    navigate("/blogs");
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
            // Silently continue to next endpoint
          }
        }

        // If all endpoints failed
        if (!response) {
          // Fallback to mock data from your file

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

        const data = await response.json();

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
    // Check auth state after successful login
    checkAuthState();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/"); // Redirect to home page after verification
  };

  // Click-away functionality and keyboard navigation
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

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        if (desktopServicesDropdownOpen) {
          setDesktopServicesDropdownOpen(false);
        }
        if (mobileServicesDropdownOpen) {
          setMobileServicesDropdownOpen(false);
        }
        if (menuOpen) {
          setMenuOpen(false);
        }
      }
    };

    // Add event listeners
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [desktopServicesDropdownOpen, mobileServicesDropdownOpen, menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="InstaTax.ai" className="navbar-logo-img" />
          </Link>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={menuOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleMenu();
            }
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

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
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleDesktopServicesDropdown();
                } else if (e.key === "Escape" && desktopServicesDropdownOpen) {
                  setDesktopServicesDropdownOpen(false);
                }
              }}
              aria-expanded={desktopServicesDropdownOpen}
              aria-haspopup="true"
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

          <Link
            to="/payment"
            className={location.pathname === "/payment" ? "active" : ""}
          >
            Payment
          </Link>
          <Link
            to="/about-us"
            className={location.pathname === "/about-us" ? "active" : ""}
          >
            About
          </Link>
          <Link
            to="/contact-us"
            className={location.pathname === "/contact-us" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </div>

        {/* User Authentication */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {user?.name || "User"}</span>
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
          <button
            className="mobile-dropdown-title"
            onClick={toggleMobileServicesDropdown}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMobileServicesDropdown();
              } else if (e.key === "Escape" && mobileServicesDropdownOpen) {
                setMobileServicesDropdownOpen(false);
              }
            }}
            aria-expanded={mobileServicesDropdownOpen}
            aria-haspopup="true"
          >
            Services{" "}
            <span
              className={`dropdown-arrow ${
                mobileServicesDropdownOpen ? "open" : ""
              }`}
            >
              ▼
            </span>
          </button>
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

        <Link
          to="/payment"
          className={location.pathname === "/payment" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Payment
        </Link>
        <Link
          to="/about-us"
          className={location.pathname === "/about-us" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          About
        </Link>
        <Link
          to="/contact-us"
          className={location.pathname === "/contact-us" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Contact
        </Link>
        {isAuthenticated ? (
          <>
            <div className="mobile-user-info" style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span style={{ color: "#333", fontWeight: "500" }}>
                Welcome, {user?.name || "User"}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
                setMenuOpen(false);
              }}
              style={{ 
                background: "none", 
                border: "none", 
                color: "inherit", 
                font: "inherit", 
                cursor: "pointer",
                padding: "10px 0",
                width: "100%",
                textAlign: "left"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setPopupOpen(true);
              setMenuOpen(false);
            }}
            style={{ 
              background: "none", 
              border: "none", 
              color: "inherit", 
              font: "inherit", 
              cursor: "pointer",
              padding: "10px 0",
              width: "100%",
              textAlign: "left"
            }}
          >
            Login / Sign Up
          </button>
        )}
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
