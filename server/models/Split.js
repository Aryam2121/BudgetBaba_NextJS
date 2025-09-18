const mongoose = require("mongoose")

const splitParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Can be null for external users (non-registered)
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Split amount is required"],
    min: [0.01, "Split amount must be greater than 0"],
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: {
    type: Date,
  },
  emailProvider: {
    type: String,
    enum: ['gmail', 'outlook', 'app'],
  },
  emailFrom: {
    type: String, // The actual email address used to send
  }
})

const splitSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: [true, "Expense ID is required"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Creator ID is required"],
  },
  title: {
    type: String,
    required: [true, "Split title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0.01, "Total amount must be greater than 0"],
  },
  splitType: {
    type: String,
    enum: ["equal", "exact", "percentage"],
    default: "equal",
  },
  participants: [splitParticipantSchema],
  isSettled: {
    type: Boolean,
    default: false,
  },
  settledAt: {
    type: Date,
  },
  // Enhanced tracking for personal email notifications
  emailNotifications: {
    createdNotificationSent: { type: Boolean, default: false },
    createdEmailProvider: { type: String, enum: ['gmail', 'outlook', 'app'] },
    createdEmailFrom: { type: String },
    settlementNotificationsSent: [{ 
      participantEmail: String, 
      sentAt: Date, 
      provider: String, 
      fromEmail: String 
    }],
    remindersSent: [{ 
      participantEmail: String, 
      sentAt: Date, 
      provider: String, 
      fromEmail: String 
    }]
  },
  currency: {
    type: String,
    default: "INR",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
})

// Update the updatedAt field before saving
splitSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Index for efficient queries
splitSchema.index({ createdBy: 1, createdAt: -1 })
splitSchema.index({ expenseId: 1 })
splitSchema.index({ 'participants.email': 1 })
splitSchema.index({ 'participants.userId': 1 })

module.exports = mongoose.model("Split", splitSchema)
