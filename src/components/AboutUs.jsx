// src/components/AboutUs.jsx
import React from "react";
import "./AboutUs.css";
import aboutIllustration from "../assets/aboutus11.png";

const AboutUs = () => {
  return (
    <section className="about-us" id="about-us">
      <div className="about-container">
        <div className="about-illustration">
          <img src={aboutIllustration} alt="Team illustration" />
        </div>

        <div className="about-content">
          <h2>
  InstaTax.ai supports busy Entrepreneurs <br />
  to handle their messy Startup Legalities <br />
  and Tax filings so that they worry less <br />
  and focus more on their dream business.
</h2>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
