import React from "react";
import AboutUs from "../components/AboutUs";
import AppPromotion from "../components/AppPromotion";
import AboutCompany from "../components/AboutCompany";

function AboutHome() {
  return (
    <div>
      <AboutUs />
      <AboutCompany />
      <AppPromotion />
    </div>
  );
}

export default AboutHome;
