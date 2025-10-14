// src/components/AppPromotion.jsx
import React from "react";
import "./AppPromotion.css";
import googlePlayBadge from "../assets/google-play-badge.png";
import appStoreBadge from "../assets/app-store-badge.png";
import appIllustration from "../assets/mobile1.png"; // Update this to your image filename

const AppPromotion = () => {
  return (
    <section className="app-promotion">
      <div className="app-promotion-container">
        <div className="app-promotion-content">
          <h2> Law made simple,
            <br />
            startups made easy!</h2>

          <div className="app-ranking">
            <p>
              Ranked #1 Mobile App
              <br />
              in Business Category
            </p>

            <div className="app-badges">
              <a href="#" className="store-badge">
                <img src={googlePlayBadge} alt="Get it on Google Play" />
              </a>
              <a href="#" className="store-badge">
                <img src={appStoreBadge} alt="Download on the App Store" />
              </a>
            </div>
          </div>
        </div>

        <div className="app-illustration">
          <img src={appIllustration} alt="App features illustration" />
        </div>
      </div>
    </section>
  );
};

export default AppPromotion;
