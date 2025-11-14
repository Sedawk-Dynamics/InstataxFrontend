// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutHome";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Services from "./pages/Services";
import Payment from "./pages/Payment";
import Contact from "./pages/Contact";
import Disclaimer from "./pages/Disclaimer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import Careers from "./pages/Careers";

import ServiceQuoteHome from "../src/components/services/ServiceQuoteHome";

function App() {
  
  return (
  
      <Router>
        <ScrollToTop />
        <div className="app">
          <Navbar />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />

            {/* Main services page */}
            <Route path="/services/:categoryId" element={<Services />} />
            <Route
              path="/service-quote/:documentId"
              element={<ServiceQuoteHome />}
            />
            <Route
              path="/services/detail/:documentId"
              element={<ServiceQuoteHome />}
            />

              <Route path="/payment" element={<Payment />} />
              <Route path="/contact-us" element={<Contact />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/careers" element={<Careers />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
        </div>
      </Router>
  );
}

export default App;
