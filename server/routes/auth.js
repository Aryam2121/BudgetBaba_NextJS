const express = require("express")
const rateLimit = require("express-rate-limit")
const { register, login, googleAuth, googleCallback } = require("../controllers/authController")
const authMiddleware = require("../middleware/auth")
const User = require("../models/User")

const router = express.Router()

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)

// Google OAuth routes
router.get("/google", googleAuth)
router.post("/google/callback", googleCallback)

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
