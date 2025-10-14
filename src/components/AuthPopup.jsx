import React, { useState } from "react";
import "./AuthPopup.css";
// import { useNavigate } from "react-router-dom";

const AuthPopup = ({ isOpen, onClose, onVerifySuccess }) => {
  // const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const baseUrl = "https://backend.instatax.ai/api";

  // Login form state
  const [loginForm, setLoginForm] = useState({
    identifier: "", // Email or username
    password: "",
  });

  // Sign up form state
  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    state: "",
    city: "",
  });

  // Form validation states
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value,
    });
    // Clear error when user types
    if (loginErrors[name]) {
      setLoginErrors({
        ...loginErrors,
        [name]: "",
      });
    }
    setErrorMessage("");
  };

  // Handle signup form changes
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm({
      ...signupForm,
      [name]: value,
    });
    // Clear error when user types
    if (signupErrors[name]) {
      setSignupErrors({
        ...signupErrors,
        [name]: "",
      });
    }
    setErrorMessage("");
  };

  // Validate login form
  const validateLoginForm = () => {
    const errors = {};
    if (!loginForm.identifier) {
      errors.identifier = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginForm.identifier)) {
      errors.identifier = "Please enter a valid email";
    }

    if (!loginForm.password) {
      errors.password = "Password is required";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate signup form
  const validateSignupForm = () => {
    const errors = {};

    if (!signupForm.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupForm.email)) {
      errors.email = "Please enter a valid email";
    }

    // Set username to email value to ensure they match
    signupForm.username = signupForm.email;

    if (!signupForm.password) {
      errors.password = "Password is required";
    } else if (signupForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!signupForm.name) {
      errors.name = "Name is required";
    }

    if (!signupForm.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(signupForm.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!signupForm.state) {
      errors.state = "State is required";
    }

    if (!signupForm.city) {
      errors.city = "City is required";
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle login submission
const handleLogin = async (e) => {
  e.preventDefault();
  if (!validateLoginForm()) return;

  setIsLoading(true);
  setErrorMessage("");

  try {
    const response = await fetch(`${baseUrl}/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: loginForm.identifier,
        password: loginForm.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // More specific error message handling
      if (response.status === 400) {
        throw new Error(
          "Invalid credentials. Please check your email and password."
        );
      } else if (response.status === 404) {
        throw new Error("User not found. Please sign up first.");
      } else {
        throw new Error(
          data.error?.message || "Login failed. Please try again."
        );
      }
    }

    // Store JWT and user data
    localStorage.setItem("token", data.jwt);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Update UI and close popup
    setIsLoading(false);
    onClose();

    // Notify success
    alert(`Welcome back, ${data.user.name || data.user.username}!`);

    // Trigger success callback
    if (onVerifySuccess) {
      onVerifySuccess();
    }

    // Force page reload to update navbar state
    window.location.reload();
  } catch (error) {
    setIsLoading(false);
    setErrorMessage(error.message);
    console.error("Login error:", error);
  }
};

  // Handle signup submission
const handleSignup = async (e) => {
  e.preventDefault();
  if (!validateSignupForm()) return;

  setIsLoading(true);
  setErrorMessage("");

  try {
    const payload = {
      username: signupForm.email, // Using email as username to ensure uniqueness
      email: signupForm.email,
      password: signupForm.password,
      name: signupForm.name,
      phone: signupForm.phone,
      state: signupForm.state,
      city: signupForm.city,
    };

    const response = await fetch(`${baseUrl}/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMessage = data?.error?.message || "Registration failed.";

      // Check for existing email error
      if (
        errMessage.toLowerCase().includes("email") ||
        errMessage.toLowerCase().includes("already taken")
      ) {
        throw new Error("This email is already registered. Please login.");
      }
      throw new Error(errMessage);
    }

    localStorage.setItem("token", data.jwt);
    localStorage.setItem("user", JSON.stringify(data.user));
    setIsLoading(false);
    onClose();
    alert("Account created successfully!");

    if (onVerifySuccess) onVerifySuccess();
    window.location.reload();
  } catch (error) {
    setIsLoading(false);
    setErrorMessage(error.message);
    console.error("Signup error:", error);
  }
};


  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <h2>Welcome Back</h2>

            <div className="form-group">
              <input
                type="email"
                name="identifier"
                placeholder="Email"
                value={loginForm.identifier}
                onChange={handleLoginChange}
                disabled={isLoading}
              />
              {loginErrors.identifier && (
                <span className="error-text">{loginErrors.identifier}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={handleLoginChange}
                disabled={isLoading}
              />
              {loginErrors.password && (
                <span className="error-text">{loginErrors.password}</span>
              )}
            </div>

            <button type="submit" className="verify-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <p className="switch-auth">
              Don't have an account?{" "}
              <button
                type="button"
                className="switch-btn"
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignup} className="auth-form">
            <h2>Create an Account</h2>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signupForm.email}
                onChange={handleSignupChange}
                disabled={isLoading}
              />
              {signupErrors.email && (
                <span className="error-text">{signupErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signupForm.password}
                onChange={handleSignupChange}
                disabled={isLoading}
              />
              {signupErrors.password && (
                <span className="error-text">{signupErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={signupForm.name}
                onChange={handleSignupChange}
                disabled={isLoading}
              />
              {signupErrors.name && (
                <span className="error-text">{signupErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={signupForm.phone}
                onChange={handleSignupChange}
                disabled={isLoading}
              />
              {signupErrors.phone && (
                <span className="error-text">{signupErrors.phone}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group half">
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={signupForm.state}
                  onChange={handleSignupChange}
                  disabled={isLoading}
                />
                {signupErrors.state && (
                  <span className="error-text">{signupErrors.state}</span>
                )}
              </div>

              <div className="form-group half">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={signupForm.city}
                  onChange={handleSignupChange}
                  disabled={isLoading}
                />
                {signupErrors.city && (
                  <span className="error-text">{signupErrors.city}</span>
                )}
              </div>
            </div>

            <button type="submit" className="verify-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="switch-auth">
              Already have an account?{" "}
              <button
                type="button"
                className="switch-btn"
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPopup;
