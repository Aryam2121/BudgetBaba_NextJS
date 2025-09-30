# Making Google OAuth Public for All Users

## Current Status
Your app is currently in "Testing" mode, which means only approved test users can sign in.

## To Enable for ALL Users

### Method 1: Publish App (Recommended for Production)

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Select your project: "Expenses Tracker"

2. **OAuth Consent Screen Settings**
   - Go to **APIs & Services** > **OAuth consent screen**
   - Click **PUBLISH APP**
   - Select **"Make app available to all users"**

3. **Required Information for Verification**
   ```
   App Name: Budget Baba
   User Support Email: your-email@gmail.com
   App Logo: [Optional but recommended]
   App Domain: your-domain.com (if you have one)
   Privacy Policy URL: Required for public apps
   Terms of Service URL: Required for public apps
   ```

4. **Submit for Verification**
   - Google will review your app (can take 1-6 weeks)
   - You'll need to provide:
     - Privacy Policy
     - Terms of Service
     - Explanation of why you need Gmail scope

### Method 2: Quick Testing Solution (For Development)

If you want to test with multiple users immediately:

1. **Keep app in Testing mode**
2. **Add test users manually**:
   ```
   aryamangupta1421@gmail.com
   friend1@gmail.com
   friend2@gmail.com
   ... (up to 100 users)
   ```

### Method 3: Temporary Workaround (Not Recommended)

You can temporarily bypass the restriction by:

1. **Change User Type to External**
2. **Don't publish the app** (keep in Testing)
3. **Configure these scopes as "non-sensitive"**:
   ```
   - https://www.googleapis.com/auth/userinfo.email
   - https://www.googleapis.com/auth/userinfo.profile
   ```
4. **For Gmail sending, you'd need to publish**

## Current Scopes in Your App

Your app requests these permissions:
```javascript
scope: [
  'https://www.googleapis.com/auth/userinfo.email',     // Basic - usually allowed
  'https://www.googleapis.com/auth/userinfo.profile',  // Basic - usually allowed  
  'https://www.googleapis.com/auth/gmail.send'         // Sensitive - requires verification
]
```

## Quick Fix for Immediate Testing

**Option A: Remove Gmail Scope Temporarily**
```javascript
// Temporary scope for testing (remove gmail.send)
scope: [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]
```

**Option B: Add Specific Test Users**
1. Go to OAuth consent screen
2. Scroll to "Test users"
3. Add each email that needs access
4. They can now sign in immediately

## Production-Ready Solution

For a real production app, you should:

1. **Create proper legal pages**:
   - Privacy Policy
   - Terms of Service
   
2. **Submit for Google verification**
   
3. **Use domain verification**
   
4. **Implement proper error handling**

## What I Recommend for You Right Now

Since you want immediate access for all users:

1. **Add test users manually** (quickest solution)
2. **Start the verification process** (for long-term solution)
3. **Consider removing Gmail scope temporarily** if you just want login to work

Would you like me to help you with any of these approaches?