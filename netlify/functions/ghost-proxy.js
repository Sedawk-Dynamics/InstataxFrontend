// Netlify Serverless Function - Ghost API Proxy
// This file should be at: netlify/functions/ghost-proxy.js
// Works automatically with Netlify deployment

const https = require('https');
const http = require('http');

// Ghost instance URL
const GHOST_URL = process.env.GHOST_URL || 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me';
const GHOST_BASE_PATH = '/ghost/api/content';

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract path from query string parameters
    // Netlify functions: /api/ghost-proxy?path=posts&key=xxx
    const path = event.queryStringParameters.path || 'posts';
    const queryParams = { ...event.queryStringParameters };
    delete queryParams.path; // Remove path from query params
    
    // Build query string
    const queryString = Object.keys(queryParams).length > 0
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';

    // Construct Ghost API URL
    const ghostUrl = `${GHOST_URL}${GHOST_BASE_PATH}/${path}${queryString}`;
    
    console.log(`[Ghost Proxy] ${event.httpMethod} ${event.path} -> ${ghostUrl}`);

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
        rejectUnauthorized: false, // Allow self-signed certificates
      };

      const proxyReq = requestModule.request(options, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
          data += chunk;
        });

        proxyRes.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              statusCode: proxyRes.statusCode || 200,
              headers,
              body: JSON.stringify(jsonData),
            });
          } catch (e) {
            resolve({
              statusCode: proxyRes.statusCode || 200,
              headers: { ...headers, 'Content-Type': 'text/plain' },
              body: data,
            });
          }
        });
      });

      proxyReq.on('error', (error) => {
        console.error('[Ghost Proxy Error]', error.message);
        resolve({
          statusCode: 502,
          headers,
          body: JSON.stringify({ 
            error: 'Ghost API connection failed', 
            message: error.message 
          }),
        });
      });

      proxyReq.end();
    });
  } catch (error) {
    console.error('[Ghost Proxy Error]', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message 
      }),
    };
  }
};

