# Serverless Function Deployment Guide

## ✅ Solution: No Backend Needed!

I've created serverless functions that deploy **with your frontend**. No separate backend required!

## What Was Created

1. **Vercel Function**: `api/ghost/[...path].js` - Works automatically on Vercel
2. **Netlify Function**: `netlify/functions/ghost-proxy.js` - Works automatically on Netlify
3. **Configuration files**: `vercel.json` and `netlify.toml`

## How It Works

- Frontend requests: `/api/ghost/posts/?key=...`
- Serverless function proxies to: `http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me/ghost/api/content/posts/?key=...`
- Returns JSON to frontend

## Deployment

### Option A: Vercel (Recommended)

1. **Deploy to Vercel:**
   ```bash
   # If using Vercel CLI
   npm i -g vercel
   vercel
   
   # Or connect your GitHub repo to Vercel
   ```

2. **Set Environment Variable:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `GHOST_URL` = `http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me`
   - (Optional - already set in vercel.json)

3. **Deploy!** The function will work automatically at `/api/ghost/*`

### Option B: Netlify

1. **Deploy to Netlify:**
   ```bash
   # If using Netlify CLI
   npm i -g netlify-cli
   netlify deploy --prod
   
   # Or connect your GitHub repo to Netlify
   ```

2. **Set Environment Variable:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `GHOST_URL` = `http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me`
   - (Optional - already set in netlify.toml)

3. **Deploy!** The function will work automatically

### Option C: Other Platforms

If using other platforms (Cloudflare Pages, etc.), you can adapt the Vercel function code.

## Testing

After deployment, test the endpoint:

```bash
curl "https://your-domain.com/api/ghost/posts/?key=5e5376cf1889a8f439def11710&limit=1"
```

Should return JSON with posts.

## Frontend Changes

✅ **Already done!** The frontend code is updated to use `/api/ghost` first.

## What You Need to Do

1. **Deploy your project** to Vercel or Netlify
2. **That's it!** The serverless function will be deployed automatically

## Environment Variables

Only needed if different from default:

- `GHOST_URL` - Your Ghost instance URL (already set in config files)

## Troubleshooting

### Function Not Working?

1. Check function logs in Vercel/Netlify dashboard
2. Test the endpoint directly: `curl https://your-domain.com/api/ghost/posts/?key=...`
3. Verify `GHOST_URL` environment variable is set

### 502 Errors?

- Check that Ghost instance is accessible from serverless function
- Verify Ghost URL is correct in environment variables

### CORS Errors?

- Should not happen - serverless function handles CORS automatically

## Benefits

- ✅ No separate backend needed
- ✅ Deploys with frontend
- ✅ Automatic scaling
- ✅ Free tier available on Vercel/Netlify
- ✅ Handles CORS automatically
- ✅ Works with self-signed certificates (traefik.me)

