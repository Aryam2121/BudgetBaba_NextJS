const Expense = require("../models/Expense")

async function checkBudgetAlerts(userId, monthlyBudget) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Get current month expenses
  const monthlyExpenses = await Expense.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  })

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetLeft = monthlyBudget - totalSpent

  const alerts = []

  // Budget exceeded alert
  if (totalSpent >= monthlyBudget && monthlyBudget > 0) {
    alerts.push({
      type: "budget_exceeded",
      message: `You've exceeded your monthly budget of ₹${monthlyBudget}. Total spent: ₹${totalSpent.toFixed(2)}`,
      severity: "high",
    })
  }
  // 90% budget alert
  else if (totalSpent >= monthlyBudget * 0.9 && monthlyBudget > 0) {
    alerts.push({
      type: "budget_warning",
      message: `You've used 90% of your monthly budget. Remaining: ₹${budgetLeft.toFixed(2)}`,
      severity: "medium",
    })
  }

  // Prediction based on daily average
  const daysInMonth = endOfMonth.getDate()
  const daysPassed = now.getDate()
  const daysRemaining = daysInMonth - daysPassed

  if (daysPassed > 0 && daysRemaining > 0) {
    const dailyAverage = totalSpent / daysPassed
    const projectedTotal = totalSpent + dailyAverage * daysRemaining

    if (projectedTotal > monthlyBudget && monthlyBudget > 0) {
      alerts.push({
        type: "budget_prediction",
        message: `At this pace, you'll exceed your budget by ₹${(projectedTotal - monthlyBudget).toFixed(2)} by month-end`,
        severity: "low",
      })
    }
  }

  return {
    totalSpent,
    budgetLeft: Math.max(0, budgetLeft),
    alerts,
    monthlyBudget,
  }
}

async function getCategoryTrends(userId, months = 3) {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1)

  const expenses = await Expense.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          category: "$category",
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

  return expenses
}

module.exports = {
  checkBudgetAlerts,
  getCategoryTrends,
}
