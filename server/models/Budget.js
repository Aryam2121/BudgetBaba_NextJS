const mongoose = require("mongoose")

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  period: {
    type: String,
    required: true,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  categories: [{
    category: {
      type: String,
      required: true,
      enum: [
        'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare',
        'Shopping', 'Education', 'Travel', 'Investments', 'Insurance',
        'Rent', 'Subscriptions', 'Other'
      ]
    },
    budgetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    }
  }],
  alertSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    thresholds: [{
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      notified: {
        type: Boolean,
        default: false
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoRollover: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Virtual for total spent amount
budgetSchema.virtual('totalSpent').get(function() {
  return this.categories.reduce((total, cat) => total + cat.spentAmount, 0)
})

// Virtual for budget utilization percentage
budgetSchema.virtual('utilizationPercentage').get(function() {
  return this.totalAmount > 0 ? (this.totalSpent / this.totalAmount) * 100 : 0
})

// Virtual for remaining amount
budgetSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.totalAmount - this.totalSpent)
})

// Virtual for budget status
budgetSchema.virtual('status').get(function() {
  const utilization = this.utilizationPercentage
  if (utilization >= 100) return 'exceeded'
  if (utilization >= 90) return 'critical'
  if (utilization >= 75) return 'warning'
  return 'good'
})

// Virtual for days remaining
budgetSchema.virtual('daysRemaining').get(function() {
  const now = new Date()
  const end = new Date(this.endDate)
  if (end < now) return 0
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
})

// Virtual for days elapsed
budgetSchema.virtual('daysElapsed').get(function() {
  const now = new Date()
  const start = new Date(this.startDate)
  const end = new Date(this.endDate)
  const total = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  const elapsed = Math.ceil((now - start) / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.min(total, elapsed))
})

// Virtual for time progress percentage
budgetSchema.virtual('timeProgressPercentage').get(function() {
  const start = new Date(this.startDate)
  const end = new Date(this.endDate)
  const now = new Date()
  const total = end - start
  const elapsed = now - start
  return total > 0 ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0
})

// Method to check if budget period is current
budgetSchema.methods.isCurrent = function() {
  const now = new Date()
  return now >= this.startDate && now <= this.endDate
}

// Method to check if budget is expired
budgetSchema.methods.isExpired = function() {
  return new Date() > this.endDate
}

// Method to get category by name
budgetSchema.methods.getCategoryBudget = function(categoryName) {
  return this.categories.find(cat => cat.category === categoryName)
}

// Method to update category spent amount
budgetSchema.methods.updateCategorySpent = function(categoryName, amount) {
  const categoryBudget = this.getCategoryBudget(categoryName)
  if (categoryBudget) {
    categoryBudget.spentAmount = Math.max(0, categoryBudget.spentAmount + amount)
    return true
  }
  return false
}

// Method to check if alerts should be triggered
budgetSchema.methods.checkAlerts = function() {
  const alerts = []
  
  if (!this.alertSettings.enabled) return alerts
  
  // Check overall budget alerts
  const utilizationPercentage = this.utilizationPercentage
  this.alertSettings.thresholds.forEach(threshold => {
    if (utilizationPercentage >= threshold.percentage && !threshold.notified) {
      alerts.push({
        type: 'budget_threshold',
        message: `Budget "${this.name}" is ${utilizationPercentage.toFixed(1)}% utilized`,
        threshold: threshold.percentage,
        level: threshold.percentage >= 100 ? 'critical' : threshold.percentage >= 90 ? 'high' : 'medium'
      })
      threshold.notified = true
    }
  })
  
  // Check category alerts
  this.categories.forEach(category => {
    const categoryUtilization = category.budgetAmount > 0 
      ? (category.spentAmount / category.budgetAmount) * 100 
      : 0
    
    if (categoryUtilization >= category.alertThreshold) {
      alerts.push({
        type: 'category_threshold',
        message: `Category "${category.category}" is ${categoryUtilization.toFixed(1)}% of budget`,
        category: category.category,
        utilization: categoryUtilization,
        level: categoryUtilization >= 100 ? 'critical' : 'medium'
      })
    }
  })
  
  return alerts
}

// Indexes for performance
budgetSchema.index({ userId: 1, isActive: 1 })
budgetSchema.index({ userId: 1, startDate: -1 })
budgetSchema.index({ startDate: 1, endDate: 1 })
budgetSchema.index({ period: 1 })

// Set virtuals to be included in JSON
budgetSchema.set('toJSON', { virtuals: true })
budgetSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Budget', budgetSchema)