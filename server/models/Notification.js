const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      'budget_alert', 
      'split_created', 
      'split_paid', 
      'split_reminder',
      'expense_added',
      'monthly_summary',
      'unusual_spending',
      'goal_achieved',
      'system_update'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // For additional context data
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  actionUrl: {
    type: String, // URL for clickable notifications
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
})

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("Notification", notificationSchema)