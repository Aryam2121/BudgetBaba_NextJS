const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Subscription name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billingCycle: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    default: 'Subscriptions'
  },
  icon: {
    type: String,
    default: 'Repeat'
  },
  color: {
    type: String,
    default: '#8B5CF6'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  reminderDays: {
    type: Number,
    default: 3,
    min: 0
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  website: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  billingHistory: [{
    date: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid'
    }
  }]
}, {
  timestamps: true
})

// Indexes
subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index({ userId: 1, nextBillingDate: 1 })

// Calculate next billing date based on cycle
subscriptionSchema.methods.calculateNextBillingDate = function(fromDate) {
  const date = new Date(fromDate || this.nextBillingDate)
  
  switch (this.billingCycle) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
  }
  
  return date
}

// Calculate annual cost
subscriptionSchema.methods.getAnnualCost = function() {
  const multipliers = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    yearly: 1
  }
  
  return this.amount * (multipliers[this.billingCycle] || 12)
}

// Check if renewal is due soon
subscriptionSchema.methods.isDueSoon = function(days = 3) {
  const daysUntilRenewal = Math.ceil((this.nextBillingDate - new Date()) / (1000 * 60 * 60 * 24))
  return daysUntilRenewal <= days && daysUntilRenewal >= 0
}

// Add billing history entry
subscriptionSchema.methods.addBillingEntry = function(amount, status = 'paid') {
  this.billingHistory.push({
    date: new Date(),
    amount: amount || this.amount,
    status
  })
  
  if (status === 'paid') {
    this.totalPaid += amount || this.amount
    this.nextBillingDate = this.calculateNextBillingDate()
  }
}

module.exports = mongoose.model('Subscription', subscriptionSchema)
