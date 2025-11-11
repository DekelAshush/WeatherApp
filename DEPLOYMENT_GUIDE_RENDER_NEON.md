# Weather App Deployment Guide - Render + Neon + Vercel

This guide will help you deploy your weather app with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon PostgreSQL

---

## 📦 Part 1: Set Up Neon PostgreSQL Database

### Step 1: Create Neon Account and Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click **"Create Project"**
3. Choose a project name (e.g., "weatherapp")
4. Select a region closest to you
5. Click **"Create Project"**

### Step 2: Get Database Connection String

1. After project creation, you'll see the **Connection Details**
2. Copy the **Connection String** (it looks like: `postgresql://user:password@host/database?sslmode=require`)
3. **Important**: Also note down these individual values:
   - **Host** (e.g., `ep-xxx-xxx.us-east-2.aws.neon.tech`)
   - **Database** (usually `neondb`)
   - **User** (your username)
   - **Password** (your password)
   - **Port** (usually `5432`)

### Step 3: Test Connection (Optional)

You can test the connection using any PostgreSQL client or the Neon SQL Editor.

---

## 🚀 Part 2: Deploy Backend to Render

### Step 1: Prepare Backend for Render

Your backend is already configured correctly! No changes needed.

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository: `DekelAshush/WeatherApp`
5. Configure the service:
   - **Name**: `weatherapp-backend` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `master` (or `main` if that's your default)
   - **Root Directory**: `weatherapp-back`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free tier is fine to start

### Step 3: Configure Environment Variables on Render

In the Render dashboard → Your service → **Environment** tab, add these variables:

```
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
WEATHER_API_KEY=your_openweather_api_key
GOOGLE_API_KEY=your_google_api_key
PG_HOST=your_neon_host
PG_USER=your_neon_user
PG_PASSWORD=your_neon_password
PG_DATABASE=neondb
PG_PORT=5432
```

**For Neon, use the values from Step 2:**
- `PG_HOST`: The host from Neon connection string (e.g., `ep-xxx-xxx.us-east-2.aws.neon.tech`)
- `PG_USER`: Your Neon username
- `PG_PASSWORD`: Your Neon password
- `PG_DATABASE`: Usually `neondb` (check your Neon dashboard)
- `PG_PORT`: `5432`

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. Wait for deployment to complete (usually 2-5 minutes)
4. Once deployed, Render will provide a URL like: `https://weatherapp-backend.onrender.com`
5. **Copy this URL** - you'll need it for the frontend!

### Step 5: Test Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see: `{"ok":true}`

---

## 🌐 Part 3: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variable

The frontend code already uses `VITE_API_URL` - we just need to set it in Vercel.

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"** → **"Import Git Repository"**
3. Connect your GitHub account if not already connected
4. Select your repository: `DekelAshush/WeatherApp`
5. Configure the project:
   - **Project Name**: `weatherapp` (or any name)
   - **Root Directory**: `weatherApp front` (IMPORTANT!)
   - **Framework Preset**: Vite (should auto-detect)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)

### Step 3: Add Environment Variable

Before deploying, click **"Environment Variables"** and add:

- **Key**: `VITE_API_URL`
- **Value**: `https://your-backend-url.onrender.com` (from Render)
- **Environment**: Production, Preview, Development (select all)

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Wait for deployment (usually 1-2 minutes)
4. Once deployed, Vercel will provide a URL like: `https://weatherapp.vercel.app`
5. **Copy this URL** - you'll need it to update backend CORS!

---

## 🔄 Part 4: Update Backend CORS

Now that you have your frontend URL, update the backend CORS:

1. Go back to Render dashboard → Your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy with the new CORS settings

---

## ✅ Part 5: Initialize Database Tables

The database tables will be created automatically when the backend starts, but you can verify:

1. Go to your Neon dashboard → **SQL Editor**
2. Run this query to check if the table exists:
   ```sql
   SELECT * FROM weather_history LIMIT 1;
   ```
3. If you get an error, the table will be created on the first API call

---

## 🧪 Testing Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: Visit `https://your-backend.onrender.com/api/health`
3. **Test Weather API**: Try searching for a location in your app
4. **Check Database**: Go to Neon SQL Editor and query `weather_history` table

---

## 📝 Environment Variables Summary

### Render (Backend):
```
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
WEATHER_API_KEY=your_key
GOOGLE_API_KEY=your_key
PG_HOST=ep-xxx-xxx.us-east-2.aws.neon.tech
PG_USER=your_neon_user
PG_PASSWORD=your_neon_password
PG_DATABASE=neondb
PG_PORT=5432
```

### Vercel (Frontend):
```
VITE_API_URL=https://your-backend.onrender.com
```

### Neon (Database):
- Connection details are in your Neon dashboard
- Use the individual values (host, user, password, database, port) for Render env vars

---

## 🐛 Troubleshooting

### Backend Issues:
- **Database connection fails**: 
  - Double-check all PG_* environment variables in Render
  - Ensure Neon database is running (check Neon dashboard)
  - Verify SSL mode (Neon requires SSL)
  
- **CORS errors**: 
  - Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
  - Check browser console for specific CORS error messages
  
- **Build fails**: 
  - Check Render build logs for errors
  - Ensure `Root Directory` is set to `weatherapp-back`

### Frontend Issues:
- **API calls fail**: 
  - Check `VITE_API_URL` is set correctly in Vercel
  - Verify backend URL is accessible (test `/api/health` endpoint)
  - Check browser console for network errors

- **Build fails**: 
  - Check Vercel build logs
  - Ensure `Root Directory` is set to `weatherApp front`

### Database Issues:
- **Table not created**: 
  - Check Render logs for database initialization errors
  - Manually create table using Neon SQL Editor if needed
  - Ensure database connection string is correct

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Neon Connection Guide](https://neon.tech/docs/connect/connect-from-any-app)

---

## 💡 Pro Tips

1. **Free Tier Limits**:
   - Render: Free tier services spin down after 15 minutes of inactivity
   - Neon: Free tier has generous limits, perfect for development
   - Vercel: Free tier is excellent for frontend hosting

2. **Performance**:
   - First request to Render free tier may be slow (cold start)
   - Consider upgrading to paid tier for production if needed

3. **Monitoring**:
   - Use Render logs to debug backend issues
   - Use Vercel analytics for frontend performance
   - Use Neon dashboard to monitor database usage

---

**Your app should now be live! 🎉**

