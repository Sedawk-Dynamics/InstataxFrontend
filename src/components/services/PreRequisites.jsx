
// export default PreRequisites;
import React from "react";
import ReactMarkdown from "react-markdown";
import "./PreRequisites.css";

const PreRequisites = ({ preRequisites }) => {
  console.log("PreRequisites received:", preRequisites);

  return (
    <div className="pre-requisites-container">
      <div className="pre-requisites-content">
        <h2 className="pre-requisites-title">Pre-requisites</h2>
        {preRequisites ? (
          <div className="pre-requisites-markdown">
            <ReactMarkdown>{preRequisites}</ReactMarkdown>
          </div>
        ) : (
          <div className="pre-requisites-empty">
            No pre-requisites information available.
          </div>
        )}
      </div>
    </div>
  );
};

export default PreRequisites;