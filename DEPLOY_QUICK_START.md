# 🚀 Quick Deployment Steps

## Backend (Railway) - 5 minutes

1. **Go to [railway.app](https://railway.app)** → Sign up/login
2. **New Project** → **Deploy from GitHub** → Select your repo
3. **Settings** → **Root Directory** → Set to `weatherapp-back`
4. **New** → **Database** → **Add PostgreSQL**
5. **Variables** tab → Add these:
   ```
   PORT=3001
   FRONTEND_URL=https://your-frontend.vercel.app (update after frontend deploy)
   WEATHER_API_KEY=your_key
   GOOGLE_API_KEY=your_key
   ```
6. **Database** → **Variables** → Copy PostgreSQL vars:
   ```
   PG_HOST=${{Postgres.PGHOST}}
   PG_USER=${{Postgres.PGUSER}}
   PG_PASSWORD=${{Postgres.PGPASSWORD}}
   PG_DATABASE=${{Postgres.PGDATABASE}}
   PG_PORT=${{Postgres.PGPORT}}
   ```
7. **Copy your backend URL** (e.g., `https://xxx.up.railway.app`)

## Frontend (Vercel) - 3 minutes

1. **Go to [vercel.com](https://vercel.com)** → Sign up/login
2. **Add New Project** → Import your GitHub repo
3. **Root Directory**: `weatherApp front`
4. **Framework Preset**: Vite (auto-detected)
5. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
6. **Deploy**

## Update Backend CORS

Go back to Railway → **Variables** → Update:
```
FRONTEND_URL=https://your-app.vercel.app
```

## ✅ Done! Your app is live!

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.

