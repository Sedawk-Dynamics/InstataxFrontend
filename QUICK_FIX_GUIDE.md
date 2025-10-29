# Quick Fix Guide - Ghost API Not Working

## Problem
All backend proxy attempts are returning 404, which means the backend at `backend.instatax.ai` doesn't have the Ghost API proxy configured.

## Immediate Solution Options

### Option A: Quick Backend Proxy Setup (5 minutes)

If you have access to your backend server, add this to your backend:

#### For Express.js/Node.js backend:

```javascript
// Add to your backend server file
const { createProxyMiddleware } = require('http-proxy-middleware');

// Add this route BEFORE your other /api routes
app.use('/api/posts', createProxyMiddleware({
  target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/ghost/api/content',
  },
  secure: false, // Allow self-signed certificates
}));

app.use('/api/posts/slug', createProxyMiddleware({
  target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/ghost/api/content',
  },
  secure: false,
}));
```

#### For Nginx:

```nginx
location /api/posts {
    proxy_pass http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me/ghost/api/content/posts;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/posts/slug {
    proxy_pass http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me/ghost/api/content/posts/slug;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Option B: Deploy Simple Proxy Server (10 minutes)

I've created `simple-ghost-proxy.js` - a standalone proxy server you can deploy:

1. **Install dependencies:**
```bash
npm install express http-proxy-middleware cors
```

2. **Run the proxy:**
```bash
node simple-ghost-proxy.js
```

3. **Update your `.env` file:**
```
VITE_GHOST_PROXY_URL=http://localhost:3001/api
```

4. **Deploy this proxy server** alongside your frontend (or on a subdomain like `ghost-proxy.instatax.ai`)

### Option C: Temporary CORS Proxy (Not Recommended for Production)

As a last resort, you can use a public CORS proxy service, but this is **NOT recommended** for production:

Update `src/services/ghostApi.js` to add this pattern (only for testing):

```javascript
// In getUrlPatterns(), add as last resort:
patterns.push(`https://cors-anywhere.herokuapp.com/${ghostUrl}/ghost/api/content`);
```

⚠️ **Warning:** Public CORS proxies are unreliable and slow. Use only for testing.

## Recommended Solution

**Option A is the best** - just add the proxy routes to your existing backend at `backend.instatax.ai`.

## Testing After Setup

Once you've configured the proxy, test it:

```bash
curl "https://backend.instatax.ai/api/posts/?key=5e5376cf1889a8f439def11710&limit=1"
```

You should get JSON response with posts. If it works, your frontend will automatically use it.

## Current Status

- ✅ Frontend code is ready and will automatically use the proxy once configured
- ❌ Backend proxy is NOT configured (all requests return 404)
- ✅ API key is set correctly
- ✅ All fallback patterns are tried automatically

**Next Step:** Configure the backend proxy using Option A above, then deploy and test.

