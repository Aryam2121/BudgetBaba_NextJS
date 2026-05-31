const { google } = require('googleapis');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const crypto = require('crypto-js');
const User = require('../models/User');

class EmailController {
  constructor() {
    // Google OAuth2 Client
    this.googleClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
    );

    // Microsoft MSAL Client - only initialize if credentials are available
    this.msalClient = null;
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
      this.msalConfig = {
        auth: {
          clientId: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          authority: 'https://login.microsoftonline.com/common'
        }
      };
      this.msalClient = new ConfidentialClientApplication(this.msalConfig);
    }
  }

  // Encrypt tokens before storing
  encryptToken(token) {
    const secret = process.env.TOKEN_ENCRYPTION_KEY || 'default-secret-key-change-in-production';
    return crypto.AES.encrypt(token, secret).toString();
  }

  // Decrypt tokens when retrieving
  decryptToken(encryptedToken) {
    if (!encryptedToken) return null;
    try {
      const secret = process.env.TOKEN_ENCRYPTION_KEY || 'default-secret-key-change-in-production';
      const bytes = crypto.AES.decrypt(encryptedToken, secret);
      return bytes.toString(crypto.enc.Utf8);
    } catch (error) {
      console.error('Token decryption failed:', error);
      return null;
    }
  }

  // Gmail OAuth Flow - Step 1: Get authorization URL
  initiateGmailAuth = async (req, res) => {
    try {
      const scopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];

      const authUrl = this.googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: req.user._id.toString(), // Pass user ID in state
        prompt: 'consent' // Force consent to get refresh token
      });

      res.json({ authUrl });
    } catch (error) {
      console.error('Gmail auth initiation failed:', error);
      res.status(500).json({ error: 'Failed to initiate Gmail authentication' });
    }
  }

  // Gmail OAuth Flow - Step 2: Handle callback and store tokens
  handleGmailCallback = async (req, res) => {
    try {
      const { code, state } = req.query;
      const userId = state;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      // Exchange code for tokens
      const { tokens } = await this.googleClient.getToken(code);
      
      // Get user info from Google
      this.googleClient.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.googleClient });
      const userInfo = await oauth2.userinfo.get();

      // Update user with encrypted tokens
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.emailConnections.gmail = {
        connected: true,
        email: userInfo.data.email,
        accessToken: this.encryptToken(tokens.access_token),
        refreshToken: this.encryptToken(tokens.refresh_token),
        tokenExpiry: new Date(tokens.expiry_date),
        scope: tokens.scope,
        connectedAt: new Date()
      };

      // Set preferred provider to Gmail if this is their first connection
      if (user.emailPreferences.preferredProvider === 'app') {
        user.emailPreferences.preferredProvider = 'gmail';
      }

      await user.save();

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?emailConnected=gmail`);
    } catch (error) {
      console.error('Gmail callback failed:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?emailError=gmail`);
    }
  }

  // Outlook OAuth Flow - Step 1: Get authorization URL
  initiateOutlookAuth = async (req, res) => {
    try {
      if (!this.msalClient) {
        return res.status(400).json({ error: 'Outlook OAuth is not configured. Please set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables.' });
      }

      const authCodeUrlParameters = {
        scopes: [
          'https://graph.microsoft.com/Mail.Send',
          'https://graph.microsoft.com/User.Read'
        ],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3001/api/auth/outlook/callback',
        state: req.user._id.toString()
      };

      const authUrl = await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
      res.json({ authUrl });
    } catch (error) {
      console.error('Outlook auth initiation failed:', error);
      res.status(500).json({ error: 'Failed to initiate Outlook authentication' });
    }
  }

  // Outlook OAuth Flow - Step 2: Handle callback and store tokens
  handleOutlookCallback = async (req, res) => {
    try {
      if (!this.msalClient) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?emailError=outlook&reason=not_configured`);
      }

      const { code, state } = req.query;
      const userId = state;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      const tokenRequest = {
        code,
        scopes: [
          'https://graph.microsoft.com/Mail.Send',
          'https://graph.microsoft.com/User.Read'
        ],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3001/api/auth/outlook/callback',
      };

      const response = await this.msalClient.acquireTokenByCode(tokenRequest);
      
      // Get user info from Microsoft Graph
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${response.accessToken}` }
      });
      const userInfo = await userInfoResponse.json();

      // Update user with encrypted tokens
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.emailConnections.outlook = {
        connected: true,
        email: userInfo.mail || userInfo.userPrincipalName,
        accessToken: this.encryptToken(response.accessToken),
        refreshToken: this.encryptToken(response.refreshToken),
        tokenExpiry: new Date(response.expiresOn),
        scope: response.scopes.join(' '),
        connectedAt: new Date()
      };

      // Set preferred provider to Outlook if this is their first connection
      if (user.emailPreferences.preferredProvider === 'app') {
        user.emailPreferences.preferredProvider = 'outlook';
      }

      await user.save();

      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?emailConnected=outlook`);
    } catch (error) {
      console.error('Outlook callback failed:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?emailError=outlook`);
    }
  }

  // Get user's email connection status
  getEmailStatus = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const gmail = user.emailConnections?.gmail || {};
      const outlook = user.emailConnections?.outlook || {};

      const emailStatus = {
        gmail: {
          connected: gmail.connected || false,
          email: gmail.email || null,
          connectedAt: gmail.connectedAt || null,
          tokenExpired: gmail.tokenExpiry ?
            new Date() > gmail.tokenExpiry : false
        },
        outlook: {
          connected: outlook.connected || false,
          email: outlook.email || null,
          connectedAt: outlook.connectedAt || null,
          tokenExpired: outlook.tokenExpiry ?
            new Date() > outlook.tokenExpiry : false
        },
        preferences: user.emailPreferences || {}
      };

      res.json(emailStatus);
    } catch (error) {
      console.error('Get email status failed:', error);
      res.status(500).json({ error: 'Failed to get email status' });
    }
  }

  // Update email preferences
  updateEmailPreferences = async (req, res) => {
    try {
      const { 
        sendFromPersonalEmail, 
        preferredProvider, 
        splitNotifications, 
        settlementNotifications, 
        reminderNotifications, 
        fallbackToReplyTo 
      } = req.body;

      const user = await User.findById(req.user._id);
      
      if (sendFromPersonalEmail !== undefined) {
        user.emailPreferences.sendFromPersonalEmail = sendFromPersonalEmail;
      }
      if (preferredProvider !== undefined) {
        user.emailPreferences.preferredProvider = preferredProvider;
      }
      if (splitNotifications !== undefined) {
        user.emailPreferences.splitNotifications = splitNotifications;
      }
      if (settlementNotifications !== undefined) {
        user.emailPreferences.settlementNotifications = settlementNotifications;
      }
      if (reminderNotifications !== undefined) {
        user.emailPreferences.reminderNotifications = reminderNotifications;
      }
      if (fallbackToReplyTo !== undefined) {
        user.emailPreferences.fallbackToReplyTo = fallbackToReplyTo;
      }

      await user.save();

      res.json({ 
        message: 'Email preferences updated successfully', 
        preferences: user.emailPreferences 
      });
    } catch (error) {
      console.error('Update email preferences failed:', error);
      res.status(500).json({ error: 'Failed to update email preferences' });
    }
  }

  // Disconnect email provider
  disconnectEmailProvider = async (req, res) => {
    try {
      const { provider } = req.params;
      const user = await User.findById(req.user._id);

      if (provider === 'gmail' && user.emailConnections.gmail.connected) {
        user.emailConnections.gmail = {
          connected: false,
          email: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          scope: null,
          connectedAt: null
        };
      } else if (provider === 'outlook' && user.emailConnections.outlook.connected) {
        user.emailConnections.outlook = {
          connected: false,
          email: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          scope: null,
          connectedAt: null
        };
      } else {
        return res.status(400).json({ error: 'Invalid provider or not connected' });
      }

      // If disconnecting the preferred provider, fall back to app
      if (user.emailPreferences.preferredProvider === provider) {
        const otherProvider = provider === 'gmail' ? 'outlook' : 'gmail';
        if (user.emailConnections[otherProvider].connected) {
          user.emailPreferences.preferredProvider = otherProvider;
        } else {
          user.emailPreferences.preferredProvider = 'app';
        }
      }

      await user.save();

      res.json({ 
        message: `${provider} disconnected successfully`,
        preferences: user.emailPreferences
      });
    } catch (error) {
      console.error('Disconnect email provider failed:', error);
      res.status(500).json({ error: 'Failed to disconnect email provider' });
    }
  }

  // Refresh expired tokens
  refreshTokens = async (user, provider) => {
    try {
      if (provider === 'gmail' && user.emailConnections.gmail.refreshToken) {
        const refreshToken = this.decryptToken(user.emailConnections.gmail.refreshToken);
        
        this.googleClient.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.googleClient.refreshAccessToken();
        
        user.emailConnections.gmail.accessToken = this.encryptToken(credentials.access_token);
        user.emailConnections.gmail.tokenExpiry = new Date(credentials.expiry_date);
        
        if (credentials.refresh_token) {
          user.emailConnections.gmail.refreshToken = this.encryptToken(credentials.refresh_token);
        }
        
        await user.save();
        return this.decryptToken(user.emailConnections.gmail.accessToken);
      } else if (provider === 'outlook' && user.emailConnections.outlook.refreshToken) {
        const refreshToken = this.decryptToken(user.emailConnections.outlook.refreshToken);
        
        const tokenRequest = {
          refreshToken,
          scopes: ['https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/User.Read']
        };
        
        const response = await this.msalClient.acquireTokenByRefreshToken(tokenRequest);
        
        user.emailConnections.outlook.accessToken = this.encryptToken(response.accessToken);
        user.emailConnections.outlook.tokenExpiry = new Date(response.expiresOn);
        
        if (response.refreshToken) {
          user.emailConnections.outlook.refreshToken = this.encryptToken(response.refreshToken);
        }
        
        await user.save();
        return this.decryptToken(user.emailConnections.outlook.accessToken);
      }
    } catch (error) {
      console.error(`Failed to refresh ${provider} token:`, error);
      // Mark as disconnected if refresh fails
      user.emailConnections[provider].connected = false;
      await user.save();
      throw error;
    }
    
    return null;
  }

  // Get valid access token (refresh if needed)
  getValidAccessToken = async (user, provider) => {
    const connection = user.emailConnections[provider];
    
    if (!connection.connected) {
      throw new Error(`${provider} is not connected`);
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(connection.tokenExpiry);
    
    if (now >= tokenExpiry) {
      // Token is expired, try to refresh
      return await this.refreshTokens(user, provider);
    }

    // Token is still valid
    return this.decryptToken(connection.accessToken);
  }

  // Test email connection
  testEmailConnection = async (req, res) => {
    try {
      const { provider } = req.params;
      const user = await User.findById(req.user._id);

      const accessToken = await this.getValidAccessToken(user, provider);
      
      // Test the connection by getting user info
      if (provider === 'gmail') {
        this.googleClient.setCredentials({ access_token: accessToken });
        const oauth2 = google.oauth2({ version: 'v2', auth: this.googleClient });
        const userInfo = await oauth2.userinfo.get();
        
        res.json({ 
          success: true, 
          email: userInfo.data.email,
          provider: 'gmail' 
        });
      } else if (provider === 'outlook') {
        const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }
        
        const userInfo = await userInfoResponse.json();
        
        res.json({ 
          success: true, 
          email: userInfo.mail || userInfo.userPrincipalName,
          provider: 'outlook' 
        });
      }
    } catch (error) {
      console.error(`Test ${req.params.provider} connection failed:`, error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        requiresReauth: error.message.includes('expired') || error.message.includes('invalid')
      });
    }
  }
}

module.exports = new EmailController();