const Goal = require("../models/Goal")
const Expense = require("../models/Expense")
const { createNotification } = require("./notificationController")

// Get user goals
const getGoals = async (req, res) => {
  try {
    const userId = req.user._id
    const { status, type, sort = 'targetDate' } = req.query

    const filter = { userId }
    if (status) filter.status = status
    if (type) filter.type = type

    const goals = await Goal.find(filter)
      .sort({ [sort]: sort === 'targetDate' ? 1 : -1 })

    // Update completion status for goals that reached target
    for (let goal of goals) {
      if (goal.status === 'active' && goal.currentAmount >= goal.targetAmount) {
        goal.status = 'completed'
        await goal.save()

        // Send completion notification
        await createNotification(
          userId,
          'goal_achieved',
          'Goal Completed! 🎉',
          `Congratulations! You've achieved your goal: ${goal.title}`,
          { goalId: goal._id },
          { priority: 'high' }
        )
      }
    }

    res.json({ goals })
  } catch (error) {
    console.error("Get goals error:", error)
    res.status(500).json({ error: "Failed to get goals" })
  }
}

// Create new goal
const createGoal = async (req, res) => {
  try {
    const userId = req.user._id
    const {
      title,
      description,
      type,
      targetAmount,
      targetDate,
      category,
      priority = 'medium',
      reminderFrequency = 'monthly',
      autoSave
    } = req.body

    // Validation
    if (!title || !type || !targetAmount || !targetDate) {
      return res.status(400).json({ error: "Title, type, target amount, and target date are required" })
    }

    if (new Date(targetDate) <= new Date()) {
      return res.status(400).json({ error: "Target date must be in the future" })
    }

    const goal = new Goal({
      userId,
      title: title.trim(),
      description: description?.trim(),
      type,
      targetAmount: parseFloat(targetAmount),
      targetDate: new Date(targetDate),
      category,
      priority,
      reminderFrequency,
      autoSave: autoSave || { enabled: false }
    })

    await goal.save()

    // Send creation notification
    await createNotification(
      userId,
      'goal_created',
      'New Goal Created',
      `You've set a new goal: ${goal.title} - ₹${goal.targetAmount.toLocaleString()}`,
      { goalId: goal._id }
    )

    res.status(201).json({ message: "Goal created successfully", goal })
  } catch (error) {
    console.error("Create goal error:", error)
    res.status(500).json({ error: "Failed to create goal" })
  }
}

// Update goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const updates = req.body

    // Prevent updating userId
    delete updates.userId

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    )

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" })
    }

    res.json({ message: "Goal updated successfully", goal })
  } catch (error) {
    console.error("Update goal error:", error)
    res.status(500).json({ error: "Failed to update goal" })
  }
}

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const goal = await Goal.findOneAndDelete({ _id: id, userId })

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" })
    }

    res.json({ message: "Goal deleted successfully" })
  } catch (error) {
    console.error("Delete goal error:", error)
    res.status(500).json({ error: "Failed to delete goal" })
  }
}

// Add progress to goal
const addProgress = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { amount, note } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" })
    }

    const goal = await Goal.findOne({ _id: id, userId })

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" })
    }

    // Add progress entry
    goal.progress.push({
      amount: parseFloat(amount),
      note: note?.trim(),
      date: new Date()
    })

    // Update current amount
    goal.currentAmount += parseFloat(amount)

    // Check if goal is completed
    const previousCompletion = goal.completionPercentage
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'completed'
      
      await createNotification(
        userId,
        'goal_achieved',
        'Goal Completed! 🎉',
        `Congratulations! You've achieved your goal: ${goal.title}`,
        { goalId: goal._id },
        { priority: 'high' }
      )
    } else if (goal.completionPercentage >= 50 && previousCompletion < 50) {
      await createNotification(
        userId,
        'goal_milestone',
        'Goal Milestone',
        `Great progress! You're halfway to your goal: ${goal.title}`,
        { goalId: goal._id }
      )
    } else if (goal.completionPercentage >= 75 && previousCompletion < 75) {
      await createNotification(
        userId,
        'goal_milestone',
        'Goal Milestone',
        `Almost there! You're 75% complete on your goal: ${goal.title}`,
        { goalId: goal._id }
      )
    }

    await goal.save()

    res.json({ message: "Progress added successfully", goal })
  } catch (error) {
    console.error("Add progress error:", error)
    res.status(500).json({ error: "Failed to add progress" })
  }
}

// Get goals analytics
const getGoalAnalytics = async (req, res) => {
  try {
    const userId = req.user._id

    // Get all goals
    const goals = await Goal.find({ userId })

    // Calculate analytics
    const analytics = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      totalTargetAmount: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalSavedAmount: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      averageCompletion: goals.length > 0 
        ? goals.reduce((sum, g) => sum + g.completionPercentage, 0) / goals.length 
        : 0,
    }

    // Goals by type
    const goalsByType = goals.reduce((acc, goal) => {
      acc[goal.type] = (acc[goal.type] || 0) + 1
      return acc
    }, {})

    // Goals progress over time (monthly)
    const progressOverTime = {}
    goals.forEach(goal => {
      goal.progress.forEach(entry => {
        const monthKey = `${entry.date.getFullYear()}-${entry.date.getMonth() + 1}`
        progressOverTime[monthKey] = (progressOverTime[monthKey] || 0) + entry.amount
      })
    })

    // Upcoming goals (due within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const upcomingDeadlines = goals.filter(g => 
      g.status === 'active' && 
      g.targetDate <= thirtyDaysFromNow &&
      g.currentAmount < g.targetAmount
    ).map(g => ({
      id: g._id,
      title: g.title,
      daysRemaining: g.daysRemaining,
      completionPercentage: g.completionPercentage,
      requiredDailyProgress: Math.max(0, (g.targetAmount - g.currentAmount) / Math.max(1, g.daysRemaining))
    }))

    // Performance insights
    const completionRate = analytics.totalGoals > 0 
      ? (analytics.completedGoals / analytics.totalGoals) * 100 
      : 0

    const insights = []
    
    if (completionRate >= 80) {
      insights.push("Excellent! You have a high goal completion rate.")
    } else if (completionRate >= 60) {
      insights.push("Good progress on your goals. Keep it up!")
    } else if (completionRate < 40 && analytics.totalGoals > 0) {
      insights.push("Consider reviewing your goals - you might want to adjust targets or timelines.")
    }

    if (upcomingDeadlines.length > 0) {
      insights.push(`You have ${upcomingDeadlines.length} goals with upcoming deadlines.`)
    }

    res.json({
      analytics,
      goalsByType,
      progressOverTime,
      upcomingDeadlines,
      insights,
      completionRate
    })
  } catch (error) {
    console.error("Goal analytics error:", error)
    res.status(500).json({ error: "Failed to get goal analytics" })
  }
}

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addProgress,
  getGoalAnalytics
}