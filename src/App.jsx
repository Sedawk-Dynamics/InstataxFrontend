// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutHome";
import Blogs from "./pages/Blogs";
import Services from "./pages/Services";
import Payment from "./pages/Payment";

// Import service-specific pages, or you can create a dynamic service page
import BusinessRegistration from "./pages/Services";
import TaxFiling from "./pages/Services";
import AccountingServices from "./pages/Services";
import ComplianceSupport from "./pages/Services";
import TrademarkCopyright from "./pages/Services";
import CertificationLicenses from "./pages/Services";
import OtherServices from "./pages/Services";
import ServiceQuoteHome from "../src/components/services/ServiceQuoteHome";

import PrivateLimitedCompanyQuote from "./components/services/ServiceQuoteHome";
import OnePersonCompanyQuote from "./components/services/ServiceQuoteHome";
import LLPQuote from "./components/services/ServiceQuoteHome";
import StartupIndiaQuote from "./components/services/ServiceQuoteHome";
import GSTRegistrationQuote from "./components/services/ServiceQuoteHome";

function App() {
  
  return (
  
      <Router>
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/blogs" element={<Blogs />} />

            {/* Main services page */}
            {/* <Route path="/services" element={<Services />} /> */}
            <Route path="/services/:categoryId" element={<Services />} />
            {/* Individual service routes */}
            <Route
              path="/services/business-registration"
              element={<BusinessRegistration />}
            />
            {/* Individual service detail pages */}
            <Route
              path="/services/private-limited-company"
              element={
                <PrivateLimitedCompanyQuote
                  title="Private Limited Company"
                  subtitle="Start your Pvt. Ltd. in 15 days"
                  price="Rs. 6299"
                />
              }
            />

            <Route
              path="/services/one-person-company"
              element={
                <OnePersonCompanyQuote
                  title="One Person Company"
                  subtitle="Start your OPC in 15 days"
                  price="Rs. 4799"
                />
              }
            />

            <Route
              path="/services/limited-liability-partnership"
              element={
                <LLPQuote
                  title="Limited Liability Partnership"
                  subtitle="Start your LLP in 15 days"
                  price="Rs. 3499"
                />
              }
            />

            <Route
              path="/services/startup-india-registration"
              element={
                <StartupIndiaQuote
                  title="Startup India Registration"
                  subtitle="Get Startup India recognition support"
                  price="Rs. 3999"
                />
              }
            />

            <Route
              path="/services/gst-registration"
              element={
                <GSTRegistrationQuote
                  title="GST Registration"
                  subtitle="Get it in 4 days"
                  price="Rs. 1499"
                />
              }
            />
            <Route
              path="/service-quote/:documentId"
              element={<ServiceQuoteHome />}
            />
            {/* You might want to keep the old route as well for backward compatibility */}
            <Route
              path="/services/detail/:documentId"
              element={<ServiceQuoteHome />}
            />
            <Route path="/services/tax-filing" element={<TaxFiling />} />
            <Route
              path="/services/accounting"
              element={<AccountingServices />}
            />
            <Route
              path="/services/compliance"
              element={<ComplianceSupport />}
            />
            <Route
              path="/services/trademark"
              element={<TrademarkCopyright />}
            />
            <Route
              path="/services/certification"
              element={<CertificationLicenses />}
            />
            <Route path="/services/other" element={<OtherServices />} />

            <Route path="/payment" element={<Payment />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
