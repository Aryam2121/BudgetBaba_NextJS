const express = require("express")
const authMiddleware = require("../middleware/auth")
const { 
  getExpenseAnalytics, 
  getCategoryAnalytics, 
  getSpendingTrends, 
  getExpenseComparison,
  getTopVendors,
  getSpendingPatterns,
  getBudgetAnalytics,
  getExpenseInsights
} = require("../controllers/analyticsController")

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/analytics/expenses - Advanced expense analytics
router.get("/expenses", getExpenseAnalytics)

// GET /api/analytics/categories - Category breakdown and insights  
router.get("/categories", getCategoryAnalytics)

// GET /api/analytics/trends - Spending trends over time
router.get("/trends", getSpendingTrends)

// GET /api/analytics/comparison - Period-over-period comparison
router.get("/comparison", getExpenseComparison)

// GET /api/analytics/vendors - Top vendors and merchant insights
router.get("/vendors", getTopVendors)

// GET /api/analytics/patterns - Spending patterns and habits
router.get("/patterns", getSpendingPatterns)

// GET /api/analytics/budget - Budget vs actual analytics
router.get("/budget", getBudgetAnalytics)

// GET /api/analytics/insights - AI-powered spending insights
router.get("/insights", getExpenseInsights)

module.exports = router