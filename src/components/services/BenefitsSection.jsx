import React, { useState } from "react";
import "./BenefitsSection.css";

const BenefitsSection = ({ benefits }) => {
  const [openIndex, setOpenIndex] = useState(null);

  // Toggle accordion open/close
  const toggleBenefit = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Check if benefits exists and is an array
  if (!benefits || !Array.isArray(benefits) || benefits.length === 0) {
    return null; // Don't render anything if no benefits are available
  }

  return (
    <div className="benefits-container">
      <div className="benefits-content">
        <h2 className="benefits-title">Benefits</h2>
        <div className="benefits-list">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id || index}
              className={`benefit-item ${openIndex === index ? "open" : ""}`}
              onClick={() => toggleBenefit(index)}
            >
              <div className="benefit-header">
                <div className="benefit-text">{benefit.title}</div>
                <div
                  className={`benefit-icon ${
                    openIndex === index ? "rotate" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
              {openIndex === index && benefit.description && (
                <div className="benefit-description">{benefit.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;
