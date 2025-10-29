// Simple Ghost Proxy Server
// Deploy this as a separate service or add to your existing backend
// Usage: node simple-ghost-proxy.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://instatax.ai', 'http://localhost:5173'], // Add your frontend domains
  credentials: true
}));

// Ghost proxy endpoint
app.use('/api/posts', createProxyMiddleware({
  target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/ghost/api/content', // Rewrite /api/posts to /ghost/api/content/posts
  },
  secure: false, // Allow self-signed certificates
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Ghost Proxy] Proxying: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('[Ghost Proxy] Error:', err.message);
    res.status(500).json({ 
      error: 'Ghost API proxy error', 
      message: err.message 
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Ghost Proxy] Response: ${proxyRes.statusCode} for ${req.url}`);
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ghost-proxy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Ghost Proxy Server running on port ${PORT}`);
  console.log(`Configure your frontend to use: http://localhost:${PORT}/api/posts`);
  console.log(`Or in production: https://your-backend-domain:${PORT}/api/posts`);
});

