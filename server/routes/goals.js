const express = require("express")
const authMiddleware = require("../middleware/auth")
const { 
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addProgress,
  getGoalAnalytics
} = require("../controllers/goalController")

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/goals - Get user goals
router.get("/", getGoals)

// POST /api/goals - Create new goal
router.post("/", createGoal)

// PUT /api/goals/:id - Update goal
router.put("/:id", updateGoal)

// DELETE /api/goals/:id - Delete goal
router.delete("/:id", deleteGoal)

// POST /api/goals/:id/progress - Add progress to goal
router.post("/:id/progress", addProgress)

// GET /api/goals/analytics - Get goals analytics
router.get("/analytics", getGoalAnalytics)

module.exports = router