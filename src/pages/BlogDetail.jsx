import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./BlogDetail.css";
import ghostApi from "../services/ghostApi";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const ghostPost = await ghostApi.fetchPostBySlug(slug);
        if (ghostPost) {
          const formattedPost = ghostApi.formatPostData(ghostPost);
          setPost(formattedPost);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-detail-container">
        <div className="blog-detail-content">
          <div className="blog-loading">
            <h1>Loading...</h1>
            <p>Please wait while we fetch the blog post.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-container">
        <div className="blog-detail-content">
          <div className="blog-not-found">
            <h1>{error || 'Blog Post Not Found'}</h1>
            <p>The blog post you're looking for doesn't exist or couldn't be loaded.</p>
            <Link to="/blogs" className="back-to-blog-btn">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      <div className="blog-detail-content">
        {/* Category Tag */}
        <div className="blog-category-tag">{post.category}</div>
        
        {/* Title */}
        <h1 className="blog-detail-title">{post.title}</h1>
        
        {/* Date */}
        <p className="blog-detail-date">{post.publishedAt}</p>
        
        {/* Hero Image */}
        {post.image && (
          <div className="blog-detail-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}
        
        {/* Content */}
        <div 
          className="blog-detail-body"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Back to Blog Button */}
        <div className="blog-detail-footer">
          <Link to="/blogs" className="back-to-blog-btn">
            Back to blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
