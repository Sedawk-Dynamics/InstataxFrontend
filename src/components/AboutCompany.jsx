// src/components/AboutCompany.jsx
import React from "react";
import "./AboutCompany.css";
import companyIllustration from "../assets/aboutus1.png";
import ChatWidget from "./ChatWidget";

const AboutCompany = () => {
  return (
    <section className="about-company">
      <div className="about-company-container">
        <div className="about-company-content">
          <h2>About the Company</h2>

          <div className="about-company-text">
            <p>
              Starting a business is exciting, but navigating legal complexities
              can be overwhelming. We simplify the process with expert guidance
              and seamless execution, so you can focus on what matters—growing
              your startup.
            </p>

            <p>
              Starting a business is exciting, but navigating legal complexities
              can be overwhelming. We simplify the process with expert guidance
              and seamless execution, so you can focus on what matters—growing
              your startup. Starting a business is exciting, but navigating
              legal complexities can be overwhelming. <br></br>We simplify the process
              with expert guidance and seamless execution, so you can focus on
              what matters—growing your startup.
            </p>

            <p>
              Starting a business is exciting, but navigating legal complexities
              can be overwhelming. We simplify the process with expert guidance
              and seamless execution, so you can focus on what matters—growing
              your startup.
            </p>

         

            {/* <p>
              Starting a business is exciting, but navigating legal complexities
              can be overwhelming. We simplify the process with expert guidance
              and seamless execution, so you can focus on what matters—growing
              your startup.
            </p> */}
          </div>
        </div>

        <div className="about-company-illustration">
          <img src={companyIllustration} alt="Team collaborating" />
        </div>
      </div>

      <ChatWidget />
    </section>
  );
};

export default AboutCompany;
