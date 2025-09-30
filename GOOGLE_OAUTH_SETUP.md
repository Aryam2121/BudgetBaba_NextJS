# Google OAuth Setup Guide

This guide will help you set up Google OAuth for both login authentication and Gmail API integration in the Budget Baba app.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Required APIs

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Enable the following APIs:
   - **Google+ API** (for user profile information)
   - **Gmail API** (for sending emails from user's Gmail account)

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Budget Baba
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add the following scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/gmail.send`
5. Add test users (during development)
6. Save and continue

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Set the name to "Budget Baba Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain when deploying
6. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - Your production callback URL when deploying
7. Click "Create"

## Step 5: Configure Environment Variables

1. Copy your Client ID and Client Secret from the credentials page
2. Create a `.env` file in your project root (copy from `.env.example`)
3. Set the following variables:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   FRONTEND_URL=http://localhost:3000
   ```

## Step 6: Test the Integration

1. Start your backend server: `cd server && npm run dev`
2. Start your frontend: `npm run dev`
3. Go to `http://localhost:3000/auth/login`
4. Click "Continue with Google"
5. Complete the OAuth flow
6. Create a split expense to test email sending

## Security Notes

- Keep your Client Secret secure and never commit it to version control
- Use environment variables for all sensitive data
- In production, make sure to:
  - Update redirect URIs to your production domain
  - Remove test users and publish the OAuth consent screen
  - Use HTTPS for all redirects

## Troubleshooting

### "redirect_uri_mismatch" Error
- Check that your redirect URI exactly matches what's configured in Google Cloud Console
- Ensure there are no trailing slashes or typos

### "invalid_client" Error
- Verify your Client ID and Client Secret are correct
- Check that the OAuth consent screen is properly configured

### Email Sending Issues
- Ensure Gmail API is enabled
- Check that the user has granted the `gmail.send` scope
- Verify the access token is not expired

### Development vs Production

**Development Setup:**
- Use `http://localhost:3000/auth/google/callback` as redirect URI
- Set FRONTEND_URL to `http://localhost:3000`

**Production Setup:**
- Use `https://yourdomain.com/auth/google/callback` as redirect URI
- Set FRONTEND_URL to `https://yourdomain.com`
- Publish your OAuth consent screen

## Features Enabled

After successful setup, users will be able to:

1. **Sign in with Google**: One-click authentication using their Google account
2. **Automatic Gmail Integration**: Gmail API permissions are granted during login
3. **Personal Email Sending**: Split notifications are sent from the user's own Gmail account
4. **No Additional Setup**: Users don't need to manually connect their Gmail - it's automatic

## Support

If you encounter issues during setup, check:
1. Google Cloud Console error logs
2. Browser developer console for JavaScript errors
3. Server logs for backend API errors
4. Ensure all environment variables are properly set