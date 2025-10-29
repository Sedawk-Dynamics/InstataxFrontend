// Ghost CMS API service
const GHOST_API_URL = import.meta.env.VITE_GHOST_API_URL || '';
const GHOST_CONTENT_BASE = import.meta.env.VITE_GHOST_CONTENT_BASE || '';
const GHOST_PROXY_URL = import.meta.env.VITE_GHOST_PROXY_URL || 'https://backend.instatax.ai/api';
const GHOST_CONTENT_API_KEY = import.meta.env.VITE_GHOST_CONTENT_API_KEY || '';

class GhostApiService {
  constructor() {
    // In production, use serverless function first (works with Vercel/Netlify)
    // Serverless function is at /api/ghost/[...path] - deployed with frontend
    if (import.meta.env.DEV) {
      // Development: use vite proxy
      this.baseUrl = '/api';
    } else {
      // Production: prioritize serverless function (no separate backend needed)
      // Serverless function handles: /api/ghost/posts -> Ghost /ghost/api/content/posts
      this.baseUrl = '/api/ghost';
      
      // If VITE_GHOST_CONTENT_BASE is explicitly set, use it instead
      if (GHOST_CONTENT_BASE) {
        const normalizedContentBase = GHOST_CONTENT_BASE
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        this.baseUrl = normalizedContentBase;
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
          // Check if response is actually JSON (not HTML error page)
          const contentType = response.headers.get('content-type') || '';
          const text = await response.text();
          
          if (contentType.includes('application/json')) {
            try {
              const data = JSON.parse(text);
              console.log(`[Ghost API] Success with pattern ${i + 1}: ${baseUrl}`);
              // Update baseUrl for future requests
              this.baseUrl = baseUrl;
              return {
                posts: data.posts || [],
                meta: data.meta || {}
              };
            } catch (e) {
              // Not valid JSON, try next pattern
              console.warn(`[Ghost API] Pattern ${i + 1} returned invalid JSON, trying next...`);
              if (i === urlPatterns.length - 1) {
                throw new Error(`Invalid JSON response from ${baseUrl}`);
              }
              continue;
            }
          } else if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            // HTML response (404 page, etc.)
            console.warn(`[Ghost API] Pattern ${i + 1} returned HTML (likely not deployed), trying next...`);
            if (i === urlPatterns.length - 1) {
              throw new Error(`HTML response received (serverless function not available)`);
            }
            continue;
          } else {
            // Try to parse anyway
            try {
              const data = JSON.parse(text);
              console.log(`[Ghost API] Success with pattern ${i + 1}: ${baseUrl}`);
              this.baseUrl = baseUrl;
              return {
                posts: data.posts || [],
                meta: data.meta || {}
              };
            } catch (e) {
              console.warn(`[Ghost API] Pattern ${i + 1} returned invalid response, trying next...`);
              if (i === urlPatterns.length - 1) {
                throw new Error(`Invalid response from ${baseUrl}`);
              }
              continue;
            }
          }
        } else {
          console.warn(`[Ghost API] Pattern ${i + 1} returned ${response.status}, trying next...`);
          if (i === urlPatterns.length - 1) {
            // Last pattern failed
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (error) {
        // Check if response is HTML (serverless function not deployed or routing failed)
        const isHtmlError = error.message.includes('<!DOCTYPE') || 
                          error.message.includes('Unexpected token') ||
                          error.message.includes('is not valid JSON');
        
        if (isHtmlError) {
          console.warn(`[Ghost API] Pattern ${i + 1} returned HTML (serverless function may not be deployed), trying next...`);
        } else {
          console.warn(`[Ghost API] Pattern ${i + 1} failed:`, error.message);
        }
        
        if (i === urlPatterns.length - 1) {
          // Last pattern, throw error with helpful message
          console.error('[Ghost API] All URL patterns failed. Last error:', error);
          console.error('[Ghost API] Tried patterns:', urlPatterns);
          
          if (isHtmlError && urlPatterns[0] === '/api/ghost') {
            console.error(`
[Ghost API] Serverless Function Not Deployed:
The serverless function at /api/ghost is returning HTML (likely a 404 page).
This means the function isn't deployed or recognized.

QUICK FIX:
1. Deploy to Vercel or Netlify (the serverless function will deploy automatically)
2. OR: Set VITE_GHOST_CONTENT_BASE in .env with a working Ghost URL
3. OR: Use a public Ghost API URL in VITE_GHOST_API_URL

For development, the Vite proxy should handle this automatically.
            `);
          } else {
            const proxyUrl = import.meta.env.VITE_GHOST_PROXY_URL || 'https://backend.instatax.ai/api';
            const ghostUrl = import.meta.env.VITE_GHOST_API_URL || 'not configured';
            console.error(`
[Ghost API] Troubleshooting Guide:
1. Serverless Function: Deploy to Vercel/Netlify for automatic serverless function
2. Direct Access: Set VITE_GHOST_CONTENT_BASE with a public Ghost Content API URL
3. Backend Proxy: Configure backend at ${proxyUrl} to proxy Ghost requests
            `);
          }
          throw new Error(`Failed to fetch Ghost API from all ${urlPatterns.length} attempted URL patterns. See console for details.`);
        }
      }
    }
  }

  getUrlPatterns() {
    // Generate multiple URL patterns to try
    const patterns = [];
    
    if (!import.meta.env.DEV) {
      // If VITE_GHOST_CONTENT_BASE is set, use it exclusively
      if (GHOST_CONTENT_BASE) {
        const normalized = GHOST_CONTENT_BASE.replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
        patterns.push(normalized);
        return patterns;
      }
      
      // Production: Try serverless function first (only if not disabled)
      const disableServerless = import.meta.env.VITE_DISABLE_GHOST_SERVERLESS === 'true';
      
      if (!disableServerless) {
        patterns.push('/api/ghost');  // Serverless function at /api/ghost/[...path]
      }
      
      // Fallback patterns (if serverless function not available)
      const GHOST_PROXY_URL = import.meta.env.VITE_GHOST_PROXY_URL || 'https://backend.instatax.ai/api';
      const GHOST_API_URL = import.meta.env.VITE_GHOST_API_URL || '';
      const normalizedProxy = GHOST_PROXY_URL.replace(/^http:\/\//i, 'https://').replace(/\/$/, '');
      
      patterns.push(
        normalizedProxy,                           // /api (old backend proxy)
        `${normalizedProxy}/ghost/api/content`,    // /api/ghost/api/content
        `${normalizedProxy}/ghost`,                // /api/ghost
      );
      
      // If Ghost URL is available and public, try direct
      if (GHOST_API_URL && !GHOST_API_URL.includes('traefik.me')) {
        const httpsOrigin = GHOST_API_URL
          .replace(/^http:\/\//i, 'https://')
          .replace(/\/$/, '');
        patterns.push(`${httpsOrigin}/ghost/api/content`);
      }
    } else {
      // Development - use vite proxy
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
