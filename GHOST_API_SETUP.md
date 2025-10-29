# Ghost API Setup - Complete Guide

## ✅ Solution: Use Public Ghost API Directly

Your Ghost instance is publicly accessible at: **https://blogs.instatax.ai**

## Environment Variables

Update your `.env` file with:

```env
VITE_GHOST_API_URL=https://blogs.instatax.ai
VITE_GHOST_CONTENT_API_KEY=5e5376cf1889a8f439def11710
```

Or if deploying, set these in your deployment platform's environment variables:
- **Vercel/Netlify/etc.:** Add these as environment variables in your project settings

## How It Works Now

1. **Production:** Frontend directly calls `https://blogs.instatax.ai/ghost/api/content/posts/?key=...`
2. **Development:** Vite proxy handles `/api` requests (already configured)
3. **No backend needed:** Direct API access with your API key

## Testing

After setting environment variables, test:

```bash
# In development
npm run dev

# Check browser console - should see:
# [Ghost API] Success with pattern 1: https://blogs.instatax.ai/ghost/api/content
```

## Deployment

1. Set environment variables in your hosting platform:
   - `VITE_GHOST_API_URL=https://blogs.instatax.ai`
   - `VITE_GHOST_CONTENT_API_KEY=5e5376cf1889a8f439def11710`

2. Deploy - it will work automatically!

## CORS Configuration

If you get CORS errors, configure Ghost to allow your domain:

1. In Ghost Admin → Settings → Integrations
2. Under your integration, ensure CORS is configured for: `https://instatax.ai`

## What Changed

- ✅ Code now prioritizes direct Ghost API access
- ✅ Uses public URL: `https://blogs.instatax.ai/ghost/api/content`
- ✅ No serverless functions needed
- ✅ No backend proxy needed
- ✅ Works automatically once environment variables are set

## Troubleshooting

### Still getting errors?

1. **Check environment variables are set:**
   ```bash
   echo $VITE_GHOST_API_URL  # Should show: https://blogs.instatax.ai
   ```

2. **Test Ghost API directly:**
   ```bash
   curl "https://blogs.instatax.ai/ghost/api/content/posts/?key=5e5376cf1889a8f439def11710&limit=1"
   ```
   Should return JSON with posts.

3. **Check browser console** for specific error messages

4. **Verify Ghost allows CORS** for your frontend domain

