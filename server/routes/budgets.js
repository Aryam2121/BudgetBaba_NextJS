const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAnalytics,
  checkBudgetAlerts,
  getBudgetById
} = require('../controllers/budgetController')

// Get all budgets for user
router.get('/', auth, getBudgets)

// Get budget by ID
router.get('/:id', auth, getBudgetById)

// Create new budget
router.post('/', auth, createBudget)

// Update budget
router.put('/:id', auth, updateBudget)

// Delete budget
router.delete('/:id', auth, deleteBudget)

// Get budget analytics
router.get('/analytics/overview', auth, getBudgetAnalytics)

// Check budget alerts
router.get('/alerts/check', auth, checkBudgetAlerts)

module.exports = router