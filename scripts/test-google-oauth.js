const { google } = require('googleapis')
require('dotenv').config()

async function testGoogleOAuth() {
  console.log('🔍 Testing Google OAuth Configuration...\n')
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log('✅ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : '❌ Missing')
  console.log('✅ GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : '❌ Missing')
  console.log('✅ FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Missing')
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('\n❌ Missing required Google OAuth environment variables')
    return
  }
  
  try {
    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL}/auth/google/callback`
    )
    
    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.send'
      ],
      prompt: 'consent'
    })
    
    console.log('\n✅ OAuth Client initialized successfully')
    console.log('✅ Auth URL generated successfully')
    console.log('\n🔗 Test Authorization URL:')
    console.log(authUrl)
    
    console.log('\n📝 Next Steps:')
    console.log('1. Make sure aryamangupta1421@gmail.com is added as a test user in Google Cloud Console')
    console.log('2. Enable Gmail API in Google Cloud Console')
    console.log('3. Ensure OAuth consent screen is published for testing')
    console.log('4. Test the auth URL above in your browser')
    
  } catch (error) {
    console.log('\n❌ OAuth Configuration Error:')
    console.log(error.message)
  }
}

// Run the test
testGoogleOAuth()