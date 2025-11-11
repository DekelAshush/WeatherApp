# Weather App Deployment Guide

This guide will help you deploy both the frontend and backend of your weather app.

## Prerequisites
- GitHub account
- Accounts for deployment platforms (see below)

---

## 🎯 Deployment Strategy

### Frontend: **Vercel** (Recommended) or Netlify
### Backend: **Railway** (Recommended) or Render
### Database: **Railway PostgreSQL** or **Supabase** (Free tier available)

---

## 📦 Part 1: Deploy Backend (Railway)

### Step 1: Prepare Backend for Deployment

1. **Create a `Procfile` or update `package.json`** (already done - uses `start` script)

2. **Update CORS in `server.js`** to allow your frontend URL

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select your repository
4. Select the **`weatherapp-back`** folder as the root directory
5. Railway will auto-detect Node.js

### Step 3: Set Up PostgreSQL Database on Railway

1. In your Railway project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will create a PostgreSQL database automatically
3. Copy the connection details (you'll need them for environment variables)

### Step 4: Configure Environment Variables on Railway

In Railway project → **Variables** tab, add:

```
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
WEATHER_API_KEY=your_openweather_api_key
GOOGLE_API_KEY=your_google_api_key
PG_HOST=your_railway_db_host
PG_USER=your_railway_db_user
PG_PASSWORD=your_railway_db_password
PG_DATABASE=your_railway_db_name
PG_PORT=5432
```

**Note:** Railway provides these automatically if you use their PostgreSQL. Check the database service → **Variables** tab.

### Step 5: Get Your Backend URL

After deployment, Railway will provide a URL like: `https://your-app-name.up.railway.app`

**Copy this URL** - you'll need it for the frontend!

---

## 🌐 Part 2: Deploy Frontend (Vercel)

### Step 1: Update Frontend Environment Variable

Update `weatherApp front/.env` or create `weatherApp front/.env.production`:

```
VITE_API_URL=https://your-backend-url.railway.app
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Connect your GitHub account and select your repository
4. Configure:
   - **Root Directory**: `weatherApp front`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app`
6. Click **"Deploy"**

### Step 3: Update Backend CORS

Go back to Railway → Your backend project → **Variables**:
- Update `FRONTEND_URL` to your Vercel URL: `https://your-app.vercel.app`

---

## 🔄 Alternative: Deploy Backend to Render

If you prefer Render over Railway:

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo
4. Configure:
   - **Name**: `weatherapp-backend`
   - **Root Directory**: `weatherapp-back`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Create PostgreSQL database: **"New +"** → **"PostgreSQL"**

---

## 📝 Quick Checklist

- [ ] Backend deployed to Railway/Render
- [ ] PostgreSQL database created
- [ ] Backend environment variables configured
- [ ] Backend URL obtained
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable (`VITE_API_URL`) set
- [ ] Backend CORS updated with frontend URL
- [ ] Test the deployed app!

---

## 🐛 Troubleshooting

### Backend Issues:
- **Database connection fails**: Check PostgreSQL connection string in environment variables
- **CORS errors**: Ensure `FRONTEND_URL` matches your frontend domain exactly
- **Port issues**: Railway/Render sets PORT automatically, don't hardcode it

### Frontend Issues:
- **API calls fail**: Check `VITE_API_URL` is set correctly in Vercel environment variables
- **Build fails**: Check Node.js version compatibility

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

