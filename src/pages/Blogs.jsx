import React from "react";
import BlogsSection from "../components/blogs/BlogSection";
import BlogSubscription from "../components/BlogSubscription";
import Footer from "../components/Footer";
import blogImage1 from "../../src/assets/planning2.png";
const blogPostsData = [
  {
    title: "Sample title",
    content:
      "Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here.",
    // image: "../../assets/planning2.png", // Replace with your actual image path
    image: blogImage1, // Replace with your actual image path
  },
  {
    title: "Title",
    content:
      "Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here.",
    image: blogImage1, // Replace with your actual image path
  },
  {
    title: "Title",
    content:
      "Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here. Enter the content here.",
    image: blogImage1, // Replace with your actual image path
  },
];
function Blogs() {
  return (
    <div>
      <BlogSubscription />
      <BlogsSection blogPosts={blogPostsData} />
      <Footer />
    </div>
  );
}

export default Blogs;
