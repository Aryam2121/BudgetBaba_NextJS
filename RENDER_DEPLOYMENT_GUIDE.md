# 🚀 Render Deployment Guide for Smart Expense Tracker

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **MongoDB Atlas**: Set up a MongoDB database at [cloud.mongodb.com](https://cloud.mongodb.com)
4. **Environment Variables**: Prepare all required credentials

---

## 🔧 Step 1: Prepare Your Environment Variables

You'll need the following environment variables for Render:

```bash
# Server Configuration
NODE_ENV=production
PORT=10000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-characters

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.onrender.com/api/auth/google/callback

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (Important for CORS)
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🚀 Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Push render.yaml to your repository** (already created)
2. **Go to Render Dashboard**: https://dashboard.render.com
3. **Click "New +"** → **"Blueprint"**
4. **Connect your GitHub repository**
5. **Render will automatically detect `render.yaml`**
6. **Click "Apply"** to create the service

### Option B: Manual Setup

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   ```yaml
   Name: expense-tracker-api
   Region: Oregon (or your preferred region)
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free (or your preferred plan)
   ```

5. **Add Environment Variables** (copy from Step 1 above)
6. **Click "Create Web Service"**

---

## 🔒 Step 3: Configure MongoDB Atlas

### Allow Render IP Addresses

1. Go to **MongoDB Atlas Dashboard**
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add Render's specific IP ranges for better security
5. Click **Confirm**

### Test Connection

```bash
# Test MongoDB connection from your local machine
mongosh "mongodb+srv://cluster.mongodb.net/expense-tracker" --username yourUsername
```

---

## 🌐 Step 4: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add Authorized Redirect URIs:
   ```
   https://your-app.onrender.com/api/auth/google/callback
   ```
5. Add Authorized JavaScript Origins:
   ```
   https://your-app.onrender.com
   ```
6. Click **Save**

---

## ✅ Step 5: Verify Deployment

### Check Health Endpoint

```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Check Logs

1. Go to your service in Render Dashboard
2. Click on **"Logs"** tab
3. Look for:
   ```
   Connected to MongoDB Atlas successfully
   Server running on 0.0.0.0:10000
   Environment: production
   Socket.IO enabled for real-time updates
   Scheduler service started successfully
   ```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Application failed to respond"

**Solution:**
- Check if server is listening on `0.0.0.0` (not `localhost`)
- Verify PORT is set to `10000` or using `process.env.PORT`
- Check logs for MongoDB connection errors

### Issue 2: "CORS Error"

**Solution:**
- Add your frontend URL to `FRONTEND_URL` environment variable
- Update `allowedOrigins` in server.js
- Make sure credentials: true is set in CORS config

### Issue 3: "MongoDB Connection Failed"

**Solution:**
- Verify MongoDB URI is correct
- Check MongoDB Atlas Network Access allows Render IPs (0.0.0.0/0)
- Ensure database user has correct permissions

### Issue 4: "Build Failed"

**Solution:**
- Make sure `package.json` is in the `server/` directory
- Verify all dependencies are listed in `package.json`
- Check Node version compatibility (use Node 18+)

### Issue 5: "Health Check Failing"

**Solution:**
- Verify `/api/health` endpoint is accessible
- Check if server is running on the correct port
- Update healthcheck.js to use `0.0.0.0` instead of `localhost`

---

## 📊 Step 6: Monitor Your Application

### Render Dashboard

- **Metrics**: CPU, Memory, Request count
- **Logs**: Real-time application logs
- **Events**: Deployment history
- **Shell**: Direct access to your container

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Add your email for deployment notifications
3. Enable alerts for:
   - Deployment failures
   - Service downtime
   - High memory usage

---

## 🚀 Step 7: Deploy Frontend (Optional)

If you want to deploy the frontend separately:

### Deploy to Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/smart-expense-tracker
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

### Update Backend CORS

After deploying frontend, update `FRONTEND_URL`:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔄 Step 8: Continuous Deployment

Render automatically deploys when you push to your connected branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render will automatically:
# 1. Pull latest code
# 2. Run build command
# 3. Deploy new version
# 4. Run health checks
```

---

## 📝 Environment Variables Checklist

Copy this checklist when setting up environment variables in Render:

- [ ] `NODE_ENV` = production
- [ ] `PORT` = 10000
- [ ] `HOST` = 0.0.0.0
- [ ] `MONGODB_URI` = your MongoDB connection string
- [ ] `JWT_SECRET` = strong secret (min 32 characters)
- [ ] `REFRESH_TOKEN_SECRET` = strong secret (min 32 characters)
- [ ] `GOOGLE_CLIENT_ID` = your Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` = your Google OAuth secret
- [ ] `GOOGLE_REDIRECT_URI` = https://your-app.onrender.com/api/auth/google/callback
- [ ] `FRONTEND_URL` = your frontend URL
- [ ] `EMAIL_HOST` = smtp.gmail.com (if using email)
- [ ] `EMAIL_PORT` = 587
- [ ] `EMAIL_USER` = your email
- [ ] `EMAIL_PASS` = your app password

---

## 🎯 Testing Your Deployment

### Test Authentication

```bash
# Test register
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Test login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Test Protected Routes

```bash
# Get user profile (requires token)
curl https://your-app.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 Security Best Practices

1. **Never commit secrets** to GitHub
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable MongoDB IP whitelist** (don't use 0.0.0.0/0 in production if possible)
4. **Use HTTPS only** (Render provides free SSL)
5. **Rotate secrets regularly**
6. **Monitor logs** for suspicious activity
7. **Set up rate limiting** (already configured in your app)
8. **Enable 2FA** on Render and MongoDB accounts

---

## 📞 Support & Troubleshooting

### Render Documentation
- https://render.com/docs

### MongoDB Atlas Documentation
- https://docs.atlas.mongodb.com

### Check Render Status
- https://status.render.com

### Community Support
- Render Community: https://community.render.com
- Stack Overflow: Tag `render-platform`

---

## 🎉 Success!

If all steps are completed, your Smart Expense Tracker backend should be:

✅ Deployed on Render
✅ Connected to MongoDB Atlas
✅ Google OAuth working
✅ Health checks passing
✅ CORS configured correctly
✅ SSL certificate enabled
✅ Real-time Socket.IO working
✅ Scheduled tasks running

**Your API URL:** `https://your-app.onrender.com`

---

## 📈 Next Steps

1. **Set up monitoring** with Render metrics
2. **Configure custom domain** (optional)
3. **Set up CI/CD** for automated testing
4. **Add error tracking** (e.g., Sentry)
5. **Optimize performance** based on metrics
6. **Scale up** if needed (upgrade from free tier)

---

## 🆘 Quick Fixes

### Restart Service
```bash
# In Render Dashboard
Click "Manual Deploy" → "Clear build cache & deploy"
```

### View Real-time Logs
```bash
# In Render Dashboard
Go to Logs tab → Enable "Live tail"
```

### SSH into Container (Paid plans only)
```bash
# In Render Dashboard
Go to Shell tab
```

---

**Last Updated:** January 2024
**Render Free Tier Limits:** 
- 750 hours/month
- Spins down after 15 minutes of inactivity
- Cold starts take ~30 seconds

For production use, consider upgrading to a paid plan for:
- No spin down
- Faster performance
- Better support
- SSH access
