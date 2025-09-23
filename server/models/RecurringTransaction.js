const mongoose = require("mongoose")

const recurringTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare',
      'Shopping', 'Education', 'Travel', 'Investments', 'Insurance',
      'Rent', 'Subscriptions', 'Salary', 'Other'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income']
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  lastProcessed: {
    type: Date
  },
  nextDue: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoProcess: {
    type: Boolean,
    default: false
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    daysBefore: {
      type: Number,
      default: 1,
      min: 0,
      max: 30
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdExpenses: [{
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense'
    },
    date: {
      type: Date
    }
  }]
}, {
  timestamps: true
})

// Calculate next due date based on frequency
recurringTransactionSchema.methods.calculateNextDue = function() {
  const current = this.nextDue || this.startDate
  const next = new Date(current)
  
  switch (this.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  
  return next
}

// Update next due date
recurringTransactionSchema.methods.updateNextDue = function() {
  this.nextDue = this.calculateNextDue()
  return this.save()
}

// Check if transaction is due
recurringTransactionSchema.methods.isDue = function() {
  return new Date() >= this.nextDue
}

// Check if transaction should end
recurringTransactionSchema.methods.shouldEnd = function() {
  return this.endDate && new Date() >= this.endDate
}

// Virtual for frequency display
recurringTransactionSchema.virtual('frequencyDisplay').get(function() {
  const frequencies = {
    daily: 'Daily',
    weekly: 'Weekly', 
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  }
  return frequencies[this.frequency] || this.frequency
})

// Virtual for total created expenses
recurringTransactionSchema.virtual('totalCreatedExpenses').get(function() {
  return this.createdExpenses.length
})

// Virtual for total amount created
recurringTransactionSchema.virtual('totalAmountCreated').get(function() {
  return this.createdExpenses.length * this.amount
})

// Indexes for performance
recurringTransactionSchema.index({ userId: 1, isActive: 1 })
recurringTransactionSchema.index({ nextDue: 1, isActive: 1 })
recurringTransactionSchema.index({ frequency: 1 })
recurringTransactionSchema.index({ category: 1, type: 1 })

// Pre-save middleware
recurringTransactionSchema.pre('save', function(next) {
  if (this.isNew && !this.nextDue) {
    this.nextDue = this.startDate
  }
  next()
})

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema)