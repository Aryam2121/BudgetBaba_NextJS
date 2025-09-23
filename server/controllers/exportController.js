const Expense = require("../models/Expense")
const Split = require("../models/Split")
const Budget = require("../models/Budget")
const Goal = require("../models/Goal")
const RecurringTransaction = require("../models/RecurringTransaction")
const Notification = require("../models/Notification")
const { createNotification } = require("./notificationController")

// Helper function to convert data to CSV
const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return ''
  
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      // Handle strings with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// Helper function to flatten object for CSV export
const flattenObject = (obj, prefix = '') => {
  const flattened = {}
  
  for (const key in obj) {
    if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
      Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}_`))
    } else if (Array.isArray(obj[key])) {
      flattened[`${prefix}${key}`] = obj[key].join('; ')
    } else {
      flattened[`${prefix}${key}`] = obj[key]
    }
  }
  
  return flattened
}

// Export expenses
const exportExpenses = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      format = 'csv',
      startDate,
      endDate,
      category,
      minAmount,
      maxAmount 
    } = req.body

    // Build filter
    const filter = { userId }
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }
    if (category) filter.category = category
    if (minAmount) filter.amount = { ...filter.amount, $gte: parseFloat(minAmount) }
    if (maxAmount) filter.amount = { ...filter.amount, $lte: parseFloat(maxAmount) }

    const expenses = await Expense.find(filter).sort({ date: -1 })

    if (format === 'csv') {
      const flattenedExpenses = expenses.map(expense => ({
        ...flattenObject(expense.toObject()),
        date: expense.date.toISOString().split('T')[0],
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString()
      }))

      const headers = Object.keys(flattenedExpenses[0] || {})
      const csv = convertToCSV(flattenedExpenses, headers)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.json"`)
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: expenses.length,
        filters: { startDate, endDate, category, minAmount, maxAmount },
        data: expenses
      })
    }

    // Log export activity
    await createNotification(
      userId,
      'data_export',
      'Data Export Completed',
      `Expenses exported successfully (${expenses.length} records, ${format.toUpperCase()} format)`,
      { 
        exportType: 'expenses',
        format,
        recordCount: expenses.length
      }
    )

  } catch (error) {
    console.error("Export expenses error:", error)
    res.status(500).json({ error: "Failed to export expenses" })
  }
}

// Export splits
const exportSplits = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      format = 'csv',
      status,
      startDate,
      endDate 
    } = req.body

    const filter = { 
      $or: [
        { createdBy: userId },
        { 'participants.user': userId }
      ]
    }
    
    if (status) filter.status = status
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    const splits = await Split.find(filter)
      .populate('createdBy', 'name email')
      .populate('participants.user', 'name email')
      .sort({ createdAt: -1 })

    if (format === 'csv') {
      const flattenedSplits = splits.map(split => {
        const splitObj = split.toObject()
        return {
          id: splitObj._id,
          title: splitObj.title,
          description: splitObj.description,
          totalAmount: splitObj.totalAmount,
          status: splitObj.status,
          createdBy_name: splitObj.createdBy?.name,
          createdBy_email: splitObj.createdBy?.email,
          participants: splitObj.participants.map(p => 
            `${p.user?.name} (${p.user?.email}): ₹${p.amountOwed} - ${p.status}`
          ).join('; '),
          createdAt: splitObj.createdAt,
          updatedAt: splitObj.updatedAt
        }
      })

      const headers = Object.keys(flattenedSplits[0] || {})
      const csv = convertToCSV(flattenedSplits, headers)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="splits-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="splits-${new Date().toISOString().split('T')[0]}.json"`)
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: splits.length,
        filters: { status, startDate, endDate },
        data: splits
      })
    }

    await createNotification(
      userId,
      'data_export',
      'Data Export Completed',
      `Splits exported successfully (${splits.length} records, ${format.toUpperCase()} format)`,
      { 
        exportType: 'splits',
        format,
        recordCount: splits.length
      }
    )

  } catch (error) {
    console.error("Export splits error:", error)
    res.status(500).json({ error: "Failed to export splits" })
  }
}

// Export budgets
const exportBudgets = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      format = 'csv',
      isActive,
      period 
    } = req.body

    const filter = { userId }
    if (isActive !== undefined) filter.isActive = isActive
    if (period) filter.period = period

    const budgets = await Budget.find(filter).sort({ startDate: -1 })

    if (format === 'csv') {
      const flattenedBudgets = budgets.map(budget => ({
        ...flattenObject(budget.toObject()),
        startDate: budget.startDate.toISOString().split('T')[0],
        endDate: budget.endDate.toISOString().split('T')[0],
        categories: budget.categories.map(cat => 
          `${cat.category}: ₹${cat.budgetAmount} (Spent: ₹${cat.spentAmount})`
        ).join('; '),
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString()
      }))

      const headers = Object.keys(flattenedBudgets[0] || {})
      const csv = convertToCSV(flattenedBudgets, headers)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="budgets-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="budgets-${new Date().toISOString().split('T')[0]}.json"`)
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: budgets.length,
        filters: { isActive, period },
        data: budgets
      })
    }

    await createNotification(
      userId,
      'data_export',
      'Data Export Completed',
      `Budgets exported successfully (${budgets.length} records, ${format.toUpperCase()} format)`,
      { 
        exportType: 'budgets',
        format,
        recordCount: budgets.length
      }
    )

  } catch (error) {
    console.error("Export budgets error:", error)
    res.status(500).json({ error: "Failed to export budgets" })
  }
}

// Export goals
const exportGoals = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      format = 'csv',
      status,
      type 
    } = req.body

    const filter = { userId }
    if (status) filter.status = status
    if (type) filter.type = type

    const goals = await Goal.find(filter).sort({ targetDate: 1 })

    if (format === 'csv') {
      const flattenedGoals = goals.map(goal => ({
        ...flattenObject(goal.toObject()),
        targetDate: goal.targetDate.toISOString().split('T')[0],
        progress: goal.progress.map(p => 
          `${p.date.toISOString().split('T')[0]}: ₹${p.amount}${p.note ? ` (${p.note})` : ''}`
        ).join('; '),
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString()
      }))

      const headers = Object.keys(flattenedGoals[0] || {})
      const csv = convertToCSV(flattenedGoals, headers)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="goals-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="goals-${new Date().toISOString().split('T')[0]}.json"`)
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: goals.length,
        filters: { status, type },
        data: goals
      })
    }

    await createNotification(
      userId,
      'data_export',
      'Data Export Completed',
      `Goals exported successfully (${goals.length} records, ${format.toUpperCase()} format)`,
      { 
        exportType: 'goals',
        format,
        recordCount: goals.length
      }
    )

  } catch (error) {
    console.error("Export goals error:", error)
    res.status(500).json({ error: "Failed to export goals" })
  }
}

// Export all user data
const exportAllData = async (req, res) => {
  try {
    const userId = req.user._id
    const { format = 'json' } = req.body

    // Get all user data
    const [expenses, splits, budgets, goals, recurring, notifications] = await Promise.all([
      Expense.find({ userId }).sort({ date: -1 }),
      Split.find({ 
        $or: [
          { createdBy: userId },
          { 'participants.user': userId }
        ]
      }).populate('createdBy', 'name email').populate('participants.user', 'name email'),
      Budget.find({ userId }).sort({ startDate: -1 }),
      Goal.find({ userId }).sort({ targetDate: 1 }),
      RecurringTransaction.find({ userId }).sort({ nextDue: 1 }),
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(100)
    ])

    const allData = {
      exportDate: new Date().toISOString(),
      userId,
      summary: {
        expenses: expenses.length,
        splits: splits.length,
        budgets: budgets.length,
        goals: goals.length,
        recurring: recurring.length,
        notifications: notifications.length
      },
      data: {
        expenses,
        splits,
        budgets,
        goals,
        recurringTransactions: recurring,
        notifications
      }
    }

    if (format === 'csv') {
      // For CSV, create a zip file with multiple CSV files
      const JSZip = require('jszip')
      const zip = new JSZip()

      // Add each data type as separate CSV file
      if (expenses.length > 0) {
        const flatExpenses = expenses.map(e => flattenObject(e.toObject()))
        const headers = Object.keys(flatExpenses[0])
        zip.file('expenses.csv', convertToCSV(flatExpenses, headers))
      }

      if (splits.length > 0) {
        const flatSplits = splits.map(s => flattenObject(s.toObject()))
        const headers = Object.keys(flatSplits[0])
        zip.file('splits.csv', convertToCSV(flatSplits, headers))
      }

      if (budgets.length > 0) {
        const flatBudgets = budgets.map(b => flattenObject(b.toObject()))
        const headers = Object.keys(flatBudgets[0])
        zip.file('budgets.csv', convertToCSV(flatBudgets, headers))
      }

      if (goals.length > 0) {
        const flatGoals = goals.map(g => flattenObject(g.toObject()))
        const headers = Object.keys(flatGoals[0])
        zip.file('goals.csv', convertToCSV(flatGoals, headers))
      }

      if (recurring.length > 0) {
        const flatRecurring = recurring.map(r => flattenObject(r.toObject()))
        const headers = Object.keys(flatRecurring[0])
        zip.file('recurring.csv', convertToCSV(flatRecurring, headers))
      }

      // Add summary file
      zip.file('export-summary.txt', 
        `Smart Expense Tracker - Complete Data Export
Export Date: ${allData.exportDate}
User ID: ${userId}

Summary:
- Expenses: ${expenses.length} records
- Splits: ${splits.length} records  
- Budgets: ${budgets.length} records
- Goals: ${goals.length} records
- Recurring Transactions: ${recurring.length} records
- Recent Notifications: ${notifications.length} records

Files included:
${expenses.length > 0 ? '- expenses.csv' : ''}
${splits.length > 0 ? '- splits.csv' : ''}
${budgets.length > 0 ? '- budgets.csv' : ''}
${goals.length > 0 ? '- goals.csv' : ''}
${recurring.length > 0 ? '- recurring.csv' : ''}`)

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
      
      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', `attachment; filename="smart-expense-tracker-export-${new Date().toISOString().split('T')[0]}.zip"`)
      res.send(zipBuffer)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="smart-expense-tracker-export-${new Date().toISOString().split('T')[0]}.json"`)
      res.json(allData)
    }

    await createNotification(
      userId,
      'data_export',
      'Complete Data Export',
      `All data exported successfully (${Object.values(allData.summary).reduce((a, b) => a + b, 0)} total records, ${format.toUpperCase()} format)`,
      { 
        exportType: 'complete',
        format,
        summary: allData.summary
      }
    )

  } catch (error) {
    console.error("Export all data error:", error)
    res.status(500).json({ error: "Failed to export all data" })
  }
}

// Get export history (from notifications)
const getExportHistory = async (req, res) => {
  try {
    const userId = req.user._id
    const { page = 1, limit = 20 } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [exportHistory, total] = await Promise.all([
      Notification.find({ 
        userId, 
        type: 'data_export' 
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
      Notification.countDocuments({ 
        userId, 
        type: 'data_export' 
      })
    ])

    res.json({
      exportHistory,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    })
  } catch (error) {
    console.error("Get export history error:", error)
    res.status(500).json({ error: "Failed to get export history" })
  }
}

// Generate comprehensive report
const generateReport = async (req, res) => {
  try {
    const userId = req.user._id
    const { 
      reportType = 'monthly',
      startDate,
      endDate,
      includeCharts = false
    } = req.body

    let start, end
    const now = new Date()

    switch (reportType) {
      case 'weekly':
        start = new Date(now.setDate(now.getDate() - 7))
        end = new Date()
        break
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), quarter * 3, 1)
        end = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        break
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
        break
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.setDate(now.getDate() - 30))
        end = endDate ? new Date(endDate) : new Date()
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    // Get data for the report period
    const [expenses, splits, budgets, goals] = await Promise.all([
      Expense.find({ 
        userId, 
        date: { $gte: start, $lte: end } 
      }).sort({ date: -1 }),
      Split.find({ 
        $or: [
          { createdBy: userId },
          { 'participants.user': userId }
        ],
        createdAt: { $gte: start, $lte: end }
      }),
      Budget.find({ 
        userId,
        startDate: { $lte: end },
        endDate: { $gte: start }
      }),
      Goal.find({ 
        userId,
        $or: [
          { createdAt: { $gte: start, $lte: end } },
          { 'progress.date': { $gte: start, $lte: end } }
        ]
      })
    ])

    // Calculate summary statistics
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const avgDailyExpense = expenses.length > 0 ? totalExpenses / ((end - start) / (1000 * 60 * 60 * 24)) : 0
    
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    const report = {
      reportType,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      generatedAt: new Date().toISOString(),
      summary: {
        totalExpenses,
        expenseCount: expenses.length,
        avgDailyExpense,
        avgExpenseAmount: expenses.length > 0 ? totalExpenses / expenses.length : 0,
        splitsCount: splits.length,
        activeBudgets: budgets.filter(b => b.isActive).length,
        activeGoals: goals.filter(g => g.status === 'active').length
      },
      categoryAnalysis: {
        breakdown: categoryBreakdown,
        topCategories: topCategories.map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
      },
      budgetPerformance: budgets.map(budget => ({
        name: budget.name,
        totalAmount: budget.totalAmount,
        totalSpent: budget.totalSpent,
        utilization: budget.utilizationPercentage,
        status: budget.status
      })),
      goalProgress: goals.map(goal => ({
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        completionPercentage: goal.completionPercentage,
        status: goal.status
      })),
      insights: []
    }

    // Add insights
    if (report.summary.avgDailyExpense > 1000) {
      report.insights.push("Your daily average spending is quite high. Consider reviewing your expenses.")
    }

    if (topCategories.length > 0) {
      const topCategory = topCategories[0]
      if (topCategory[1] > totalExpenses * 0.4) {
        report.insights.push(`${topCategory[0]} accounts for ${((topCategory[1] / totalExpenses) * 100).toFixed(1)}% of your expenses. Consider if this is optimal.`)
      }
    }

    const overBudgetCount = budgets.filter(b => b.status === 'exceeded').length
    if (overBudgetCount > 0) {
      report.insights.push(`You have ${overBudgetCount} budget(s) that exceeded their limits.`)
    }

    res.json(report)

    await createNotification(
      userId,
      'report_generated',
      'Report Generated',
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`,
      { 
        reportType,
        period: report.period,
        totalExpenses: report.summary.totalExpenses
      }
    )

  } catch (error) {
    console.error("Generate report error:", error)
    res.status(500).json({ error: "Failed to generate report" })
  }
}

module.exports = {
  exportExpenses,
  exportSplits,
  exportBudgets,
  exportGoals,
  exportAllData,
  getExportHistory,
  generateReport
}