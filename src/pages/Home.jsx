import React from "react";
import Hero from "../components/Hero";
import AppPromotion from "../components/AppPromotion";
import Footer from "../components/Footer";
import Services from "../components/services/Services";
import ChatWidget from "../components/ChatWidget";

function Home() {
  return (
    <div>
      {" "}
      <Hero />
      <Services />
      <AppPromotion />
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default Home;
