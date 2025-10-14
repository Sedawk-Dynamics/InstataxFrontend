import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPopup.css";
import phoneVerificationImg from "../assets/logingraphic1.png"; // Uploaded phone verification image
import otpVerificationImg from "../assets/otp1.png"; // Upload another image for OTP page

const AuthPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false); // Step tracking
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  if (!isOpen) return null;

  // Handle "Verify" button click - switch to OTP input
  const handleVerifyClick = () => {
    if (!fullName || !phoneNumber) {
      alert("Please enter Full Name and Phone Number");
      return;
    }
    setIsVerifying(true); // Switch to OTP input stage
  };

  // Handle OTP submission
  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    alert("Verification Successful! Redirecting...");
    navigate("/"); // Redirect to home page
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* Dynamic Image Change */}
        <img
          src={isVerifying ? otpVerificationImg : phoneVerificationImg}
          alt="Step Icon"
          className="popup-icon"
        />

        {!isVerifying ? (
          <>
            <h2>Please Verify Your Phone Number</h2>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="+91 XXXXXX XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <button className="verify-btn" onClick={handleVerifyClick}>
              Verify
            </button>
          </>
        ) : (
          <>
            <h2>Please enter the verification code received on your phone</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="verify-btn" onClick={handleOtpSubmit}>
              Confirm
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPopup;
