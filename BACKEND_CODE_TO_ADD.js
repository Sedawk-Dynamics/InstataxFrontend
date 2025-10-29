// ============================================
// COPY AND PASTE THIS INTO YOUR BACKEND SERVER
// ============================================
// Add this code to your existing backend at backend.instatax.ai
// It will make Ghost API requests work immediately

// For Express.js/Node.js backend:
const { createProxyMiddleware } = require('http-proxy-middleware');

// Add this BEFORE your other route handlers
// This proxies /api/posts requests to Ghost
app.use('/api/posts', createProxyMiddleware({
  target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
  changeOrigin: true,
  secure: false, // Allow self-signed certificates (required for traefik.me)
  pathRewrite: {
    '^/api': '/ghost/api/content', // Rewrites /api/posts to /ghost/api/content/posts
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Ghost Proxy] ${req.method} ${req.url} -> Ghost API`);
  },
  onError: (err, req, res) => {
    console.error('[Ghost Proxy Error]', err.message);
    res.status(502).json({ error: 'Ghost API unavailable', details: err.message });
  }
}));

// Also handle /api/posts/slug/:slug routes
app.use('/api/posts/slug', createProxyMiddleware({
  target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api': '/ghost/api/content',
  }
}));

// ============================================
// INSTALL REQUIRED PACKAGE:
// npm install http-proxy-middleware
// ============================================

// ============================================
// FOR STRAPI BACKEND (if using Strapi):
// ============================================
// Add this to config/middlewares.js BEFORE other middlewares:
const ghostProxy = require('http-proxy-middleware');

module.exports = ({ env }) => [
  // Ghost proxy middleware - add FIRST
  {
    resolve: './middlewares/ghost-proxy',
    config: {
      enabled: true,
    },
  },
  'strapi::logger',
  // ... rest of your middlewares
];

// Then create file: middlewares/ghost-proxy/index.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.url.startsWith('/api/posts')) {
      const proxy = createProxyMiddleware({
        target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '/ghost/api/content',
        },
      });
      
      return new Promise((resolve, reject) => {
        proxy(ctx.req, ctx.res, (err) => {
          if (err) {
            ctx.throw(502, `Ghost API error: ${err.message}`);
          }
          resolve();
        });
      });
    }
    await next();
  };
};

// ============================================
// TEST AFTER ADDING:
// curl "https://backend.instatax.ai/api/posts/?key=5e5376cf1889a8f439def11710&limit=1"
// Should return JSON with posts
// ============================================

