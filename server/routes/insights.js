const express = require('express')
const router = express.Router()
const insightsController = require('../controllers/insightsController')
const { protect } = require('../middleware/auth')

// Apply authentication to all routes
router.use(protect)

// Routes
router.get('/spending', insightsController.getSpendingInsights)
router.get('/budget-recommendations', insightsController.getBudgetRecommendations)
router.get('/savings-opportunities', insightsController.getSavingsOpportunities)

module.exports = router
