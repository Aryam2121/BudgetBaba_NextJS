const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { google } = require('googleapis')

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// Google OAuth setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`
)

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Create user
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      currency: 'INR', // Default to Indian Rupees
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Server error during registration" })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency || 'INR', // Default to INR if not set
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error during login" })
  }
}

// Google OAuth login initiation
const googleAuth = async (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
        // Note: Gmail scope removed temporarily to avoid verification requirement
        // 'https://www.googleapis.com/auth/gmail.send'
      ],
      prompt: 'consent'
    })

    res.json({ authUrl })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ error: 'Failed to initiate Google authentication' })
  }
}

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    if (!userInfo.email || !userInfo.verified_email) {
      return res.status(400).json({ error: 'Email not verified with Google' })
    }

    // Find or create user
    let user = await User.findOne({ email: userInfo.email })
    
    if (!user) {
      // Create new user
      user = new User({
        name: userInfo.name,
        email: userInfo.email,
        googleId: userInfo.id,
        avatar: userInfo.picture,
        passwordHash: Math.random().toString(36).slice(-12),
        currency: 'INR', // Default to Indian Rupees
        emailConnections: {
          gmail: {
            connected: true,
            email: userInfo.email,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            scope: tokens.scope || 'email profile',
            connectedAt: new Date()
          }
        },
        emailPreferences: {
          sendFromPersonalEmail: true,
          preferredProvider: 'gmail',
          splitNotifications: true,
          settlementNotifications: true,
          reminderNotifications: true
        }
      })
    } else {
      if (!user.emailConnections) user.emailConnections = {}
      if (!user.emailPreferences) user.emailPreferences = {}

      user.googleId = user.googleId || userInfo.id
      if (userInfo.picture) user.avatar = userInfo.picture

      // Update existing user with Gmail connection
      user.emailConnections.gmail = {
        connected: true,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope || 'email profile',
        connectedAt: new Date()
      }
      user.emailPreferences.sendFromPersonalEmail = true
      user.emailPreferences.preferredProvider = 'gmail'
    }

    await user.save()

    // Generate JWT token
    const token = generateToken(user._id)

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency || 'INR', // Default to INR if not set
        emailConnections: {
          gmail: {
            connected: user.emailConnections.gmail.connected,
            email: user.emailConnections.gmail.email
          }
        }
      }
    })
  } catch (error) {
    console.error('Google callback error:', error)
    res.status(500).json({
      error: 'Failed to process Google authentication',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  googleCallback,
}
