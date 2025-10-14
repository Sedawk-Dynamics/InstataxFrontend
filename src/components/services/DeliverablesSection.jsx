import React from "react";
import "./DeliverablesSection.css";

const DeliverablesSection = ({ deliverables }) => {
  // Function to convert the markdown string into an array of items
  const parseDeliverables = () => {
    if (!deliverables) return [];

    // Split by newlines and filter out empty lines
    return deliverables
      .split("\n")
      .filter((item) => item.trim().length > 0)
      .map((item, index) => ({
        id: index,
        title: item.trim(),
      }));
  };

  const deliverableItems = parseDeliverables();

  if (!deliverables) {
    return (
      <div className="deliverables-container">
        <div className="deliverables-content">
          <h2 className="deliverables-title">Deliverables</h2>
          <p>No deliverables information available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deliverables-container">
      <div className="deliverables-content">
        <h2 className="deliverables-title">Deliverables</h2>
        <div className="deliverables-grid">
          {deliverableItems.map((deliverable) => (
            <div key={deliverable.id} className="deliverable-item">
              <span className="check-icon">✓</span>
              <span className="deliverable-text">{deliverable.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliverablesSection;
