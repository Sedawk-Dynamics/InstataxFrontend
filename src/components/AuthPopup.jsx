import React, { useState, useEffect, useRef } from "react";
import "./AuthPopup.css";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import { FaPhone, FaUser, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

const AuthPopup = ({ isOpen, onClose, onVerifySuccess }) => {
  // const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const baseUrl = "https://backend.instatax.ai/api";

  // Firebase OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef = useRef(null);

  // Login form state - only mobile number
  const [loginForm, setLoginForm] = useState({
    phone: "",
  });

  // Sign up form state - name, phone, email, state, city
  const [signupForm, setSignupForm] = useState({
    name: "",
    phone: "",
    email: "",
    state: "",
    city: "",
  });

  // Form validation states
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});

  // Cleanup recaptcha when component unmounts or popup closes
  useEffect(() => {
    if (!isOpen) {
      setOtpSent(false);
      setOtp("");
      setConfirmationResult(null);
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    };
  }, [isOpen]);

  // Setup reCAPTCHA verifier
  const setupRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
    }
    
    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: (response) => {
        console.log("reCAPTCHA verified");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired");
        setErrorMessage("reCAPTCHA expired. Please try again.");
      },
    });

    return recaptchaVerifierRef.current;
  };

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

  // Handle OTP input change
  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/\D/g, "")); // Only allow digits
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

  // Validate login form - only mobile number
  const validateLoginForm = () => {
    const errors = {};
    if (!loginForm.phone) {
      errors.phone = "Mobile number is required";
    } else if (!/^\d{10}$/.test(loginForm.phone)) {
      errors.phone = "Please enter a valid 10-digit mobile number";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate signup form - name, phone, email, state, city
  const validateSignupForm = () => {
    const errors = {};

    if (!signupForm.name) {
      errors.name = "Name is required";
    }

    if (!signupForm.phone) {
      errors.phone = "Mobile number is required";
    } else if (!/^\d{10}$/.test(signupForm.phone)) {
      errors.phone = "Please enter a valid 10-digit mobile number";
    }

    if (!signupForm.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      errors.email = "Please enter a valid email address";
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

  // Check if user exists in backend
  const checkUserExists = async (phone) => {
    try {
      const phoneNumber = `91${phone}`;
      
      // Try the check-user endpoint first
      try {
        const response = await fetch(`${baseUrl}/mauth/check-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phoneNumber,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.exists === true || data.exists === false ? data.exists : null;
        }
      } catch (endpointError) {
        // If check-user endpoint doesn't exist, try alternative: use login endpoint to check
        console.log("check-user endpoint not available, trying alternative method");
      }

      // Alternative: Try to login (without OTP) to see if user exists
      // This is a fallback if check-user endpoint doesn't exist
      try {
        const loginCheckResponse = await fetch(`${baseUrl}/mauth/check-user-by-phone`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phoneNumber,
          }),
        });

        if (loginCheckResponse.ok) {
          const data = await loginCheckResponse.json();
          return data.exists === true || data.exists === false ? data.exists : null;
        }
      } catch (altError) {
        // Both methods failed
      }

      // If all checks fail, return null to allow proceeding
      return null;
    } catch (error) {
      console.error("Error checking user existence:", error);
      // If check fails, allow proceeding (backend might be down or endpoint doesn't exist)
      return null;
    }
  };

  // Send OTP for login
  const sendLoginOTP = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // First, check if user exists in backend
      const userExists = await checkUserExists(loginForm.phone);
      
      if (userExists === false) {
        // User does not exist, redirect to signup
        setIsLoading(false);
        setErrorMessage("User not found. Please sign up first.");
        setTimeout(() => {
          setActiveTab("signup");
          // Pre-fill phone number in signup form
          setSignupForm(prev => ({ ...prev, phone: loginForm.phone }));
        }, 1500);
        return;
      }

      // User exists, proceed with OTP
      // Setup reCAPTCHA
      const appVerifier = setupRecaptcha();

      // Format phone number with country code (91 for India)
      const phoneNumber = `+91${loginForm.phone}`;

      // Send OTP using Firebase
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Send OTP error:", error);
      
      // Clear recaptcha on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }

      // User-friendly error messages
      if (error.code === "auth/too-many-requests") {
        setErrorMessage("Too many attempts. Please try again later.");
      } else if (error.code === "auth/invalid-phone-number") {
        setErrorMessage("Invalid phone number. Please check and try again.");
      } else {
        setErrorMessage(error.message || "Failed to send OTP. Please try again.");
      }
    }
  };

  // Verify OTP for login
  const verifyLoginOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      setErrorMessage("Please send OTP first");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Get Firebase ID token
      const firebaseToken = await user.getIdToken();
      const firebaseUser = {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
      };

      // Store Firebase token and user data
      localStorage.setItem("firebaseToken", firebaseToken);
      localStorage.setItem("firebaseUser", JSON.stringify(firebaseUser));

      // Store data in backend - Required for login
      try {
        const phoneNumber = `91${loginForm.phone}`;
        const response = await fetch(`${baseUrl}/mauth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${firebaseToken}`, // Send Firebase token
          },
          body: JSON.stringify({
            phone: phoneNumber,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            // Update Firebase user displayName with backend name if available
            if (data.user.name && firebaseUser) {
              firebaseUser.displayName = data.user.name;
              localStorage.setItem("firebaseUser", JSON.stringify(firebaseUser));
            }
          }
        } else {
          // If backend login fails, still allow Firebase auth but show warning
          const errorData = await response.json().catch(() => ({}));
          console.warn("Backend login failed:", errorData);
          setErrorMessage("Login successful, but failed to sync with server. Please try again later.");
        }
      } catch (backendError) {
        console.error("Backend login error:", backendError);
        setErrorMessage("Login successful, but failed to sync with server. Please try again later.");
        // Continue with Firebase auth even if backend fails
      }

      // Update UI and close popup
      setIsLoading(false);
      onClose();

      // Dispatch event to notify Navbar about auth state change
      window.dispatchEvent(new Event("authStateChanged"));

      // Trigger success callback
      if (onVerifySuccess) {
        onVerifySuccess();
      }

      // Force page reload to update navbar state (optional, but keeps it in sync)
      window.location.reload();
    } catch (error) {
      setIsLoading(false);
      console.error("Verify OTP error:", error);
      
      if (error.code === "auth/invalid-verification-code") {
        setErrorMessage("Invalid OTP. Please check and try again.");
      } else if (error.code === "auth/code-expired") {
        setErrorMessage("OTP has expired. Please request a new one.");
        setOtpSent(false);
        setConfirmationResult(null);
      } else {
        setErrorMessage(error.message || "Verification failed. Please try again.");
      }
    }
  };

  // Send OTP for signup
  const sendSignupOTP = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // First, check if user already exists in backend
      const userExists = await checkUserExists(signupForm.phone);
      
      if (userExists === true) {
        // User already exists, redirect to login
        setIsLoading(false);
        setErrorMessage("User already exists. Please login instead.");
        setTimeout(() => {
          setActiveTab("login");
          // Pre-fill phone number in login form
          setLoginForm({ phone: signupForm.phone });
        }, 1500);
        return;
      }

      // User doesn't exist, proceed with signup OTP
      // Setup reCAPTCHA
      const appVerifier = setupRecaptcha();

      // Format phone number with country code (91 for India)
      const phoneNumber = `+91${signupForm.phone}`;

      // Send OTP using Firebase
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Send OTP error:", error);
      
      // Clear recaptcha on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }

      // User-friendly error messages
      if (error.code === "auth/too-many-requests") {
        setErrorMessage("Too many attempts. Please try again later.");
      } else if (error.code === "auth/invalid-phone-number") {
        setErrorMessage("Invalid phone number. Please check and try again.");
      } else {
        setErrorMessage(error.message || "Failed to send OTP. Please try again.");
      }
    }
  };

  // Verify OTP for signup
  const verifySignupOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }

    if (!confirmationResult) {
      setErrorMessage("Please send OTP first");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Get Firebase ID token
      const firebaseToken = await user.getIdToken();
      const firebaseUser = {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: signupForm.name,
      };

      // Store Firebase token and user data
      localStorage.setItem("firebaseToken", firebaseToken);
      localStorage.setItem("firebaseUser", JSON.stringify(firebaseUser));

      // Store data in backend - Required for signup
      try {
        const phoneNumber = `91${signupForm.phone}`;
        const response = await fetch(`${baseUrl}/mauth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${firebaseToken}`, // Send Firebase token
          },
          body: JSON.stringify({
            name: signupForm.name,
            phone: phoneNumber,
            email: signupForm.email,
            state: signupForm.state,
            city: signupForm.city,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem("token", data.token);
          }
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            // Update Firebase user displayName with backend name if available
            if (data.user.name && firebaseUser) {
              firebaseUser.displayName = data.user.name;
              localStorage.setItem("firebaseUser", JSON.stringify(firebaseUser));
            }
          }
        } else {
          const data = await response.json();
          const errMessage = data?.message || data?.error?.message || "Backend registration failed.";
          // Check for existing phone number error
          if (
            errMessage.toLowerCase().includes("phone") ||
            errMessage.toLowerCase().includes("already taken") ||
            errMessage.toLowerCase().includes("already exists")
          ) {
            throw new Error("This mobile number is already registered. Please login.");
          }
          throw new Error(`Failed to register: ${errMessage}`);
        }
      } catch (backendError) {
        console.error("Backend signup error:", backendError);
        // If backend signup fails, show error but Firebase auth succeeded
        if (backendError.message.includes("already registered")) {
          throw backendError;
        }
        // Throw error to prevent signup completion if backend fails
        throw new Error(`Registration failed: ${backendError.message || "Please try again later."}`);
      }

      // Update UI and close popup
      setIsLoading(false);
      onClose();

      // Dispatch event to notify Navbar about auth state change
      window.dispatchEvent(new Event("authStateChanged"));

      if (onVerifySuccess) onVerifySuccess();
      window.location.reload();
    } catch (error) {
      setIsLoading(false);
      console.error("Verify OTP error:", error);
      
      if (error.code === "auth/invalid-verification-code") {
        setErrorMessage("Invalid OTP. Please check and try again.");
      } else if (error.code === "auth/code-expired") {
        setErrorMessage("OTP has expired. Please request a new one.");
        setOtpSent(false);
        setConfirmationResult(null);
      } else {
        setErrorMessage(error.message || "Verification failed. Please try again.");
      }
    }
  };

  // Reset OTP step (go back to phone number input)
  const resetOtpStep = () => {
    setOtpSent(false);
    setOtp("");
    setConfirmationResult(null);
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  };


  // Focus trap and keyboard navigation
  const popupRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleTab = (e) => {
      if (!popupRef.current) return;

      const focusableElements = popupRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);

    // Focus first element when popup opens
    setTimeout(() => {
      const firstElement = popupRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstElement?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-popup-title">
      <div className="popup-container" onClick={(e) => e.stopPropagation()} ref={popupRef}>
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close authentication popup"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClose();
            }
          }}
        >
          &times;
        </button>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
            role="tab"
            aria-selected={activeTab === "login"}
            aria-controls="login-panel"
            id="login-tab"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTab("login");
              }
            }}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
            role="tab"
            aria-selected={activeTab === "signup"}
            aria-controls="signup-panel"
            id="signup-tab"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTab("signup");
              }
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Login Form */}
        {activeTab === "login" && (
          <form onSubmit={otpSent ? verifyLoginOTP : sendLoginOTP} className="auth-form" role="tabpanel" id="login-panel" aria-labelledby="login-tab">
            <h2 id="auth-popup-title">Welcome Back</h2>

            {!otpSent ? (
              <>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Mobile Number (10 digits)"
                      value={loginForm.phone}
                      onChange={handleLoginChange}
                      disabled={isLoading}
                      maxLength="10"
                    />
                  </div>
                  {loginErrors.phone && (
                    <span className="error-text">{loginErrors.phone}</span>
                  )}
                </div>

                <button type="submit" className="verify-btn" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>

                {/* Hidden reCAPTCHA container */}
                <div id="recaptcha-container"></div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isLoading}
                    maxLength="6"
                  />
                </div>

                <button type="submit" className="verify-btn" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="switch-btn"
                  onClick={resetOtpStep}
                  disabled={isLoading}
                  style={{ marginTop: "10px", display: "block", width: "100%" }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isLoading) {
                      e.preventDefault();
                      resetOtpStep();
                    }
                  }}
                >
                  Change Phone Number
                </button>
              </>
            )}

            <p className="switch-auth">
              Don't have an account?{" "}
              <button
                type="button"
                className="switch-btn"
                onClick={() => {
                  resetOtpStep();
                  setActiveTab("signup");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resetOtpStep();
                    setActiveTab("signup");
                  }
                }}
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === "signup" && (
          <form onSubmit={otpSent ? verifySignupOTP : sendSignupOTP} className="auth-form" role="tabpanel" id="signup-panel" aria-labelledby="signup-tab">
            <h2 id="auth-popup-title">Create an Account</h2>

            {!otpSent ? (
              <>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={signupForm.name}
                      onChange={handleSignupChange}
                      disabled={isLoading}
                    />
                  </div>
                  {signupErrors.name && (
                    <span className="error-text">{signupErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-with-icon">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Mobile Number (10 digits)"
                      value={signupForm.phone}
                      onChange={handleSignupChange}
                      disabled={isLoading}
                      maxLength="10"
                    />
                  </div>
                  {signupErrors.phone && (
                    <span className="error-text">{signupErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      disabled={isLoading}
                    />
                  </div>
                  {signupErrors.email && (
                    <span className="error-text">{signupErrors.email}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <div className="input-with-icon">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={signupForm.state}
                        onChange={handleSignupChange}
                        disabled={isLoading}
                      />
                    </div>
                    {signupErrors.state && (
                      <span className="error-text">{signupErrors.state}</span>
                    )}
                  </div>

                  <div className="form-group half">
                    <div className="input-with-icon">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={signupForm.city}
                        onChange={handleSignupChange}
                        disabled={isLoading}
                      />
                    </div>
                    {signupErrors.city && (
                      <span className="error-text">{signupErrors.city}</span>
                    )}
                  </div>
                </div>

                <button type="submit" className="verify-btn" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>

                {/* Hidden reCAPTCHA container */}
                <div id="recaptcha-container"></div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isLoading}
                    maxLength="6"
                  />
                </div>

                <button type="submit" className="verify-btn" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="switch-btn"
                  onClick={resetOtpStep}
                  disabled={isLoading}
                  style={{ marginTop: "10px", display: "block", width: "100%" }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isLoading) {
                      e.preventDefault();
                      resetOtpStep();
                    }
                  }}
                >
                  Change Phone Number
                </button>
              </>
            )}

            <p className="switch-auth">
              Already have an account?{" "}
              <button
                type="button"
                className="switch-btn"
                onClick={() => {
                  resetOtpStep();
                  setActiveTab("login");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    resetOtpStep();
                    setActiveTab("login");
                  }
                }}
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
