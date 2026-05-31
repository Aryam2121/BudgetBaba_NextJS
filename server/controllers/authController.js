const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { google } = require("googleapis")
const {
  resolveFrontendOrigin,
  parseOAuthState,
  buildOAuthState,
  getRedirectUri,
  createOAuth2Client,
  assertGoogleOAuthConfigured,
  normalizeOrigin,
  isAllowedOrigin,
} = require("../config/googleOAuth")

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      currency: "INR",
    })

    await user.save()

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

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency || "INR",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error during login" })
  }
}

const googleAuth = async (req, res) => {
  try {
    assertGoogleOAuthConfigured()

    const origin = resolveFrontendOrigin(req)
    const redirectUri = getRedirectUri(origin)
    const oauth2Client = createOAuth2Client(redirectUri)

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GOOGLE_SCOPES,
      prompt: "consent",
      state: buildOAuthState(origin),
      redirect_uri: redirectUri,
    })

    res.json({ authUrl, redirectUri })
  } catch (error) {
    console.error("Google auth error:", error)
    const message = error.message || "Failed to initiate Google authentication"
    const status = message.includes("not configured") ? 503 : message.includes("Unauthorized") ? 400 : 500
    res.status(status).json({ error: message })
  }
}

const googleCallback = async (req, res) => {
  try {
    assertGoogleOAuthConfigured()

    const { code, origin, state } = req.body

    if (!code) {
      return res.status(400).json({ error: "Authorization code required" })
    }

    let resolvedOrigin = parseOAuthState(state)

    if (!resolvedOrigin && origin) {
      const normalizedOrigin = normalizeOrigin(origin)
      if (!isAllowedOrigin(normalizedOrigin)) {
        return res.status(400).json({ error: "Invalid frontend origin" })
      }
      resolvedOrigin = normalizedOrigin
    }

    if (!resolvedOrigin) {
      resolvedOrigin = resolveFrontendOrigin(req)
    }

    const redirectUri = getRedirectUri(resolvedOrigin)
    const oauth2Client = createOAuth2Client(redirectUri)

    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    })
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    if (!userInfo.email || !userInfo.verified_email) {
      return res.status(400).json({ error: "Email not verified with Google" })
    }

    let user = await User.findOne({ email: userInfo.email })

    if (!user) {
      user = new User({
        name: userInfo.name,
        email: userInfo.email,
        googleId: userInfo.id,
        avatar: userInfo.picture,
        passwordHash: Math.random().toString(36).slice(-12),
        currency: "INR",
        emailConnections: {
          gmail: {
            connected: true,
            email: userInfo.email,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            scope: tokens.scope || "email profile",
            connectedAt: new Date(),
          },
        },
        emailPreferences: {
          sendFromPersonalEmail: true,
          preferredProvider: "gmail",
          splitNotifications: true,
          settlementNotifications: true,
          reminderNotifications: true,
        },
      })
    } else {
      if (!user.emailConnections) user.emailConnections = {}
      if (!user.emailPreferences) user.emailPreferences = {}

      user.googleId = user.googleId || userInfo.id
      if (userInfo.picture) user.avatar = userInfo.picture

      user.emailConnections.gmail = {
        connected: true,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope || "email profile",
        connectedAt: new Date(),
      }
      user.emailPreferences.sendFromPersonalEmail = true
      user.emailPreferences.preferredProvider = "gmail"
    }

    await user.save()

    const token = generateToken(user._id)

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency || "INR",
        emailConnections: {
          gmail: {
            connected: user.emailConnections.gmail.connected,
            email: user.emailConnections.gmail.email,
          },
        },
      },
    })
  } catch (error) {
    console.error("Google callback error:", error)
    res.status(500).json({
      error: "Failed to process Google authentication",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  googleCallback,
}
