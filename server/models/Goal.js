const mongoose = require("mongoose")

const progressEntrySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
  }
})

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['savings', 'spending_limit', 'debt_payoff', 'investment', 'emergency_fund'],
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String, // For spending limit goals
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  progress: [progressEntrySchema],
  reminderFrequency: {
    type: String,
    enum: ['none', 'weekly', 'monthly'],
    default: 'monthly',
  },
  autoSave: {
    enabled: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly'],
    },
    nextDate: {
      type: Date,
    }
  }
}, {
  timestamps: true,
})

// Virtual for completion percentage
goalSchema.virtual('completionPercentage').get(function() {
  return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount) * 100 : 0
})

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date()
  const diffTime = this.targetDate - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for required monthly savings
goalSchema.virtual('requiredMonthlySavings').get(function() {
  const now = new Date()
  const monthsRemaining = Math.max(1, (this.targetDate - now) / (1000 * 60 * 60 * 24 * 30))
  const remainingAmount = this.targetAmount - this.currentAmount
  return remainingAmount / monthsRemaining
})

goalSchema.set('toJSON', { virtuals: true })
goalSchema.index({ userId: 1, status: 1, targetDate: 1 })

module.exports = mongoose.model("Goal", goalSchema)