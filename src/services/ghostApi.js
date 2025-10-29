// Ghost CMS API service
const GHOST_API_URL = import.meta.env.VITE_GHOST_API_URL || '';
const GHOST_CONTENT_BASE = import.meta.env.VITE_GHOST_CONTENT_BASE || '';
const GHOST_PROXY_URL = import.meta.env.VITE_GHOST_PROXY_URL || 'https://backend.instatax.ai/api';
const GHOST_CONTENT_API_KEY = import.meta.env.VITE_GHOST_CONTENT_API_KEY || '';

class GhostApiService {
  constructor() {
    if (import.meta.env.DEV) {
      this.baseUrl = '/api';
    } else {
      if (GHOST_CONTENT_BASE) {
        const normalizedContentBase = GHOST_CONTENT_BASE
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = normalizedContentBase;
      } else if (GHOST_API_URL) {
        const normalizedOrigin = GHOST_API_URL
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = `${normalizedOrigin}/ghost/api/content`;
      } else {
        this.baseUrl = '/api/ghost';
      }
    }
    this.apiKey = GHOST_CONTENT_API_KEY;
  }

  async fetchPosts(page = 1, limit = 6, include = 'tags,authors') {
    const urlPatterns = this.getUrlPatterns();
    
    for (let i = 0; i < urlPatterns.length; i++) {
      try {
        const baseUrl = urlPatterns[i];
        const url = `${baseUrl}/posts/?key=${this.apiKey}&limit=${limit}&page=${page}&include=${include}&formats=html,plaintext`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          const text = await response.text();
          
          if (contentType.includes('application/json')) {
            try {
              const data = JSON.parse(text);
              this.baseUrl = baseUrl;
              return {
                posts: data.posts || [],
                meta: data.meta || {}
              };
            } catch (e) {
              if (i === urlPatterns.length - 1) {
                throw new Error(`Invalid JSON response from ${baseUrl}`);
              }
              continue;
            }
          } else if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            if (i === urlPatterns.length - 1) {
              throw new Error('HTML response received (serverless function not available)');
            }
            continue;
          } else {
            try {
              const data = JSON.parse(text);
              this.baseUrl = baseUrl;
              return {
                posts: data.posts || [],
                meta: data.meta || {}
              };
            } catch (e) {
              if (i === urlPatterns.length - 1) {
                throw new Error(`Invalid response from ${baseUrl}`);
              }
              continue;
            }
          }
        } else {
          if (i === urlPatterns.length - 1) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (error) {
        if (i === urlPatterns.length - 1) {
          console.error('[Ghost API] Failed to fetch posts:', error.message);
          throw new Error(`Failed to fetch Ghost API from all ${urlPatterns.length} attempted URL patterns.`);
        }
      }
    }
  }

  getUrlPatterns() {
    const patterns = [];
    
    if (!import.meta.env.DEV) {
      if (GHOST_CONTENT_BASE) {
        const normalized = GHOST_CONTENT_BASE.replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
        patterns.push(normalized);
        return patterns;
      }
      
      if (GHOST_API_URL) {
        const normalizedOrigin = GHOST_API_URL
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        patterns.push(`${normalizedOrigin}/ghost/api/content`);
      }
      
      const disableServerless = import.meta.env.VITE_DISABLE_GHOST_SERVERLESS === 'true';
      if (!disableServerless) {
        patterns.push('/api/ghost');
      }
      
      const normalizedProxy = GHOST_PROXY_URL.replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
      patterns.push(
        normalizedProxy,
        `${normalizedProxy}/ghost/api/content`,
        `${normalizedProxy}/ghost`
      );
    } else {
      patterns.push(this.baseUrl);
    }
    
    return patterns;
  }

  async fetchPostBySlug(slug) {
    const urlPatterns = this.getUrlPatterns();
    
    for (let i = 0; i < urlPatterns.length; i++) {
      try {
        const baseUrl = urlPatterns[i];
        const url = `${baseUrl}/posts/slug/${slug}/?key=${this.apiKey}&include=tags,authors&formats=html,plaintext`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          this.baseUrl = baseUrl;
          return data.posts[0] || null;
        } else {
          if (i === urlPatterns.length - 1) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (error) {
        if (i === urlPatterns.length - 1) {
          console.error('[Ghost API] Failed to fetch post by slug:', error.message);
          throw error;
        }
      }
    }
  }

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