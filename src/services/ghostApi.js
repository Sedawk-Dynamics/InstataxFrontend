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
        // Try different proxy path patterns to find the working one
        const normalizedProxy = GHOST_PROXY_URL
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        
        // Try /api/ghost/api/content pattern first (full Ghost API path)
        // If backend proxy handles /api/ghost/* → Ghost's /ghost/api/content/*
        // Then /api/ghost/api/content/posts/ should work
        this.baseUrl = `${normalizedProxy}/ghost/api/content`;
      } else {
        console.warn('Ghost API URL not configured. Set VITE_GHOST_API_URL, VITE_GHOST_CONTENT_BASE, or VITE_GHOST_PROXY_URL environment variable.');
        this.baseUrl = '';
      }
    }
    this.apiKey = GHOST_CONTENT_API_KEY;
  }

  async fetchPosts(page = 1, limit = 6, include = 'tags,authors') {
    // Try multiple URL patterns if first attempt fails
    const urlPatterns = this.getUrlPatterns();
    
    for (let i = 0; i < urlPatterns.length; i++) {
      try {
        const baseUrl = urlPatterns[i];
        const url = `${baseUrl}/posts/?key=${this.apiKey}&limit=${limit}&page=${page}&include=${include}&formats=html,plaintext`;
        
        console.log(`[Ghost API] Trying URL pattern ${i + 1}/${urlPatterns.length}: ${url}`);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[Ghost API] Success with pattern ${i + 1}: ${baseUrl}`);
          // Update baseUrl for future requests
          this.baseUrl = baseUrl;
          return {
            posts: data.posts || [],
            meta: data.meta || {}
          };
        } else {
          console.warn(`[Ghost API] Pattern ${i + 1} returned ${response.status}, trying next...`);
          if (i === urlPatterns.length - 1) {
            // Last pattern failed
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (error) {
        if (i === urlPatterns.length - 1) {
          // Last pattern, throw error
          console.error('[Ghost API] All URL patterns failed. Last error:', error);
          console.error('[Ghost API] Tried patterns:', urlPatterns);
          throw error;
        }
        // Continue to next pattern
        console.warn(`[Ghost API] Pattern ${i + 1} failed:`, error.message);
      }
    }
  }

  getUrlPatterns() {
    // Generate multiple URL patterns to try
    const patterns = [];
    const GHOST_PROXY_URL = import.meta.env.VITE_GHOST_PROXY_URL || 'https://backend.instatax.ai/api';
    const GHOST_API_URL = import.meta.env.VITE_GHOST_API_URL || '';
    const normalizedProxy = GHOST_PROXY_URL.replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
    
    if (!import.meta.env.DEV) {
      // Production patterns - try different proxy path structures
      patterns.push(
        `${normalizedProxy}/ghost/api/content`,  // /api/ghost/api/content
        `${normalizedProxy}/ghost`,               // /api/ghost
        normalizedProxy                           // /api (with rewrite)
      );
      
      // If Ghost URL is available, try direct (even if internal, might work with proper CORS)
      // Try HTTPS first (browsers require HTTPS on HTTPS pages)
      if (GHOST_API_URL) {
        const httpsOrigin = GHOST_API_URL
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        patterns.push(`${httpsOrigin}/ghost/api/content`);
        
        // Also try HTTP if it was originally HTTP (for local dev/testing)
        if (GHOST_API_URL.startsWith('http://')) {
          const httpOrigin = GHOST_API_URL.replace(/\/$/, '');
          patterns.push(`${httpOrigin}/ghost/api/content`);
        }
      }
    } else {
      // Development - just use proxy
      patterns.push(this.baseUrl);
    }
    
    return patterns;
  }

  async fetchPostBySlug(slug) {
    // Use the same pattern-based approach
    const urlPatterns = this.getUrlPatterns();
    
    for (let i = 0; i < urlPatterns.length; i++) {
      try {
        const baseUrl = urlPatterns[i];
        const url = `${baseUrl}/posts/slug/${slug}/?key=${this.apiKey}&include=tags,authors&formats=html,plaintext`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          // Update baseUrl for future requests
          this.baseUrl = baseUrl;
          return data.posts[0] || null;
        } else {
          if (i === urlPatterns.length - 1) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (error) {
        if (i === urlPatterns.length - 1) {
          console.error('Error fetching post by slug:', { error, slug });
          throw error;
        }
      }
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
