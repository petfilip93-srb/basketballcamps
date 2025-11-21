# Deployment Guide - Netlify

## Prerequisites
- GitHub account
- Netlify account (free at https://www.netlify.com)

## Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub (https://github.com/new)
2. In your project folder, run these commands:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub
5. Select your repository
6. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
7. Click "Add environment variables" and add your Supabase credentials:
   - `VITE_SUPABASE_URL` = (your Supabase URL from .env)
   - `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key from .env)
8. Click "Deploy site"

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

## Step 3: Configure Environment Variables

In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add these variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Step 4: Update Supabase URL Configuration

1. Go to your Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Netlify URL to "Site URL" and "Redirect URLs"
   - Example: `https://your-site-name.netlify.app`

## Your Site is Live!

Your basketball camps platform will be available at:
`https://your-site-name.netlify.app`

## Continuous Deployment

Every time you push changes to your GitHub repository, Netlify will automatically rebuild and deploy your site!

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly in Netlify
- Verify your package.json has all required dependencies

### Authentication Issues
- Ensure Supabase URLs are configured correctly
- Check that redirect URLs in Supabase match your Netlify URL

### Images Not Loading
- Verify image paths are correct
- Check that images are included in your git repository

## Custom Domain (Optional)

To add a custom domain:
1. In Netlify Dashboard, go to Domain settings
2. Click "Add custom domain"
3. Follow the instructions to update your DNS settings
