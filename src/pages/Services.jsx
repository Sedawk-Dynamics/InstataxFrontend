import React from "react";
import { useParams } from "react-router-dom";
import BusinessRegistration from "../components/services/BusinessRegistration";
import ServiceList from "../components/services/ServiceList";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";

function Services() {
  const { categoryId } = useParams();
  return (
    <div>
      <BusinessRegistration categoryId={categoryId} />
      <ServiceList categoryId={categoryId} />
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default Services;
