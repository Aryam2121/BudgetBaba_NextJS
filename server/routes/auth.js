const express = require("express")
const rateLimit = require("express-rate-limit")
const { register, login, googleAuth, googleCallback } = require("../controllers/authController")
const authMiddleware = require("../middleware/auth")
const User = require("../models/User")

const router = express.Router()

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to 100 requests per 15 minutes for better user experience
  message: "Too many authentication attempts, please try again later.",
})

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)

// Google OAuth routes
router.get("/google", googleAuth)
router.post("/google/callback", googleCallback)

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to get profile" })
  }
})

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, currency } = req.body
    const updates = {}

    if (name && typeof name === "string") {
      updates.name = name.trim()
    }

    if (currency) {
      const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'KRW', 'SGD', 'HKD', 'MXN', 'BRL', 'ZAR', 'THB', 'TRY', 'ILS', 'AED', 'SAR']
      if (!supportedCurrencies.includes(currency)) {
        return res.status(400).json({ error: "Valid currency code is required" })
      }
      updates.currency = currency
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-passwordHash")
    res.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" })
    }

    const user = await User.findById(req.user._id)
    if (!user.googleId && !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    user.passwordHash = newPassword
    await user.save()

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Failed to change password" })
  }
})

router.put("/budget", authMiddleware, async (req, res) => {
  try {
    const { monthlyBudget } = req.body
    const userId = req.user._id

    if (typeof monthlyBudget !== "number" || monthlyBudget < 0) {
      return res.status(400).json({ error: "Valid monthly budget is required" })
    }

    const user = await User.findByIdAndUpdate(userId, { monthlyBudget }, { new: true }).select("-passwordHash")

    res.json({
      message: "Budget updated successfully",
      user,
    })
  } catch (error) {
    console.error("Budget update error:", error)
    res.status(500).json({ error: "Failed to update budget" })
  }
})

// Update user currency
router.put("/currency", authMiddleware, async (req, res) => {
  try {
    const { currency } = req.body
    const userId = req.user._id

    // List of supported currencies
    const supportedCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'KRW', 'SGD', 'HKD', 'MXN', 'BRL', 'ZAR', 'THB', 'TRY', 'ILS', 'AED', 'SAR']

    if (!currency || !supportedCurrencies.includes(currency)) {
      return res.status(400).json({ error: "Valid currency code is required" })
    }

    const user = await User.findByIdAndUpdate(userId, { currency }, { new: true }).select("-passwordHash")

    res.json({
      message: "Currency updated successfully",
      user,
    })
  } catch (error) {
    console.error("Currency update error:", error)
    res.status(500).json({ error: "Failed to update currency" })
  }
})

module.exports = router
