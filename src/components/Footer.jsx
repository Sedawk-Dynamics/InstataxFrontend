// src/components/Footer.jsx
import React from "react";
import "./Footer.css";
import footerLogo from "../assets/logo-01-removebg.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faXTwitter,
  faInstagram,
  faYoutube,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-info">
            <div className="footer-logo">
              <img src={footerLogo} alt="InstaTax.ai" />
            </div>
            <p>
              Starting a business is exciting, but navigating legal complexities
              can be overwhelming. We simplify the process with expert guidance
              and seamless execution, so you can focus on what matters— growing
              your startup.
            </p>

            <div className="social-icons">
              <a href="https://www.facebook.com/InstaTaxai" aria-label="Facebook" target="_blank" rel="noreferrer noopener">
                <FontAwesomeIcon icon={faFacebook} className="social-icon" />
              </a>
              <a href="https://x.com/instatax_ai" aria-label="X (formerly Twitter)" target="_blank" rel="noreferrer noopener">
                <FontAwesomeIcon icon={faXTwitter} className="social-icon" />
              </a>
              <a href="https://www.instagram.com/instatax.ai/" aria-label="Instagram" target="_blank" rel="noreferrer noopener">
                <FontAwesomeIcon icon={faInstagram} className="social-icon" />
              </a>
              <a href="#" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} className="social-icon" />
              </a>
              <a href="https://www.linkedin.com/company/instatax-ai/about/" aria-label="LinkedIn" target="_blank" rel="noreferrer noopener">
                <FontAwesomeIcon icon={faLinkedin} className="social-icon" />
              </a>
            </div>
          </div>

          <div className="footer-content">
            <div className="footer-company">
              <h3>Content</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/" className="footer-link">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/services/start_business" className="footer-link">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="footer-link">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="footer-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/payment" className="footer-link">
                    Payment
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-container">
              <h3>Company‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  </h3>
              <ul className="footer-links">
                <li>
                  <Link to="/terms-and-conditions" className="footer-link">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="footer-link">
                    Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="footer-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="footer-link">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="footer-link">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="footer-link">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-logo">
            <img src={footerLogo} alt="InstaTax.ai" />
          </div>

          <div className="footer-copyright">
            <p>
              <span className="copyright-text">
                © {new Date().getFullYear()} InstaTax.ai. All Rights Reserved.
              </span>
              <br className="copyright-break" />
              <span className="footer-links-text">
                <Link to="/privacy-policy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link> | <Link to="/refund-policy" style={{ color: "inherit", textDecoration: "none" }}>Refund</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
