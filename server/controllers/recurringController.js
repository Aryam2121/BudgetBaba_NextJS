const RecurringTransaction = require("../models/RecurringTransaction")
const Expense = require("../models/Expense")
const { createNotification } = require("./notificationController")

// Get recurring transactions
const getRecurringTransactions = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      isActive = 'true',
      type,
      frequency,
      sort = 'nextDue',
      page = 1,
      limit = 20
    } = req.query

    const filter = { userId }
    if (isActive !== 'all') filter.isActive = isActive === 'true'
    if (type) filter.type = type
    if (frequency) filter.frequency = frequency

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [transactions, total] = await Promise.all([
      RecurringTransaction.find(filter)
        .sort({ [sort]: sort === 'nextDue' ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      RecurringTransaction.countDocuments(filter)
    ])

    // Check for due transactions and upcoming ones
    const now = new Date()
    const upcoming = new Date()
    upcoming.setDate(upcoming.getDate() + 3)

    const dueTransactions = transactions.filter(t => t.nextDue <= now && t.isActive)
    const upcomingTransactions = transactions.filter(t => 
      t.nextDue > now && t.nextDue <= upcoming && t.isActive
    )

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      },
      summary: {
        due: dueTransactions.length,
        upcoming: upcomingTransactions.length,
        total: transactions.length
      }
    })
  } catch (error) {
    console.error("Get recurring transactions error:", error)
    res.status(500).json({ error: "Failed to get recurring transactions" })
  }
}

// Create recurring transaction
const createRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user._id
    const {
      title,
      description,
      amount,
      category,
      type,
      frequency,
      startDate,
      endDate,
      autoProcess = false,
      notifications = { enabled: true, daysBefore: 1 },
      tags = []
    } = req.body

    // Validation
    if (!title || !amount || !category || !type || !frequency || !startDate) {
      return res.status(400).json({ 
        error: "Title, amount, category, type, frequency, and start date are required" 
      })
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" })
    }

    const start = new Date(startDate)
    if (start < new Date()) {
      return res.status(400).json({ error: "Start date cannot be in the past" })
    }

    if (endDate && new Date(endDate) <= start) {
      return res.status(400).json({ error: "End date must be after start date" })
    }

    const recurringTransaction = new RecurringTransaction({
      userId,
      title: title.trim(),
      description: description?.trim(),
      amount: parseFloat(amount),
      category,
      type,
      frequency,
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
      nextDue: start,
      autoProcess,
      notifications: {
        enabled: notifications.enabled,
        daysBefore: Math.max(0, Math.min(30, notifications.daysBefore || 1))
      },
      tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0)
    })

    await recurringTransaction.save()

    // Send creation notification
    await createNotification(
      userId,
      'recurring_created',
      'Recurring Transaction Created',
      `New ${frequency} ${type}: ${title} - ₹${amount.toLocaleString()}`,
      { recurringId: recurringTransaction._id }
    )

    res.status(201).json({ 
      message: "Recurring transaction created successfully", 
      transaction: recurringTransaction 
    })
  } catch (error) {
    console.error("Create recurring transaction error:", error)
    res.status(500).json({ error: "Failed to create recurring transaction" })
  }
}

// Update recurring transaction
const updateRecurringTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const updates = req.body

    // Prevent updating userId and createdExpenses
    delete updates.userId
    delete updates.createdExpenses

    // Validate amount if provided
    if (updates.amount && parseFloat(updates.amount) <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" })
    }

    const transaction = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    )

    if (!transaction) {
      return res.status(404).json({ error: "Recurring transaction not found" })
    }

    // If frequency changed, recalculate next due date
    if (updates.frequency) {
      transaction.nextDue = transaction.calculateNextDue()
      await transaction.save()
    }

    res.json({ 
      message: "Recurring transaction updated successfully", 
      transaction 
    })
  } catch (error) {
    console.error("Update recurring transaction error:", error)
    res.status(500).json({ error: "Failed to update recurring transaction" })
  }
}

// Delete recurring transaction
const deleteRecurringTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const transaction = await RecurringTransaction.findOneAndDelete({ _id: id, userId })

    if (!transaction) {
      return res.status(404).json({ error: "Recurring transaction not found" })
    }

    res.json({ message: "Recurring transaction deleted successfully" })
  } catch (error) {
    console.error("Delete recurring transaction error:", error)
    res.status(500).json({ error: "Failed to delete recurring transaction" })
  }
}

// Process due recurring transactions
const processRecurringTransactions = async (req, res) => {
  try {
    const userId = req.user._id
    const { transactionIds } = req.body

    let filter = { userId, isActive: true }
    if (transactionIds && Array.isArray(transactionIds)) {
      filter._id = { $in: transactionIds }
    } else {
      // Process all due transactions
      filter.nextDue = { $lte: new Date() }
    }

    const dueTransactions = await RecurringTransaction.find(filter)
    const processed = []
    const errors = []

    for (const transaction of dueTransactions) {
      try {
        // Check if should end
        if (transaction.shouldEnd()) {
          transaction.isActive = false
          await transaction.save()
          continue
        }

        // Create expense
        const expense = new Expense({
          userId: transaction.userId,
          amount: transaction.amount,
          category: transaction.category,
          description: `${transaction.title}${transaction.description ? ` - ${transaction.description}` : ''} (Recurring)`,
          date: new Date(),
          tags: [...transaction.tags, 'recurring']
        })

        await expense.save()

        // Update recurring transaction
        transaction.createdExpenses.push({
          expenseId: expense._id,
          date: new Date()
        })
        transaction.lastProcessed = new Date()
        await transaction.updateNextDue()

        processed.push({
          recurringId: transaction._id,
          expenseId: expense._id,
          title: transaction.title,
          amount: transaction.amount
        })

        // Send notification
        await createNotification(
          userId,
          'recurring_processed',
          'Recurring Transaction Processed',
          `${transaction.type === 'expense' ? 'Expense' : 'Income'} added: ${transaction.title} - ₹${transaction.amount.toLocaleString()}`,
          { 
            recurringId: transaction._id,
            expenseId: expense._id 
          }
        )
      } catch (error) {
        console.error(`Error processing transaction ${transaction._id}:`, error)
        errors.push({
          recurringId: transaction._id,
          title: transaction.title,
          error: error.message
        })
      }
    }

    res.json({
      message: "Recurring transactions processed",
      processed,
      errors,
      summary: {
        total: dueTransactions.length,
        successful: processed.length,
        failed: errors.length
      }
    })
  } catch (error) {
    console.error("Process recurring transactions error:", error)
    res.status(500).json({ error: "Failed to process recurring transactions" })
  }
}

// Get recurring analytics
const getRecurringAnalytics = async (req, res) => {
  try {
    const userId = req.user._id

    const transactions = await RecurringTransaction.find({ userId })

    // Basic stats
    const analytics = {
      totalTransactions: transactions.length,
      activeTransactions: transactions.filter(t => t.isActive).length,
      inactiveTransactions: transactions.filter(t => !t.isActive).length,
      totalExpenses: transactions.filter(t => t.type === 'expense').length,
      totalIncome: transactions.filter(t => t.type === 'income').length
    }

    // Monthly projections
    const monthlyProjections = {
      totalExpenses: 0,
      totalIncome: 0,
      netCashFlow: 0
    }

    transactions.filter(t => t.isActive).forEach(transaction => {
      let monthlyAmount = 0
      
      switch (transaction.frequency) {
        case 'daily':
          monthlyAmount = transaction.amount * 30
          break
        case 'weekly':
          monthlyAmount = transaction.amount * 4.33
          break
        case 'monthly':
          monthlyAmount = transaction.amount
          break
        case 'quarterly':
          monthlyAmount = transaction.amount / 3
          break
        case 'yearly':
          monthlyAmount = transaction.amount / 12
          break
      }

      if (transaction.type === 'expense') {
        monthlyProjections.totalExpenses += monthlyAmount
      } else {
        monthlyProjections.totalIncome += monthlyAmount
      }
    })

    monthlyProjections.netCashFlow = monthlyProjections.totalIncome - monthlyProjections.totalExpenses

    // By frequency
    const byFrequency = transactions.reduce((acc, t) => {
      acc[t.frequency] = (acc[t.frequency] || 0) + 1
      return acc
    }, {})

    // By category
    const byCategory = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {})

    // Upcoming due (next 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const upcomingDue = transactions.filter(t => 
      t.isActive && t.nextDue <= nextWeek
    ).map(t => ({
      id: t._id,
      title: t.title,
      amount: t.amount,
      type: t.type,
      nextDue: t.nextDue,
      daysUntilDue: Math.ceil((t.nextDue - new Date()) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => a.daysUntilDue - b.daysUntilDue)

    // Performance metrics
    const totalCreatedExpenses = transactions.reduce((sum, t) => sum + t.createdExpenses.length, 0)
    const avgExpensesPerTransaction = analytics.totalTransactions > 0 
      ? totalCreatedExpenses / analytics.totalTransactions 
      : 0

    // Insights
    const insights = []
    
    if (monthlyProjections.netCashFlow < 0) {
      insights.push("Your recurring expenses exceed income. Consider reviewing your subscriptions.")
    } else if (monthlyProjections.netCashFlow > monthlyProjections.totalIncome * 0.2) {
      insights.push("Great! Your recurring income significantly exceeds expenses.")
    }

    if (upcomingDue.length > 5) {
      insights.push(`You have ${upcomingDue.length} recurring transactions due in the next week.`)
    }

    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.isActive)
    if (expenseTransactions.length > 10) {
      insights.push("You have many recurring expenses. Consider consolidating or canceling unused subscriptions.")
    }

    res.json({
      analytics,
      monthlyProjections,
      byFrequency,
      byCategory,
      upcomingDue,
      insights,
      performance: {
        totalCreatedExpenses,
        avgExpensesPerTransaction: Math.round(avgExpensesPerTransaction * 100) / 100
      }
    })
  } catch (error) {
    console.error("Recurring analytics error:", error)
    res.status(500).json({ error: "Failed to get recurring analytics" })
  }
}

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions,
  getRecurringAnalytics
}