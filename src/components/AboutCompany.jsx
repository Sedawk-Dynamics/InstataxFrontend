// src/components/AboutCompany.jsx
import React from "react";
import "./AboutCompany.css";
import companyIllustration from "../assets/aboutus1.png";

const AboutCompany = () => {
  return (
    <section className="about-company">
      <div className="about-company-container">
        <div className="about-company-content">
          <h2>About Us</h2>

          <div className="about-company-text">
            <p>
              InstaTax.ai is an initiative of TSMTX Solutions Private Limited, created with the vision of simplifying complex legal, taxation, and compliance processes for individuals, startups, and businesses across India. We combine the precision of law and finance with the power of technology to deliver reliable, fast, and transparent solutions — all in one digital platform.
            </p>

            <p>
              Our mission is to make professional services accessible, affordable, and intelligent through automation, expert guidance. Whether it's registering a company, filing taxes, protecting intellectual property, drafting contracts, or ensuring regulatory compliance, InstaTax.ai connects you with qualified professionals and smart digital tools that handle the heavy lifting for you.
            </p>

            <p>
              We understand that entrepreneurs and professionals often struggle with multiple legal, financial, and administrative obligations. InstaTax.ai bridges this gap by offering an integrated ecosystem where users can manage their entire business lifecycle — from incorporation to compliance — without visiting a single government office. Every process is streamlined, secure, and compliant with Indian laws and regulatory standards.
            </p>

            <p>
              Our team consists of seasoned Chartered Accountants, Company Secretaries, Lawyers, Tax Experts, and IT Professionals, all working together to ensure that every client receives accurate, trustworthy, and result-oriented service. Backed by technology and guided by human expertise, we are redefining how businesses handle their legal and financial obligations.
            </p>

            <p>
              Security and confidentiality are central to everything we do. InstaTax.ai follows industry-standard data protection practices and complies with the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023. We ensure your data and transactions are always protected.
            </p>

            <p>
              Beyond compliance and filings, InstaTax.ai aims to empower businesses to grow. Our goal is not just to complete tasks but to create lasting partnerships built on trust, transparency, and transformation. We believe every entrepreneur deserves access to reliable support and expert advice, without unnecessary complexity or cost.
            </p>

            <p>
              At InstaTax.ai, innovation meets integrity. We're building more than just a service platform — we're building India's digital infrastructure for legal, financial, and technological empowerment.
            </p>

            <p>
              For partnerships, collaborations, or service-related queries, reach us at <a href="mailto:Careers@instatax.ai" className="contact-email">Careers@instatax.ai</a>.
            </p>
          </div>
        </div>

        <div className="about-company-illustration">
          <img src={companyIllustration} alt="Team collaborating" />
        </div>
      </div>
    </section>
  );
};

export default AboutCompany;
