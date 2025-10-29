// Ghost CMS API service
const GHOST_API_URL = import.meta.env.VITE_GHOST_API_URL || '';
const GHOST_CONTENT_BASE = import.meta.env.VITE_GHOST_CONTENT_BASE || '';
const GHOST_PROXY_URL = import.meta.env.VITE_GHOST_PROXY_URL || 'https://backend.instatax.ai/api';
const GHOST_CONTENT_API_KEY = import.meta.env.VITE_GHOST_CONTENT_API_KEY || '';

class GhostApiService {
  constructor() {
    // Use proxy in development
    if (import.meta.env.DEV) {
      this.baseUrl = '/api';
    } else {
      // In production, check if Ghost URL is public or internal
      const isInternalUrl = (url) => {
        if (!url) return true;
        const lowerUrl = url.toLowerCase();
        // Check for internal domains (traefik, localhost, internal IPs, etc.)
        return lowerUrl.includes('traefik.me') ||
               lowerUrl.includes('localhost') ||
               lowerUrl.includes('127.0.0.1') ||
               lowerUrl.includes('192.168.') ||
               lowerUrl.includes('10.') ||
               lowerUrl.includes('.local');
      };

      // In production, prioritize direct Ghost API if URL is public
      if (GHOST_CONTENT_BASE) {
        // Explicit full URL override (must be HTTPS and include /ghost/api/content)
        const normalizedContentBase = GHOST_CONTENT_BASE
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = normalizedContentBase;
      } else if (GHOST_API_URL && !isInternalUrl(GHOST_API_URL)) {
        // Use direct Ghost API if URL is public
        const normalizedOrigin = GHOST_API_URL
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = `${normalizedOrigin}/ghost/api/content`;
      } else if (GHOST_PROXY_URL) {
        // Fallback to backend proxy for internal URLs or when direct access isn't available
        // Backend proxy should rewrite /api/* to /ghost/api/content/*
        const normalizedProxy = GHOST_PROXY_URL
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = normalizedProxy;
      } else {
        console.warn('Ghost API URL not configured. Set VITE_GHOST_API_URL, VITE_GHOST_CONTENT_BASE, or VITE_GHOST_PROXY_URL environment variable.');
        this.baseUrl = '';
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
