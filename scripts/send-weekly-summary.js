const mongoose = require("mongoose")
const User = require("../server/models/User")
const Expense = require("../server/models/Expense")
const { checkBudgetAlerts } = require("../server/utils/budgetChecker")
const mailer = require("../server/utils/mailer")
require("dotenv").config()

async function sendWeeklySummaries() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    const users = await User.find({})
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    for (const user of users) {
      try {
        // Get user's expenses from the last week
        const weeklyExpenses = await Expense.find({
          userId: user._id,
          createdAt: { $gte: oneWeekAgo },
        })

        if (weeklyExpenses.length === 0) {
          console.log(`No expenses for user ${user.email} this week, skipping...`)
          continue
        }

        const totalSpent = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0)

        // Get category breakdown
        const categoryBreakdown = {}
        weeklyExpenses.forEach((expense) => {
          if (!categoryBreakdown[expense.category]) {
            categoryBreakdown[expense.category] = { total: 0, count: 0 }
          }
          categoryBreakdown[expense.category].total += expense.amount
          categoryBreakdown[expense.category].count += 1
        })

        const topCategories = Object.entries(categoryBreakdown)
          .map(([category, data]) => ({ category, ...data }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)

        // Get current budget info
        const budgetInfo = await checkBudgetAlerts(user._id, user.monthlyBudget)

        const weeklyData = {
          totalSpent,
          expenseCount: weeklyExpenses.length,
          topCategories,
          budgetInfo,
        }

        await mailer.sendWeeklySummary(user.email, user.name, weeklyData)
        console.log(`Weekly summary sent to ${user.email}`)

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to send weekly summary to ${user.email}:`, error)
      }
    }

    console.log("Weekly summary sending completed")
  } catch (error) {
    console.error("Weekly summary script failed:", error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run the script
sendWeeklySummaries()
