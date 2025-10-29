// Vercel Serverless Function - Ghost API Proxy
// This file should be at: api/ghost/[...path].js
// Works automatically with Vercel deployment

const https = require('https');
const http = require('http');

// Ghost instance URL (from environment or default)
const GHOST_URL = process.env.GHOST_URL || 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me';
const GHOST_BASE_PATH = '/ghost/api/content';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the path from the catch-all route
    // URL: /api/ghost/posts -> path becomes ['posts']
    // URL: /api/ghost/posts/slug/test -> path becomes ['posts', 'slug', 'test']
    const path = req.query.path || [];
    const apiPath = Array.isArray(path) ? path.join('/') : (path || 'posts');
    
    // Get query parameters from original request
    const queryString = new URL(req.url, `http://${req.headers.host}`).search;
    
    // Construct Ghost API URL
    const ghostUrl = `${GHOST_URL}${GHOST_BASE_PATH}/${apiPath}${queryString || ''}`;
    
    console.log(`[Ghost Proxy] Proxying: ${req.method} ${req.url} -> ${ghostUrl}`);

    // Make request to Ghost API
    return new Promise((resolve) => {
      const url = new URL(ghostUrl);
      const requestModule = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'User-Agent': 'InstaTax-Frontend/1.0',
        },
        // Allow self-signed certificates (for traefik.me)
        rejectUnauthorized: false,
      };

      const proxyReq = requestModule.request(options, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
          data += chunk;
        });

        proxyRes.on('end', () => {
          // Forward status code and headers
          res.status(proxyRes.statusCode);
          
          // Forward response headers
          const contentType = proxyRes.headers['content-type'];
          if (contentType) {
            res.setHeader('Content-Type', contentType);
          }

          // Send response
          if (proxyRes.statusCode === 200) {
            try {
              const jsonData = JSON.parse(data);
              resolve(res.json(jsonData));
            } catch (e) {
              resolve(res.send(data));
            }
          } else {
            resolve(res.json({ 
              error: 'Ghost API error', 
              status: proxyRes.statusCode,
              message: data 
            }));
          }
        });
      });

      proxyReq.on('error', (error) => {
        console.error('[Ghost Proxy Error]', error.message);
        resolve(res.status(502).json({ 
          error: 'Ghost API connection failed', 
          message: error.message 
        }));
      });

      proxyReq.end();
    });
  } catch (error) {
    console.error('[Ghost Proxy Error]', error);
    return res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}

