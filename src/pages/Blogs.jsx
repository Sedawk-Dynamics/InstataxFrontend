import React from "react";
import BlogsSection from "../components/blogs/BlogSection";
import BlogSubscription from "../components/BlogSubscription";
import Footer from "../components/Footer";

function Blogs() {
  return (
    <div>
      <BlogSubscription />
      <BlogsSection />
      <Footer />
    </div>
  );
}

export default Blogs;
