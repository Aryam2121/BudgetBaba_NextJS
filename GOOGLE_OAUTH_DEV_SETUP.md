# Google OAuth Development Setup Guide

## Issue: Access Blocked - App Not Verified

The "Access blocked" error occurs because your Google OAuth app hasn't completed Google's verification process. For development, you need to configure the OAuth consent screen and add test users.

## Step-by-Step Setup

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"

### 2. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (for testing with real Gmail accounts)
3. Fill in the required fields:
   - **App name**: Smart Expense Tracker
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
   - **App domain** (optional for testing)
   - **Authorized domains** (optional for testing)

### 3. Add Scopes
1. Click "Add or Remove Scopes"
2. Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile` 
   - `../auth/gmail.send`
3. Save and continue

### 4. Add Test Users (CRITICAL FOR DEVELOPMENT)
1. In the "Test users" section, click "Add Users"
2. Add the Gmail addresses you want to test with:
   - `aryamangupta1421@gmail.com`
   - Add any other test email addresses
3. Save the changes

### 5. Configure OAuth Client
1. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
2. Choose "Web application"
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `http://127.0.0.1:3000/auth/google/callback`
4. Save and copy the Client ID and Client Secret

### 6. Update Environment Variables
Add these to your `.env` file:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_URL=http://localhost:3000
```

### 7. Publish App for Testing
1. Go back to "OAuth consent screen"
2. Click "Publish App" 
3. Choose "Make available to test users only"

## Important Notes

- **Test Users Only**: Only emails added to the "Test users" list can access the OAuth flow
- **Development Mode**: The app stays in "Testing" mode until you submit for verification
- **Gmail API**: Make sure Gmail API is enabled in "APIs & Services" > "Library"
- **Verification Not Required**: You don't need Google verification for development with test users

## Testing the Flow

1. Start your development server
2. Go to the login page
3. Click "Continue with Google"  
4. Sign in with a test user email
5. Grant permissions for email and profile access
6. You should be redirected back to your app successfully

## Troubleshooting

- **Still getting 403**: Make sure your email is in the test users list
- **Invalid redirect URI**: Check that your redirect URI matches exactly
- **API not enabled**: Enable Gmail API in Google Cloud Console
- **Wrong client ID**: Verify environment variables are correct

The key is adding your Gmail address (`aryamangupta1421@gmail.com`) to the test users list in the OAuth consent screen!