const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  passwordHash: {
    type: String,
    required: function() { return !this.googleId }, // Password not required for OAuth users
    minlength: [6, "Password must be at least 6 characters"],
  },
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allows null values while maintaining uniqueness when present
  },
  avatar: {
    type: String, // Store Google profile picture URL
  },
  monthlyBudget: {
    type: Number,
    default: 0,
    min: [0, "Budget cannot be negative"],
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'KRW', 'SGD', 'HKD', 'MXN', 'BRL', 'ZAR', 'THB', 'TRY', 'ILS', 'AED', 'SAR'],
    trim: true,
  },
  // Email integration fields for personal email sending
  emailConnections: {
    gmail: {
      connected: { type: Boolean, default: false },
      email: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      tokenExpiry: { type: Date },
      scope: { type: String },
      connectedAt: { type: Date }
    },
    outlook: {
      connected: { type: Boolean, default: false },
      email: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      tokenExpiry: { type: Date },
      scope: { type: String },
      connectedAt: { type: Date }
    }
  },
  emailPreferences: {
    sendFromPersonalEmail: { type: Boolean, default: true },
    preferredProvider: { type: String, enum: ['gmail', 'outlook', 'app'], default: 'gmail' },
    splitNotifications: { type: Boolean, default: true },
    settlementNotifications: { type: Boolean, default: true },
    reminderNotifications: { type: Boolean, default: true },
    fallbackToReplyTo: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next()

  try {
    const salt = await bcrypt.genSalt(10) // Reduced from 12 to 10 for better performance
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.passwordHash
  return userObject
}

module.exports = mongoose.model("User", userSchema)
