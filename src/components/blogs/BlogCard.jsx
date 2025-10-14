// src/components/BlogCard.jsx
import React from "react";
import "./BlogCard.css";

const BlogCard = ({ title, content, image }) => {
  return (
    <div className="blog-card">
      <div className="blog-content">
        <h3 className="blog-title">{title}</h3>
        <p className="blog-text">{content}</p>
      </div>
      <div className="blog-image">
        <img src={image} alt={title} />
      </div>
    </div>
  );
};

export default BlogCard;
