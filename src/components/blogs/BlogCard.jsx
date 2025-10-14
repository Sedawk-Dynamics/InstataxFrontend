// src/components/BlogCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./BlogCard.css";

const BlogCard = ({ 
  title, 
  excerpt, 
  image, 
  category, 
  publishedAt, 
  slug
}) => {

  return (
    <div className="blog-card">
      <div className="blog-image-container">
        {image && (
          <img src={image} alt={title} className="blog-image" />
        )}
        {category && (
          <div className="category-tag">{category}</div>
        )}
      </div>
      <div className="blog-content">
        <h3 className="blog-title">{title}</h3>
        {publishedAt && (
          <p className="blog-date">{publishedAt}</p>
        )}
        <p className="blog-excerpt">{excerpt}</p>
        <Link to={`/blog/${slug}`} className="read-more-btn">
          Read more
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
