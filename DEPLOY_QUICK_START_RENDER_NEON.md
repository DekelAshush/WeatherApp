# 🚀 Quick Deployment Steps - Render + Neon + Vercel

## Database (Neon) - 2 minutes

1. **Go to [neon.tech](https://neon.tech)** → Sign up/login
2. **Create Project** → Choose name and region
3. **Copy Connection Details**:
   - Host (e.g., `ep-xxx-xxx.us-east-2.aws.neon.tech`)
   - User, Password, Database (`neondb`), Port (`5432`)

## Backend (Render) - 5 minutes

1. **Go to [render.com](https://render.com)** → Sign up/login
2. **New +** → **Web Service** → Connect GitHub → Select repo
3. **Configure**:
   - Name: `weatherapp-backend`
   - Root Directory: `weatherapp-back`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables** → Add:
   ```
   PORT=3001
   FRONTEND_URL=https://your-frontend.vercel.app (update after frontend deploy)
   WEATHER_API_KEY=your_key
   GOOGLE_API_KEY=your_key
   PG_HOST=your_neon_host
   PG_USER=your_neon_user
   PG_PASSWORD=your_neon_password
   PG_DATABASE=neondb
   PG_PORT=5432
   ```
5. **Create Web Service** → Wait for deployment
6. **Copy backend URL** (e.g., `https://xxx.onrender.com`)

## Frontend (Vercel) - 3 minutes

1. **Go to [vercel.com](https://vercel.com)** → Sign up/login
2. **Add New Project** → Import GitHub repo
3. **Configure**:
   - Root Directory: `weatherApp front`
   - Framework: Vite (auto-detected)
4. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. **Deploy** → Wait for deployment
6. **Copy frontend URL** (e.g., `https://xxx.vercel.app`)

## Update Backend CORS - 1 minute

1. **Render Dashboard** → Your backend service → **Environment**
2. **Update** `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. **Save** → Auto-redeploys

## ✅ Done! Your app is live!

**Test it:**
- Frontend: Visit your Vercel URL
- Backend: `https://your-backend.onrender.com/api/health`
- Database: Check Neon SQL Editor

---

**Need detailed instructions?** See `DEPLOYMENT_GUIDE_RENDER_NEON.md`

