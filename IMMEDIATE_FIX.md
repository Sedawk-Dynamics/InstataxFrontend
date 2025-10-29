# Immediate Fix - Ghost API Not Working

## Current Issue
The serverless function at `/api/ghost` is returning HTML (404 page), meaning it's not deployed or not working on your hosting platform.

## Quick Solutions (Choose One)

### Solution 1: Use Public Ghost URL (If Available)

If you have a public Ghost URL with valid SSL certificate:

1. **Set in your `.env` file:**
   ```
   VITE_GHOST_CONTENT_BASE=https://your-public-ghost-domain.com/ghost/api/content
   VITE_GHOST_CONTENT_API_KEY=5e5376cf1889a8f439def11710
   ```

2. **Redeploy** - The frontend will use this URL directly

### Solution 2: Disable Serverless Function and Use Vite Proxy Pattern

If you're deployed but serverless functions don't work:

1. **Set in your `.env` file (or deployment environment variables):**
   ```
   VITE_DISABLE_GHOST_SERVERLESS=true
   VITE_GHOST_PROXY_URL=https://backend.instatax.ai/api
   ```

2. This will skip the serverless function and try backend proxy patterns

### Solution 3: Deploy to Vercel/Netlify

If you're not on Vercel/Netlify yet, deploy there:

1. **Vercel:**
   - Push to GitHub
   - Connect repo to Vercel
   - The `api/ghost/[...path].js` function will deploy automatically
   - Set env var: `GHOST_URL=http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me`

2. **Netlify:**
   - Push to GitHub  
   - Connect repo to Netlify
   - The `netlify/functions/ghost-proxy.js` function will deploy automatically
   - Set env var: `GHOST_URL=http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me`

### Solution 4: Make Ghost Instance Public

If you can configure your Ghost instance:

1. Make Ghost accessible at a public HTTPS URL
2. Configure CORS on Ghost to allow `https://instatax.ai`
3. Set in `.env`:
   ```
   VITE_GHOST_CONTENT_BASE=https://your-public-ghost.com/ghost/api/content
   ```

## For Development (Local)

The Vite proxy is already configured and should work automatically when you run `npm run dev`.

## Testing

After applying a solution, check the browser console. You should see:
- `[Ghost API] Success with pattern X: ...`
- And posts should load

## Most Likely Fix

If you're already deployed but serverless functions aren't working, use **Solution 2** to disable the serverless function pattern and use fallback patterns.

Add to your deployment environment variables:
```
VITE_DISABLE_GHOST_SERVERLESS=true
```

This will make the code skip `/api/ghost` and try other patterns.

