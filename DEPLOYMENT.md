# Deployment Guide - Vercel

## Overview

This project is configured to deploy both the React frontend and Express backend to Vercel as a unified deployment.

## Architecture Changes for Vercel

### What Was Modified:

1. **Split Express App** (`server/src/app.ts` + `server/src/index.ts`)
   - Extracted Express app configuration to `app.ts`
   - Modified `index.ts` to export the app for Vercel and conditionally start server for local dev
   - Vercel treats the exported Express app as a serverless function

2. **Added Vercel Configuration** (`vercel.json`)
   - Routes `/api/*` requests to the Express backend
   - Routes all other requests to the Vite frontend
   - Configured build outputs for both workspaces

3. **Database Already Serverless-Ready**
   - Using `@neondatabase/serverless` with connection pooling
   - No changes needed - Neon is designed for serverless environments

4. **Added Build Script** (`client/package.json`)
   - Added `vercel-build` script for Vercel's build process

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Neon Database**: Your existing Neon Postgres database

## Deployment Steps

### 1. Import Project to Vercel

```bash
# Option A: Using Vercel CLI (recommended)
npm i -g vercel
vercel login
vercel

# Option B: Using Vercel Dashboard
# Go to https://vercel.com/new
# Import your GitHub repository
```

### 2. Configure Build Settings

If using the dashboard, configure:

- **Framework Preset**: Other
- **Root Directory**: Leave empty (monorepo detected automatically)
- **Build Command**: `yarn build` (from root package.json)
- **Output Directory**: Leave empty (configured in vercel.json)
- **Install Command**: `yarn install`

### 3. Set Environment Variables

In Vercel dashboard (Settings → Environment Variables), add:

```bash
# Required
DATABASE_URL=postgresql://[user]:[password]@[neon-host]/[database]?sslmode=require

# Optional (defaults to production)
NODE_ENV=production
```

**Important**:
- Get your `DATABASE_URL` from Neon dashboard
- Make sure it includes `?sslmode=require` for serverless connections
- Add this to all environments (Production, Preview, Development)

### 4. Deploy

```bash
# Using CLI
vercel --prod

# Or push to main branch (auto-deploys if GitHub integration enabled)
git push origin main
```

## Vercel Configuration Explained

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "client/dist" }
    },
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ]
}
```

- **builds**: Defines how to build frontend (static) and backend (Node.js serverless)
- **routes**: API requests → backend, everything else → frontend

## Local Development (Unchanged)

Local development works exactly as before:

```bash
# Terminal 1: Start backend (http://localhost:3001)
cd server
yarn dev

# Terminal 2: Start frontend (http://localhost:5173)
cd client
yarn dev

# Or use workspace command from root
yarn dev  # Runs both concurrently
```

The Vite proxy configuration (`client/vite.config.ts`) handles routing `/api` to `localhost:3001`.

## Testing the Deployment

After deployment, Vercel provides a URL (e.g., `https://budget-forecast.vercel.app`).

### Quick Test Checklist:

1. **Frontend loads**: Visit the URL
2. **API works**: Check browser network tab for `/api/forecasts` requests
3. **Database connection**: Balance anchor should load (tests DB connection)
4. **Create entry**: Test creating a one-time entry
5. **Recurring entry**: Test creating a recurring entry
6. **Calendar**: Test date selection and navigation

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'app.js'`
- **Solution**: Ensure TypeScript is compiling to `.js` files with `.js` extensions in imports
- **Check**: `server/tsconfig.json` should have `"module": "ESNext"` or `"NodeNext"`

**Error**: `Type errors in client`
- **Solution**: Run `yarn type-check` locally to see the exact errors
- **Fix**: Address type errors before deploying

### Runtime Errors

**Error**: `ECONNREFUSED` or database connection errors
- **Solution**: Verify `DATABASE_URL` environment variable is set in Vercel
- **Check**: Neon database is active and connection string is correct
- **Verify**: Connection string includes `?sslmode=require`

**Error**: `404 on /api/forecasts`
- **Solution**: Check `vercel.json` routes configuration
- **Verify**: Backend deployed successfully (check Vercel Functions tab)

**Error**: `Function timeout`
- **Solution**: Optimize database queries or increase timeout
- **Check**: Neon connection pooling is working (already configured)

### CORS Issues

**Error**: CORS errors in browser console
- **Solution**: Already configured with `cors()` middleware in `server/src/app.ts`
- **If persists**: Add specific origin to CORS config:
  ```typescript
  app.use(cors({
    origin: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : '*'
  }));
  ```

## Database Migrations

### Running Migrations on Deployed Database

```bash
# Option 1: Push schema changes directly (development)
cd server
DATABASE_URL="your-neon-url" yarn drizzle-kit push

# Option 2: Generate and run migrations (production)
yarn db:generate
DATABASE_URL="your-neon-url" yarn db:migrate
```

**Important**: Always test migrations on a staging database first!

## Preview Deployments

Vercel automatically creates preview deployments for PRs and non-main branches.

### Use Cases:
- Test new features before merging
- Share work-in-progress with stakeholders
- Validate database schema changes safely

Each preview gets its own URL: `https://budget-forecast-git-[branch].vercel.app`

**Tip**: Use a separate Neon database branch for preview deployments to avoid conflicts.

## Environment-Specific Configuration

### Production vs Preview vs Development

Vercel supports three environment types:

```bash
# Production (main branch)
DATABASE_URL=your-production-db-url

# Preview (PRs and other branches)
DATABASE_URL=your-staging-db-url

# Development (local with vercel dev)
DATABASE_URL=your-local-db-url
```

Set different values for each in Vercel dashboard → Settings → Environment Variables.

## Performance Optimization

### Cold Starts

Vercel serverless functions have cold starts (~1-2s for first request).

**Mitigations**:
- Neon serverless driver is optimized for cold starts
- Connection pooling reduces overhead (already configured)
- Consider Vercel Pro for reduced cold starts

### Caching

Frontend is automatically cached by Vercel CDN. API responses can be cached:

```typescript
// In your route handlers
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
- **Analytics**: Page views, performance metrics
- **Speed Insights**: Core Web Vitals
- **Logs**: Function execution logs (Runtime Logs)

### Database Monitoring

Use Neon dashboard to monitor:
- Connection count
- Query performance
- Storage usage

## Cost Considerations

### Vercel Hobby (Free) Limits:
- 100 GB bandwidth/month
- 100 hours function execution/month
- Unlimited deployments
- 6,000 function invocations/day (144,000/month)

### When to Upgrade:
- Exceeding free tier limits
- Need for faster cold starts
- Team collaboration features
- Custom domains on preview deployments

## Rollback Strategy

If a deployment breaks production:

```bash
# Option 1: Revert in Vercel Dashboard
# Go to Deployments → Find working deployment → Promote to Production

# Option 2: Revert git commit and push
git revert HEAD
git push origin main
```

## Next Steps

1. **Custom Domain**: Add your domain in Vercel dashboard → Settings → Domains
2. **SSL Certificate**: Vercel provides automatic HTTPS
3. **CI/CD**: Already configured via GitHub integration
4. **Monitoring**: Enable Vercel Analytics for production insights
5. **Staging Environment**: Create a `staging` branch for pre-production testing

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Express Apps](https://vercel.com/guides/using-express-with-vercel)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
