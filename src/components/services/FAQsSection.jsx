import React, { useState } from "react";
import "./FAQsSection.css";
import ReactMarkdown from "react-markdown";

const FAQsSection = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  // Toggle FAQ open/close
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Check if faqs exists and is an array
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return null; // Don't render anything if no FAQs are available
  }

  return (
    <div className="faqs-container">
      <div className="faqs-content">
        <h2 className="faqs-title">FAQs</h2>
        <div className="faqs-list">
          {faqs.map((faq, index) => (
            <div key={faq.id || index} className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <div className="faq-text">{faq.title}</div>
                <div
                  className={`faq-icon ${openIndex === index ? "open" : ""}`}
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
              {openIndex === index && (
                <div className="faq-answer">
                  <ReactMarkdown>{faq.description}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQsSection;
