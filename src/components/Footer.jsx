// src/components/Footer.jsx
import React from "react";
import "./Footer.css";
import logoWhite from "../assets/logo-01.jpg";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faYoutube,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-info">
            <h3>InstaTax.ai</h3>
            <p>
              Starting a business is exciting, but navigating legal complexities
              can be overwhelming. We simplify the process with expert guidance
              and seamless execution, so you can focus on what matters— growing
              your startup.
            </p>

            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} className="social-icon" />
              </a>
              <a href="#" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} className="social-icon" />
              </a>
              <a href="#" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} className="social-icon" />
              </a>
              <a href="#" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} className="social-icon" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedin} className="social-icon" />
              </a>
            </div>
          </div>

          <div className="footer-content">
            <div className="footer-company">
              <h3>Company</h3>
              <ul className="footer-links">
                <li>
                  <a href="/disclaimer" className="footer-link">
                    Disclaimer
                  </a>
                </li>
                <li>
                  <a href="/careers" className="footer-link">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/contact-us" className="footer-link">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-links-container">
              <h3>Content</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/" className="footer-link">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="footer-link">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="footer-link">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="footer-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/payment" className="footer-link">
                    Payments
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
            <img src={logoWhite} alt="InstaTax.ai" />
            {/* <span>InstaTax.ai</span> */}
          </div>

          <div className="footer-copyright">
            <p>
              © {new Date().getFullYear()} InstaTax.ai. All Rights Reserved.
              <br />
              Privacy | Refund
            </p>
            {/* <a href="#" className="privacy-link">
              Privacy
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
