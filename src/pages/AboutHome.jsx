import React from "react";
import AboutUs from "../components/AboutUs";
import Footer from "../components/Footer";
import AppPromotion from "../components/AppPromotion";
import AboutCompany from "../components/AboutCompany";

function AboutHome() {
  return (
    <div>
      <AboutUs />
      <AboutCompany />
      <AppPromotion />
      <Footer />
    </div>
  );
}

export default AboutHome;
