const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  exportExpenses,
  exportSplits,
  exportBudgets,
  exportGoals,
  exportAllData,
  getExportHistory,
  generateReport
} = require('../controllers/exportController')

// Export expenses as CSV/JSON
router.post('/expenses', auth, exportExpenses)

// Export splits as CSV/JSON
router.post('/splits', auth, exportSplits)

// Export budgets as CSV/JSON
router.post('/budgets', auth, exportBudgets)

// Export goals as CSV/JSON
router.post('/goals', auth, exportGoals)

// Export all user data
router.post('/all', auth, exportAllData)

// Get export history
router.get('/history', auth, getExportHistory)

// Generate comprehensive report
router.post('/report', auth, generateReport)

module.exports = router