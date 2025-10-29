// Ghost CMS API service
const GHOST_API_URL = import.meta.env.VITE_GHOST_API_URL || '';
const GHOST_CONTENT_BASE = import.meta.env.VITE_GHOST_CONTENT_BASE || '';
const GHOST_CONTENT_API_KEY = import.meta.env.VITE_GHOST_CONTENT_API_KEY || '';

class GhostApiService {
  constructor() {
    // Use proxy in development, direct URL in production
    if (import.meta.env.DEV) {
      this.baseUrl = '/api';
    } else {
      // Allow explicit override of full content base (must be HTTPS)
      if (GHOST_CONTENT_BASE) {
        const normalizedContentBase = GHOST_CONTENT_BASE
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = normalizedContentBase;
      } else {
        // Fallback: construct from origin, normalized to HTTPS
        const normalizedOrigin = (GHOST_API_URL || '')
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = `${normalizedOrigin}/ghost/api/content`;
      }
    }
    this.apiKey = GHOST_CONTENT_API_KEY;
  }

  async fetchPosts(page = 1, limit = 6, include = 'tags,authors') {
    try {
      const url = `${this.baseUrl}/posts/?key=${this.apiKey}&limit=${limit}&page=${page}&include=${include}&formats=html,plaintext`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        posts: data.posts || [],
        meta: data.meta || {}
      };
    } catch (error) {
      console.error('Error fetching posts from Ghost:', { error, url: `${this.baseUrl}/posts/` });
      throw error;
    }
  }

  async fetchPostBySlug(slug) {
    try {
      const url = `${this.baseUrl}/posts/slug/${slug}/?key=${this.apiKey}&include=tags,authors&formats=html,plaintext`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.posts[0] || null;
    } catch (error) {
      console.error('Error fetching post by slug:', { error, url: `${this.baseUrl}/posts/slug/${slug}/` });
      throw error;
    }
  }

  // Helper method to format Ghost post data for our components
  formatPostData(ghostPost) {
    return {
      id: ghostPost.id,
      title: ghostPost.title,
      slug: ghostPost.slug,
      excerpt: ghostPost.excerpt || ghostPost.plaintext?.substring(0, 150) + '...',
      content: ghostPost.html,
      image: ghostPost.feature_image,
      publishedAt: new Date(ghostPost.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      category: ghostPost.tags?.[0]?.name || 'Blog',
      author: ghostPost.authors?.[0]?.name || 'Anonymous',
      url: ghostPost.url
    };
  }
}

export default new GhostApiService();
