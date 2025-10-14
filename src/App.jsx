// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutHome";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Services from "./pages/Services";
import Payment from "./pages/Payment";

import ServiceQuoteHome from "../src/components/services/ServiceQuoteHome";

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
          </Routes>
        </div>
      </Router>
  );
}

export default App;
