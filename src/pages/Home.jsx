import React from "react";
import Hero from "../components/Hero";
import AppPromotion from "../components/AppPromotion";
import Services from "../components/services/Services";

function Home() {
  return (
    <div>
      {" "}
      <Hero />
      <Services />
      <AppPromotion />
    </div>
  );
}

export default Home;
