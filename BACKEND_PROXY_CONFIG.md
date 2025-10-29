# Backend Proxy Configuration Guide for Ghost API

This guide explains how to configure your backend at `backend.instatax.ai` to proxy Ghost API requests.

## Current Setup
- **Frontend:** `https://instatax.ai`
- **Backend:** `https://backend.instatax.ai`
- **Ghost Instance:** `http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me`
- **Ghost Content API Key:** `5e5376cf1889a8f439def11710`

## Proxy Requirements

The frontend will request: `https://backend.instatax.ai/api/posts/?key=...`

The backend should:
1. Accept requests at `/api/*` 
2. Rewrite `/api` to `/ghost/api/content`
3. Forward to Ghost instance at `http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me/ghost/api/content/*`

## Configuration Options

### Option 1: Nginx Configuration (Recommended)

If your backend uses Nginx as a reverse proxy, add this configuration:

```nginx
# In your nginx server block for backend.instatax.ai
server {
    listen 443 ssl;
    server_name backend.instatax.ai;
    
    # Your existing SSL configuration...
    # ssl_certificate ...
    # ssl_certificate_key ...

    # Existing Strapi API routes
    location /api/services {
        proxy_pass http://your-strapi-instance;
        # ... your existing proxy settings
    }
    
    location /api/categories {
        proxy_pass http://your-strapi-instance;
        # ... your existing proxy settings
    }
    
    # NEW: Ghost API Proxy
    # Rewrite /api/* to /ghost/api/content/* and forward to Ghost
    location /api/ {
        # Check if it's a Ghost API request (contains key parameter or /posts, /posts/slug)
        # Option A: Proxy all /api/* to Ghost (if no Strapi conflicts)
        proxy_pass http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me/ghost/api/content/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rewrite the path: remove /api and add /ghost/api/content
        rewrite ^/api/(.*)$ /ghost/api/content/$1 break;
    }
    
    # OR Option B: More specific route (if you have Strapi at /api/*)
    # Uncomment and use this if Option A conflicts with Strapi
    # location ~ ^/api/(posts|posts/slug) {
    #     proxy_pass http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    #     rewrite ^/api/(.*)$ /ghost/api/content/$1 break;
    # }
}
```

**Important:** If you have Strapi routes at `/api/*`, you may need to use Option B or configure Nginx to route Ghost-specific paths only.

### Option 2: Express.js/Node.js Proxy

If your backend is Node.js/Express, use `http-proxy-middleware`:

```javascript
// Install: npm install http-proxy-middleware
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const app = express();

// Existing Strapi routes...

// Ghost API Proxy
app.use('/api/posts', createProxyMiddleware({
    target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/ghost/api/content',  // Rewrite /api/posts to /ghost/api/content/posts
    },
    onProxyReq: (proxyReq, req, res) => {
        // Log requests for debugging
        console.log('Proxying Ghost API:', req.url);
    },
    onError: (err, req, res) => {
        console.error('Ghost proxy error:', err);
        res.status(500).json({ error: 'Ghost API proxy error' });
    }
}));

// Handle /api/posts/slug/:slug routes
app.use('/api/posts/slug', createProxyMiddleware({
    target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/ghost/api/content',
    },
}));

app.listen(3000);
```

### Option 3: Strapi Middleware (If using Strapi)

If your backend is Strapi, add custom middleware:

**File:** `config/middlewares.js`

```javascript
module.exports = [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
    {
        name: 'global::ghost-proxy',
        config: {
            enabled: true,
        },
    },
];
```

**File:** `middlewares/ghost-proxy/index.js`

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (config, { strapi }) => {
    return async (ctx, next) => {
        // Check if it's a Ghost API request
        if (ctx.url.startsWith('/api/posts')) {
            const target = 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me';
            
            const proxy = createProxyMiddleware({
                target,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/ghost/api/content',
                },
                onProxyReq: (proxyReq) => {
                    // Preserve original URL and query params
                    const url = ctx.url.replace('/api', '/ghost/api/content');
                    proxyReq.path = url;
                },
            });
            
            // Use the proxy middleware
            await new Promise((resolve, reject) => {
                proxy(ctx.req, ctx.res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            return;
        }
        
        await next();
    };
};
```

### Option 4: Traefik Configuration

If you're using Traefik (since Ghost URL is traefik.me), configure routing:

**docker-compose.yml or traefik config:**

```yaml
services:
  backend:
    labels:
      - "traefik.http.routers.backend.rule=Host(`backend.instatax.ai`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.middlewares.ghost-proxy.redirectscheme.scheme=https"
      - "traefik.http.middlewares.ghost-rewrite.replacepathregex.regex=^/api/(.*)"
      - "traefik.http.middlewares.ghost-rewrite.replacepathregex.replacement=/ghost/api/content/$$1"
      - "traefik.http.services.backend.loadbalancer.server.port=3000"
      - "traefik.http.routers.backend-ghost.rule=Host(`backend.instatax.ai`) && PathPrefix(`/api/posts`)"
      - "traefik.http.routers.backend-ghost.entrypoints=websecure"
      - "traefik.http.routers.backend-ghost.tls.certresolver=letsencrypt"
      - "traefik.http.routers.backend-ghost.middlewares=ghost-rewrite"
      - "traefik.http.services.backend-ghost.loadbalancer.server.url=http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me"
```

## Testing the Configuration

After configuring the proxy, test with:

```bash
# Test posts endpoint
curl "https://backend.instatax.ai/api/posts/?key=5e5376cf1889a8f439def11710&limit=1"

# Test specific post
curl "https://backend.instatax.ai/api/posts/slug/test-post/?key=5e5376cf1889a8f439def11710"
```

## Expected Response

You should get a JSON response like:
```json
{
  "posts": [...],
  "meta": {...}
}
```

## Troubleshooting

1. **404 Errors**: Check that the proxy path rewriting is correct
2. **502/503 Errors**: Check that Ghost instance is accessible from backend
3. **CORS Errors**: Should not occur since requests go through backend
4. **Connection Refused**: Verify Ghost instance URL and network connectivity

## Frontend Configuration

Once the backend proxy is configured, your frontend is already set up! It will automatically:
- Try the proxy URL first
- Fall back to other patterns if needed
- Log detailed information in the console

The frontend code in `src/services/ghostApi.js` will automatically use:
- `https://backend.instatax.ai/api/posts/` (for proxy)
- And fallback to other patterns if this fails

## Next Steps

1. Configure the backend proxy using one of the options above
2. Test the proxy endpoint manually (see Testing section)
3. Deploy the frontend changes
4. Check browser console for `[Ghost API]` logs to verify it's working

