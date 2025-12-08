# ✅ DEPLOYMENT CHECKLIST

Use this checklist to deploy your app step by step!

## Before You Start

- [ ] All code is committed to git
- [ ] Have GitHub account (free)
- [ ] Have Railway account (free - railway.app)
- [ ] Have Vercel account (free - vercel.com)

---

## Step 1: Push to GitHub (5 min)

- [ ] Create new repo on github.com
- [ ] Copy repo URL
- [ ] Run: `git remote add origin [YOUR-REPO-URL]`
- [ ] Run: `git push -u origin main`
- [ ] Verify code is visible on GitHub

---

## Step 2: Deploy Backend to Railway (10 min)

- [ ] Go to railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Wait for initial deploy to complete

### Add PostgreSQL Database
- [ ] Click "+ New" in project
- [ ] Select "Database" → "PostgreSQL"
- [ ] Database auto-connects

### Configure Settings
- [ ] Go to project Settings
- [ ] Set "Root Directory" = `backend`
- [ ] Set "Start Command" = `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`

### Add Environment Variables
- [ ] Go to "Variables" tab
- [ ] Add: `DJANGO_SETTINGS_MODULE` = `core.production`
- [ ] Add: `DEBUG` = `False`
- [ ] Add: `SECRET_KEY` = [Generate using: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`]
- [ ] Add: `PYTHONUNBUFFERED` = `1`

### Deploy
- [ ] Click "Deploy" (top right)
- [ ] Wait for build to complete
- [ ] Copy your Railway URL (e.g., `https://verified-revenue-saas-production.up.railway.app`)
- [ ] Test: Visit `[YOUR-RAILWAY-URL]/api/` - should see API

---

## Step 3: Deploy Frontend to Vercel (5 min)

- [ ] Go to vercel.com
- [ ] Click "Add New" → "Project"
- [ ] Import your GitHub repository
- [ ] Configure:
  - [ ] Framework Preset: "Vite"
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`

### Add Environment Variable
- [ ] Go to "Environment Variables"
- [ ] Add: `VITE_API_BASE` = `[YOUR-RAILWAY-URL]/api`
  - Example: `https://verified-revenue-saas-production.up.railway.app/api`

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 min)
- [ ] Copy your Vercel URL (e.g., `https://verified-revenue-saas.vercel.app`)

---

## Step 4: Update CORS (2 min)

- [ ] Go back to Railway
- [ ] Go to "Variables"
- [ ] Update or add:
  - [ ] `CORS_ALLOWED_ORIGINS` = `[YOUR-VERCEL-URL]`
    - Example: `https://verified-revenue-saas.vercel.app`
- [ ] Redeploy Railway project

---

## Step 5: Create Admin User (2 min)

- [ ] In Railway dashboard, go to your project
- [ ] Click "..." → "New Service" → "Run Command"
- [ ] Run: `python manage.py createsuperuser`
- [ ] Enter username, email, password
- [ ] Admin created!

---

## Step 6: Test Everything (10 min)

- [ ] Visit your Vercel URL
- [ ] Test login/signup
- [ ] Add a company
- [ ] Book an ad
- [ ] Check "My Ads" dashboard
- [ ] Verify ad appears on homepage
- [ ] Test click tracking
- [ ] Check admin panel: `[YOUR-RAILWAY-URL]/admin`

---

## Step 7: Share Your App! 🎉

Your app is live! Share these URLs:

**Public URL**: `[YOUR-VERCEL-URL]`
**Admin Panel**: `[YOUR-RAILWAY-URL]/admin`

### Share On:
- [ ] Twitter/X
- [ ] LinkedIn
- [ ] Product Hunt
- [ ] Hacker News
- [ ] Reddit (r/SideProject)
- [ ] IndieHackers
- [ ] Your network!

### Sample Post:
```
🚀 I just launched a SaaS revenue verification platform!

✅ Browse verified startup revenues
✅ See who's crushing it
✅ Book advertisements
✅ Real-time analytics

Check it out: [YOUR-VERCEL-URL]

Built with Django + React, deployed for FREE on @railway & @vercel

Feedback welcome! 🙏
```

---

## Troubleshooting

### Frontend can't reach backend?
- [ ] Check `VITE_API_BASE` in Vercel env vars
- [ ] Verify CORS settings in Railway
- [  ] Check browser console for errors
- [ ] Try: `https://[RAILWAY-URL]/api/` directly

### Database errors?
- [ ] Railway: Run `python manage.py migrate`
- [ ] Check PostgreSQL is connected
- [ ] View logs in Railway dashboard

### Static files 404?
- [ ] Railway: Run `python manage.py collectstatic --noinput`

### Still stuck?
- [ ] Check Railway logs
- [ ] Check Vercel logs
- [ ] Read full guide: DEPLOYMENT_GUIDE.md

---

## 🎊 CONGRATULATIONS!

You've successfully deployed your app to the internet!

### What You Achieved:
✅ App live and publicly accessible
✅ Free hosting (Railway + Vercel)
✅ HTTPS/SSL included
✅ PostgreSQL database
✅ Auto-deployments on git push
✅ Shareable link

### Next Steps:
1. Gather user feedback
2. Add more features
3. Share everywhere
4. Iterate and improve!

---

**Your journey from local to global is complete! 🌍✨**
