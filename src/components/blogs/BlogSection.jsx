// src/components/BlogsSection.jsx
import React from "react";
import BlogCard from "./BlogCard";
import "./BlogSection.css";
const BlogsSection = ({ blogPosts }) => {
  return (
    <section className="blogs-section" id="blogs">
      <div className="blogs-container">
        <h2 className="section-title">Blogs</h2>
        <div className="blogs-list">
          {blogPosts.map((post, index) => (
            <BlogCard
              key={index}
              title={post.title}
              content={post.content}
              image={post.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogsSection;
