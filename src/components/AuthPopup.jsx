import React, { useState, useEffect, useRef } from "react";
import "./AuthPopup.css";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
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

  // Sign up form state - name, phone, state, city
  const [signupForm, setSignupForm] = useState({
    name: "",
    phone: "",
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

  // Validate signup form - name, phone, state, city
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

    if (!signupForm.state) {
      errors.state = "State is required";
    }

    if (!signupForm.city) {
      errors.city = "City is required";
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Send OTP for login
  const sendLoginOTP = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
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

      // Optionally sync with backend API (if you want to keep backend user data)
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
          }
        }
      } catch (backendError) {
        console.log("Backend sync error (non-critical):", backendError);
        // Continue even if backend sync fails - Firebase auth is successful
      }

      // Update UI and close popup
      setIsLoading(false);
      onClose();

      // Trigger success callback
      if (onVerifySuccess) {
        onVerifySuccess();
      }

      // Force page reload to update navbar state
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

      // Sync with backend API to register user with additional info
      try {
        const response = await fetch(`${baseUrl}/mauth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${firebaseToken}`, // Send Firebase token
          },
          body: JSON.stringify({
            name: signupForm.name,
            phone: signupForm.phone,
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
          throw new Error(errMessage);
        }
      } catch (backendError) {
        // If backend fails but Firebase auth succeeded, still allow login
        console.error("Backend sync error:", backendError);
        if (backendError.message.includes("already registered")) {
          throw backendError;
        }
        // Continue with Firebase auth only - user is authenticated via Firebase
      }

      // Update UI and close popup
      setIsLoading(false);
      onClose();

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
          <form onSubmit={otpSent ? verifyLoginOTP : sendLoginOTP} className="auth-form">
            <h2>Welcome Back</h2>

            {!otpSent ? (
              <>
                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile Number (10 digits)"
                    value={loginForm.phone}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                    maxLength="10"
                  />
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
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === "signup" && (
          <form onSubmit={otpSent ? verifySignupOTP : sendSignupOTP} className="auth-form">
            <h2>Create an Account</h2>

            {!otpSent ? (
              <>
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
                    placeholder="Mobile Number (10 digits)"
                    value={signupForm.phone}
                    onChange={handleSignupChange}
                    disabled={isLoading}
                    maxLength="10"
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
