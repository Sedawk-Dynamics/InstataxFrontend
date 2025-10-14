

// export default OverviewSection;
import React from "react";
import ReactMarkdown from "react-markdown";
import "./OverviewSection.css";

const OverviewSection = ({ overview }) => {
  const handlePayment = () => {
    // Typically, you would integrate a payment gateway or redirect to a payment page
    alert("Redirecting to payment...");
  };

  return (
    <div className="overview-container">
      <div className="overview-content">
        <div className="overview-text-section">
          <h2 className="overview-title">Overview</h2>
          <div className="overview-text">
            {overview ? (
              <ReactMarkdown>{overview}</ReactMarkdown>
            ) : (
              <p>No overview information available.</p>
            )}
          </div>
        </div>

        <div className="payment-section">
          <div className="payment-card">
            <h3>Make Payment Instantly in a Minute!</h3>
            <button onClick={handlePayment} className="payment-button">
              Click here to make Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;