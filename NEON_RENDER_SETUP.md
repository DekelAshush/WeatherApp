# Neon Database Setup for Render

## Your Neon Connection String:
```
postgresql://neondb_owner:npg_nWS6A8HRxTmF@ep-frosty-sun-add1ndia-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## Option 1: Use Connection String (EASIEST) ✅ Recommended

### In Render Dashboard:

1. Go to your Render service → **Environment** tab
2. Add this variable:

**Key:** `DATABASE_URL`  
**Value:** `postgresql://neondb_owner:npg_nWS6A8HRxTmF@ep-frosty-sun-add1ndia-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

That's it! The updated `knex.js` will automatically use this connection string.

---

## Option 2: Use Individual Parameters

If you prefer to set individual environment variables:

### In Render Dashboard → Environment Variables:

**Key:** `PG_HOST`  
**Value:** `ep-frosty-sun-add1ndia-pooler.c-2.us-east-1.aws.neon.tech`

**Key:** `PG_USER`  
**Value:** `neondb_owner`

**Key:** `PG_PASSWORD`  
**Value:** `npg_nWS6A8HRxTmF`

**Key:** `PG_DATABASE`  
**Value:** `neondb`

**Key:** `PG_PORT`  
**Value:** `5432`

**Key:** `PG_SSL`  
**Value:** `true`

---

## Complete Render Environment Variables List

Add these to your Render service:

```
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
WEATHER_API_KEY=your_openweather_api_key
GOOGLE_API_KEY=your_google_api_key

# Option 1: Use connection string (recommended)
DATABASE_URL=postgresql://neondb_owner:npg_nWS6A8HRxTmF@ep-frosty-sun-add1ndia-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# OR Option 2: Use individual parameters
# PG_HOST=ep-frosty-sun-add1ndia-pooler.c-2.us-east-1.aws.neon.tech
# PG_USER=neondb_owner
# PG_PASSWORD=npg_nWS6A8HRxTmF
# PG_DATABASE=neondb
# PG_PORT=5432
# PG_SSL=true
```

---

## ⚠️ Important Notes:

1. **Use Option 1 (DATABASE_URL)** - It's simpler and the code already supports it
2. **Don't use both options** - Choose either DATABASE_URL OR individual PG_* variables
3. **Update FRONTEND_URL** after deploying frontend to Vercel
4. **Save changes** - Render will automatically redeploy when you save environment variables

---

## ✅ After Adding Variables:

1. Render will automatically redeploy
2. Check the logs to ensure database connection is successful
3. The `weather_history` table will be created automatically on first API call


