// import React from "react";
// import ChatWidget from "../ChatWidget";
// import Footer from "../Footer";
// import BenefitsSection from "./BenefitsSection";
// import DeliverablesSection from "./DeliverablesSection";
// import FAQsSection from "./FAQsSection";
// import OverviewSection from "./OverviewSection";
// import PreRequisites from "./PreRequisites";
// import ServiceQuote from "./ServiceQuote";

// function ServiceQuoteHome() {
//   return (
//     <div>
//       <ServiceQuote />
//       <OverviewSection />
//       <PreRequisites />
//       <BenefitsSection />
//       <DeliverablesSection />
//       <FAQsSection />
//       <ChatWidget />
//       <Footer />
//     </div>
//   );
// }

// export default ServiceQuoteHome;
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChatWidget from "../ChatWidget";
import Footer from "../Footer";
import BenefitsSection from "./BenefitsSection";
import DeliverablesSection from "./DeliverablesSection";
import FAQsSection from "./FAQsSection";
import OverviewSection from "./OverviewSection";
import PreRequisites from "./PreRequisites";
import ServiceQuote from "./ServiceQuote";

function ServiceQuoteHome() {
  const { documentId } = useParams();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const baseUrl = "https://backend.instatax.ai";
        const response = await fetch(
          `${baseUrl}/api/services/${documentId}?populate=*`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch service details: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Raw API response:", data);

        // Store the correct data structure
        setServiceData(data.data);
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchServiceDetails();
    }
  }, [documentId]);

  if (loading) return <div>Loading service details...</div>;
  if (error) return <div>Error loading service: {error}</div>;
  if (!serviceData) return <div>Service not found</div>;

  console.log("Service data:", serviceData);

  return (
    <div>
      <ServiceQuote serviceData={serviceData} />
      <OverviewSection overview={serviceData.overview} />
      <PreRequisites preRequisites={serviceData.pre_requisites} />
      <BenefitsSection benefits={serviceData.benefits} />
      <DeliverablesSection deliverables={serviceData.deliverables} />
      <FAQsSection faqs={serviceData.faqs} /> {/* ✅ Updated */}
      <ChatWidget />
      <Footer />
    </div>
  );
}

export default ServiceQuoteHome;