const Expense = require("../models/Expense")
const { categorizeExpense } = require("../utils/categorizer")
const { checkBudgetAlerts } = require("../utils/budgetChecker")
const mailer = require("../utils/mailer")
const User = require("../models/User")

const getExpenses = async (req, res) => {
  try {
    const { from, to, category } = req.query
    const userId = req.user._id

    // Build filter object
    const filter = { userId }

    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = new Date(from)
      if (to) filter.date.$lte = new Date(to)
    }

    if (category && category !== "all") {
      filter.category = category
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 }).limit(100) // Limit to prevent large responses

    res.json({
      expenses,
      total: expenses.length,
    })
  } catch (error) {
    console.error("Get expenses error:", error)
    res.status(500).json({ error: "Failed to fetch expenses" })
  }
}

const addExpense = async (req, res) => {
  try {
    const { amount, date, note, vendor, category } = req.body
    const userId = req.user._id

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" })
    }

    if (!date) {
      return res.status(400).json({ error: "Date is required" })
    }

    // Auto-categorize if category not provided
    const finalCategory = category || categorizeExpense(vendor, note)

    // Create expense
    const expense = new Expense({
      userId,
      amount: Number.parseFloat(amount),
      category: finalCategory,
      vendor: vendor?.trim(),
      note: note?.trim(),
      date: new Date(date),
    })

    await expense.save()

    // Check budget alerts
    const user = await User.findById(userId)
    const budgetInfo = await checkBudgetAlerts(userId, user.monthlyBudget)

    // Send email notification
    try {
      await mailer.sendExpenseNotification(
        user.email,
        {
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          note: expense.note,
          vendor: expense.vendor,
        },
        budgetInfo,
      )
    } catch (emailError) {
      console.error("Email notification failed:", emailError)
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: "Expense added successfully",
      expense,
      budgetInfo,
      emailSent: true,
    })
  } catch (error) {
    console.error("Add expense error:", error)
    res.status(500).json({ error: "Failed to add expense" })
  }
}

const uploadExpenses = async (req, res) => {
  try {
    const userId = req.user._id
    const { expenses } = req.body

    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ error: "Invalid expenses data" })
    }

    const processedExpenses = []
    const errors = []
    const categoryBreakdown = {}

    for (let i = 0; i < expenses.length; i++) {
      try {
        const { amount, date, note, vendor } = expenses[i]

        if (!amount || !date) {
          errors.push(`Row ${i + 1}: Amount and date are required`)
          continue
        }

        const parsedAmount = Number.parseFloat(amount)
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          errors.push(`Row ${i + 1}: Invalid amount`)
          continue
        }

        const category = categorizeExpense(vendor, note)

        const expense = new Expense({
          userId,
          amount: parsedAmount,
          category,
          vendor: vendor?.trim(),
          note: note?.trim(),
          date: new Date(date),
        })

        await expense.save()
        processedExpenses.push(expense)

        // Track category breakdown for summary
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { total: 0, count: 0 }
        }
        categoryBreakdown[category].total += parsedAmount
        categoryBreakdown[category].count += 1
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    // Send enhanced summary email if expenses were processed
    if (processedExpenses.length > 0) {
      try {
        const user = await User.findById(userId)
        const budgetInfo = await checkBudgetAlerts(userId, user.monthlyBudget)

        const totalAmount = processedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        const topCategories = Object.entries(categoryBreakdown)
          .map(([category, data]) => ({ category, ...data }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)

        await mailer.sendBulkUploadNotification(user.email, user.name, {
          totalAmount,
          expenseCount: processedExpenses.length,
          topCategories,
          budgetInfo,
          errorCount: errors.length,
        })
      } catch (emailError) {
        console.error("Bulk upload email failed:", emailError)
      }
    }

    res.json({
      message: "Upload completed",
      processed: processedExpenses.length,
      errors: errors.length,
      errorDetails: errors,
      categoryBreakdown,
    })
  } catch (error) {
    console.error("Upload expenses error:", error)
    res.status(500).json({ error: "Failed to upload expenses" })
  }
}

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get current month expenses
    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          categories: { $addToSet: "$category" },
        },
      },
    ])

    // Get last month expenses for comparison
    const lastMonthExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ])

    // Get user budget info
    const user = await User.findById(userId)
    const monthlyBudget = user.monthlyBudget || 0
    const monthlySpent = currentMonthExpenses[0]?.total || 0
    const remainingBudget = monthlyBudget - monthlySpent

    // Calculate percentage changes
    const lastMonthTotal = lastMonthExpenses[0]?.total || 0
    const expenseChange = lastMonthTotal > 0 ? ((monthlySpent - lastMonthTotal) / lastMonthTotal) * 100 : 0
    
    // Get splits data
    const Split = require("../models/Split")
    const splits = await Split.find({
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId }
      ]
    })

    const pendingSplits = splits.filter(split => 
      split.participants.some(p => !p.isPaid && 
        ((p.userId && p.userId.toString() === userId.toString()) || 
         p.email === user.email))
    ).length

    // Calculate daily average
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const avgDailySpend = monthlySpent / now.getDate()

    res.json({
      totalExpenses: currentMonthExpenses[0]?.count || 0,
      monthlySpent: monthlySpent,
      remainingBudget: remainingBudget,
      savingsRate: monthlyBudget > 0 ? ((remainingBudget / monthlyBudget) * 100) : 0,
      pendingSplits: pendingSplits,
      totalSplits: splits.length,
      categoriesCount: currentMonthExpenses[0]?.categories?.length || 0,
      avgDailySpend: avgDailySpend,
      expenseChange: expenseChange
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ error: "Failed to get dashboard stats" })
  }
}

const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    // Get category-wise totals for current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const categoryTotals = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ])

    // Get monthly trends for last 6 months
    const monthlyTrends = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Get budget info
    const user = await User.findById(userId)
    const budgetInfo = await checkBudgetAlerts(userId, user.monthlyBudget)

    res.json({
      categoryTotals,
      monthlyTrends,
      budgetInfo,
      currentMonth: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    })
  } catch (error) {
    console.error("Monthly summary error:", error)
    res.status(500).json({ error: "Failed to get monthly summary" })
  }
}

module.exports = {
  getExpenses,
  addExpense,
  uploadExpenses,
  getMonthlySummary,
  getDashboardStats,
}
