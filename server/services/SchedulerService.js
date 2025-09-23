const cron = require('node-cron')
const RecurringTransaction = require('../models/RecurringTransaction')
const Budget = require('../models/Budget')
const Goal = require('../models/Goal')
const Expense = require('../models/Expense')
const { createNotification } = require('../controllers/notificationController')

class SchedulerService {
  constructor(io) {
    this.io = io
    this.jobs = []
    this.initializeSchedulers()
  }

  initializeSchedulers() {
    console.log('Initializing scheduler service...')

    // Process recurring transactions - every hour
    const recurringJob = cron.schedule('0 * * * *', async () => {
      await this.processRecurringTransactions()
    }, {
      scheduled: false
    })

    // Check budget alerts - daily at 9 AM
    const budgetAlertJob = cron.schedule('0 9 * * *', async () => {
      await this.checkBudgetAlerts()
    }, {
      scheduled: false
    })

    // Check goal reminders - daily at 8 AM
    const goalReminderJob = cron.schedule('0 8 * * *', async () => {
      await this.checkGoalReminders()
    }, {
      scheduled: false
    })

    // Send weekly summaries - Sundays at 8 AM
    const weeklyJob = cron.schedule('0 8 * * 0', async () => {
      await this.sendWeeklySummaries()
    }, {
      scheduled: false
    })

    // Clean up old notifications - daily at midnight
    const cleanupJob = cron.schedule('0 0 * * *', async () => {
      await this.cleanupOldNotifications()
    }, {
      scheduled: false
    })

    this.jobs = [
      { name: 'recurring-transactions', job: recurringJob },
      { name: 'budget-alerts', job: budgetAlertJob },
      { name: 'goal-reminders', job: goalReminderJob },
      { name: 'weekly-summaries', job: weeklyJob },
      { name: 'cleanup-notifications', job: cleanupJob }
    ]

    console.log(`${this.jobs.length} scheduled jobs initialized`)
  }

  start() {
    console.log('Starting scheduler service...')
    this.jobs.forEach(({ name, job }) => {
      job.start()
      console.log(`✓ ${name} scheduler started`)
    })
  }

  stop() {
    console.log('Stopping scheduler service...')
    this.jobs.forEach(({ name, job }) => {
      job.stop()
      console.log(`✓ ${name} scheduler stopped`)
    })
  }

  async processRecurringTransactions() {
    try {
      console.log('Processing recurring transactions...')
      
      const dueTransactions = await RecurringTransaction.find({
        isActive: true,
        nextDue: { $lte: new Date() }
      })

      let processedCount = 0
      let errorCount = 0

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
            description: `${transaction.title}${transaction.description ? ` - ${transaction.description}` : ''} (Auto-recurring)`,
            date: new Date(),
            tags: [...transaction.tags, 'recurring', 'auto-processed']
          })

          await expense.save()

          // Update recurring transaction
          transaction.createdExpenses.push({
            expenseId: expense._id,
            date: new Date()
          })
          transaction.lastProcessed = new Date()
          await transaction.updateNextDue()

          // Send notification
          await createNotification(
            transaction.userId,
            'recurring_processed',
            'Recurring Transaction Auto-Processed',
            `${transaction.type === 'expense' ? 'Expense' : 'Income'} added automatically: ${transaction.title} - ₹${transaction.amount.toLocaleString()}`,
            { 
              recurringId: transaction._id,
              expenseId: expense._id,
              isAutoProcessed: true
            }
          )

          // Emit real-time update
          this.io.to(`user-${transaction.userId}`).emit('recurring-processed', {
            recurringId: transaction._id,
            expenseId: expense._id,
            amount: transaction.amount,
            title: transaction.title
          })

          processedCount++
        } catch (error) {
          console.error(`Error processing recurring transaction ${transaction._id}:`, error)
          errorCount++
        }
      }

      if (processedCount > 0 || errorCount > 0) {
        console.log(`Recurring transactions processed: ${processedCount} successful, ${errorCount} failed`)
      }

    } catch (error) {
      console.error('Error in processRecurringTransactions:', error)
    }
  }

  async checkBudgetAlerts() {
    try {
      console.log('Checking budget alerts...')
      
      const currentDate = new Date()
      const activeBudgets = await Budget.find({
        isActive: true,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        'alertSettings.enabled': true
      })

      let alertCount = 0

      for (const budget of activeBudgets) {
        // Update spent amounts
        const expenses = await Expense.find({
          userId: budget.userId,
          date: { $gte: budget.startDate, $lte: budget.endDate }
        })

        budget.categories.forEach(cat => { cat.spentAmount = 0 })
        expenses.forEach(expense => {
          const categoryBudget = budget.getCategoryBudget(expense.category)
          if (categoryBudget) {
            categoryBudget.spentAmount += expense.amount
          }
        })

        // Check for alerts
        const budgetAlerts = budget.checkAlerts()
        
        for (const alert of budgetAlerts) {
          await createNotification(
            budget.userId,
            alert.type,
            alert.type === 'budget_threshold' ? 'Budget Alert' : 'Category Budget Alert',
            alert.message,
            { 
              budgetId: budget._id,
              category: alert.category,
              isScheduledAlert: true
            },
            { priority: alert.level === 'critical' ? 'high' : 'medium' }
          )

          // Emit real-time alert
          this.io.to(`user-${budget.userId}`).emit('budget-alert', {
            budgetId: budget._id,
            budgetName: budget.name,
            ...alert
          })

          alertCount++
        }

        await budget.save()
      }

      if (alertCount > 0) {
        console.log(`Budget alerts sent: ${alertCount}`)
      }

    } catch (error) {
      console.error('Error in checkBudgetAlerts:', error)
    }
  }

  async checkGoalReminders() {
    try {
      console.log('Checking goal reminders...')
      
      const activeGoals = await Goal.find({
        status: 'active'
      })

      let reminderCount = 0

      for (const goal of activeGoals) {
        const daysSinceLastProgress = goal.progress.length > 0 
          ? Math.ceil((new Date() - new Date(goal.progress[goal.progress.length - 1].date)) / (1000 * 60 * 60 * 24))
          : Math.ceil((new Date() - goal.createdAt) / (1000 * 60 * 60 * 24))

        let shouldRemind = false
        let reminderMessage = ''

        // Check if reminder is due based on frequency
        switch (goal.reminderFrequency) {
          case 'daily':
            shouldRemind = daysSinceLastProgress >= 1
            break
          case 'weekly':
            shouldRemind = daysSinceLastProgress >= 7
            break
          case 'monthly':
            shouldRemind = daysSinceLastProgress >= 30
            break
        }

        // Special reminders
        if (goal.daysRemaining <= 7 && goal.completionPercentage < 90) {
          shouldRemind = true
          reminderMessage = `Your goal "${goal.title}" is due in ${goal.daysRemaining} days and is ${goal.completionPercentage.toFixed(1)}% complete.`
        } else if (shouldRemind) {
          reminderMessage = `It's been ${daysSinceLastProgress} days since your last progress on "${goal.title}". Keep going!`
        }

        if (shouldRemind) {
          await createNotification(
            goal.userId,
            'goal_reminder',
            'Goal Reminder',
            reminderMessage,
            { 
              goalId: goal._id,
              isScheduledReminder: true,
              daysSinceProgress: daysSinceLastProgress
            }
          )

          // Emit real-time reminder
          this.io.to(`user-${goal.userId}`).emit('goal-reminder', {
            goalId: goal._id,
            title: goal.title,
            completionPercentage: goal.completionPercentage,
            daysRemaining: goal.daysRemaining,
            message: reminderMessage
          })

          reminderCount++
        }
      }

      if (reminderCount > 0) {
        console.log(`Goal reminders sent: ${reminderCount}`)
      }

    } catch (error) {
      console.error('Error in checkGoalReminders:', error)
    }
  }

  async sendWeeklySummaries() {
    try {
      console.log('Sending weekly summaries...')
      
      // Get all users who have expenses in the last week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const usersWithActivity = await Expense.distinct('userId', {
        date: { $gte: oneWeekAgo }
      })

      let summaryCount = 0

      for (const userId of usersWithActivity) {
        try {
          // Get weekly data
          const [expenses, budgets, goals] = await Promise.all([
            Expense.find({ 
              userId, 
              date: { $gte: oneWeekAgo } 
            }).sort({ date: -1 }),
            Budget.find({ 
              userId,
              isActive: true,
              startDate: { $lte: new Date() },
              endDate: { $gte: oneWeekAgo }
            }),
            Goal.find({ 
              userId,
              status: 'active'
            })
          ])

          const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
          const categoryBreakdown = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount
            return acc
          }, {})

          const topCategory = Object.entries(categoryBreakdown)
            .sort(([,a], [,b]) => b - a)[0]

          let summaryMessage = `Weekly Summary: You spent ₹${totalSpent.toLocaleString()} across ${expenses.length} transactions.`
          
          if (topCategory) {
            summaryMessage += ` Top category: ${topCategory[0]} (₹${topCategory[1].toLocaleString()}).`
          }

          if (budgets.length > 0) {
            const overBudget = budgets.filter(b => b.status === 'exceeded').length
            if (overBudget > 0) {
              summaryMessage += ` ${overBudget} budget(s) exceeded.`
            }
          }

          await createNotification(
            userId,
            'weekly_summary',
            'Weekly Summary',
            summaryMessage,
            { 
              totalSpent,
              transactionCount: expenses.length,
              topCategory: topCategory ? topCategory[0] : null,
              isWeeklySummary: true
            }
          )

          // Emit real-time summary
          this.io.to(`user-${userId}`).emit('weekly-summary', {
            totalSpent,
            transactionCount: expenses.length,
            categoryBreakdown,
            budgetStatus: budgets.map(b => ({
              name: b.name,
              utilization: b.utilizationPercentage,
              status: b.status
            })),
            goalProgress: goals.map(g => ({
              title: g.title,
              completionPercentage: g.completionPercentage
            }))
          })

          summaryCount++
        } catch (error) {
          console.error(`Error generating weekly summary for user ${userId}:`, error)
        }
      }

      if (summaryCount > 0) {
        console.log(`Weekly summaries sent: ${summaryCount}`)
      }

    } catch (error) {
      console.error('Error in sendWeeklySummaries:', error)
    }
  }

  async cleanupOldNotifications() {
    try {
      console.log('Cleaning up old notifications...')
      
      // Delete notifications older than 90 days
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const Notification = require('../models/Notification')
      const result = await Notification.deleteMany({
        createdAt: { $lt: ninetyDaysAgo },
        isRead: true
      })

      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} old notifications`)
      }

    } catch (error) {
      console.error('Error in cleanupOldNotifications:', error)
    }
  }

  // Manual trigger methods for testing
  async triggerRecurringProcess() {
    await this.processRecurringTransactions()
  }

  async triggerBudgetAlerts() {
    await this.checkBudgetAlerts()
  }

  async triggerGoalReminders() {
    await this.checkGoalReminders()
  }

  async triggerWeeklySummaries() {
    await this.sendWeeklySummaries()
  }
}

module.exports = SchedulerService