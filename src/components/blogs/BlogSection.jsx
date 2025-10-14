// src/components/BlogsSection.jsx
import React, { useState, useEffect } from "react";
import BlogCard from "./BlogCard";
import "./BlogSection.css";
import ghostApi from "../../services/ghostApi";

const BlogsSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ghostApi.fetchPosts(currentPage, 6);
      const formattedPosts = response.posts.map(post => ghostApi.formatPostData(post));
      setPosts(formattedPosts);
      setHasNextPage(response.meta?.pagination?.next !== null);
    } catch (err) {
      setError('Failed to load blog posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <section className="blogs-section" id="blogs">
      <div className="blogs-container">
        <h2 className="section-title">Blogs</h2>
        
        {loading && (
          <div className="loading-state">
            <p>Loading blog posts...</p>
          </div>
        )}
        
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchPosts} className="retry-btn">
              Try Again
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="blogs-grid">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  image={post.image}
                  category={post.category}
                  publishedAt={post.publishedAt}
                  slug={post.slug}
                />
              ))}
            </div>
            
            {hasNextPage && (
              <div className="pagination">
                <button 
                  className="next-btn"
                  onClick={handleNextPage}
                  disabled={loading}
                >
                  Next &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;
