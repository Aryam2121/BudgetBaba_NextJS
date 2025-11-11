const Subscription = require('../models/Subscription')
const Expense = require('../models/Expense')

// Get all subscriptions for user
exports.getSubscriptions = async (req, res) => {
  try {
    const { status, sort } = req.query
    
    const filter = { userId: req.user.id }
    if (status) filter.status = status

    let sortOptions = { nextBillingDate: 1 }
    if (sort === 'amount') sortOptions = { amount: -1 }
    if (sort === 'name') sortOptions = { name: 1 }

    const subscriptions = await Subscription.find(filter).sort(sortOptions)
    
    // Calculate totals
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
      const multipliers = { daily: 30, weekly: 4.33, monthly: 1, quarterly: 0.33, yearly: 0.083 }
      return sum + (sub.amount * (multipliers[sub.billingCycle] || 1))
    }, 0)
    
    const annualTotal = activeSubscriptions.reduce((sum, sub) => sum + sub.getAnnualCost(), 0)

    res.json({ 
      success: true, 
      subscriptions,
      summary: {
        total: subscriptions.length,
        active: activeSubscriptions.length,
        monthlyTotal: Math.round(monthlyTotal * 100) / 100,
        annualTotal: Math.round(annualTotal * 100) / 100
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get subscription by ID
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' })
    }

    res.json({ success: true, subscription })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Create new subscription
exports.createSubscription = async (req, res) => {
  try {
    const {
      name, description, amount, currency, billingCycle, startDate,
      category, icon, color, reminderDays, website, notes, paymentMethod
    } = req.body

    // Calculate first billing date
    const start = new Date(startDate)
    const subscription = new Subscription({
      userId: req.user.id,
      name,
      description,
      amount,
      currency: currency || req.user.currency || 'USD',
      billingCycle: billingCycle || 'monthly',
      startDate: start,
      nextBillingDate: start,
      category,
      icon,
      color,
      reminderDays,
      website,
      notes,
      paymentMethod
    })

    // Calculate next billing date
    subscription.nextBillingDate = subscription.calculateNextBillingDate(start)
    
    await subscription.save()

    res.status(201).json({ success: true, subscription })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' })
    }

    const allowedUpdates = [
      'name', 'description', 'amount', 'currency', 'billingCycle',
      'category', 'icon', 'color', 'status', 'reminderDays',
      'autoRenew', 'website', 'notes', 'paymentMethod'
    ]

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        subscription[field] = req.body[field]
      }
    })

    // Recalculate next billing if cycle changed
    if (req.body.billingCycle) {
      subscription.nextBillingDate = subscription.calculateNextBillingDate()
    }

    await subscription.save()
    res.json({ success: true, subscription })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Delete subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' })
    }

    await subscription.deleteOne()
    res.json({ success: true, message: 'Subscription deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Process subscription payment
exports.processPayment = async (req, res) => {
  try {
    const { status = 'paid', createExpense = true } = req.body
    
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id
    })

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' })
    }

    // Add billing history
    subscription.addBillingEntry(subscription.amount, status)
    
    // Create expense if requested
    if (createExpense && status === 'paid') {
      const expense = new Expense({
        userId: req.user.id,
        amount: subscription.amount,
        category: subscription.category,
        description: `${subscription.name} - ${subscription.billingCycle} subscription`,
        date: new Date(),
        paymentMethod: subscription.paymentMethod || 'Card'
      })
      await expense.save()
    }

    await subscription.save()

    res.json({ 
      success: true, 
      subscription,
      message: 'Payment processed successfully'
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get upcoming renewals
exports.getUpcomingRenewals = async (req, res) => {
  try {
    const { days = 7 } = req.query
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + parseInt(days))

    const subscriptions = await Subscription.find({
      userId: req.user.id,
      status: 'active',
      nextBillingDate: {
        $gte: new Date(),
        $lte: cutoffDate
      }
    }).sort({ nextBillingDate: 1 })

    res.json({ success: true, subscriptions })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get subscription analytics
exports.getAnalytics = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.user.id
    })

    const active = subscriptions.filter(s => s.status === 'active')
    const paused = subscriptions.filter(s => s.status === 'paused')
    const cancelled = subscriptions.filter(s => s.status === 'cancelled')

    // Group by category
    const byCategory = {}
    active.forEach(sub => {
      if (!byCategory[sub.category]) {
        byCategory[sub.category] = { count: 0, total: 0 }
      }
      byCategory[sub.category].count++
      byCategory[sub.category].total += sub.getAnnualCost() / 12
    })

    // Group by billing cycle
    const byCycle = {}
    active.forEach(sub => {
      if (!byCycle[sub.billingCycle]) {
        byCycle[sub.billingCycle] = { count: 0, total: 0 }
      }
      byCycle[sub.billingCycle].count++
      byCycle[sub.billingCycle].total += sub.amount
    })

    const monthlyTotal = active.reduce((sum, sub) => {
      const multipliers = { daily: 30, weekly: 4.33, monthly: 1, quarterly: 0.33, yearly: 0.083 }
      return sum + (sub.amount * (multipliers[sub.billingCycle] || 1))
    }, 0)

    const annualTotal = active.reduce((sum, sub) => sum + sub.getAnnualCost(), 0)
    const totalPaid = subscriptions.reduce((sum, sub) => sum + sub.totalPaid, 0)

    res.json({
      success: true,
      analytics: {
        counts: {
          total: subscriptions.length,
          active: active.length,
          paused: paused.length,
          cancelled: cancelled.length
        },
        costs: {
          monthly: Math.round(monthlyTotal * 100) / 100,
          annual: Math.round(annualTotal * 100) / 100,
          totalPaid: Math.round(totalPaid * 100) / 100
        },
        byCategory,
        byCycle,
        mostExpensive: active.sort((a, b) => b.amount - a.amount).slice(0, 5)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
